import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dishTitle, dishWeight, dishNutrition, photoRect, swipeAxis, shouldDismissDish } from '../src/catalog/dish-model.ts';

const data = JSON.parse(await readFile(new URL('../src/catalog/catalog.json', import.meta.url), 'utf8'));
test('photo origins stay in phone coordinates at every preview scale', () => {
  for (const scale of [0.5, 0.75, 1, 1.5]) {
    const screen = { left: 120, top: 40, width: 430 * scale };
    const rect = { left: 120 + 16 * scale, top: 40 + 248 * scale, width: 398 * scale, height: 457 * scale };
    assert.deepEqual(photoRect(rect, screen, 430, 115), { x: 16, y: 133, width: 398, height: 457, borderRadius: '20px 20px 20px 20px' });
  }
});
test('only a rightward horizontal gesture owns dismiss; vertical and left drags remain distinct', () => {
  assert.equal(swipeAxis(7, 6), 'pending');
  assert.equal(swipeAxis(18, 7), 'horizontal');
  assert.equal(swipeAxis(8, 18), 'vertical');
  assert.equal(swipeAxis(8, 8), 'vertical');
  assert.equal(swipeAxis(-18, 7), 'blocked');
});
test('dismiss requires distance or an intentional rightward flick, not small taps', () => {
  assert.equal(shouldDismissDish(120, 0, 430), false);
  assert.equal(shouldDismissDish(121, 0, 430), true);
  assert.equal(shouldDismissDish(23, 1, 430), false);
  assert.equal(shouldDismissDish(24, 0.55, 430), true);
  assert.equal(shouldDismissDish(70, -0.6, 430), false);
  assert.equal(shouldDismissDish(70, 0.1, 430), false);
});
test('dish presentation preserves factual catalogue data and scopes the only supplied weight', () => {
  const original = JSON.stringify(data);
  const chia = data.products.find(product => product.id === '884bb3d4-573a-44dd-b370-25277a9b8580');
  assert.equal(dishTitle(chia), 'Chia pudding');
  assert.equal(dishWeight(chia), '345 g');
  assert.deepEqual(dishNutrition(chia).map(item => item.value), [535, 12, 29, 61]);
  assert.equal(data.products.filter(product => dishWeight(product)).length, 1);
  for (const product of data.products) assert.ok(dishTitle(product).length);
  assert.equal(JSON.stringify(data), original);
});
test('missing nutrition is omitted, while measured zero remains visible', () => {
  const product = { kcal: 0, nutrition: { protein: null, fat: 0, carbs: null } };
  assert.deepEqual(dishNutrition(product), [{ label: 'Kcal', value: 0 }, { label: 'Fat', value: 0 }]);
});
