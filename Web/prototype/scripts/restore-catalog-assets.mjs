// Vercel source deployments omit the 135 MB photo snapshot. Restore the same
// public, versioned image URLs and verify bytes before building; never use a live menu API.
import { createHash } from "node:crypto";
import { access, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// This UI illustration is uploaded with the source, not restored from the menu.
await access(path.join(root, "public/assets/cart-empty-bag.png"));
const manifest = JSON.parse(await readFile(path.join(root, "src/data/catalog-assets.json"), "utf8"));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
let cursor = 0;
let restored = 0;
async function restore(asset) {
  if (!/^menu\/[a-zA-Z0-9-]+\.(png|jpg|jpeg|webp)$/.test(asset.file) || new URL(asset.url).origin !== "https://s3.amazonaws.com") throw new Error("Unexpected catalogue asset location");
  const target = path.join(root, "public/assets", asset.file);
  const existing = await readFile(target).catch((error) => { if (error.code === "ENOENT") return null; throw error; });
  if (existing && digest(existing) === asset.sha256) return;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(asset.url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length !== asset.bytes || digest(bytes) !== asset.sha256) throw new Error("Snapshot checksum mismatch");
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, bytes);
      restored++;
      return;
    } catch (error) { lastError = error; }
  }
  throw new Error(`Cannot restore ${asset.file}: ${lastError.message}`);
}
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < manifest.assets.length) await restore(manifest.assets[cursor++]);
}));
console.log(`Verified ${manifest.assets.length} catalogue photos; restored ${restored} exact source files.`);
