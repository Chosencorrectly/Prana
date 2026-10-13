import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMenuSearch, searchSuggestions, cartSummary } from '../src/catalog/search-model.ts';
import { changeQuantity } from '../src/catalog/catalog-model.ts';

const { products, categories } = JSON.parse(await readFile(new URL('../src/catalog/catalog.json', import.meta.url), 'utf8'));
const search = createMenuSearch(products, categories);

test('menu search tolerates case and surrounding/repeated whitespace; empty query restores the complete menu', () => {
  assert.deepEqual(search('  AVOCADO  '), search('avocado'));
  assert.ok(search('avocado').length > 0);
  assert.deepEqual(search('coconut   milk'), search('coconut milk'));
  assert.equal(search('   ').length, 87);
});
test('search covers names, descriptions and categories from the original catalogue', () => {
  for (const product of products) assert.ok(search(product.name).some(item => item.id === product.id));
  const category = categories[0];
  const matches = search(category.name);
  for (const product of products.filter(product => product.categoryId === category.id)) assert.ok(matches.some(item => item.id === product.id));
  assert.equal(search('qzx-no-dish-2026').length, 0);
});
test('empty-result suggestions are eight distinct real dishes, stable across queries', () => {
  const suggested = searchSuggestions(products, categories);
  assert.equal(suggested.length, 8);
  assert.equal(new Set(suggested.map(item => item.categoryId)).size, 8);
  assert.ok(suggested.every(item => products.includes(item)));
  search('missing'); search('avocado');
  assert.deepEqual(searchSuggestions(products, categories), suggested);
});
test('cart dock sums all quantities in cents even when search only displays a subset', () => {
  const [first, second] = products;
  let quantities = changeQuantity({}, first.id, 2);
  quantities = changeQuantity(quantities, second.id, 1);
  assert.deepEqual(cartSummary(products, quantities), { count: 3, cents: first.priceCents * 2 + second.priceCents });
  search('avocado');
  quantities = changeQuantity(quantities, first.id, -2);
  quantities = changeQuantity(quantities, second.id, -1);
  assert.deepEqual(cartSummary(products, quantities), { count: 0, cents: 0 });
});
