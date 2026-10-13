// Rehydrate the exact published snapshot at build time, never in the browser.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const manifest = JSON.parse(await readFile(path.join(root, 'vercel-assets.json'), 'utf8'));
if (!/^[a-f0-9]{40}$/.test(manifest.commit)) throw new Error('Expected a pinned source commit');
const valid = (bytes, asset) => bytes.length === asset.bytes && createHash('sha256').update(bytes).digest('hex') === asset.sha256;
let next = 0, restored = 0;
async function worker() {
  while (next < manifest.assets.length) {
    const asset = manifest.assets[next++];
    const destination = path.resolve(publicDir, asset.path);
    if (!destination.startsWith(publicDir + path.sep)) throw new Error('Invalid asset path');
    const existing = await readFile(destination).catch(() => null);
    if (existing && valid(existing, asset)) continue;
    const url = `https://raw.githubusercontent.com/Chosencorrectly/Prana/${manifest.commit}/Mobile/public/${asset.path.split('/').map(encodeURIComponent).join('/')}`;
    let bytes;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
        if (!response.ok) throw new Error(`Asset HTTP ${response.status}: ${asset.path}`);
        bytes = Buffer.from(await response.arrayBuffer());
        if (!valid(bytes, asset)) throw new Error(`Asset checksum mismatch: ${asset.path}`);
        break;
      } catch (error) { if (attempt === 2) throw error; }
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
    restored++;
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`Verified ${manifest.assets.length} original assets; restored ${restored} from ${manifest.commit}.`);
