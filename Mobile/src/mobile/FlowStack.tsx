import {
  createContext,
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { useMobileDevice } from "./Device";
import { useKeyboard, useKeyboardDismissDrag, useKeyboardInsets } from "./Keyboard";
import { advanceStep, createStepTimeline, stepTiming, type StepAction, type StepMotionPreset, type StepState } from './step-motion';

export type FlowScreen = {
  id: string;
  title?: string;
  header?: (flow: FlowControls) => ReactNode;
  headerHeight?: number;
  footer?: (flow: FlowControls) => ReactNode;
  footerHeight?: number;
  focusSelector?: string;
  render: (flow: FlowControls) => ReactNode;
};

type FlowEntry = FlowScreen & {
  key: string;
};

export type FlowControls = {
  current: FlowEntry;
  previous: FlowEntry | null;
  stack: FlowEntry[];
  canGoBack: boolean;
  push: (screen: FlowScreen) => void;
  pop: () => void;
  replace: (screen: FlowScreen) => void;
  reset: (screen: FlowScreen) => void;
};

const FlowContext = createContext<FlowControls | null>(null);

export function useFlow() {
  const context = useContext(FlowContext);

  if (!context) {
    throw new Error("useFlow must be used inside FlowStack");
  }

  return context;
}

function FlowProvider({ value, children }: PropsWithChildren<{ value: FlowControls }>) {
  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

function StepFlowStack({ initial, preset }: { initial: FlowScreen; preset: StepMotionPreset }) {
  const { device } = useMobileDevice();
  const keyboard = useKeyboard();
  const keyboardRef = useRef(keyboard);
  keyboardRef.current = keyboard;
  const { bottomInset, keyboardDragging } = useKeyboardInsets();
  const reduced = !!useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<FlowEntry>({ ...initial, key: initial.id });
  const [view, setView] = useState<StepState<FlowEntry>>({ stack: [first.current], scenes: [first.current], direction: 1, revision: 0 });
  const viewRef = useRef(view);
  const timeline = useRef(createStepTimeline());
  const releaseFocus = useRef<(() => void) | null>(null);
  const keptKeyboard = useRef(false);
  const wantsFocus = useRef(false);
  const [transitioning, setTransitioning] = useState(false);
  const [reserveKeyboard, setReserveKeyboard] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const edge = useRef(false);

  const navigate = useCallback((action: StepAction<FlowEntry>) => {
    const next = advanceStep(viewRef.current, action);
    if (next === viewRef.current) return;
    timeline.current.cancel();
    releaseFocus.current?.();
    releaseFocus.current = null;
    const destination = next.stack[next.stack.length - 1];
    const kb = keyboardRef.current;
    keptKeyboard.current = !!destination.focusSelector && kb.visible;
    wantsFocus.current = !!destination.focusSelector;
    if (keptKeyboard.current) releaseFocus.current = kb.beginFocusTransfer();
    else kb.hide();
    viewRef.current = next;
    setReserveKeyboard(wantsFocus.current);
    setTransitioning(true);
    setSwipeX(0);
    setView(next);
  }, []);

  const controls = useMemo<FlowControls>(() => ({
    current: view.stack[view.stack.length - 1],
    previous: view.stack.at(-2) ?? null,
    stack: view.stack,
    canGoBack: view.stack.length > 1,
    push: screen => navigate({ type: 'push', screen: { ...screen, key: screen.id } }),
    replace: screen => navigate({ type: 'replace', screen: { ...screen, key: screen.id } }),
    reset: screen => navigate({ type: 'reset', screen: { ...screen, key: screen.id } }),
    pop: () => navigate({ type: 'pop' }),
  }), [view, navigate]);

  useLayoutEffect(() => {
    if (!view.revision) return;
    const focusRelease = releaseFocus.current;
    const timing = stepTiming(preset, reduced, keptKeyboard.current);
    timeline.current.start([
      { at: timing.focusMs, run: () => {
        if (wantsFocus.current && controls.current.focusSelector) {
          const field = root.current?.querySelector<HTMLElement>(`[data-flow-current="true"] ${controls.current.focusSelector}`);
          field?.focus({ preventScroll: true });
        }
        wantsFocus.current = false;
        focusRelease?.();
        if (releaseFocus.current === focusRelease) releaseFocus.current = null;
        setReserveKeyboard(false);
      } },
      { at: timing.endMs, run: () => setTransitioning(false) },
    ]);
    return () => {
      timeline.current.cancel();
      focusRelease?.();
      if (releaseFocus.current === focusRelease) releaseFocus.current = null;
    };
  }, [view, preset, reduced, controls.current]);

  const bindEdge = useDrag(state => {
    if (!controls.canGoBack) return;
    if (state.first) edge.current = state.initial[0] - (state.event.currentTarget as HTMLElement).getBoundingClientRect().left < 28;
    if (!edge.current) return;
    if (!state.last) { setSwipeX(Math.min(preset.distance, Math.max(0, state.movement[0]))); return; }
    setSwipeX(0);
    edge.current = false;
    if (state.movement[0] > 92 || (state.velocity[0] > 0.45 && state.direction[0] > 0)) controls.pop();
  }, { axis: 'x', filterTaps: true, pointer: { touch: true } });

  return <FlowProvider value={controls}>
    <div ref={root} className="flow-stack flow-step-stack" data-testid="flow-stack" data-motion-preset={preset.name}
      data-step-state={transitioning ? 'transitioning' : 'idle'} data-step-revision={view.revision}
      data-current-step={controls.current.id} data-reduced-motion={reduced} data-keyboard-dragging={keyboardDragging}
      style={{ '--flow-surface-top': `${device.geometry.safeArea.top}px` } as CSSProperties}
      onFocusCapture={event => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          wantsFocus.current = false;
          setReserveKeyboard(false);
        }
      }} {...bindEdge()}>
      <div className="flow-step-surface" aria-hidden="true" />
      <div className="flow-scenes">
        {view.scenes.map(entry => <StepScene key={entry.key} entry={entry} flow={controls} preset={preset}
          direction={view.direction} reduced={reduced} initialScene={entry.id === initial.id}
          inset={reserveKeyboard ? keyboard.fullHeight : bottomInset} swipeX={swipeX} />)}
      </div>
    </div>
  </FlowProvider>;
}

