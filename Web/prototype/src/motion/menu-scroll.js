import { animate } from 'motion';
import { motion } from './tokens.js';

const clamp = (value, maximum) => Math.max(0, Math.min(value, maximum));
const maximumScroll = (list) => Math.max(0, list.scrollWidth - list.clientWidth);

export function menuScrollPosition(list) {
  // Native scrolling may round to whole pixels. The track renders the remainder.
  const remainder = parseFloat(list.style.getPropertyValue('--menu-subpixel-x')) || 0;
  return clamp(list.scrollLeft - remainder, maximumScroll(list));
}

export function createMenuScroller(list, onUpdate) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation = null;
  let destination = null;

  function stop() {
    animation?.stop();
    animation = null;
  }

  function render(value) {
    const position = clamp(value, maximumScroll(list));
    // Round down so the remainder never expands the scrollable right boundary.
    list.scrollLeft = Math.floor(position);
    list.style.setProperty('--menu-subpixel-x', `${list.scrollLeft - position}px`);
    onUpdate();
  }

  function scrollTo(left, intent = 'menuReveal') {
    // Retarget from the displayed position, including a partially completed hint.
    stop();
    const current = menuScrollPosition(list);
    destination = clamp(left, maximumScroll(list));
    if (preference.matches || Math.abs(current - destination) < 0.01) {
      render(destination);
      return;
    }
    animation = animate(current, destination, {
      ...motion[intent],
      onUpdate: render,
      onComplete: () => { animation = null; },
    });
  }

  function interrupt() {
    stop();
    destination = null;
    list.style.removeProperty('--menu-subpixel-x');
    onUpdate();
  }

  function preferenceChanged() {
    if (!preference.matches) return;
    stop();
    if (destination !== null) render(destination);
  }
  preference.addEventListener('change', preferenceChanged);

  return {
    scrollTo,
    interrupt,
    dispose() {
      stop();
      preference.removeEventListener('change', preferenceChanged);
      list.style.removeProperty('--menu-subpixel-x');
    },
  };
}
