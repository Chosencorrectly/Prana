import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cartChangeIssue, cartItems, cartNutrition, cartSuggestions } from '../src/catalog/cart-model.ts';
import { cartPreviewQuantities } from '../src/catalog/cart-preview-model.ts';
import { changeQuantity } from '../src/catalog/catalog-model.ts';
import { cartSummary } from '../src/catalog/search-model.ts';

const { products, categories } = JSON.parse(await readFile(new URL('../src/catalog/catalog.json', import.meta.url), 'utf8'));
test('cart preserves add order and all quantity changes reconcile with the catalogue total', () => {
  const [first, second] = products;
  let quantities = changeQuantity({}, second.id, 1);
  quantities = changeQuantity(quantities, first.id, 2);
  quantities = changeQuantity(quantities, second.id, 2);
  const items = cartItems(products, quantities);
  assert.deepEqual(items.map(item => item.product.id), [second.id, first.id]);
  assert.equal(items.reduce((sum, item) => sum + item.quantity * item.product.priceCents, 0), cartSummary(products, quantities).cents);
  quantities = changeQuantity(quantities, second.id, -3);
  assert.deepEqual(cartItems(products, quantities).map(item => item.product.id), [first.id]);
  assert.deepEqual(cartItems(products, {}), []);
});
test('suggestions use distinct real dishes outside the cart, including a nearly full catalogue', () => {
  const initial = cartSuggestions(products, categories, {});
  assert.equal(initial.length, 4);
  const quantities = Object.fromEntries(initial.map(product => [product.id, 1]));
  const next = cartSuggestions(products, categories, quantities);
  assert.equal(new Set(next.map(product => product.id)).size, 4);
  assert.ok(next.every(product => products.includes(product) && !quantities[product.id]));
  const allButLast = Object.fromEntries(products.slice(0, -1).map(product => [product.id, 1]));
  assert.deepEqual(cartSuggestions(products, categories, allButLast), [products.at(-1)]);
  assert.deepEqual(cartSuggestions(products, categories, Object.fromEntries(products.map(product => [product.id, 1]))), []);
});

test('cart nutrition multiplies every portion and keeps unknown values distinct from measured zero', () => {
  const a = { ...products[0], id: 'a', kcal: 100, nutrition: { protein: 0, fat: 1.25, carbs: 12 } };
  const b = { ...products[1], id: 'b', kcal: 50, nutrition: { protein: 2, fat: null, carbs: 5 } };
  assert.deepEqual(cartNutrition([a, b], { a: 2, b: 3 }).map(item => item.value), [350, 6, null, 39]);
  assert.deepEqual(cartNutrition([a, b], { a: 2 }).map(item => item.value), [200, 0, 2.5, 24]);
  assert.deepEqual(cartNutrition([a, b], {}).map(item => item.value), [null, null, null, null]);
});

test('stock caps additions without blocking reductions; offline and failed requests preserve selection', () => {
  const available = { offline: false, failed: false, limit: 2 };
  assert.equal(cartChangeIssue(2, 1, available), 'stock');
  assert.equal(cartChangeIssue(2, -1, available), null);
  assert.equal(cartChangeIssue(1, 1, available), null);
  assert.equal(cartChangeIssue(1, -1, available), null);
  assert.equal(cartChangeIssue(1, 1, { ...available, offline: true }), 'offline');
  assert.equal(cartChangeIssue(1, -1, { ...available, failed: true }), 'update-error');
  assert.equal(cartChangeIssue(50, 1, { offline: false, failed: false }), null);
});

test('preview has real independent fixtures: three distinct dishes, four portions and correct totals', () => {
  const quantities = cartPreviewQuantities(products, 'ready');
  assert.equal(cartItems(products, quantities).length, 3);
  assert.deepEqual(cartSummary(products, quantities), { count: 4, cents: 6380 });
  assert.deepEqual(cartNutrition(products, quantities).map(item => item.value), [2350, 62, 104, 310]);
  assert.deepEqual(cartPreviewQuantities(products, 'empty'), {});
  const changed = changeQuantity(quantities, Object.keys(quantities)[0], 1);
  assert.notDeepEqual(changed, cartPreviewQuantities(products, 'ready'));
});
