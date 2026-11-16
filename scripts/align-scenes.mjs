// Richtet die Szenen einer Story an den Sprechpausen im Voiceover aus.
// Nutzung: npm run align -- 01-one-percent
//
// Ablauf: ffmpeg silencedetect findet alle Pausen in public/audio/vo.mp3.
// Die (Anzahl Szenen − 1) längsten Pausen sind die Satz-/Absatzgrenzen.
// Kürzere Pausen innerhalb eines Satzes landen als "pauses" in der Szene
// (nutzbar in der JSON als "at": "pause1", "pause2" …).
import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) {
  console.error('Nutzung: npm run align -- <story-id>   (z. B. 01-one-percent)');
  process.exit(1);
}
const storyPath = join(root, 'stories', `${id}.json`);
if (!existsSync(storyPath)) {
  console.error(`FEHLER: ${storyPath} nicht gefunden.`);
  process.exit(1);
}
const story = JSON.parse(readFileSync(storyPath, 'utf8'));
const voPath = join(root, 'public', story.voiceover ?? 'audio/vo.mp3');
if (!existsSync(voPath)) {
  console.error(`FEHLER: ${voPath} fehlt. Erst "npm run vo" ausführen.`);
  process.exit(1);
}

const NOISE = process.env.SILENCE_DB ?? '-40dB';
const MIN_SILENCE = Number(process.env.MIN_SILENCE ?? 0.25);
const PAD_BEFORE = 0.06; // Luft vor dem ersten Laut
const PAD_AFTER = 0.14; // Luft nach dem letzten Laut (Ausklingen)

const duration = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voPath]).toString().trim(),
);
const silences = [];
{
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', voPath, '-af', `silencedetect=n=${NOISE}:d=${MIN_SILENCE}`, '-f', 'null', '-'], {encoding: 'utf8'});
  let start = null;
  for (const line of (r.stderr ?? '').split('\n')) {
    const s = /silence_start: ([\d.]+)/.exec(line);
    const e = /silence_end: ([\d.]+)/.exec(line);
    if (s) start = Number(s[1]);
    if (e && start !== null) {
      silences.push({start, end: Number(e[1]), dur: Number(e[1]) - start});
      start = null;
    }
  }
}
// Nur Pausen mitten im Audio (Anfang/Ende wurden bei "npm run vo" bereits entfernt)
const inner = silences.filter((s) => s.start > 0.05 && s.end < duration - 0.05);
const n = story.scenes.length;
if (inner.length < n - 1) {
  console.error(`WARNUNG: Nur ${inner.length} Pausen gefunden, aber ${n} Szenen. ` +
    'Sprich zwischen den Sätzen deutlicher Pausen ein oder versuche: MIN_SILENCE=0.15 npm run align -- ' + id);
  process.exit(1);
}
const boundaries = [...inner].sort((a, b) => b.dur - a.dur).slice(0, n - 1).sort((a, b) => a.start - b.start);
const r2 = (v) => Math.round(v * 100) / 100;

const rows = [];
story.scenes.forEach((scene, i) => {
  const prev = boundaries[i - 1];
  const next = boundaries[i];
  const start = Math.max(0, prev ? prev.end - PAD_BEFORE : 0);
  const end = Math.min(duration, next ? next.start + Math.min(PAD_AFTER, next.dur / 2) : duration);
  const pauses = inner
    .filter((s) => !boundaries.includes(s) && s.start > start && s.end < end)
    .map((s) => r2(s.end - start - PAD_BEFORE / 2));
  scene.vo = {start: r2(start), end: r2(end), pauses};
  rows.push({Szene: scene.id, Start: r2(start), Ende: r2(end), Dauer: r2(end - start), 'Pausen im Satz': pauses.join(', ') || '–'});
});

writeFileSync(storyPath, JSON.stringify(story, null, 2) + '\n');
console.table(rows);
console.log(`OK: ${n} Szenen in stories/${id}.json ausgerichtet (VO-Länge ${r2(duration)} s).`);
