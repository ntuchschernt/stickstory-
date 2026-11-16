// Erzeugt src/stories.generated.ts aus allen stories/*.json (läuft automatisch vor studio/render).
import {readdirSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(join(root, 'stories')).filter((f) => f.endsWith('.json')).sort();
const lines = [
  '// AUTOMATISCH ERZEUGT von scripts/sync-stories.mjs – nicht von Hand bearbeiten.',
  "import type {Story} from './story/types';",
  ...files.map((f, i) => `import s${i} from '../stories/${f}';`),
  '',
  `export const STORIES: Story[] = [${files.map((_, i) => `s${i} as Story`).join(', ')}];`,
  '',
];
writeFileSync(join(root, 'src/stories.generated.ts'), lines.join('\n'));
console.log(`OK: ${files.length} Story/Stories registriert: ${files.join(', ')}`);
