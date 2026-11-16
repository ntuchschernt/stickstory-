# StickStory – Briefing

> **Hinweis:** Die ursprüngliche Datei `stickstory-briefing.md` war beim Hochladen leer (nur ein Zeilenumbruch).
> Dieses Briefing beschreibt die **Annahmen**, nach denen das Projekt gebaut wurde.
> Farben und Typografie stammen aus den MINDFRAME-Brand-Guidelines (`MINDFRAME/brand/`).
> Wenn du dein Original-Briefing hast, ersetze diese Datei. Abweichungen lassen sich dann gezielt nachziehen.

## 1. Ziel

Minimalistische, per Code animierte Strichmännchen-Geschichten im Hochformat (9:16) für TikTok, Reels und Shorts.
**Eine Story-JSON plus ein Voiceover ergeben ein Video.** Keine Handarbeit im Schnittprogramm.

- Format: 1080 × 1920, 30 fps, H.264 + AAC (48 kHz)
- Länge: mindestens 61 Sekunden (TikTok-Monetarisierung)
- Sprache der On-Screen-Texte: Englisch (wie MINDFRAME)

## 2. Ordnerstruktur

```
stickstory-/
├── briefing.md              ← dieses Dokument
├── HOWTO.md                 ← Schritt-für-Schritt-Anleitung (Deutsch)
├── stories/                 ← eine JSON pro Video (z. B. 01-one-percent.json)
├── public/
│   ├── audio/vo.mp3         ← Voiceover (aus vo.mp4 erzeugt)
│   ├── audio/music.mp3      ← Musikteppich
│   ├── sfx/*.mp3            ← Soundeffekte (per ffmpeg erzeugt)
│   └── fonts/               ← Inter (OFL)
├── src/
│   ├── theme.ts             ← alle Design-Tokens (Farben, Größen, Safe Zones, Timing)
│   ├── primitives/          ← wiederverwendbare Bausteine (Abschnitt 4)
│   ├── story/               ← StoryComposition, Timeline, JSON-Typen (Abschnitt 5)
│   └── Root.tsx             ← registriert jede Story automatisch als Composition
├── scripts/                 ← vo, align, sfx, music, render, stills
└── out/                     ← fertige Videos + Kontrollbilder
```

## 3. Style- und Animationsregeln

**Farben** (nur aus `theme.ts`):

| Rolle | Farbe |
|---|---|
| Hintergrund | Deep Charcoal `#101114` mit sehr weicher Vignette |
| Figur | Warm Ivory `#F0EDE5` |
| Gedimmte Figur / Vergangenheit | `#5E5D5A` |
| Akzent | Cinematic Orange `#D98242`, **sparsam**: maximal 1–2 Schlüsselwörter pro Text |
| Text | Soft White `#F5F5F5` |
| Negativ (Verfall) | kühles Grau `#7C7F87`, nie Rot |

**Typografie:** Inter, Bold 92 px (Headline) bzw. SemiBold 64 px (Caption), zentriert, maximal 3 Zeilen.
Die Schrift wird bei Bedarf automatisch verkleinert, damit nichts abgeschnitten wird.

**Safe Zones (TikTok-UI):** oben 250 px, unten 480 px, rechts 160 px (Button-Spalte ab y = 900), links 80 px.
- Text-Zone: y 310–740
- Bühne für Figuren und Grafiken: y ≈ 780–1400, Boden standardmäßig bei y = 1330

**Strichmännchen:** Kopf als gefüllter Kreis, Linien 13 px, runde Enden. Keine Gesichter, keine Kleidung.

**Animationsregeln:**
1. Nichts springt. Alles kommt per Spring oder Ease (Einblenden plus leichtes Hochskalieren von 92 % auf 100 %).
2. Texte erscheinen Wort für Wort (2,5 Frames Versatz, leichtes Hochgleiten).
   Akzentwörter färben sich orange, wenn sie (geschätzt) gesprochen werden.
3. Szenenwechsel: weiches Aus- und Einblenden (9 Frames), Bild läuft 0,35 s vor dem Sprechen an.
4. Kamera: langsame Fahrt pro Szene (Zoom maximal ±15 %), immer eased.
5. Figuren atmen leicht im Stand, gehen mit Walk-Cycle, Posen wechseln weich (Blend 12 Frames).
6. Pro Szene **eine** klare Bildidee. Lieber leer als überladen.
7. Zahlen zählen sichtbar hoch bzw. runter. Diagramme zeichnen sich synchron zur Zahl.

