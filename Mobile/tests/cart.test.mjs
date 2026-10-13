import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cartItems, cartSuggestions } from '../src/catalog/cart-model.ts';
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
