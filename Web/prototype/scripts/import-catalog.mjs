import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Import the public, browser-observed catalogue snapshot; no private API or session data.
const root = fileURLToPath(new URL("../", import.meta.url));
const source = JSON.parse(await readFile(path.join(root, "reference/live-catalog-source.json"), "utf8"));
const imageDirectory = path.join(root, "public/assets/menu");
await mkdir(imageDirectory, { recursive: true });
const ids = new Set(source.products.map((p) => p.id));
if (ids.size !== source.products.length) throw new Error("Duplicate product IDs");
const categoryIds = new Set(source.categories.map((c) => c.id));
const imported = [];
const queue = [...source.products.entries()];

await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const [index, product] = queue.shift();
    if (!/^[a-f0-9-]+$/.test(product.id) || !categoryIds.has(product.categoryId)) throw new Error("Invalid product identity");
    if (!Number.isFinite(product.price) || product.price <= 0) throw new Error(`Missing price: ${product.name}`);
    const url = new URL(product.imageUrl);
    if (url.hostname !== "s3.amazonaws.com") throw new Error(`Unrecognized image host: ${url.hostname}`);
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (response.ok) break;
      if (attempt === 2) throw new Error(`Image download failed: ${product.name} (${response.status})`);
    }
    const mime = response.headers.get("content-type")?.split(";")[0];
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[mime];
    if (!extension) throw new Error(`Unsupported image type: ${mime}`);
    const image = `menu/${product.id}.${extension}`;
    await writeFile(path.join(root, "public/assets", image), Buffer.from(await response.arrayBuffer()));
    const { viewLabel, ...data } = product;
    imported[index] = { ...data, priceCents: Math.round(product.price * 100), image, initialQuantity: 0 };
  }
}));

const catalog = { source: source.source, capturedAt: source.capturedAt, categories: source.categories, products: imported };
await writeFile(path.join(root, "src/data/catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(JSON.stringify({ categories: catalog.categories.length, products: catalog.products.length, images: imported.length }));
