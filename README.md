# stickstory-

Code-animated minimalist stick-figure story videos (9:16) for TikTok, built with Remotion.
One JSON story + voiceover = one video.

- **Anleitung (Deutsch):** [HOWTO.md](HOWTO.md)
- **Spezifikation (Stil, Primitives, JSON-Format):** [briefing.md](briefing.md)
- **Erstes Video:** [`out/01-one-percent.mp4`](out/01-one-percent.mp4)

```bash
npm install
npm run vo                          # vo.mp4 → public/audio/vo.mp3
npm run align -- 01-one-percent     # Szenen an Sprechpausen ausrichten
npm run studio                      # Vorschau
npm run render -- 01-one-percent    # → out/01-one-percent.mp4
```
