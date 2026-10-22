import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Carousel, FlowStack, KeyboardInput, MobileScroll, useFlow, useKeyboard, useKeyboardInsets, useMobileDevice, type FlowScreen } from '../mobile';
import { authStep } from '../auth-motion';
import { resendRemaining, validPhone } from '../auth-model';
import { BottomFade } from './BottomFade';
import { CartValue } from './CartQuantity';
import { money } from './catalog-model';
import { checkoutTotals } from './promo-model';
import { PromoCodeField } from './PromoCodeField';
import { CheckoutContext, useCheckout, type CheckoutState } from './checkout-context';
import { useAddressBook } from './AddressBook';
import { fullAddress } from './address-model';
import { AddressDock, AddressMapLayer, addressListStep, addressBack, useAddressGeometry } from './AddressFlow';
import { ActiveOrderScreen } from './ActiveOrder';
import { useActiveOrder } from './ActiveOrderState';
import { createOrder, type OrderOptions } from './order-model';
import data from './catalog.json';
import './checkout.css';

const asset = (name: string) => `/assets/checkout/${name}.svg`;

// The cart is already mounted in its sheet. This empty root entry lets the
// existing FlowStack own forward/back and preserve Delivery's form and scroll.
function CartStepBridge() {
  const flow = useFlow(), { onActive, controls, host, initialTracking, onClose } = useCheckout();
  const { device } = useMobileDevice(), keyboard = useKeyboard(), reduced = !!useReducedMotion();
  const step = flow.current.id, tracking = step === 'active-order' || (initialTracking && step === 'cart'), active = step !== 'cart' || tracking;
  const addressGeometry = useAddressGeometry();
  const top = step === 'checkout-phone' ? device.geometry.screen.height - keyboard.fullHeight - 263
    : step === 'checkout-code' ? device.geometry.screen.height - keyboard.fullHeight - 405 : addressGeometry[step as keyof typeof addressGeometry] ?? device.geometry.safeArea.top;
  useLayoutEffect(() => { controls.current = flow; onActive(active, tracking ? 'active-order' : step); }, [flow, active, tracking, step, onActive, controls]);
  useLayoutEffect(() => { if (initialTracking && step === 'cart') flow.reset(activeOrderStep); }, [initialTracking, step, flow]);
  useLayoutEffect(() => {
    if (!step.startsWith('address-') || step === 'address-search') return;
    host?.querySelector<HTMLButtonElement>(step === 'address-list' ? '.address-map-close' : `[data-step="${step}"] .address-toolbar button`)?.focus({ preventScroll: true });
  }, [step, host]);
  // One opaque surface changes height; it never fades with the moving content.
  return host && <>{createPortal(<div className="checkout-surface-layer">
    <motion.div className="checkout-blackout" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? .08 : .14 }} />
    <AddressMapLayer />
    <motion.div className="checkout-surface" style={{ background: step.startsWith('address-') ? '#151515' : '#121212', borderRadius: step.startsWith('address-') ? '20px 20px 0 0' : '30px 30px 0 0' }} initial={false} animate={{ top, opacity: active && !tracking ? 1 : 0 }} transition={{ top: { duration: reduced ? 0 : .32, ease: [.2, .8, .2, 1] }, opacity: { duration: reduced ? .08 : .14 } }} />
  </div>, host)}<AddressDock />{tracking && createPortal(<ActiveOrderScreen onClose={onClose} returning={initialTracking} />, host)}</>;
}
function DeliveryHeader() {
  const flow = useFlow(), keyboard = useKeyboard(), { onClose } = useCheckout();
  return <div className="delivery-toolbar">
    <button type="button" aria-label="Back to cart" onClick={flow.pop}><img src="/assets/auth/back.svg" alt="" width={22} height={22} />Back to cart</button>
    <span>Checkout</span>
    <button className="delivery-close" type="button" aria-label="Close checkout and cart" onClick={() => { keyboard.hide(); onClose(); }}>Close<span className="cart-close-icon"><img src={asset('close')} alt="" width={11.6667} height={11.6667} /></span></button>
  </div>;
}
function DeliveryBody() {
  const { promo, count, cents, active, host, options, setOptions } = useCheckout(), flow = useFlow();
  const { state: addresses, dispatch: addressDispatch } = useAddressBook();
  const title = useRef<HTMLHeadingElement>(null), initialVisit = useRef(true);
  const previousStep = useRef(flow.current.id);
  const { leaveAtDoor, time, payment } = options;
  const setLeaveAtDoor = () => setOptions({ ...options, leaveAtDoor: !leaveAtDoor });
  const setTime = (time: number) => setOptions({ ...options, time });
  const setPayment = (payment: number) => setOptions({ ...options, payment });
  const totals = checkoutTotals(cents, promo.status);
  useEffect(() => {
    if (!active) return;
    // The first entry is positioned at the start; subsequent visits retain scroll.
    if (initialVisit.current) { title.current?.focus({ preventScroll: true }); initialVisit.current = false; }
  }, [active]);
  useLayoutEffect(() => {
    if (flow.current.id === 'delivery' && previousStep.current.startsWith('checkout-')) host?.querySelector<HTMLButtonElement>('.delivery-order-button')?.focus({ preventScroll: true });
    if (flow.current.id === 'delivery' && previousStep.current.startsWith('address-')) host?.querySelector<HTMLButtonElement>('.delivery-address-row')?.focus({ preventScroll: true });
    previousStep.current = flow.current.id;
  }, [flow.current.id, host]);
  return <MobileScroll className="delivery-scroll"><div className="delivery-content">
    <link rel="preload" as="image" href="/assets/address/map.png" /><link rel="preload" as="image" href="/assets/active-order/markers.png" /><link rel="preload" as="image" href="/assets/active-order/courier.png" />
    <div className="delivery-tabs" role="group" aria-label="Delivery method"><button type="button" aria-pressed="true" aria-disabled="true">Delivery</button><button type="button" aria-pressed="false" aria-disabled="true">Pickup</button></div>
    <h1 ref={title} tabIndex={-1}>Delivery</h1>
    <section className="delivery-address" aria-label="Delivery address">
      <button type="button" className="delivery-address-row" aria-label="Change delivery address" onClick={() => { addressDispatch({ type: 'begin' }); flow.push(addressListStep); }}><span className="delivery-house"><img src={asset('house')} alt="" width={24} height={24} /></span><span>{fullAddress(addresses.current.location)}</span><img src={asset('chevron')} alt="" width={18} height={18} /></button>
      <img className="delivery-address-divider" src={asset('address-divider')} alt="" width={372} height={1} />
      <div className="delivery-note"><span>Comments for the courier</span><p>{addresses.current.details.instructions || 'No delivery instructions'}</p></div>
    </section>
    <button className="delivery-leave" type="button" role="switch" aria-checked={leaveAtDoor} onClick={setLeaveAtDoor}><span>Leave at the door</span><span className="delivery-switch" data-checked={leaveAtDoor}><span /></span></button>
    <section className="delivery-time" aria-labelledby="delivery-time-label"><h2 id="delivery-time-label" className="delivery-label">Delivery time</h2>
      <Carousel className="delivery-time-rail" contentClassName="delivery-time-track" ariaLabel="Delivery time"><div role="group" className="delivery-time-options">
        {['As soon as possible', '11:20 - 12:30 PM', '11:20 - 12:30 PM'].map((label, index) => <button className="delivery-choice" type="button" key={index} aria-pressed={time === index} onClick={() => setTime(index)}>{label}</button>)}
      </div></Carousel>
    </section>
    <img className="delivery-section-divider" src={asset('section-divider')} alt="" width={400} height={1} />
    <PromoCodeField promo={promo} />
    <section className="delivery-order" aria-labelledby="delivery-order-title"><h2 id="delivery-order-title">Order details</h2>
      <dl className="delivery-calculation">
        <div><dt>Subtotal · {count} {count === 1 ? 'item' : 'items'}</dt><dd>{money(cents)}<img src={asset('summary-divider')} alt="" width={368} height={1} /></dd></div>
        <div><dt>Delivery · <span className="delivery-free">free</span></dt><dd className="delivery-muted">$0<img src={asset('summary-divider')} alt="" width={368} height={1} /></dd></div>
        <div><dt>Discount</dt><dd><CartValue value={totals.discountCents}>−{money(totals.discountCents)}</CartValue><img src={asset('summary-divider')} alt="" width={368} height={1} /></dd></div>
        <div><dt>Accrual bonuses</dt><dd>+$2</dd></div>
      </dl>
    </section>
    <section className="delivery-bonuses" aria-labelledby="delivery-bonuses-label"><h2 id="delivery-bonuses-label" className="delivery-label">Bonuses</h2>
      <div className="delivery-points-card"><div className="delivery-points-top"><span className="delivery-points-icon"><img src={asset('points-circle')} alt="" width={50} height={50} /><img src={asset('points-mark')} alt="" width={20} height={20} /></span><div className="delivery-points-balance"><strong>476</strong><span>Prana points</span></div><button type="button" aria-disabled="true">Apply</button></div>
        <img className="delivery-points-divider" src={asset('points-divider')} alt="" width={360} height={1} /><div className="delivery-points-bottom"><p>Apply 300 Prana Points and save $20 on this order.</p><span>Valid until June 7</span></div>
      </div>
    </section>
    <section className="delivery-payment" aria-labelledby="delivery-payment-label"><h2 id="delivery-payment-label" className="delivery-label">Payment method</h2>
      <Carousel className="delivery-payment-rail" contentClassName="delivery-payment-track" ariaLabel="Payment method">
        {[0, 1].map(index => <button className="delivery-choice" key={index} type="button" aria-label={`Mastercard ending in 4344, card ${index + 1}`} aria-pressed={payment === index} onClick={() => setPayment(index)}><img src={asset('mastercard')} alt="" width={22} height={14} /><span>*4344</span></button>)}
        <button className="delivery-add-card" type="button" aria-disabled="true">+ Add card</button>
      </Carousel>
    </section>
    <img className="delivery-payment-divider" src={asset('payment-divider')} alt="" width={400} height={1.00003} />
    <section className="delivery-support" aria-labelledby="delivery-support-title">
      <h2 id="delivery-support-title">Need help with your order?</h2>
      <p>Message us if something isn’t clear before you place it.</p>
      <button type="button" aria-disabled="true"><img src={asset('whatsapp')} alt="" width={20} height={20} />Contact support</button>
    </section>
  </div></MobileScroll>;
}

