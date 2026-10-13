# 🎮 Spiele-Lounge

Eine Spielesammlung für den Spieleabend: 15 Spiele in einer einzigen HTML-Datei, ohne Build-Schritt und ohne Abhängigkeiten.

## Spiele

- **Zu zweit:** Tic Tac Toe, Vier gewinnt, Reversi, Dame, Schiffe versenken
- **Würfeln und Brettspiele:** Schwein, Kniffel, Mensch ärgere dich nicht, Monopoly, Nim
- **Karten und Denken:** Memory, UNO, Galgenmännchen
- **Für die ganze Runde:** Montagsmaler, Werwolf

## Spielmodi

| Modus | Funktioniert auf GitHub Pages |
|---|---|
| Gegen den Computer | ja |
| Zusammen an einem Handy | ja |
| Online mit Raum-Code | nein, siehe unten |

## Starten

Öffne `index.html` im Browser. Oder veröffentliche die Seite mit GitHub Pages:

1. Repository auf GitHub erstellen und diese Dateien hochladen.
2. **Settings → Pages → Branch: `main` / Ordner `/ (root)`** wählen und speichern.
3. Nach etwa einer Minute ist die Seite unter `https://<dein-name>.github.io/<repo-name>/` erreichbar.

## Online-Modus

Der Online-Modus nutzt die Raum-Funktion von Claude-Artifacts (`claude.use("room")`). Sie existiert nur, wenn die Seite als Artifact auf claude.ai läuft. Auf GitHub Pages zeigt die Seite dafür eine Hinweismeldung, die anderen Modi funktionieren normal.

Für Online-Spiel außerhalb von claude.ai müsstest du die Funktionen `joinRoom`, `net.emit`, `net.on`, `net.presence` und `net.onPeers` durch einen eigenen Dienst ersetzen, zum Beispiel PeerJS oder Firebase Realtime Database.

## Technik

- Reines HTML, CSS und JavaScript in `index.html`
- Schriften (Fredoka, Nunito) werden von Google Fonts geladen, mit Fallback auf Systemschriften
- Statistik und Einstellungen liegen im `localStorage` des Browsers