function StepScene({ entry, flow, preset, direction, reduced, initialScene, inset, swipeX }: {
  entry: FlowEntry; flow: FlowControls; preset: StepMotionPreset; direction: number;
  reduced: boolean; initialScene: boolean; inset: number; swipeX: number;
}) {
  const { device } = useMobileDevice();
  const dismissKeyboardDrag = useKeyboardDismissDrag();
  const active = entry.key === flow.current.key;
  const lastInset = useRef(inset);
  if (active) lastInset.current = inset;
  const timing = stepTiming(preset, reduced, false);
  const header = entry.header?.(flow);
  const footer = entry.footer?.(flow);
  const safeArea = header ? device.geometry.safeArea.top : 0;
  const duration = (active ? timing.enterMs : timing.exitMs) / 1000;
  const delay = active ? timing.enterDelayMs / 1000 : 0;
  return <motion.div className="flow-screen flow-step-scene" data-step={entry.id} data-flow-current={active}
    data-testid={active ? 'flow-current' : undefined} inert={!active} aria-hidden={!active || undefined}
    initial={initialScene ? false : { x: direction * timing.distance, opacity: 0 }}
    animate={{ x: reduced ? 0 : active ? swipeX : -direction * timing.distance, opacity: active ? 1 : 0 }}
    transition={{ x: { duration, delay, ease: active ? preset.entrance : preset.exit }, opacity: { duration, delay, ease: 'linear' } }}
    style={{ pointerEvents: active ? 'auto' : 'none', zIndex: active ? 2 : 1,
      '--flow-header-height': `${header ? safeArea + (entry.headerHeight ?? 0) : 0}px`,
      '--flow-header-safe-area': `${safeArea}px`,
      '--flow-footer-height': `${footer ? entry.footerHeight ?? 0 : 0}px`,
      '--keyboard-height': `${lastInset.current}px`,
    } as CSSProperties}>
    {header && <header className="flow-fixed-header" data-testid={active ? 'flow-fixed-header' : undefined}>{header}</header>}
    <div className="flow-step-body">{entry.render(flow)}</div>
    {footer && <footer className="flow-fixed-footer" data-testid={active ? 'flow-fixed-footer' : undefined} {...dismissKeyboardDrag}>{footer}</footer>}
  </motion.div>;
}

export function FlowStack({ initial, motionPreset }: { initial: FlowScreen; motionPreset?: StepMotionPreset }) {
  return motionPreset ? <StepFlowStack initial={initial} preset={motionPreset} /> : <PushFlowStack initial={initial} />;
}

