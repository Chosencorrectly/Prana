// IBM Carbon productive motion, adapted to Prana's small desktop interactions.
// Source: https://v10.carbondesignsystem.com/guidelines/motion/overview/
// Durations are seconds for Motion; CSS variables are derived from the same data.
export const duration = {
  fast01: 0.07, fast02: 0.11, moderate01: 0.15,
  moderate02: 0.24, slow01: 0.4, slow02: 0.7,
};

export const easing = {
  standard: [0.2, 0, 0.38, 0.9],
  entrance: [0, 0, 0.38, 0.9],
  exit: [0.2, 0, 1, 0.9],
  // Gentle, symmetric acceleration and deceleration for long page travel.
  gentleInOut: [0.3, 0, 0.7, 1],
};

export const motion = {
  cardEnter: { duration: duration.moderate01, ease: easing.entrance },
  cardLeave: { duration: duration.moderate02, ease: easing.standard },
  menuHint: { duration: duration.moderate02, ease: easing.standard },
  menuReturn: { duration: duration.moderate02, ease: easing.standard },
  menuReveal: { duration: duration.slow01, ease: easing.standard },
  pageScroll: { duration: duration.slow02, ease: easing.gentleInOut },
  categoryState: { duration: duration.moderate02, ease: easing.standard },
  controlHover: { duration: duration.moderate01, ease: easing.entrance },
  toggleState: { duration: duration.moderate02, ease: easing.standard },
  calendarMonth: { duration: duration.moderate02, ease: easing.standard },
  searchHighlight: { duration: duration.moderate01, ease: easing.entrance },
  searchSurroundings: { duration: duration.moderate02, ease: easing.standard },
  searchResultEnter: { duration: duration.moderate02, ease: easing.entrance },
  searchResultMove: { duration: duration.moderate02, ease: easing.standard },
  dialogEnter: { duration: duration.moderate02, ease: easing.entrance },
  dialogExit: { duration: duration.fast02, ease: easing.exit },
  cartStateEnter: { duration: duration.moderate02, ease: easing.entrance },
  cartStateExit: { duration: duration.fast02, ease: easing.exit },
  purchaseEnter: { duration: duration.moderate02, ease: easing.entrance },
  purchaseExit: { duration: duration.fast02, ease: easing.exit },
  quantityChange: { duration: duration.moderate01, ease: easing.entrance },
};

// Relative brightness of the card surface only; photos and content stay unchanged.
export const cardHoverBrightness = 1.5;

export const pageScrollDuration = (distance) => Math.min(
  motion.pageScroll.duration,
  Math.max(duration.slow01, duration.moderate02 + Math.sqrt(Math.abs(distance)) * 0.004),
);

const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
export const motionCssVariables = {
  ...Object.fromEntries(Object.entries(duration).map(([name, value]) => [`--motion-duration-${kebab(name)}`, `${value * 1000}ms`])),
  ...Object.fromEntries(Object.entries(easing).map(([name, value]) => [`--motion-ease-${name}`, `cubic-bezier(${value.join(', ')})`])),
  ...Object.fromEntries(Object.entries(motion).flatMap(([name, value]) => [
    [`--motion-${kebab(name)}-duration`, `${value.duration * 1000}ms`],
    [`--motion-${kebab(name)}-ease`, `cubic-bezier(${value.ease.join(', ')})`],
  ])),
  '--card-hover-brightness': cardHoverBrightness,
};