function DeliveryFooter() {
  const { host, cents, promo, accountPhone, quantities, onOrdered, options } = useCheckout(), flow = useFlow(), { device } = useMobileDevice();
  const { state: addresses } = useAddressBook(), orders = useActiveOrder(), submitted = useRef(false);
  const { bottomInset, keyboardDragging } = useKeyboardInsets(), reduced = !!useReducedMotion();
  const active = flow.current.id === 'delivery', total = checkoutTotals(cents, promo.status).totalCents;
  if (!host) return null;
  // Escape the opacity-animated scene: blur always samples the real content.
  return createPortal(<motion.div className="delivery-dock" inert={!active} aria-hidden={!active || undefined} initial={{ '--dock-fade-opacity': 0 }}
    animate={{ '--dock-fade-opacity': active ? 1 : 0, bottom: Math.max(0, bottomInset - device.geometry.safeArea.bottom) }}
    transition={{ duration: keyboardDragging ? 0 : reduced ? .08 : .26, ease: [.2, .8, .2, 1] }} style={{ pointerEvents: active ? undefined : 'none' }}>
    <BottomFade />
    <motion.div className="delivery-dock-controls" initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? .08 : .24 }}>
      <div className="delivery-total" aria-live="polite" aria-atomic="true"><span>Total</span><strong><CartValue value={total}>{money(total)}</CartValue></strong></div>
      <button className="delivery-order-button" type="button" onClick={() => {
        if (!accountPhone.confirmedPhone) { flow.push(checkoutPhoneStep); return; }
        if (submitted.current) return;
        const order = createOrder(data.products, quantities, addresses.current, accountPhone.confirmedPhone, promo.status, options);
        if (!order) return;
        submitted.current = true; orders.place(order); onOrdered(); flow.reset(activeOrderStep);
      }}>{accountPhone.confirmedPhone ? 'Order' : 'Add phone number'}</button>
    </motion.div>
  </motion.div>, host);
}