function PushFlowStack({ initial }: { initial: FlowScreen }) {
  const { device } = useMobileDevice();
  const keyboard = useKeyboard();
  const { bottomInset, keyboardDragging } = useKeyboardInsets();
  const dismissKeyboardDrag = useKeyboardDismissDrag();
  const sequence = useRef(1);
  const gestureStartedAtEdge = useRef(false);
  const initialEntry = useRef<FlowEntry>({ ...initial, key: `${initial.id}-0` });
  const [stack, setStack] = useState<FlowEntry[]>(() => [initialEntry.current]);
  const [direction, setDirection] = useState(1);
  const [swipeX, setSwipeX] = useState(0);

  const toEntry = useCallback((screen: FlowScreen): FlowEntry => {
    const next = sequence.current;
    sequence.current += 1;
    return { ...screen, key: `${screen.id}-${next}` };
  }, []);

  const pop = useCallback(() => {
    keyboard.hide();
    setDirection(-1);
    setStack((currentStack) => {
      if (currentStack.length <= 1) return currentStack;
      return currentStack.slice(0, -1);
    });
  }, [keyboard]);

  const controls = useMemo<FlowControls>(() => {
    const current = stack[stack.length - 1];
    const previous = stack.length > 1 ? stack[stack.length - 2] : null;

    return {
      current,
      previous,
      stack,
      canGoBack: stack.length > 1,
      push: (screen) => {
        keyboard.hide();
        setDirection(1);
        setSwipeX(0);
        setStack((currentStack) => [...currentStack, toEntry(screen)]);
      },
      pop,
      replace: (screen) => {
        keyboard.hide();
        setDirection(1);
        setSwipeX(0);
        setStack((currentStack) => {
          const next = currentStack.slice(0, -1);
          return [...next, toEntry(screen)];
        });
      },
      reset: (screen) => {
        keyboard.hide();
        setDirection(1);
        setSwipeX(0);
        setStack([toEntry(screen)]);
      },
    };
  }, [keyboard, pop, stack, toEntry]);

  const bindEdgeSwipe = useDrag(
    (state) => {
      if (!controls.canGoBack) return;

      if (state.first) {
        const target = state.event.currentTarget as HTMLElement;
        const bounds = target.getBoundingClientRect();
        gestureStartedAtEdge.current = state.initial[0] - bounds.left < 28;
      }

      if (!gestureStartedAtEdge.current) return;

      const [movementX] = state.movement;
      const [velocityX] = state.velocity;
      const [directionX] = state.direction;
      const nextX = Math.max(0, Math.min(movementX, device.geometry.screen.width));

      if (!state.last) {
        setSwipeX(nextX);
        return;
      }

      const shouldPop = nextX > 92 || (velocityX > 0.45 && directionX > 0);
      setSwipeX(0);
      gestureStartedAtEdge.current = false;

      if (shouldPop) {
        controls.pop();
      }
    },
    {
      axis: "x",
      filterTaps: true,
      pointer: { touch: true },
    },
  );

  const screenWidth = device.geometry.screen.width;
  const topIndex = stack.length - 1;
  const parkedX = -screenWidth * 0.28;
  const header = controls.current.header?.(controls);
  const headerHeight = controls.current.headerHeight ?? 0;
  const headerSafeArea = header ? device.geometry.safeArea.top : 0;
  const totalHeaderHeight = header ? headerSafeArea + headerHeight : 0;
  const footer = controls.current.footer?.(controls);
  const footerHeight = controls.current.footerHeight ?? 0;

  const screenVariants = {
    enter: (animationDirection: number) => ({
      x: animationDirection > 0 ? screenWidth : parkedX,
      scale: animationDirection > 0 ? 1 : 0.985,
    }),
    exit: (animationDirection: number) => ({
      x: animationDirection < 0 ? screenWidth : parkedX,
      scale: animationDirection < 0 ? 1 : 0.985,
    }),
  };

  return (
    <FlowProvider value={controls}>
      <div
        className="flow-stack"
        data-testid="flow-stack"
        data-keyboard-dragging={keyboardDragging ? "true" : "false"}
        style={
          {
            "--flow-header-height": `${totalHeaderHeight}px`,
            "--flow-header-content-height": `${headerHeight}px`,
            "--flow-header-safe-area": `${headerSafeArea}px`,
            "--flow-footer-height": `${footer ? footerHeight : 0}px`,
            "--keyboard-height": `${bottomInset}px`,
          } as CSSProperties
        }
        {...bindEdgeSwipe()}
      >
        {header ? (
          <header className="flow-fixed-header" data-testid="flow-fixed-header">
            {header}
          </header>
        ) : null}
        <div className="flow-scenes">
          <AnimatePresence initial={false} custom={direction}>
            {stack.map((entry, index) => {
              const isTop = index === topIndex;
              const isVisible = index >= topIndex - 1;

              return (
                <motion.div
                  key={entry.key}
                  className="flow-screen"
                  data-flow-current={isTop ? "true" : "false"}
                  data-testid={isTop ? "flow-current" : undefined}
                  custom={direction}
                  variants={screenVariants}
                  initial={isTop ? "enter" : false}
                  animate={{
                    x: isTop ? swipeX : parkedX,
                    scale: isTop ? 1 : 0.985,
                  }}
                  exit="exit"
                  transition={{ type: "spring", stiffness: 360, damping: 38, mass: 0.9 }}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    pointerEvents: isTop ? "auto" : "none",
                    visibility: isVisible ? "visible" : "hidden",
                    zIndex: isTop ? 2 : 1,
                  }}
                >
                  {entry.render(controls)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {footer ? (
          <footer className="flow-fixed-footer" data-testid="flow-fixed-footer" {...dismissKeyboardDrag}>
            {footer}
          </footer>
        ) : null}
      </div>
    </FlowProvider>
  );
}
