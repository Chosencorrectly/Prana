import type { StepMotionPreset } from './mobile/step-motion';

// Prana tuning, inspired by Shared Axis and Carbon productive motion.
// Milliseconds here; Motion receives seconds only at the rendering boundary.
export const authStep: StepMotionPreset = {
  name: 'authStep',
  distance: 24,
  exitMs: 140,
  enterDelayMs: 80,
  enterMs: 240,
  focusMs: 180,
  keyboardMs: 260,
  reducedMs: 80,
  entrance: [0, 0, 0.38, 0.9],
  exit: [0.2, 0, 1, 0.9],
};
