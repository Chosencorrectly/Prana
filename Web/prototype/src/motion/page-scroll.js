import { animate } from 'motion';
import { motion, pageScrollDuration } from './tokens.js';

const navigationKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab']);

export function createPageScroller(onSettled) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation = null;
  let target = null;
  let running = false;
  let revision = 0;

  function position() {
    const offset = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(target.getBoundingClientRect().top + window.scrollY - offset, maximum));
  }
  function render(top) { window.scrollTo({ top, behavior: 'instant' }); }
  function stop() { revision += 1; animation?.stop(); animation = null; }
  function settle() {
    running = false;
    target = null;
    onSettled();
  }
  function finish() {
    stop();
    if (target?.isConnected) render(position());
    settle();
  }
  function interrupt() {
    if (!running) return;
    stop();
    settle();
  }
  function scrollTo(element) {
    // A second selection replaces the route without releasing active-category tracking.
    stop();
    target = element;
    if (!target?.isConnected) { settle(); return; }
    const from = window.scrollY;
    const to = position();
    running = true;
    if (preference.matches || Math.abs(from - to) < 1) { finish(); return; }
    const request = revision;
    animation = animate(from, to, {
      ...motion.pageScroll,
      duration: pageScrollDuration(to - from),
      onUpdate: (value) => { if (request === revision) render(value); },
      onComplete: () => { if (request === revision && running) finish(); },
    });
  }
  function onKeyDown(event) {
    if (navigationKeys.has(event.key)) interrupt();
  }
  function onPointerDown(event) {
    // A navigation click will retarget directly, without a flash of the section in transit.
    if (!event.target?.closest?.('.category-link, .header-logo')) interrupt();
  }
  function onPreference() { if (preference.matches && running) finish(); }
  const events = [['wheel', interrupt], ['touchstart', interrupt], ['pointerdown', onPointerDown], ['keydown', onKeyDown], ['resize', interrupt]];
  for (const [name, handler] of events) window.addEventListener(name, handler, { passive: true });
  preference.addEventListener('change', onPreference);

  return {
    get running() { return running; },
    scrollTo,
    interrupt,
    dispose() {
      stop(); running = false; target = null;
      for (const [name, handler] of events) window.removeEventListener(name, handler);
      preference.removeEventListener('change', onPreference);
    },
  };
}
