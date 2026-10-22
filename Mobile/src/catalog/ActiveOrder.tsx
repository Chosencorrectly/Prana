import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { MobileScroll, useMobileDevice, useScreenPortal } from '../mobile';
import { BottomFade } from './BottomFade';
import { useActiveOrder } from './ActiveOrderState';
import { money } from './catalog-model';
import { allergySummary } from './checkout-options';
import { dishTitle } from './dish-model';
import { orderSnapNames, orderSnapPoints, settleOrderSnap, type ActiveOrder as Order, type OrderSnap } from './order-model';
import './active-order.css';

const asset = (name: string, extension = 'svg') => `/assets/active-order/${name}.${extension}`;
const ease = [.2, .8, .2, 1] as const;

function OrderProgress({ stage }: { stage: number }) {
  return <div className="order-progress" role="img" aria-label={`Order progress: stage ${stage} of 3`}>{[1, 2, 3].map(index => <span key={index} data-complete={index <= stage} />)}</div>;
}

export function ActiveOrderShortcut({ onOpen }: { onOpen: (trigger: HTMLButtonElement) => void }) {
  const { order } = useActiveOrder();
  if (!order) return null;
  return <button className="active-order-shortcut" type="button" aria-label="Track active order" onClick={event => onOpen(event.currentTarget)}>
    <span><strong>{order.status}</strong><span>Free delivery • <span className="active-order-arrival">{order.eta}</span></span></span>
    <img src={asset('courier-banner', 'png')} alt="" width={52} height={52} />
  </button>;
}

function OrderDetails({ order }: { order: Order }) {
  const { presentation } = useActiveOrder();
  const [expanded, setExpanded] = useState(presentation.current.expanded), reduced = !!useReducedMotion();
  const { details, location } = order.address;
  const address = [location.street, details.building, details.unit && `Apt ${details.unit}`, details.floor && `Floor ${details.floor}`, details.access && `Gate code ${details.access}`].filter(Boolean).join(' · ');
  const row = (item: Order['items'][number]) => <li className="order-item" key={item.id}><div><h3>{dishTitle(item)}</h3><p>{item.description}</p></div><div className="order-item-price"><span>{item.quantity} x</span><strong>{money(item.priceCents)}</strong></div></li>;
  return <div className="active-order-content">
    <section aria-labelledby="active-delivery-title"><h2 id="active-delivery-title">Delivery</h2>
      <div className="active-delivery-card"><div className="active-delivery-address"><img src={asset('house')} alt="" /><p>{address}</p></div>
        <img className="active-address-divider" src={asset('address-divider')} alt="" width={372} height={1} />
        <div className="active-delivery-note"><span>Comments for the courier</span><p>{(order.options.courierNote ?? details.instructions) || 'No delivery instructions'}</p></div>
      </div>
    </section>
    <section className="active-order-details" aria-labelledby="active-details-title"><h2 id="active-details-title">Order details</h2>
      <div className="active-order-card"><ul className="active-order-items" aria-label="Ordered dishes">{order.items.slice(0, 3).map(row)}</ul>
        {order.items.length > 3 && <><motion.div className="order-more-reveal" id="order-more-items" inert={!expanded} aria-hidden={!expanded || undefined} initial={false} animate={{ gridTemplateRows: expanded ? '1fr' : '0fr', opacity: expanded ? 1 : 0 }} transition={{ duration: reduced ? 0 : .24, ease }}><div><ul className="active-order-items">{order.items.slice(3).map(row)}</ul></div></motion.div>
          <button type="button" className="order-show-more" aria-expanded={expanded} aria-controls="order-more-items" onClick={() => { presentation.current.expanded = !expanded; setExpanded(!expanded); }}>{expanded ? 'Show less' : 'Show more'}</button></>}
        <div className="active-order-summary"><img src={asset('summary-divider')} alt="" width={360} height={1} /><dl>
          <div><dt>Subtotal · {order.count} {order.count === 1 ? 'item' : 'items'}</dt><dd>{money(order.subtotalCents)}</dd></div>
          <div><dt>Delivery · <span>free</span></dt><dd className="order-muted">$0</dd></div>
          <div><dt>Discount</dt><dd>−{money(order.discountCents)}</dd></div>
          <div><dt>Tax</dt><dd>{money(order.taxCents)}</dd></div>
          {!!order.tipCents && <div><dt>Tip</dt><dd>{money(order.tipCents)}</dd></div>}
          {!!order.options.allergens?.length && <div><dt>Allergies</dt><dd>{allergySummary(order.options.allergens)}</dd></div>}
          {order.options.paymentLabel && <div><dt>Payment method</dt><dd>{order.options.paymentLabel}</dd></div>}
        </dl><img src={asset('total-divider')} alt="" width={359.079} height={1} /><div className="active-order-total"><strong>Total</strong><strong>{money(order.totalCents)}</strong></div></div>
      </div>
    </section>
    <div className="active-order-points"><span className="active-points-icon"><img src={asset('points-circle')} alt="" /><img src={asset('points-mark')} alt="" /></span><div><strong>{order.points}</strong><span>Prana points</span></div><p>Will be credited today</p></div>
    <section className="delivery-support active-order-support" aria-labelledby="active-support-title"><h2 id="active-support-title">Need help with your order?</h2><p>Message us if something doesn’t look right</p><button type="button" aria-disabled="true"><img src={asset('whatsapp')} alt="" />Contact support</button></section>
  </div>;
}

