import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

let now = 0;
let frames = [];
mock.method(performance, 'now', () => now);
globalThis.requestAnimationFrame = (callback) => { frames.push(callback); };
const { createPageScroller } = await import('../src/motion/page-scroll.js');

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
  const listeners = new Map();
  const preferenceListeners = new Set();
  const preference = {
    matches: reduced,
    addEventListener: (_, fn) => preferenceListeners.add(fn),
    removeEventListener: (_, fn) => preferenceListeners.delete(fn),
  };
  const positions = [], settled = [];
  globalThis.document = { documentElement: { scrollHeight: 12000 } };
  globalThis.getComputedStyle = () => ({ scrollMarginTop: '176px' });
  globalThis.window = {
    scrollY: 0, innerHeight: 1000,
    matchMedia: () => preference,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
    scrollTo: ({ top }) => { window.scrollY = Math.round(top); positions.push(window.scrollY); },
  };
  const scroller = createPageScroller(() => settled.push(window.scrollY));
  t.after(() => { scroller.dispose(); advance(800); });
  return {
    scroller, positions, settled, listeners, preferenceListeners,
    element: (top) => ({ isConnected: true, getBoundingClientRect: () => ({ top: top - window.scrollY }) }),
    emit: (type, event = {}) => listeners.get(type)?.(event),
    setReduced(value) { preference.matches = value; for (const fn of preferenceListeners) fn(); },
  };
}

test('long navigation keeps tracking locked until the exact section anchor is reached', async (t) => {
  const { scroller, element, settled } = fixture(t);
  scroller.scrollTo(element(6000));
  advance(200);
  assert.ok(window.scrollY > 0 && window.scrollY < 5824);
  assert.equal(scroller.running, true);
  assert.equal(settled.length, 0);
  advance(800);
  await new Promise(setImmediate);
  assert.equal(window.scrollY, 5824);
  assert.equal(scroller.running, false);
  assert.deepEqual(settled, [5824]);
});

test('a new category retargets from the current position and never resumes the old destination', async (t) => {
  const { scroller, element, settled } = fixture(t);
  scroller.scrollTo(element(9000));
  advance(170);
  const current = window.scrollY;
  scroller.scrollTo(element(700));
  assert.equal(window.scrollY, current);
  assert.equal(settled.length, 0);
  advance(800);
  assert.equal(window.scrollY, 524);
  advance(800);
  await new Promise(setImmediate);
  assert.deepEqual(settled, [524]);
});

test('a queued completion cannot finish a newer navigation', async (t) => {
  const { scroller, element, settled } = fixture(t);
  scroller.scrollTo(element(3000)); advance(800);
  scroller.scrollTo(element(9000));
  await new Promise(setImmediate);
  assert.equal(scroller.running, true);
  assert.equal(settled.length, 0);
  advance(800);
  await new Promise(setImmediate);
  assert.equal(window.scrollY, 8824);
  assert.deepEqual(settled, [8824]);
});

test('wheel, keyboard and pointer input release tracking; navigation clicks retarget without interruption', (t) => {
  const { scroller, element, emit, settled, positions, listeners, preferenceListeners } = fixture(t);
  scroller.scrollTo(element(5000));
  advance(100);
  emit('pointerdown', { target: { closest: () => true } });
  assert.equal(scroller.running, true);
  emit('wheel');
  const current = window.scrollY;
  advance(800);
  assert.equal(window.scrollY, current);
  assert.equal(scroller.running, false);
  assert.equal(settled.length, 1);
  for (const event of ['keydown', 'pointerdown', 'touchstart']) {
    scroller.scrollTo(element(6000)); advance(60);
    emit(event, { key: 'Tab' });
    assert.equal(scroller.running, false);
  }
  scroller.scrollTo(element(10000)); advance(80);
  scroller.dispose();
  const count = positions.length;
  advance(800);
  assert.equal(positions.length, count);
  assert.equal(listeners.size, 0);
  assert.equal(preferenceListeners.size, 0);
});

test('reduced motion is immediate, works live, and clamps unreachable destinations', (t) => {
  const { scroller, element, setReduced } = fixture(t, true);
  scroller.scrollTo(element(700));
  assert.equal(window.scrollY, 524);
  assert.equal(scroller.running, false);
  setReduced(false);
  scroller.scrollTo(element(7000)); advance(100);
  setReduced(true);
  assert.equal(window.scrollY, 6824);
  advance(800);
  assert.equal(window.scrollY, 6824);
  scroller.scrollTo(element(20000));
  assert.equal(window.scrollY, 11000);
  scroller.scrollTo(element(0));
  assert.equal(window.scrollY, 0);
});
