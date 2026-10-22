import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { BottomSheet, MobileScroll, useMobileDevice, useScreenPortal, type FlowControls } from '../mobile';
import { BottomFade } from './BottomFade';
import { CheckoutFlow, deliveryStep } from './CheckoutFlow';
import { usePromoCode, type PromoCode } from './usePromoCode';
import { useCheckoutPhone, type CheckoutPhone } from './useCheckoutPhone';
import { ActiveOrderProvider } from './ActiveOrderState';
import data from './catalog.json';
import { changeQuantity, money, type Product } from './catalog-model';
import { cartChangeIssue, cartItems, cartNutrition, cartSuggestions } from './cart-model';
import { cartSummary } from './search-model';
import { CartQuantity, CartValue } from './CartQuantity';
import { Nutrition, ProductCard } from './ProductCard';
import { DishDetail, type DishSelection } from './DishDetail';
import { photoRect } from './dish-model';
import { cartAsset, CartLoadError, CartNotice, CartPhoto, CartSkeleton, ClearConfirmation, EmptyCart, type CartNoticeData } from './CartStates';
import { cartPreviewQuantities, type CartScenario } from './cart-preview-model';
import './cart.css';
import { ProfileProvider, useProfile } from '../profile/ProfileState';
import type { OrderOptions } from './order-model';

type CartProps = {
  initialTracking: boolean;
  promo: PromoCode;
  accountPhone: CheckoutPhone;
  quantities: Record<string, number>; onChange: (id: string, delta: number) => void;
  onClear: () => void; onClose: () => void; onExited: () => void;
};
type CartBodyProps = CartProps & { scenario: CartScenario; checkoutDraft: RefObject<OrderOptions | null>; nestedModal: RefObject<boolean>; onTitle: (title: string) => void };

