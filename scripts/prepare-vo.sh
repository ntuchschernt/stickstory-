#!/usr/bin/env bash
# Extrahiert die Tonspur aus vo.mp4 (CapCut-Export) -> public/audio/vo.mp3 (48 kHz),
# schneidet Stille am Anfang und Ende weg und löscht danach vo.mp4.
# Nutzung: npm run vo            (liest ./vo.mp4)
#          npm run vo -- pfad/zu/datei.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
IN="${1:-vo.mp4}"
OUT="public/audio/vo.mp3"
THRESH="${SILENCE_DB:--45dB}"

if [ ! -f "$IN" ]; then
  echo "FEHLER: $IN nicht gefunden. Lege deinen CapCut-Export als vo.mp4 ins Hauptverzeichnis." >&2
  exit 1
fi
mkdir -p public/audio

# 1) Stille vorne entfernen, 2) umdrehen, Stille (jetzt vorne = Ende) entfernen, 3) zurückdrehen.
# Danach 0.15 s Luft hinten, damit das letzte Wort nicht abgeschnitten klingt.
ffmpeg -y -loglevel error -i "$IN" -vn -ac 1 -ar 48000 \
  -af "silenceremove=start_periods=1:start_threshold=${THRESH}:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=${THRESH}:start_silence=0.15,areverse,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ar 48000 -codec:a libmp3lame -b:a 192k "$OUT"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
echo "OK: $OUT erstellt (${DUR}s, 48 kHz)"

# vo.mp4 wird nicht mehr gebraucht
if git ls-files --error-unmatch "$IN" >/dev/null 2>&1; then git rm -q "$IN"; else rm -f "$IN"; fi
echo "OK: $IN gelöscht"
