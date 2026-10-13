import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createCatalogLayout, changeQuantity, menuFades, money } from '../src/catalog/catalog-model.ts';

const data = JSON.parse(await readFile(new URL('../src/catalog/catalog.json', import.meta.url), 'utf8'));
const source = JSON.parse(await readFile(new URL('../reference/catalog/web-source.json', import.meta.url), 'utf8'));
function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('every arrangement contains the complete catalogue once, within its original categories', () => {
  for (let seed = 0; seed < 50; seed += 1) {
    const layout = createCatalogLayout(data.categories, data.products, seeded(seed));
    const ids = layout.flatMap(section => section.items.map(({ product }) => product.id));
    assert.equal(ids.length, 87);
    assert.equal(new Set(ids).size, 87);
    assert.deepEqual([...ids].sort(), data.products.map(product => product.id).sort());
    for (const section of layout) {
      assert.ok(section.items.every(({ product }) => product.categoryId === section.id));
      let small = 0;
      for (const item of section.items) {
        if (item.large) { assert.equal(small % 2, 0, 'no half-empty small-card row before a large card'); small = 0; }
        else small += 1;
      }
      assert.equal(small % 2, 0);
    }
  }
});
test('large-card eligibility uses no product whitelist, and groups can have two or four small cards', () => {
  const products = Array.from({ length: 5 }, (_, index) => ({ id: `${index}`, categoryId: 'a' }));
  for (let index = 0; index < products.length; index += 1) {
    const draws = [0.9, (index + 0.1) / products.length];
    const section = createCatalogLayout([{ id: 'a' }], products, () => draws.shift())[0];
    assert.equal(section.items[0].product.id, `${index}`);
    assert.deepEqual(section.items.map(item => item.large), [true, false, false, false, false]);
  }
  const section = createCatalogLayout([{ id: 'a' }], products.slice(0, 3), () => 0)[0];
  assert.deepEqual(section.items.map(item => item.large), [true, false, false]);
  assert.deepEqual(products.map(product => product.id), ['0', '1', '2', '3', '4']);
});
test('quantities are independent, never negative, and removal restores the empty state without changing layout', () => {
  const layout = createCatalogLayout(data.categories, data.products, seeded(14));
  const before = JSON.stringify(layout);
  const first = data.products[0], second = data.products[1];
  let quantities = {};
  for (let count = 0; count < 12; count += 1) quantities = changeQuantity(quantities, first.id, 1);
  quantities = changeQuantity(quantities, second.id, 1);
  assert.equal(quantities[first.id], 12);
  assert.equal(quantities[second.id], 1);
  assert.equal(money(1595 * 3), '$47.85');
  for (let count = 0; count < 13; count += 1) quantities = changeQuantity(quantities, first.id, -1);
  assert.equal(first.id in quantities, false);
  assert.equal(quantities[second.id], 1);
  assert.equal(JSON.stringify(layout), before);
});
test('fades show overflow on the correct side, including overscroll and short menus', () => {
  assert.deepEqual(menuFades(0, 900), { left: 0, right: 127 });
  assert.deepEqual(menuFades(350, 900), { left: 127, right: 127 });
  assert.deepEqual(menuFades(900, 900), { left: 127, right: 0 });
  assert.deepEqual(menuFades(-60, 900), { left: 0, right: 127 });
  assert.deepEqual(menuFades(960, 900), { left: 127, right: 0 });
  assert.deepEqual(menuFades(0, 0), { left: 0, right: 0 });
  assert.deepEqual(menuFades(8, 20), { left: 8, right: 12 });
});
test('all 87 original images match the desktop import manifest; draft copy keeps its provenance', async () => {
  assert.equal(data.categories.length, 14);
  assert.equal(source.images.length, data.products.length);
  assert.equal(data.products.filter(product => product.descriptionSource === 'prototype-draft').length, source.draftDescriptions);
  for (const record of source.images) {
    const product = data.products.find(item => item.id === record.productId);
    assert.equal(record.path, `public/assets/${product.image}`);
    const image = await readFile(new URL(`../${record.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(image).digest('hex'), record.sha256, record.path);
    assert.ok(Number.isInteger(product.priceCents) && product.priceCents > 0);
  }
});
