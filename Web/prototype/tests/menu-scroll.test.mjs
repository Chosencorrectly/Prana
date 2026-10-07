import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

// Deterministic frames for the real Motion engine; no browser or wall-clock sleeps.
let now = 0;
let frames = [];
mock.method(performance, 'now', () => now);
globalThis.requestAnimationFrame = (callback) => { frames.push(callback); };
const { createMenuScroller, menuScrollPosition } = await import('../src/motion/menu-scroll.js');

function advance(milliseconds) {
  const end = now + milliseconds;
  while (now < end) {
    now = Math.min(end, now + 1000 / 60);
    const pending = frames;
    frames = [];
    for (const callback of pending) callback(now);
  }
}

function fixture(t, reduced = false) {
  const listeners = new Set();
  const preference = {
    matches: reduced,
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
  };
  globalThis.window = { matchMedia: () => preference };
  const styles = new Map();
  let nativeScroll = 0;
  const list = {
    scrollWidth: 1499, clientWidth: 1120,
    get scrollLeft() { return nativeScroll; },
    set scrollLeft(value) { nativeScroll = Math.round(Math.max(0, Math.min(value, 379))); },
    style: {
      getPropertyValue: (name) => styles.get(name) || '',
      setProperty: (name, value) => styles.set(name, value),
      removeProperty: (name) => styles.delete(name),
    },
  };
  const positions = [];
  const scroller = createMenuScroller(list, () => positions.push(menuScrollPosition(list)));
  t.after(() => { scroller.dispose(); advance(500); });
  return { list, positions, scroller, listeners, setReduced(value) {
    preference.matches = value;
    for (const listener of listeners) listener();
  } };
}

test('interrupted hint reverses from its visible position without snapping or overshooting', (t) => {
  const { list, positions, scroller } = fixture(t);
  scroller.scrollTo(12, 'menuHint');
  advance(90);
  const midpoint = menuScrollPosition(list);
  assert.ok(midpoint > 0 && midpoint < 12);
  assert.ok(positions.some((value) => value !== Math.round(value)), 'fractional positions must remain visible');
  scroller.scrollTo(0, 'menuReturn');
  assert.equal(menuScrollPosition(list), midpoint);
  advance(300);
  assert.equal(menuScrollPosition(list), 0);
  assert.ok(positions.every((value) => value >= 0 && value <= 12));
});

test('navigation takes over an unfinished hover return and settles at real bounds', (t) => {
  const { list, scroller } = fixture(t);
  scroller.scrollTo(12, 'menuHint');
  advance(120);
  scroller.scrollTo(0, 'menuReturn');
  advance(40);
  scroller.scrollTo(900, 'menuReveal');
  advance(500);
  assert.equal(menuScrollPosition(list), 379);
  advance(500);
  assert.equal(menuScrollPosition(list), 379, 'old return must not resume');
  scroller.scrollTo(-10);
  advance(500);
  assert.equal(menuScrollPosition(list), 0);
});

test('manual scrolling cancels animation and disposal prevents further writes', (t) => {
  const { list, positions, scroller, listeners } = fixture(t);
  scroller.scrollTo(379);
  advance(80);
  scroller.interrupt();
  list.scrollLeft = 110;
  advance(500);
  assert.equal(menuScrollPosition(list), 110);
  scroller.scrollTo(0);
  advance(50);
  scroller.dispose();
  const count = positions.length;
  advance(500);
  assert.equal(positions.length, count);
  assert.equal(listeners.size, 0);
});

test('reduced motion is immediate and changing the preference completes an active animation', (t) => {
  const { list, scroller, setReduced } = fixture(t, true);
  scroller.scrollTo(12, 'menuHint');
  assert.equal(menuScrollPosition(list), 12);
  scroller.scrollTo(0, 'menuReturn');
  assert.equal(menuScrollPosition(list), 0);
  setReduced(false);
  scroller.scrollTo(379);
  advance(70);
  assert.ok(menuScrollPosition(list) > 0 && menuScrollPosition(list) < 379);
  setReduced(true);
  assert.equal(menuScrollPosition(list), 379);
  advance(500);
  assert.equal(menuScrollPosition(list), 379);
});
