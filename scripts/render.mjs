// Rendert eine Story nach out/<id>.mp4 und prüft die Mindestlänge.
// Nutzung: npm run render -- 01-one-percent
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const id = process.argv[2];
if (!id) {
  console.error('Nutzung: npm run render -- <story-id>');
  process.exit(1);
}
const story = JSON.parse(readFileSync(`stories/${id}.json`, 'utf8'));
const minDur = story.timing?.minDurationSec ?? 0;
// Optional: eigener Browser (z. B. in Cloud-Umgebungen ohne Download)
const browser = process.env.BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.BROWSER_EXECUTABLE}`] : [];
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run('node', ['scripts/sync-stories.mjs']);

if (!existsSync('public/audio/vo.mp3')) {
  console.error('FEHLER: public/audio/vo.mp3 fehlt. Erst "npm run vo" ausführen.');
  process.exit(1);
}
const musicSrc = story.music?.src;
if (musicSrc && !existsSync(join('public', musicSrc))) {
  const out = spawnSync('npx', ['remotion', 'compositions', 'src/index.ts', ...browser], {encoding: 'utf8'}).stdout ?? '';
  const m = new RegExp(`${id}\\s+\\d+\\s+\\S+\\s+\\d+\\s+\\(([\\d.]+) sec\\)`).exec(out);
  const sec = Math.ceil(Number(m?.[1] ?? 75)) + 1;
  console.log(`Keine Musik gefunden → erzeuge Ambient-Drone (${sec}s)`);
  run('bash', ['scripts/make-music.sh', String(sec)]);
}
if (!existsSync('public/sfx/pop.mp3')) run('bash', ['scripts/make-sfx.sh']);

const outFile = `out/${id}.mp4`;
run('npx', ['remotion', 'render', 'src/index.ts', id, outFile, ...browser]);

const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outFile]).toString());
console.log(`\nFertig: ${outFile} (${dur.toFixed(2)} s)`);
if (dur < minDur) {
  console.error(`WARNUNG: kürzer als ${minDur} s! timing.minDurationSec / outroHoldSec in der JSON prüfen.`);
  process.exit(2);
}
