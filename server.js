// Spiele-Lounge Server: liefert die Seite aus und leitet Spielzüge zwischen Spielern weiter.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "public", "index.html");
const MAX_PER_ROOM = 12;

const server = http.createServer((req, res) => {
  if (req.url === "/health") { res.end("ok"); return; }
  fs.readFile(INDEX, (err, data) => {
    if (err) { res.writeHead(500); res.end("Fehler"); return; }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 8 * 1024 });
const rooms = new Map(); // Raumname -> Set von Clients

function send(ws, obj) { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); }

function broadcastPeers(room) {
  const set = rooms.get(room);
  if (!set) return;
  const peers = [...set].map(c => ({ peer: c.peer, presence: c.presence }));
  for (const c of set) send(c, { t: "peers", peers });
}

function leave(ws) {
  if (!ws.room) return;
  const set = rooms.get(ws.room);
  if (set) { set.delete(ws); if (set.size === 0) rooms.delete(ws.room); else broadcastPeers(ws.room); }
  ws.room = null;
}

wss.on("connection", (ws) => {
  ws.peer = crypto.randomBytes(5).toString("hex");
  ws.presence = {};
  ws.room = null;
  ws.alive = true;
  ws.stamp = [];
  ws.on("pong", () => { ws.alive = true; });

  ws.on("message", (raw) => {
    // einfache Bremse: max. 30 Nachrichten pro Sekunde
    const now = Date.now();
    ws.stamp = ws.stamp.filter(x => now - x < 1000);
    if (ws.stamp.push(now) > 30) return;

    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.t !== "string") return;

    if (m.t === "join") {
      if (ws.room || typeof m.room !== "string" || !/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(m.room)) return;
      const set = rooms.get(m.room) || new Set();
      if (set.size >= MAX_PER_ROOM) { send(ws, { t: "full" }); return; }
      set.add(ws); rooms.set(m.room, set); ws.room = m.room;
      send(ws, { t: "hello", peer: ws.peer });
      broadcastPeers(ws.room);
    } else if (!ws.room) {
      return;
    } else if (m.t === "emit") {
      if (typeof m.topic !== "string" || !/^[a-z][a-z0-9_.-]{0,47}$/.test(m.topic)) return;
      const out = { t: "msg", topic: m.topic, data: m.data, peer: ws.peer };
      for (const c of rooms.get(ws.room)) send(c, out);
    } else if (m.t === "presence") {
      if (!m.presence || typeof m.presence !== "object" || JSON.stringify(m.presence).length > 1024) return;
      ws.presence = m.presence;
      broadcastPeers(ws.room);
    }
  });

  ws.on("close", () => leave(ws));
});

// tote Verbindungen aufräumen
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false; ws.ping();
  }
}, 30000);

server.listen(PORT, () => console.log("Spiele-Lounge läuft auf Port " + PORT));
