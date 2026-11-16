# So erstellst du das nächste Video

Eine Story-JSON plus ein Voiceover ergeben ein fertiges TikTok-Video (1080 × 1920, 30 fps).

## Einmalig: Vorbereitung

1. Installiere **Node.js** (Version 18 oder neuer): https://nodejs.org
2. Installiere **ffmpeg**:
   - Mac: `brew install ffmpeg`
   - Windows: `winget install ffmpeg`
3. Lade das Repository herunter und installiere die Pakete:
   ```bash
   git clone https://github.com/ntuchschernt/stickstory-.git
   cd stickstory-
   npm install
   ```

## Für jedes neue Video

### 1. Voiceover in CapCut erstellen

**Schnellster Weg:** Den ganzen Text als **einen** Textblock in CapCut einfügen → „Text zu Sprache“ → als MP4 exportieren.
Die Absätze müssen nur mit Punkt, Fragezeichen oder Ausrufezeichen enden. Das Align-Skript erkennt die Szenengrenzen
über die Satzlängen (Feld `script` in der JSON), deshalb muss der eingesprochene Text **genau** dem `script` entsprechen.

- Tipp: CapCut-Sprechtempo auf etwa 0,9 stellen. Ist das Video kürzer als 61 Sekunden, werden die Pausen automatisch gestreckt.
- Selbst eingesprochen geht genauso. Etwas längere Pausen zwischen den Absätzen helfen zusätzlich.
- Die Datei als `vo.mp4` ins Hauptverzeichnis legen (neben `package.json`).

### 2. Story-JSON anlegen

1. Kopiere `stories/01-one-percent.json`, zum Beispiel nach `stories/02-mein-thema.json`.
2. Setze `"id"` auf genau den Dateinamen ohne `.json`, also `"02-mein-thema"`.
3. Lege **genauso viele Szenen an, wie dein Voiceover Absätze hat**.
4. Pro Szene änderst du:
   - `script`: dein gesprochener Satz (nur als Notiz)
   - `text`: was auf dem Bildschirm steht. `*Wort*` wird orange, `\n` erzwingt eine neue Zeile.
     Mehrere Texte nacheinander gehen mit `"at": "pause1"` usw.
   - `elements`: Figuren, Treppen, Zahlen, Kurven. Kopiere sie aus den vorhandenen Szenen und passe sie an.
     Alle Möglichkeiten stehen in `briefing.md`, Abschnitt 4 und 6.
   - `sfx`: optionale Sounds (`tick`, `pop`, `whoosh`, `rise`, `fall`, `chime`)
5. Das Feld `"vo"` musst du **nicht** ausfüllen. Das macht Schritt 4.

### 3. Voiceover vorbereiten

```bash
npm run vo
```

Das erzeugt `public/audio/vo.mp3` (48 kHz), schneidet die Stille am Anfang und Ende weg und löscht `vo.mp4`.

### 4. Szenen ans Voiceover anpassen

```bash
npm run align -- 02-mein-thema
```

Eine Tabelle zeigt, wo jede Szene beginnt und endet. Die Zeiten werden automatisch in die JSON geschrieben.

> **Fehlermeldung „Nur X Pausen gefunden“?** Dann hat das Voiceover weniger deutliche Pausen als die JSON Szenen.
> Entweder Szenen zusammenlegen, die Pausen länger einsprechen oder es so versuchen:
> `MIN_SILENCE=0.15 npm run align -- 02-mein-thema`

### 5. Vorschau ansehen (optional, empfohlen)

```bash
npm run studio
```

Im Browser öffnet sich Remotion Studio. Links wählst du deine Story und spielst sie ab.
Änderungen an der JSON siehst du sofort.

Kontrollbilder alle 5 Sekunden, mit eingeblendeten TikTok-Safe-Zones:

```bash
npm run stills -- 02-mein-thema 5 --safe
```

Die Bilder liegen danach in `out/stills/02-mein-thema/`. Text und Figuren dürfen **nicht in den roten Bereichen** liegen.

### 6. Rendern

```bash
npm run render -- 02-mein-thema
```

Das fertige Video liegt in `out/02-mein-thema.mp4`. Das Skript prüft automatisch, ob es mindestens 61 Sekunden lang ist.
Ist es kürzer, werden die Pausen zwischen den Szenen und der Schluss automatisch verlängert (`timing.minDurationSec` in der JSON).

### 7. Speichern

```bash
git add -A
git commit -m "Neues Video: 02-mein-thema"
git push
```

## Musik

- **Eigene Musik:** Lege eine Datei als `public/audio/music.mp3` ab. Sie wird unter dem Voiceover automatisch leiser.
- **Keine Musik vorhanden:** `npm run render` erzeugt automatisch einen ruhigen Ambient-Teppich.
  Manuell geht es mit `npm run music -- 75` (Länge in Sekunden).
- **Andere Musik pro Video:** In der JSON `"music": {"src": "audio/anderer-song.mp3"}` eintragen.

## Gut zu wissen

- `public/audio/vo.mp3` wird bei jedem neuen Video **überschrieben**. Willst du ein altes Video später neu rendern,
  benenne seine Datei um (z. B. `public/audio/vo-01.mp3`) und trage sie in dessen JSON unter `"voiceover"` ein.
- Video **ohne Stimme** rendern (z. B. als Vorschau): in der JSON `"voiceover": null` setzen. Das Timing bleibt gleich.
  `npm run align` trägt die Stimme automatisch wieder ein.
- Soundeffekte neu erzeugen: `npm run sfx`.
- Farben, Schriftgrößen, Safe Zones und Animationstempo stehen zentral in `src/theme.ts`.
- Fehler „Browser konnte nicht geladen werden“: Remotion lädt beim ersten Rendern einmalig einen Browser herunter.
  Dafür brauchst du Internet. Notfalls einen vorhandenen Chrome angeben:
  `BROWSER_EXECUTABLE="/Pfad/zu/chrome" npm run render -- 02-mein-thema`