// The map, fixed status and scroll viewport each stay mounted. Snap motion only
// translates this opaque panel; it never recreates the order or resets scroll.
export function ActiveOrderScreen({ onClose, returning }: { onClose: () => void; returning: boolean }) {
  const { order, presentation } = useActiveOrder(), { device } = useMobileDevice(), { screenRef } = useScreenPortal();
  const reduced = !!useReducedMotion();
  const height = device.geometry.screen.height - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0);
  const points = orderSnapPoints(height, device.platform === 'android' ? 0 : device.geometry.safeArea.bottom);
  const [snap, setSnap] = useState<OrderSnap>(presentation.current.snap);
  const y = useMotionValue(returning || reduced ? points[snap] : device.geometry.safeArea.top);
  const movement = useRef<ReturnType<typeof animate> | null>(null), scroll = useRef<HTMLDivElement>(null), close = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; start: number; origin: number; moved: boolean; handle: boolean; lastY: number; lastAt: number; velocity: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  function settle(next: OrderSnap) {
    movement.current?.stop(); presentation.current.snap = next; setSnap(next);
    movement.current = animate(y, points[next], reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 39, mass: .9 });
  }
  useLayoutEffect(() => {
    movement.current = animate(y, points[presentation.current.snap], { duration: returning || reduced ? 0 : .42, ease });
    close.current?.focus({ preventScroll: true });
    const viewport = scroll.current?.querySelector<HTMLElement>('.mobile-scroll');
    if (viewport) viewport.scrollTop = presentation.current.scroll;
    const save = () => { if (viewport) presentation.current.scroll = viewport.scrollTop; };
    viewport?.addEventListener('scroll', save, { passive: true });
    return () => { movement.current?.stop(); save(); viewport?.removeEventListener('scroll', save); };
  }, [height, reduced, returning, presentation, y]);
  useEffect(() => { document.title = 'Prana — Active order'; }, []);
  function end(event: PointerEvent, cancelled = false) {
    const start = drag.current; if (!start || start.id !== event.pointerId) return;
    drag.current = null; setDragging(false);
    const velocity = event.timeStamp - start.lastAt > 100 ? 0 : start.velocity;
    settle(cancelled ? snap : start.moved ? settleOrderSnap(y.get(), velocity, points) : start.handle ? (snap === 0 ? 1 : 0) : snap);
  }
  if (!order) return null;
  return <div className="active-order-screen" data-snap={snap} data-dragging={dragging} style={{ '--order-safe-top': `${device.geometry.safeArea.top}px`, '--order-full-height': `${height}px` } as CSSProperties}>
    <motion.div className="active-order-map" role="img" aria-label="Delivery route preview with a stationary courier" initial={{ opacity: returning || reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .24 }}>
      <img className="active-map-bitmap" src="/assets/address/map.png" alt="" width={889} height={1147} />
      <img className="active-map-route" src={asset('route')} alt="" />
      <img className="active-map-route-highlight" src={asset('route-active')} alt="" />
      <span className="active-map-restaurant"><img src={asset('markers', 'png')} alt="" /></span>
      <span className="active-map-destination"><img src={asset('markers', 'png')} alt="" /></span>
      <img className="active-map-courier" src={asset('courier', 'png')} alt="" width={68} height={68} />
    </motion.div>
    <button ref={close} className="dish-close active-order-close" type="button" aria-label="Close active order" onClick={onClose}><img src="/assets/dish/close.svg" alt="" /></button>
    <button className="active-order-expand" type="button" aria-label={snap === 1 ? 'Show order details' : 'Expand delivery map'} aria-pressed={snap === 1} onClick={() => settle(snap === 1 ? 0 : 1)}><img src={asset('expand')} alt="" /></button>
    <motion.section className="active-order-panel" aria-label="Active order" style={{ y, height: height - points[0] }}>
      <div className="active-order-grab" onPointerDown={event => {
        if (event.button !== 0) return; event.stopPropagation(); movement.current?.stop();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, start: event.clientY, origin: y.get(), moved: false, handle: !!(event.target as HTMLElement).closest('.active-order-handle'), lastY: event.clientY, lastAt: event.timeStamp, velocity: 0 };
      }} onPointerMove={event => {
        const start = drag.current; if (!start || start.id !== event.pointerId) return;
        const scale = (screenRef.current?.getBoundingClientRect().width ?? device.geometry.screen.width) / device.geometry.screen.width;
        const delta = (event.clientY - start.start) / scale; if (!start.moved && Math.abs(delta) < 6) return;
        start.moved = true; setDragging(true);
        start.velocity = (event.clientY - start.lastY) / scale / Math.max(1, event.timeStamp - start.lastAt); start.lastY = event.clientY; start.lastAt = event.timeStamp;
        y.set(Math.max(points[0], Math.min(points[1], start.origin + delta)));
      }} onPointerUp={event => end(event)} onPointerCancel={event => end(event, true)} onLostPointerCapture={event => end(event, true)}>
        <button className="active-order-handle" type="button" aria-label={`Order panel: ${orderSnapNames[snap]}. Change size`} onClick={event => { if (event.detail === 0) settle(snap === 0 ? 1 : 0); }} onKeyDown={event => {
          if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault(); event.stopPropagation(); settle(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : Math.max(0, Math.min(1, snap + (event.key === 'ArrowDown' ? 1 : -1))) as OrderSnap);
        }}><span /></button>
        <motion.div className="active-order-status" initial={returning || reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .24, delay: .08, ease }}><h1>Estimated arrival {order.eta}</h1><p>{order.status}</p><OrderProgress stage={order.stage} /></motion.div>
      </div>
      <div ref={scroll} className="active-order-scroll-slot" inert={snap === 1 || dragging} aria-hidden={snap === 1 || undefined}>
        <MobileScroll className="active-order-scroll"><OrderDetails order={order} /></MobileScroll>
      </div>
    </motion.section>
    <motion.div className="active-order-bottom-fade" initial={false} animate={{ '--dock-fade-opacity': snap === 1 ? 0 : 1 }} transition={{ duration: reduced ? 0 : .26 }}><BottomFade /></motion.div>
  </div>;
}
