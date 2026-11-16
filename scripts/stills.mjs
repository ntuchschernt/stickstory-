// Speichert Kontrollbilder (PNG) alle N Sekunden nach out/stills/<id>/.
// Nutzung: npm run stills -- 01-one-percent [intervall=5] [--safe]
//   --safe  blendet die TikTok-Safe-Zones (rot) und die Text-Zone (grün) ein.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const safe = process.argv.includes('--safe');
const id = args[0];
const every = Number(args[1] ?? 5);
if (!id) {
  console.error('Nutzung: npm run stills -- <story-id> [sekunden] [--safe]');
  process.exit(1);
}
spawnSync('node', [join(root, 'scripts/sync-stories.mjs')], {stdio: 'inherit'});
const browserExecutable = process.env.BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: join(root, 'src/index.ts')});
const inputProps = safe ? {showSafeZones: true} : {};
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
const outDir = join(root, 'out/stills', id);
mkdirSync(outDir, {recursive: true});
const fps = composition.fps;
const last = composition.durationInFrames - 1;
const frames = [];
// Optional: feste Zeitpunkte statt Intervall, z. B. STILLS_AT=1.5,6,50
const at = process.env.STILLS_AT?.split(',').map(Number);
if (at) for (const s of at) frames.push(Math.round(s * fps));
else for (let s = every; s * fps < last; s += every) frames.push(Math.round(s * fps));
frames.push(last);
for (const frame of frames) {
  const label = frame === last ? 'end' : `t${(frame / fps).toFixed(1).padStart(5, '0')}`;
  const name = `${label}${safe ? '-safe' : ''}.png`;
  await renderStill({composition, serveUrl, frame, output: join(outDir, name), inputProps, browserExecutable, scale: 0.5});
  console.log(`OK: ${name} (Frame ${frame})`);
}