function VerificationHeader() {
  const flow = useFlow();
  return <div className="verification-toolbar"><button type="button" aria-label={flow.current.id === 'checkout-code' ? 'Back to phone number' : 'Back to checkout'} onPointerDown={event => event.preventDefault()} onClick={flow.pop}><img src={asset('phone-back')} alt="" width={18} height={18} /></button><span>Add phone number</span></div>;
}
function VerificationFooter({ kind }: { kind: 'phone' | 'code' }) {
  const { accountPhone, host } = useCheckout(), flow = useFlow();
  const { bottomInset, keyboardDragging } = useKeyboardInsets(), reduced = !!useReducedMotion();
  const active = flow.current.id === `checkout-${kind}`;
  const disabled = kind === 'phone' ? !validPhone(accountPhone.phone) : accountPhone.code.length !== 4;
  return host && createPortal(<motion.div className="verification-dock" data-active={active} inert={!active} aria-hidden={!active || undefined}
    initial={{ '--dock-fade-opacity': 0 }} animate={{ bottom: bottomInset, '--dock-fade-opacity': active ? 1 : 0 }} transition={{ duration: keyboardDragging ? 0 : reduced ? .08 : .26, ease: [.2, .8, .2, 1] }}>
    <BottomFade />
    <motion.button initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? .08 : active ? .24 : .14 }} className="verification-continue" type="submit" form={`checkout-${kind}-form`} disabled={disabled} onPointerDown={event => event.preventDefault()}>Continue</motion.button>
  </motion.div>, host);
}
function CheckoutPhoneBody() {
  const { accountPhone } = useCheckout(), flow = useFlow();
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!validPhone(accountPhone.phone)) return;
    accountPhone.dispatch({ type: 'send', now: Date.now() }); flow.push(checkoutCodeStep);
  }
  return <MobileScroll className="verification-scroll"><form className="verification-phone-form" id="checkout-phone-form" onSubmit={submit} noValidate>
    <label className="verification-phone-field"><span>Phone number</span><KeyboardInput className="verification-phone-input" type="tel" inputMode="tel" autoComplete="tel" aria-label="Phone number" value={accountPhone.phone} onChange={event => accountPhone.dispatch({ type: 'phone', value: event.target.value })} /></label>
  </form></MobileScroll>;
}
function CheckoutCodeBody() {
  const { accountPhone } = useCheckout(), flow = useFlow(), input = useRef<HTMLInputElement>(null);
  const active = flow.current.id === 'checkout-code';
  const [now, setNow] = useState(Date.now), [focused, setFocused] = useState(false), [caret, setCaret] = useState(0);
  const remaining = resendRemaining(accountPhone.deadline, now);
  useEffect(() => {
    if (!active || !accountPhone.deadline) return;
    setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, [active, accountPhone.deadline]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (accountPhone.code.length !== 4) return;
    if (accountPhone.confirm()) { flow.push(deliveryStep); return; }
    input.current?.focus({ preventScroll: true }); input.current?.select();
  }
  return <MobileScroll className="verification-scroll"><form className="verification-code-form" id="checkout-code-form" onSubmit={submit} noValidate>
    <h1>Enter code</h1><p className="verification-description">Enter the code from the SMS</p>
    <div className="verification-code-field" data-error={accountPhone.error} data-focused={focused}>
      <div className="verification-code-slots" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index} data-current={index === Math.min(caret, 3)}>{accountPhone.code[index]}</span>)}</div>
      <KeyboardInput ref={input} className="verification-code-input" type="text" inputMode="numeric" autoComplete="one-time-code" aria-label="SMS verification code" value={accountPhone.code}
        aria-invalid={accountPhone.error || undefined} aria-describedby={accountPhone.error ? 'checkout-code-error' : undefined}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onSelect={event => setCaret(event.currentTarget.selectionStart ?? accountPhone.code.length)}
        onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); const index = Math.min(accountPhone.code.length, Math.max(0, Math.floor((event.clientX - rect.left) / (rect.width / 4)))); event.currentTarget.setSelectionRange(index, index); setCaret(index); }}
        onChange={event => accountPhone.dispatch({ type: 'code', value: event.target.value })} />
      {accountPhone.error && <p className="verification-error" id="checkout-code-error" role="alert">Incorrect code. Please try again.</p>}
    </div>
    <button className="verification-resend" type="button" disabled={remaining > 0} onPointerDown={event => event.preventDefault()} onClick={() => {
      const sentAt = Date.now(); accountPhone.dispatch({ type: 'resend', now: sentAt }); setNow(sentAt); input.current?.focus({ preventScroll: true });
    }}>{remaining > 0 ? `Resend the code in: ${remaining}` : 'Resend the code'}</button>
  </form></MobileScroll>;
}
const cartStep: FlowScreen = { id: 'cart', render: () => <CartStepBridge /> };
const activeOrderStep: FlowScreen = { id: 'active-order', render: () => null };
export const deliveryStep: FlowScreen = { id: 'delivery', title: 'Delivery', headerHeight: 60, header: () => <DeliveryHeader />, footerHeight: 211, footer: () => <DeliveryFooter />, render: () => <DeliveryBody /> };
const checkoutPhoneStep: FlowScreen = { id: 'checkout-phone', focusSelector: '.verification-phone-input', headerHeight: 60, header: () => <VerificationHeader />, footerHeight: 82, footer: () => <VerificationFooter kind="phone" />, render: () => <CheckoutPhoneBody /> };
const checkoutCodeStep: FlowScreen = { id: 'checkout-code', focusSelector: '.verification-code-input', headerHeight: 60, header: () => <VerificationHeader />, footerHeight: 82, footer: () => <VerificationFooter kind="code" />, render: () => <CheckoutCodeBody /> };

