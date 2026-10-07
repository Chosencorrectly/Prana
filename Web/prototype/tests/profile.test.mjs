import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDemoOrders, createProfile, dateToValue, detailsChanged, profileReducer, validBirthDate, valueToDate } from "../src/data/profile.js";
const today = new Date(2026, 9, 6);
const edit = (state, field, value) => profileReducer(state, { type: "edit", field, value });

test("Save is dirty only for meaningful edits and becomes clean on revert", () => {
  const initial = createProfile();
  assert.equal(detailsChanged(initial.draft, initial.saved), false);
  const changed = edit(initial, "name", "Alexandra");
  assert.equal(detailsChanged(changed.draft, changed.saved), true);
  assert.equal(initial.saved.name, "Alex");
  const reverted = edit(changed, "name", " Alex ");
  assert.equal(detailsChanged(reverted.draft, reverted.saved), false);
});
test("Save replaces the baseline, shows Saved and subsequent edits reset feedback", () => {
  const changed = edit(createProfile(), "email", "demo@example.com ");
  const saved = profileReducer(changed, { type: "save", today });
  assert.equal(saved.status, "saved");
  assert.equal(saved.saved.email, "demo@example.com");
  assert.equal(detailsChanged(saved.draft, saved.saved), false);
  const next = edit(saved, "phone", "+62 123456789");
  assert.equal(next.status, "idle");
  assert.equal(detailsChanged(next.draft, next.saved), true);
});
test("Invalid contact or future birth date cannot replace saved details", () => {
  for (const [field, value] of [["name", " "], ["phone", ""], ["email", "broken"], ["birthDate", "2026-10-07"]]) {
    const changed = edit(createProfile(), field, value);
    assert.equal(profileReducer(changed, { type: "save", today }), changed);
  }
});
test("Local calendar dates round-trip without UTC shifts and reject impossible dates", () => {
  assert.equal(dateToValue(valueToDate("1985-06-12")), "1985-06-12");
  assert.equal(validBirthDate("2000-02-29", today), true);
  assert.equal(validBirthDate("1900-02-29", today), false);
  assert.equal(validBirthDate("1985-06-31", today), false);
  assert.equal(validBirthDate("1899-12-31", today), false);
  assert.equal(validBirthDate("2026-10-06", today), true);
  assert.equal(validBirthDate("2026-10-07", today), false);
  assert.equal(valueToDate("not-a-date"), undefined);
});
test("Marketing changes independently, preserves personal draft and does not dirty it", () => {
  const initial = createProfile();
  const toggled = profileReducer(initial, { type: "marketing" });
  assert.equal(toggled.marketing, false);
  assert.equal(toggled.draft, initial.draft);
  assert.equal(detailsChanged(toggled.draft, toggled.saved), false);
  assert.equal(profileReducer(toggled, { type: "marketing" }).marketing, true);
});
test("Demo orders have distinct past dates, original products and exact totals", () => {
  const products = JSON.parse(readFileSync(new URL("../src/data/catalog.json", import.meta.url))).products;
  const orders = createDemoOrders(products, today, () => .5);
  assert.equal(orders.length, 2);
  assert.ok(orders[0].date < today && orders[1].date < orders[0].date);
  for (const order of orders) {
    assert.equal(new Set(order.items.map(({ product }) => product.id)).size, 3);
    assert.ok(order.items.every(({ product }) => products.includes(product)));
    assert.equal(order.totalCents, order.items.reduce((sum, { product, quantity }) => sum + product.priceCents * quantity, 0));
  }
  assert.notDeepEqual(createDemoOrders(products, today, () => .1), createDemoOrders(products, today, () => .9));
});
