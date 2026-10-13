export type StepMotionPreset = {
  name: string;
  distance: number;
  exitMs: number;
  enterDelayMs: number;
  enterMs: number;
  focusMs: number;
  keyboardMs: number;
  reducedMs: number;
  entrance: [number, number, number, number];
  exit: [number, number, number, number];
};

export function stepTiming(preset: StepMotionPreset, reduced: boolean, keyboardOpen: boolean) {
  return {
    distance: reduced ? 0 : preset.distance,
    exitMs: reduced ? preset.reducedMs : preset.exitMs,
    enterDelayMs: reduced ? 0 : preset.enterDelayMs,
    enterMs: reduced ? preset.reducedMs : preset.enterMs,
    focusMs: reduced || keyboardOpen ? 0 : preset.focusMs,
    endMs: reduced ? preset.reducedMs : Math.max(
      preset.enterDelayMs + preset.enterMs,
      keyboardOpen ? 0 : preset.focusMs + preset.keyboardMs,
    ),
  };
}

// A small, bounded flow: one mounted scene per unique step ID. Keeping the same
// scene lets Motion reverse from its actual position, even during a quick Back.
export type StepState<T extends { id: string }> = {
  stack: T[];
  scenes: T[];
  direction: number;
  revision: number;
};
export type StepAction<T> = { type: 'pop' } | { type: 'push' | 'replace' | 'reset'; screen: T };

export function advanceStep<T extends { id: string }>(state: StepState<T>, action: StepAction<T>): StepState<T> {
  if (action.type === 'pop') {
    return state.stack.length < 2 ? state : {
      ...state, stack: state.stack.slice(0, -1), direction: -1, revision: state.revision + 1,
    };
  }
  if (state.stack.at(-1)?.id === action.screen.id && (action.type !== 'reset' || state.stack.length === 1)) return state;
  const screen = state.scenes.find(scene => scene.id === action.screen.id) ?? action.screen;
  const existingIndex = state.stack.findIndex(entry => entry.id === screen.id);
  const stack = action.type === 'reset' ? [screen] : existingIndex >= 0 ? state.stack.slice(0, existingIndex + 1)
    : [...(action.type === 'replace' ? state.stack.slice(0, -1) : state.stack), screen];
  return {
    stack,
    scenes: state.scenes.includes(screen) ? state.scenes : [...state.scenes, screen],
    direction: action.type !== 'reset' && existingIndex >= 0 ? -1 : 1,
    revision: state.revision + 1,
  };
}

// One owner for focus and completion. Generation checks also reject a callback
// already queued by the browser when a new navigation cancels the old sequence.
export function createStepTimeline(
  schedule: (callback: () => void, delay: number) => unknown = (callback, delay) => setTimeout(callback, delay),
  unschedule: (handle: unknown) => void = handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
) {
  let generation = 0;
  let handles: unknown[] = [];
  const cancel = () => {
    generation += 1;
    handles.forEach(unschedule);
    handles = [];
  };
  return {
    cancel,
    start(events: { at: number; run: () => void }[]) {
      cancel();
      const owner = generation;
      for (const event of events) {
        const run = () => { if (owner === generation) event.run(); };
        if (event.at === 0) run();
        else handles.push(schedule(run, event.at));
      }
    },
  };
}
