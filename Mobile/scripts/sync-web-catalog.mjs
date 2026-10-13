// Explicit snapshot import from the existing desktop prototype; no live API.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktop = [path.resolve(root, '../prototype'), path.resolve(root, '../Web/prototype')].find(candidate => existsSync(path.join(candidate, 'src/data/catalog.json')));
if (!desktop) throw new Error('Desktop catalogue not found beside mobile or in Web/prototype.');
const { editProductCopy, formatCardCopy } = await import(pathToFileURL(path.join(desktop, 'src/data/card-copy.js')).href);
const { withPrototypeDescription } = await import(pathToFileURL(path.join(desktop, 'src/data/prototype-descriptions.js')).href);
const source = JSON.parse(await readFile(path.join(desktop, 'src/data/catalog.json'), 'utf8'));
const products = source.products.map(editProductCopy).map(withPrototypeDescription);
await mkdir(path.join(root, 'src/catalog'), { recursive: true });
await mkdir(path.join(root, 'public/assets/menu'), { recursive: true });
const images = [];
for (const product of products) {
  const original = path.join(desktop, 'public/assets', product.image);
  await copyFile(original, path.join(root, 'public/assets', product.image));
  images.push({ productId: product.id, path: `public/assets/${product.image}`, sha256: createHash('sha256').update(await readFile(original)).digest('hex') });
}
await writeFile(path.join(root, 'src/catalog/catalog.json'), JSON.stringify({
  source: source.source, capturedAt: source.capturedAt,
  categories: source.categories.map(category => ({ ...category, name: formatCardCopy(category.name) })), products,
}, null, 2) + '\n');
await writeFile(path.join(root, 'reference/catalog/web-source.json'), JSON.stringify({
  source: source.source, capturedAt: source.capturedAt, importedFrom: path.relative(root, desktop).replaceAll(path.sep, '/'),
  editorialModules: ['src/data/card-copy.js', 'src/data/prototype-descriptions.js'],
  categories: source.categories.length, products: products.length,
  draftDescriptions: products.filter(product => product.descriptionSource === 'prototype-draft').length, images,
}, null, 2) + '\n');
console.log(`Imported ${products.length} products, ${source.categories.length} categories and original images.`);
