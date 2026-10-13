import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent } from 'react';
import { animate, motion, useAnimationControls, useMotionValue, useReducedMotion } from 'motion/react';
import { MobileScroll, useKeyboardInsets, useMobileDevice, useScreenPortal } from '../mobile';
import { QuantityControl } from './QuantityControl';
import type { Product } from './catalog-model';
import { dishMotion, dishNutrition, dishTitle, dishWeight, photoRect, shouldDismissDish, swipeAxis, type PhotoRect } from './dish-model';
import './dish.css';

export type DishSelection = { product: Product; origin: PhotoRect; photo: HTMLElement; trigger: HTMLButtonElement };
type Phase = 'opening' | 'open' | 'closing';
type Gesture = { id: number; startX: number; startY: number; scale: number; base: number; axis: ReturnType<typeof swipeAxis>; samples: { x: number; t: number }[] };

export function DishDetail({ selection, quantity, onChange, onCollapse, onClosed }: {
  selection: DishSelection; quantity: number; onChange: (id: string, delta: number) => void;
  onCollapse: (id: string) => void; onClosed: () => void;
}) {
  const { device } = useMobileDevice();
  const { screenRef } = useScreenPortal();
  const { bottomInset } = useKeyboardInsets();
  const reduced = !!useReducedMotion();
  const panelTop = device.geometry.safeArea.top + 53;
  const width = device.geometry.screen.width;
  const height = device.geometry.screen.height - panelTop - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0);
  const dockBottom = Math.max(48, bottomInset + 14);
  const title = dishTitle(selection.product);
  const weight = dishWeight(selection.product);
  const nutrition = dishNutrition(selection.product);
  const panel = useRef<HTMLElement>(null), hero = useRef<HTMLDivElement>(null), info = useRef<HTMLDivElement>(null);
  const sourceHasFade = selection.photo.closest<HTMLElement>('.catalog-card')?.dataset.cardSize === 'large';
  const sourceFade = {
    '--dish-fade-height': `${sourceHasFade ? 300 : 318}px`,
    '--dish-fade-color': sourceHasFade ? 'rgba(18, 18, 18, 0.8)' : 'rgba(0, 0, 0, 0)',
    '--dish-blur': '0px',
  };
  const closeButton = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>('opening');
  const phaseRef = useRef<Phase>('opening');
  const [closeKind, setCloseKind] = useState<'collapse' | 'swipe'>('collapse');
  const [closingOrigin, setClosingOrigin] = useState<PhotoRect | null>(null);
  const [fadeHeight, setFadeHeight] = useState(318);
  const flight = useAnimationControls();
  const dragX = useMotionValue(0);
  const releaseAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const closedRef = useRef(onClosed); closedRef.current = onClosed;

  useEffect(() => {
    document.title = `${title} — Prana`;
    return () => { document.title = 'Prana — Menu'; releaseAnimation.current?.stop(); };
  }, [title]);

  useLayoutEffect(() => {
    if (!info.current) return;
    const update = () => setFadeHeight(Math.max(318, info.current!.offsetHeight + dockBottom + 64 + 28 + 48));
    const observer = new ResizeObserver(update);
    observer.observe(info.current); update();
    return () => observer.disconnect();
  }, [dockBottom]);

  const close = useCallback((kind: 'collapse' | 'swipe' = 'collapse') => {
    if (phaseRef.current === 'closing') return;
    releaseAnimation.current?.stop();
    gesture.current = null;
    if (kind === 'collapse') onCollapse(selection.product.id);
    if (phaseRef.current === 'open' && hero.current && panel.current) {
      const rect = hero.current.getBoundingClientRect(), bounds = panel.current.getBoundingClientRect();
      const scale = bounds.width / width;
      setClosingOrigin({ x: (rect.left - bounds.left) / scale, y: (rect.top - bounds.top) / scale,
        width: rect.width / scale, height: rect.height / scale, borderRadius: '32px 32px 0px 0px' });
    }
    phaseRef.current = 'closing'; setCloseKind(kind); setPhase('closing');
  }, [width, onCollapse, selection.product.id]);

  // A single cancellable owner for photo expansion/collapse and swipe completion.
  // No delayed autofocus or independent close timers can outlive this layer.
  useLayoutEffect(() => {
    if (phase === 'open') return;
    let cancelled = false;
    const destination = { x: 0, y: 0, width, height, borderRadius: '32px 32px 0px 0px',
      '--dish-fade-height': `${fadeHeight}px`, '--dish-fade-color': 'rgba(0, 0, 0, 1)', '--dish-blur': '17px' };
    const complete = () => {
      if (cancelled) return;
      if (phase === 'closing') closedRef.current();
      else { phaseRef.current = 'open'; setPhase('open'); closeButton.current?.focus({ preventScroll: true }); }
    };
    if (phase === 'closing' && closeKind === 'swipe') {
      releaseAnimation.current = animate(dragX, width, { duration: reduced ? 0 : dishMotion.swipe, ease: dishMotion.ease, onComplete: complete });
    } else {
      releaseAnimation.current = animate(dragX, 0, { duration: reduced ? 0 : dishMotion.close, ease: dishMotion.ease });
      const screen = screenRef.current?.getBoundingClientRect();
      const target = phase === 'opening' ? destination : { ...(selection.photo.isConnected && screen
        ? photoRect(selection.photo.getBoundingClientRect(), screen, width, panelTop) : selection.origin),
        '--dish-fade-height': `${sourceHasFade ? 300 : 318}px`,
        '--dish-fade-color': sourceHasFade ? 'rgba(18, 18, 18, 0.8)' : 'rgba(0, 0, 0, 0)', '--dish-blur': '0px' };
      if (phase === 'closing' && closingOrigin) flight.set(closingOrigin);
      if (reduced) {
        flight.set({ ...destination, ...(phase === 'closing' ? closingOrigin : {}), opacity: phase === 'opening' ? 0 : 1 });
        void flight.start({ opacity: phase === 'opening' ? 1 : 0 }, { duration: dishMotion.reduced }).then(complete);
      } else {
        void flight.start({ ...target, opacity: 1 }, { duration: phase === 'opening' ? dishMotion.open : dishMotion.close, ease: dishMotion.ease }).then(complete);
      }
    }
    return () => { cancelled = true; flight.stop(); releaseAnimation.current?.stop(); };
  }, [phase, closeKind, width, height, panelTop, reduced, flight, dragX, selection, closingOrigin, screenRef, fadeHeight, sourceHasFade]);

  // Keep one photo + gradient + blur surface for the entire lifetime of the dish.
  // Follow MobileScroll (including rubber-band transforms) without a compositor handoff.
  useLayoutEffect(() => {
    if (phase !== 'open') return;
    const viewport = panel.current?.querySelector<HTMLElement>('.mobile-scroll');
    const content = viewport?.querySelector<HTMLElement>('.mobile-scroll-content');
    if (!viewport || !content) return;
    flight.set({ x: 0, width, height, borderRadius: '32px 32px 0px 0px',
      '--dish-fade-height': `${fadeHeight}px`, '--dish-fade-color': 'rgba(0, 0, 0, 1)', '--dish-blur': '17px' });
    const syncPhoto = () => {
      if (!hero.current || !panel.current) return;
      const bounds = panel.current.getBoundingClientRect(), scale = bounds.width / width;
      flight.set({ y: (hero.current.getBoundingClientRect().top - bounds.top) / scale });
    };
    viewport.addEventListener('scroll', syncPhoto, { passive: true });
    const observer = new MutationObserver(syncPhoto);
    observer.observe(content, { attributes: true, attributeFilter: ['style'] });
    syncPhoto();
    return () => { viewport.removeEventListener('scroll', syncPhoto); observer.disconnect(); };
  }, [phase, flight, width, height, fadeHeight]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (phaseRef.current !== 'open' || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    suppressClick.current = false;
    if ((event.target as Element).closest('[data-dish-control]')) return;
    gesture.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY,
      scale: event.currentTarget.getBoundingClientRect().width / width, base: dragX.get(), axis: 'pending', samples: [] };
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = (event.clientX - g.startX) / g.scale, dy = (event.clientY - g.startY) / g.scale;
    if (g.axis === 'pending') {
      g.axis = swipeAxis(dx, dy);
      if (g.axis === 'horizontal') {
        g.base = dragX.get(); releaseAnimation.current?.stop();
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (g.axis !== 'horizontal') return;
    event.preventDefault(); event.stopPropagation(); suppressClick.current = true;
    const x = Math.max(0, Math.min(width, g.base + dx));
    dragX.set(x);
    g.samples.push({ x, t: event.timeStamp });
    g.samples = g.samples.filter(sample => event.timeStamp - sample.t < 100);
  };
  const finishGesture = (event: PointerEvent<HTMLElement>, cancelled = false) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.axis !== 'horizontal') return;
    event.preventDefault(); event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    g.samples.push({ x: dragX.get(), t: event.timeStamp });
    g.samples = g.samples.filter(sample => event.timeStamp - sample.t < 100);
    const first = g.samples[0], last = g.samples.at(-1);
    const velocity = first && last ? (last.x - first.x) / Math.max(1, last.t - first.t) : 0;
    if (!cancelled && shouldDismissDish(dragX.get(), velocity, width)) close('swipe');
    else releaseAnimation.current = animate(dragX, 0, reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key !== 'Tab') return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')].filter(button => !button.closest('[inert]'));
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  return <div className="prana-auth dish-layer" style={{ '--dish-panel-top': `${panelTop}px`, '--dish-hero-height': `${height}px`, '--dish-dock-bottom': `${dockBottom}px`, '--dish-fade-height': `${fadeHeight}px` } as CSSProperties}>
    <motion.section ref={panel} className="dish-panel" role="dialog" aria-modal="true" aria-labelledby="dish-title"
      data-dish-state={phase} data-dismiss-kind={closeKind} style={{ x: dragX }}
      onPointerDownCapture={onPointerDown} onPointerMoveCapture={onPointerMove}
      onPointerUpCapture={event => finishGesture(event)} onPointerCancelCapture={event => finishGesture(event, true)}
      onLostPointerCapture={event => { if (gesture.current?.id === event.pointerId) finishGesture(event, true); }}
      onClickCapture={event => { if (suppressClick.current) { suppressClick.current = false; event.preventDefault(); event.stopPropagation(); } }}
      onKeyDown={onKeyDown}>
      <motion.div className="dish-backdrop" initial={{ opacity: 0 }} animate={{ opacity: phase === 'closing' && closeKind === 'collapse' ? 0 : 1 }} transition={{ duration: reduced ? dishMotion.reduced : phase === 'closing' ? dishMotion.close : 0.18 }} />
      <motion.div className="dish-body" inert={phase === 'closing'} initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'closing' && closeKind === 'collapse' ? 0 : 1 }}
        transition={{ duration: reduced ? dishMotion.reduced : phase === 'closing' ? 0.12 : 0.2, delay: phase === 'opening' && !reduced ? 0.16 : 0 }}>
        <MobileScroll className="dish-scroll"><div className="dish-content">
          <div ref={hero} className="dish-hero">
            <div ref={info} className="dish-hero-info">
              <h1 id="dish-title">{title}</h1><p className="dish-description">{selection.product.description}</p>
              {weight && <p className="dish-weight">{weight}</p>}
            </div>
          </div>
          {nutrition.length > 0 && <section className="dish-about" aria-labelledby="dish-about-title">
            <h2 id="dish-about-title">About the Product</h2>
            <dl className="dish-nutrition" aria-label="Nutrition per portion">{nutrition.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          </section>}
        </div></MobileScroll>
        <button ref={closeButton} className="dish-close" type="button" data-dish-control aria-label="Close dish" onClick={() => close()}><img src="/assets/dish/close.svg" alt="" /></button>
        <div className="dish-purchase-dock" data-dish-control><QuantityControl product={selection.product} quantity={quantity} large={false} detail onChange={onChange} /></div>
      </motion.div>
      <motion.div className="dish-photo-flight" initial={{ ...selection.origin, ...sourceFade }} animate={flight}>
        <img className="dish-hero-image" src={`/assets/${selection.product.image}`} alt={selection.product.imageAlt} />
        <div className="dish-hero-fade" aria-hidden="true" />
      </motion.div>
    </motion.section>
  </div>;
}