export function CheckoutFlow({ active, count, cents, quantities, promo, accountPhone, initialTracking, onOrdered, onActive, onClose, controls }: Omit<CheckoutState, 'host' | 'options' | 'setOptions'>) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [options, setOptions] = useState<OrderOptions>({ leaveAtDoor: true, time: 0, payment: 0 });
  // Retain outgoing checkout pixels while the placed order consumes the basket.
  const [receipt, setReceipt] = useState<{ count: number; cents: number; promo: CheckoutState['promo'] } | null>(null);
  const keyboard = useKeyboard(), { device } = useMobileDevice(), addressGeometry = useAddressGeometry();
  return <CheckoutContext.Provider value={{ active, host, count, cents, quantities, promo, ...receipt, accountPhone, initialTracking, options, setOptions, onOrdered: () => { setReceipt({ count, cents, promo: { ...promo } }); onOrdered(); }, onActive, onClose, controls }}>
    <div ref={setHost} className="checkout-host prana-auth" data-active={active} inert={!active} style={{ ...Object.fromEntries(Object.entries(addressGeometry).map(([key, value]) => [`--${key}-top`, `${value}px`])), '--checkout-keyboard-height': `${keyboard.fullHeight}px`, '--checkout-phone-top': `${device.geometry.screen.height - keyboard.fullHeight - 263}px`, '--checkout-code-top': `${device.geometry.screen.height - keyboard.fullHeight - 405}px` } as CSSProperties} onKeyDown={event => {
      if (event.key !== 'Escape' || !active) return;
      event.preventDefault(); event.stopPropagation();
      if (keyboard.visible) {
        keyboard.hide();
        host?.querySelector<HTMLButtonElement>('.flow-step-scene[data-flow-current="true"] .flow-fixed-header button')?.focus({ preventScroll: true });
      } else if (controls.current?.current.id === 'active-order') onClose();
      else if (controls.current?.current.id.startsWith('address-')) addressBack(controls.current);
      else controls.current?.pop();
    }}><FlowStack initial={cartStep} motionPreset={authStep} /></div>
  </CheckoutContext.Provider>;
}