function CartRow({ product, quantity, photoUnavailable, onChange }: {
  product: Product; quantity: number; photoUnavailable: boolean; onChange: (delta: number, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const present = useIsPresent(), reduced = !!useReducedMotion();
  return <motion.li className="mobile-cart-row" data-cart-product={product.id} inert={!present} aria-hidden={!present || undefined}
    initial={reduced ? false : { opacity: 0, gridTemplateRows: '0fr', paddingBottom: 0, marginBottom: 0 }}
    animate={{ opacity: 1, gridTemplateRows: '1fr', paddingBottom: 20, marginBottom: 20 }}
    exit={{ opacity: 0, gridTemplateRows: '0fr', paddingBottom: 0, marginBottom: 0 }}
    transition={reduced ? { duration: 0 } : { duration: .24, ease: [.2, .8, .2, 1] }}>
    <div className="mobile-cart-row-content">
      <div className="mobile-cart-main">
        <CartPhoto product={product} unavailable={photoUnavailable} />
        <div className="mobile-cart-info">
          <h3>{product.name}</h3>
          {product.description && <p className="mobile-cart-description">{product.description}</p>}
          <Nutrition product={product} calories />
        </div>
      </div>
      <div className="mobile-cart-buy">
        <p className="mobile-cart-price" aria-label={`${money(product.priceCents)} per portion`}><strong>{money(product.priceCents)}</strong></p>
        <CartQuantity title={product.name} quantity={quantity} onChange={onChange} />
      </div>
    </div>
  </motion.li>;
}

function CartBody({ quantities, promo, accountPhone, initialTracking, onChange, onClear, onClose, onExited, nestedModal, onTitle, scenario, checkoutDraft }: CartBodyProps) {
  const { device } = useMobileDevice();
  const { screenRef } = useScreenPortal();
  const root = useRef<HTMLDivElement>(null), closeButton = useRef<HTMLButtonElement>(null), emptyTitle = useRef<HTMLHeadingElement>(null);
  const clearButton = useRef<HTMLButtonElement>(null), cancelButton = useRef<HTMLButtonElement>(null);
  const exitRef = useRef(onExited); exitRef.current = onExited;
  const [confirmation, setConfirmation] = useState(scenario === 'clear');
  const [checkout, setCheckout] = useState(initialTracking);
  const onActive = useCallback((active: boolean, step?: string) => { setCheckout(active); onTitle(step === 'active-order' ? 'Active order' : active ? 'Checkout' : 'Cart'); }, [onTitle]);
  const checkoutFlow = useRef<FlowControls | null>(null), checkoutButton = useRef<HTMLButtonElement>(null), wasCheckout = useRef(false);
  const wasConfirmation = useRef(false);
  const [selection, setSelection] = useState<DishSelection | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null), focusAfterRemoval = useRef<string | null>(null);
  const items = cartItems(data.products, quantities), summary = cartSummary(data.products, quantities);
  const nutrition = cartNutrition(data.products, quantities);
  // Stable assortment and mounted source cards preserve the return photo's anchor.
  const [suggestions] = useState(() => cartSuggestions(data.products, data.categories, quantities));
  const empty = items.length === 0;
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>(scenario === 'loading' ? 'loading' : scenario === 'load-error' ? 'error' : 'ready');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [connected, setConnected] = useState(() => navigator.onLine);
  const offline = scenario === 'offline' || !connected;
  const failedNext = useRef(scenario === 'update-error');
  const limitedProduct = scenario === 'stock' ? data.products.find(product => /^acai bowl/i.test(product.name)) : undefined;
  const [notice, setNotice] = useState<CartNoticeData | null>(null);
  const noticeId = useRef(0);
  const quantitiesRef = useRef(quantities); quantitiesRef.current = quantities;
  const notify = useCallback((kind: CartNoticeData['kind']) => {
    const messages = {
      stock: { title: 'Only 2 Acai bowls available', description: 'You can still reduce the quantity.' },
      offline: { title: 'You’re offline', description: 'This is your last saved cart. Reconnect to check prices and availability.' },
      'update-error': { title: 'Couldn’t update quantity', description: 'Your previous selection is still here.' },
    };
    setNotice({ id: ++noticeId.current, kind, ...messages[kind] });
  }, []);
  useEffect(() => {
    const update = () => setConnected(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => {
    if (offline) notify('offline');
    else setNotice(current => current?.kind === 'offline' ? null : current);
  }, [offline, notify]);
  useEffect(() => {
    if (scenario === 'stock' || scenario === 'update-error') notify(scenario);
  }, [scenario, notify]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(current => current?.id === notice.id ? null : current), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (loadState !== 'loading') return;
    const timer = window.setTimeout(() => setLoadState(navigator.onLine ? 'ready' : 'error'), loadAttempt ? 900 : 2400);
    return () => window.clearTimeout(timer);
  }, [loadState, loadAttempt]);
  const change = (id: string, delta: number) => {
    const issue = cartChangeIssue(quantitiesRef.current[id] ?? 0, delta, { offline, failed: failedNext.current, limit: id === limitedProduct?.id ? 2 : undefined });
    if (issue) { if (issue === 'update-error') failedNext.current = false; notify(issue); return false; }
    // Update the guard immediately as well as React state: quick taps cannot pass the stock limit.
    quantitiesRef.current = changeQuantity(quantitiesRef.current, id, delta);
    setNotice(current => current?.kind === 'stock' || current?.kind === 'update-error' ? null : current);
    onChange(id, delta); return true;
  };

  useLayoutEffect(() => {
    if (!selection) return;
    const viewport = root.current?.querySelector<HTMLElement>('.cart-scroll .mobile-scroll');
    const list = root.current?.querySelector<HTMLElement>('.mobile-cart-items');
    if (!viewport || !list) return;
    const anchor = selection.photo.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
    const observer = new ResizeObserver(() => {
      const bounds = viewport.getBoundingClientRect();
      const scale = bounds.width / viewport.clientWidth;
      const delta = selection.photo.getBoundingClientRect().top - bounds.top - anchor;
      if (Math.abs(delta) > 0.5) viewport.scrollTop += delta / scale;
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [selection]);
  useEffect(() => () => { document.title = 'Prana — Menu'; exitRef.current(); }, []);
  useLayoutEffect(() => {
    if (confirmation) cancelButton.current?.focus({ preventScroll: true });
    else if (wasConfirmation.current) clearButton.current?.focus({ preventScroll: true });
    wasConfirmation.current = confirmation;
  }, [confirmation]);
  useLayoutEffect(() => { nestedModal.current = !!selection || confirmation || checkout; return () => { nestedModal.current = false; }; }, [selection, confirmation, checkout, nestedModal]);
  useLayoutEffect(() => {
    if (!checkout && wasCheckout.current) checkoutButton.current?.focus({ preventScroll: true });
    wasCheckout.current = checkout;
  }, [checkout]);
  useLayoutEffect(() => {
    const sheet = root.current?.closest<HTMLElement>('.bottom-sheet');
    sheet?.style.setProperty('--cart-viewport-height', `${device.geometry.screen.height - device.geometry.safeArea.top - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0)}px`);
    sheet?.style.setProperty('--cart-bottom', `${device.platform === 'android' ? device.geometry.safeArea.bottom : 0}px`);
  }, [device]);
  useLayoutEffect(() => {
    if (empty && !checkout && loadState === 'ready') {
      const viewport = root.current?.querySelector<HTMLElement>('.cart-scroll .mobile-scroll');
      if (viewport) viewport.scrollTop = 0;
      emptyTitle.current?.focus({ preventScroll: true });
    } else if (focusAfterRemoval.current) root.current?.querySelector<HTMLButtonElement>(`[data-cart-product="${focusAfterRemoval.current}"] .cart-decrease`)?.focus({ preventScroll: true });
    focusAfterRemoval.current = null;
  }, [items.length, empty, loadState, checkout]);
  useLayoutEffect(() => {
    if (!selection && opener.current) { opener.current.focus({ preventScroll: true }); opener.current = null; }
  }, [selection]);
  const openProduct = useCallback((product: Product, trigger: HTMLButtonElement) => {
    const photo = trigger.closest('.catalog-card')?.querySelector<HTMLElement>('.catalog-photo'), screen = screenRef.current;
    if (!photo || !screen) return;
    opener.current = trigger;
    setSelection({ product, photo, trigger, origin: photoRect(photo.getBoundingClientRect(), screen.getBoundingClientRect(), device.geometry.screen.width, device.geometry.safeArea.top + 53) });
  }, [screenRef, device]);
  const closeProduct = useCallback(() => setSelection(null), []);
  const changeItem = (id: string, index: number, quantity: number, delta: number, event: MouseEvent<HTMLButtonElement>) => {
    if (!change(id, delta)) return;
    if (quantity === 1 && delta < 0 && event.currentTarget.matches(':focus-visible')) focusAfterRemoval.current = (items[index + 1] ?? items[index - 1])?.product.id ?? null;
  };
  const ready = loadState === 'ready';
  const recommendations = ready && !empty && scenario !== 'no-recommendations' && scenario !== 'photo-error' && suggestions.length > 0;
  const retry = () => { setLoadAttempt(value => value + 1); setLoadState('loading'); closeButton.current?.focus({ preventScroll: true }); };
  const proceed = () => { if (offline) notify('offline'); else checkoutFlow.current?.push(deliveryStep); };
  const requestClear = () => { if (offline) notify('offline'); else setConfirmation(true); };
  return <div className="cart-view" data-cart-state={loadState} ref={root} style={{ '--cart-safe-top': `${device.geometry.safeArea.top}px` } as CSSProperties}>
    <div className="cart-panel" inert={!!selection || confirmation || checkout} aria-hidden={!!selection || confirmation || checkout || undefined}>
      <header className="cart-toolbar">
        <button ref={closeButton} className="cart-close" type="button" aria-label="Close cart" onClick={onClose}><img src={cartAsset('close.svg')} alt="" /></button>
        <p className="cart-title">Cart</p>
        {ready && !empty && <button ref={clearButton} className="cart-clear" type="button" aria-label="Clear cart" onClick={requestClear}><img src={cartAsset('clear.svg')} alt="" /></button>}
      </header>
      <MobileScroll className="cart-scroll"><div className={`cart-scroll-content${empty && ready ? ' cart-scroll-empty' : ''}`}>
        {loadState === 'loading' ? <CartSkeleton /> : loadState === 'error' ? <CartLoadError /> : <>
          {!empty && <h2 className="cart-section-title">Your dishes</h2>}
          <ul className="mobile-cart-items" aria-label="Cart items"><AnimatePresence initial={false}>
            {items.map(({ product, quantity }, index) => <CartRow key={product.id} product={product} quantity={quantity} photoUnavailable={scenario === 'photo-error' && index === 0} onChange={(delta, event) => changeItem(product.id, index, quantity, delta, event)} />)}
          </AnimatePresence></ul>
          {empty && <EmptyCart titleRef={emptyTitle} onClose={onClose} />}
          {recommendations && <section className="cart-suggestions" aria-labelledby="cart-suggestions-title">
            <h2 id="cart-suggestions-title">Complete your meal</h2><div className="catalog-grid">
              {suggestions.map(product => <ProductCard key={product.id} product={product} large={false} quantity={quantities[product.id] ?? 0} onChange={change} onOpen={openProduct} idPrefix="cart-suggestion" />)}
            </div>
          </section>}
        </>}
      </div></MobileScroll>
      {(!ready || !empty) && <footer className={`cart-footer${!ready ? ' cart-footer-status' : ''}`}>
        <BottomFade className="cart-footer-fade" />
        {ready && <div className="cart-order-total" aria-live="polite" aria-atomic="true">
          <div className="cart-order-info"><span>{summary.count} {summary.count === 1 ? 'item' : 'items'}</span>
            <p className="cart-nutrition-total" aria-label={nutrition.map(item => `${item.value ?? 'Unavailable'} ${item.full}`).join(', ')}>
              {nutrition.map(item => <span key={item.label}>{item.value ?? '—'} {item.label}</span>)}
            </p>
          </div>
          <strong><CartValue value={summary.cents}>{money(summary.cents)}</CartValue></strong>
        </div>}
        <button ref={checkoutButton} className="cart-checkout" type="button" disabled={loadState === 'loading'} onClick={loadState === 'error' ? retry : proceed}>
          {loadState === 'loading' ? 'Loading cart' : loadState === 'error' ? 'Try again' : 'Proceed to checkout'}
        </button>
        {ready && <p className="cart-delivery-note">Delivery and discounts at checkout</p>}
      </footer>}
      <AnimatePresence mode="wait">{notice && ready && <CartNotice key={notice.kind} notice={notice} onDismiss={() => setNotice(null)} />}</AnimatePresence>
    </div>
    <CheckoutFlow checkoutDraft={checkoutDraft} onQuantityChange={change} active={checkout} count={summary.count} cents={summary.cents} quantities={quantities} initialTracking={initialTracking} onOrdered={onClear} promo={promo} accountPhone={accountPhone} onActive={onActive} onClose={onClose} controls={checkoutFlow} />
    <AnimatePresence>{confirmation && <ClearConfirmation cancelRef={cancelButton} onCancel={() => setConfirmation(false)} onClear={() => { setConfirmation(false); onClear(); }} />}</AnimatePresence>
    {selection && <div className="cart-dish-host"><DishDetail selection={selection} quantity={quantities[selection.product.id] ?? 0} onChange={change} onClosed={closeProduct} /></div>}
  </div>;
}

function CartSession({ preview, previewSeed, ...props }: Omit<CartBodyProps, 'scenario'> & { preview: CartScenario | null; previewSeed?: Record<string, number> }) {
  const [previewQuantities, setPreviewQuantities] = useState(() => previewSeed ?? cartPreviewQuantities(data.products, preview ?? 'ready'));
  const previewPromo = usePromoCode(!!preview && Object.keys(previewQuantities).length > 0);
  const previewPhone = useCheckoutPhone();
  const previewDraft = useRef<OrderOptions | null>(null);
  const profile = useProfile();
  if (!preview) return <CartBody {...props} scenario="ready" />;
  return <ProfileProvider initial={profile.data}><ActiveOrderProvider><CartBody {...props} checkoutDraft={previewDraft} scenario={preview} quantities={previewQuantities} promo={previewPromo} accountPhone={previewPhone}
    onChange={(id, delta) => setPreviewQuantities(current => changeQuantity(current, id, delta))}
    onClear={() => setPreviewQuantities({})} /></ActiveOrderProvider></ProfileProvider>;
}

export function CartSheet({ open, onOpenChange, preview = null, ...props }: CartProps & { open: boolean; onOpenChange: (open: boolean) => void; preview?: CartScenario | null; previewSeed?: Record<string, number> }) {
  const { device } = useMobileDevice();
  const [title, setTitle] = useState('Cart');
  const checkoutDraft = useRef<OrderOptions | null>(null);
  useEffect(() => { if (!Object.keys(props.quantities).length) checkoutDraft.current = null; }, [props.quantities]);
  useEffect(() => { if (open) document.title = `Prana — ${title}`; }, [open, title]);
  const nestedModal = useRef(false);
  const height = device.geometry.screen.height;
  const available = height - device.geometry.safeArea.top - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0);
  return <BottomSheet open={open} onOpenChange={next => { if (!nestedModal.current) onOpenChange(next); }} title={title} description={title === 'Active order' ? 'Track delivery and review your placed order.' : 'Review your dishes and quantities.'} snap={available / height}>
    <CartSession {...props} checkoutDraft={checkoutDraft} preview={preview} nestedModal={nestedModal} onTitle={setTitle} />
  </BottomSheet>;
}
