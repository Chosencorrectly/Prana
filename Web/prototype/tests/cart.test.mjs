import test from "node:test";
import assert from "node:assert/strict";
import { changeCartQuantity, getCart } from "../src/data/cart.js";
import { createPromoController, promoTiming } from "../src/data/promo.js";

const products = [{ id: "toast", priceCents: 1195 }, { id: "bowl", priceCents: 1895 }];
function validationHarness() {
  let now = 0;
  let nextId = 0;
  const jobs = new Map();
  const states = [];
  const controller = createPromoController((state) => states.push(state), {
    schedule(fn, delay) { const id = ++nextId; jobs.set(id, { fn, time: now + delay }); return id; },
    cancel(id) { jobs.delete(id); },
  });
  return {
    controller, states, jobs,
    get state() { return states.at(-1); },
    tick(ms) {
      const until = now + ms;
      while (true) {
        const next = [...jobs].filter(([, job]) => job.time <= until).sort((a, b) => a[1].time - b[1].time)[0];
        if (!next) break;
        now = next[1].time; jobs.delete(next[0]); next[1].fn();
      }
      now = until;
    },
  };
}

test("shared quantities accumulate rapid changes, remove at zero, and ignore unknown catalogue IDs in totals", () => {
  let quantities = {};
  for (let i = 0; i < 12; i++) quantities = changeCartQuantity(quantities, "toast", 1);
  assert.equal(getCart(products, quantities).quantity, 12);
  assert.equal(getCart(products, quantities).subtotalCents, 14340);
  for (let i = 0; i < 15; i++) quantities = changeCartQuantity(quantities, "toast", -1);
  assert.deepEqual(quantities, {});
  assert.equal(getCart(products, { missing: 99 }).items.length, 0);
});

test("discount is integer cents, applies only after validation and recalculates with quantities", () => {
  const quantities = { toast: 1, bowl: 2 };
  for (const state of ["idle", "debouncing", "validating", "invalid"]) {
    const cart = getCart(products, quantities, state);
    assert.equal(cart.subtotalCents, 4985); assert.equal(cart.totalCents, 4985); assert.equal(cart.discountCents, 0);
  }
  const cart = getCart(products, quantities, "applied");
  assert.equal(cart.quantity, 3); assert.equal(cart.discountCents, 499); assert.equal(cart.totalCents, 4486);
  assert.equal(getCart(products, { toast: 2 }, "applied").totalCents, 2151);
  assert.equal(getCart(products, {}, "applied").totalCents, 0);
});

test("typing waits for a pause, then shows loader before applying 1111", () => {
  const h = validationHarness();
  h.controller.setValue("1"); h.tick(300); h.controller.setValue("1111");
  h.tick(promoTiming.debounce - 1); assert.equal(h.state.status, "debouncing");
  h.tick(1); assert.equal(h.state.status, "validating");
  h.tick(promoTiming.validation - 1); assert.equal(h.state.status, "validating");
  h.tick(1); assert.deepEqual(h.state, { value: "1111", status: "applied" });
  assert.equal(h.states.filter((state) => state.status === "validating").length, 1);
});

test("editing resets success immediately; a stale response cannot restore it", () => {
  const h = validationHarness();
  h.controller.setValue("1111"); h.tick(promoTiming.debounce);
  const oldResponse = [...h.jobs.values()][0].fn;
  h.controller.setValue("wrong"); oldResponse();
  assert.deepEqual(h.state, { value: "wrong", status: "debouncing" });
  h.tick(promoTiming.debounce + promoTiming.validation); assert.equal(h.state.status, "invalid");
  h.controller.setValue("1111"); h.tick(promoTiming.debounce + promoTiming.validation);
  assert.equal(h.state.status, "applied");
  h.controller.setValue("1112"); assert.equal(h.state.status, "debouncing");
});

test("blank optional code cancels validation and clears feedback", () => {
  const h = validationHarness();
  h.controller.setValue("1111"); h.tick(promoTiming.debounce);
  const oldResponse = [...h.jobs.values()][0].fn;
  h.controller.clear(); oldResponse(); h.tick(2000);
  assert.deepEqual(h.state, { value: "", status: "idle" }); assert.equal(h.jobs.size, 0);
  h.controller.setValue("   "); h.tick(2000); assert.equal(h.state.status, "idle");
});

test("IME composition waits until committed and boundary spaces are tolerated", () => {
  const h = validationHarness();
  h.controller.setValue("1111", { composing: true }); h.tick(2000); assert.equal(h.state.status, "idle");
  h.controller.setValue(" 1111 "); h.tick(promoTiming.debounce + promoTiming.validation); assert.equal(h.state.status, "applied");
});

test("disposal prevents pending or later input from publishing results", () => {
  const h = validationHarness();
  h.controller.setValue("1111"); h.tick(promoTiming.debounce);
  const oldResponse = [...h.jobs.values()][0].fn;
  h.controller.dispose(); const length = h.states.length;
  oldResponse(); h.controller.setValue("1111"); h.tick(2000);
  assert.equal(h.states.length, length); assert.equal(h.jobs.size, 0);
});