**Audio:** Voiceover hat Vorrang. Musik bei 20 %, unter Sprache automatisch auf 6 % abgesenkt (Ducking mit 0,35 s Rampen),
1,5 s Fade-in und 2,5 s Fade-out. SFX leise (Lautstärke 0,15–0,3), nur zur Unterstützung.

## 4. Primitives (`src/primitives/`)

| Primitive | Zweck |
|---|---|
| `Background` | Hintergrund mit Vignette |
| `Camera` | Kamerafahrt (Zoom/Pan) über die Bühne |
| `StickFigure` | Strichmännchen mit Posen `stand, walk, cheer, point, think, slump, sit, sad, step, shrug, wave`, Laufweg und Walk-Cycle |
| `Caption` | Text-State mit Wort-für-Wort-Einblendung, `*Akzent*`, automatischer Größenanpassung |
| `Counter` | Zahl, die linear, ease-out oder exponentiell zählt |
| `Graph` | 1 %-Kurve über 365 Tage (`growth`, `decline`, `both`, `flat`) |
| `Stairs` | Treppe, die sich Stufe für Stufe aufbaut |
| `Ground` | Bodenlinie, zeichnet sich von der Mitte aus |
| `Label` | kurze Beschriftung auf der Bühne |
| `Spotlight` | weicher Lichtkegel |
| `Dots` | Punkteraster (z. B. 365 Tage) |
| `SafeZones` | Debug-Overlay für Kontrollbilder |

## 5. StoryComposition

- Liest eine Story-JSON und baut daraus eine Timeline. Jede Szene spielt ihren eigenen Voiceover-Ausschnitt,
  deshalb lassen sich Pausen frei verlängern, ohne das Audio zu zerschneiden.
- Ist das Video kürzer als `minDurationSec`, werden zuerst die Pausen zwischen den Szenen verlängert
  (maximal `maxExtraPauseSec` je Wechsel). Der Rest geht in den Outro-Hold.
- Rendert Szenen (Kamera, Elemente, Text-States), SFX, Musik mit Ducking.

## 6. Story-JSON (`stories/<id>.json`)

```jsonc
{
  "id": "01-one-percent",            // = Dateiname = Composition-ID = Ausgabedatei
  "title": "One Percent",
  "voiceover": "audio/vo.mp3",
  "music": { "src": "audio/music.mp3", "volume": 0.2, "ducked": 0.06 },
  "timing": { "leadInSec": 0.6, "outroHoldSec": 2.5, "minDurationSec": 61, "maxExtraPauseSec": 0.6 },
  "scenes": [                        // eine Szene pro Satz/Absatz im Voiceover
    {
      "id": "s1-hook",
      "script": "Nobody notices one percent.",            // nur zur Orientierung
      "vo": { "start": 0, "end": 2.79, "pauses": [] },     // setzt "npm run align" automatisch
      "text": [                                            // Text-States, nacheinander
        { "content": "Nobody notices\n*one percent.*" },
        { "at": "pause1", "content": "…" }                // Wechsel an der 1. Sprechpause
      ],
      "camera": { "from": { "zoom": 1 }, "to": { "zoom": 1.06, "y": 20 } },
      "elements": [
        { "type": "figure", "x": 540, "y": 1330, "pose": "stand", "at": -0.2 }
      ],
      "sfx": [{ "name": "whoosh", "at": -0.3, "volume": 0.25 }]
    }
  ]
}
```

**Zeitangaben (`at`, `until`)** gelten relativ zum Sprechbeginn der Szene, in Sekunden. Erlaubt sind:
- Zahlen: `1.5`, `-0.3` (vor dem Sprechen)
- `"pause1"`, `"pause2"`: wenn der Sprecher nach der n-ten kurzen Pause im Satz weiterspricht
- `"end"`: Ende des gesprochenen Satzes
- Kombinationen mit Versatz: `"pause1+0.4"`, `"end-0.5"`

Weil Text-Wechsel an Pausen hängen statt an festen Sekunden, passt die JSON auch nach einer neuen Aufnahme.

**SFX-Namen:** `tick`, `pop`, `whoosh`, `rise`, `fall`, `chime`.
