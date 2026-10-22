import { useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { BottomSheet, FlowStack, useFlow, useKeyboard, useMobileDevice, type FlowScreen } from '../mobile';
import { authStep } from '../auth-motion';
import { AddressBookProvider, useAddressBook } from '../catalog/AddressBook';
import { AddressDock, AddressMapLayer, AddressNavigationContext, addressDetailsStep, addressMapStep, addressSearchStep, useAddressGeometry } from '../catalog/AddressFlow';
import { addressReducer, addressSuggestions, initialAddressBook } from '../catalog/address-model';
import { ActiveOrderProvider } from '../catalog/ActiveOrderState';
import { ActiveOrderScreen } from '../catalog/ActiveOrder';
import { createOrder } from '../catalog/order-model';
import data from '../catalog/catalog.json';
import { ProfileProvider } from './ProfileState';
import { initialProfile, demoHistory, type ProfileScenario } from './profile-model';
import { ProfileSessionContext, scenarioRoute, useProfileSession, useProfileSessionState, type ProfileCallbacks } from './profile-session';
import { ProfileButton, ProfileDock, ProfileIcon, ProfileStateView } from './ProfileUI';
import { BirthdayScreen, DiscardScreen, PersonalDetailsScreen, ProfileCodeScreen, ProfilePhoneScreen } from './ProfileDetails';
import { CardBankScreen, CardDetailsScreen, CardErrorScreen, CardFormScreen, CardRemoveScreen, PaymentMethodsScreen } from './ProfilePayments';
import { OrderScreen, OrdersScreen, ReorderScreen } from './ProfileOrders';
import { PlacesScreen, RemoveAddressScreen } from './ProfilePlaces';
import { CreditsScreen, DeviceSettingsScreen, DocumentScreen, GuestScreen, LogoutScreen, NotificationsScreen, PermissionScreen, PointsScreen, ProfileHomeScreen, PromoCodesScreen, SettingsScreen } from './ProfileSettings';
import './profile.css';

const titles: Record<string, string> = { home: 'Profile', guest: 'Profile', promos: 'Promo codes', personal: 'Personal details', birthday: 'Date of birth', phone: 'Phone number', code: 'Phone number', discard: 'Personal details', orders: 'My orders', order: 'Order details', reorder: 'Reorder', places: 'Delivery addresses', 'address-remove': 'Delivery addresses', cards: 'Payment methods', 'card-form': 'Payment methods', card: 'Payment methods', 'card-bank': 'Payment methods', 'card-error': 'Payment methods', 'card-remove': 'Payment methods', points: 'Prana points', activity: 'Points activity', loyalty: 'Loyalty program terms', settings: 'Settings & information', notifications: 'Notifications', permission: 'Notifications', 'device-settings': 'Settings', credits: 'Credits', privacy: 'Privacy policy', terms: 'Terms and conditions', licenses: 'Open-source licenses', logout: 'Profile', 'logout-error': 'Profile', tracking: 'Active order', support: 'Support' };
function requestBack(s: ReturnType<typeof useProfileSession>) {
  const flow = s.flowRef.current; if (!flow) return;
  s.guard(() => flow.canGoBack ? flow.pop() : s.onClose());
}
function ProfileHeader({ route }: { route: string }) {
  const s = useProfileSession(), flow = useFlow();
  const isRoot = route === 'home';
  return <div className="profile-toolbar"><button type="button" aria-label={isRoot ? 'Close profile' : 'Back'} onPointerDown={e => e.preventDefault()} onClick={() => isRoot ? s.guard(s.onClose) : requestBack(s)}><ProfileIcon name={isRoot ? 'close' : 'back'} className={isRoot ? '' : 'profile-back-icon'} />{!isRoot && <span>Back</span>}</button><span>{route === 'order' ? `Order #${s.order.id}` : route === 'discard' ? titles[flow.previous?.id ?? 'home'] ?? 'Profile' : titles[route]}</span></div>;
}
function ProfileRoute({ route }: { route: string }) {
  const s = useProfileSession();
  let content;
  switch (route) {
    case 'home': content = <ProfileHomeScreen />; break;
    case 'guest': content = <GuestScreen />; break;
    case 'promos': content = <PromoCodesScreen />; break;
    case 'personal': content = <PersonalDetailsScreen />; break;
    case 'birthday': content = <BirthdayScreen />; break;
    case 'phone': content = <ProfilePhoneScreen />; break;
    case 'code': content = <ProfileCodeScreen />; break;
    case 'discard': content = <DiscardScreen />; break;
    case 'orders': content = <OrdersScreen />; break;
    case 'order': content = <OrderScreen />; break;
    case 'reorder': content = <ReorderScreen />; break;
    case 'places': content = <PlacesScreen />; break;
    case 'address-remove': content = <RemoveAddressScreen />; break;
    case 'cards': content = <PaymentMethodsScreen />; break;
    case 'card-form': content = <CardFormScreen />; break;
    case 'card': content = <CardDetailsScreen />; break;
    case 'card-bank': content = <CardBankScreen />; break;
    case 'card-error': content = <CardErrorScreen />; break;
    case 'card-remove': content = <CardRemoveScreen />; break;
    case 'points': content = <PointsScreen />; break;
    case 'activity': content = <PointsScreen activity />; break;
    case 'settings': content = <SettingsScreen />; break;
    case 'notifications': content = <NotificationsScreen />; break;
    case 'permission': content = <PermissionScreen />; break;
    case 'device-settings': content = <DeviceSettingsScreen />; break;
    case 'credits': content = <CreditsScreen />; break;
    case 'loyalty': case 'privacy': case 'terms': case 'licenses': content = <DocumentScreen kind={route} />; break;
    case 'logout': content = <LogoutScreen />; break;
    case 'logout-error': content = <LogoutScreen error />; break;
    case 'tracking': content = null; break;
    case 'support': content = <><ProfileStateView icon="info" title="Need help with your order?">Keep your order number handy when you contact the support team.</ProfileStateView><ProfileDock route="support"><ProfileButton aria-disabled="true">Contact support</ProfileButton></ProfileDock></>; break;
  }
  return <>{route === 'home' && <ProfileBridge />}{content}{s.busy && <span className="profile-visually-hidden" role="status">{s.busy === 'card' || s.busy === 'bank' ? 'Verifying card' : 'Saving changes'}</span>}</>;
}
function screen(route: string): FlowScreen {
  if (route === 'address-map') return addressMapStep;
  if (route === 'address-search') return addressSearchStep;
  if (route === 'address-details') return addressDetailsStep;
  return { id: route, headerHeight: 61, header: route === 'tracking' ? undefined : () => <ProfileHeader route={route} />, footerHeight: 120, focusSelector: route === 'phone' ? '.phone-input' : route === 'code' ? '.verification-code-input' : undefined, render: () => <ProfileRoute route={route} /> };
}
function ProfileBridge() {
  const s = useProfileSession(), flow = useFlow(), geometry = useAddressGeometry(), { device } = useMobileDevice(), keyboard = useKeyboard(), reduced = !!useReducedMotion();
  const { dispatch } = useAddressBook(), initialized = useRef(false), previous = useRef('home');
  const route = flow.current.id, isAddress = route.startsWith('address-') && route !== 'address-remove', tracking = route === 'tracking';
  const top = isAddress ? geometry[route as keyof typeof geometry] ?? device.geometry.safeArea.top : route === 'code' ? Math.max(device.geometry.safeArea.top, device.geometry.screen.height - keyboard.fullHeight - 405) : device.geometry.safeArea.top;
  useLayoutEffect(() => {
    s.flowRef.current = flow;
    if (flow.current.id !== 'discard' && s.afterDiscard.current) { const action = s.afterDiscard.current; s.afterDiscard.current = null; action(); }
    s.navigate.current = (id, replace = false) => { s.cancelOperation(); if (replace) flow.replace(screen(id)); else flow.push(screen(id)); };
  });
  useLayoutEffect(() => {
    if (initialized.current || !s.scenario) return; initialized.current = true;
    const target = scenarioRoute(s.scenario);
    if (target === 'home') return;
    const branch = ['personal', 'birthday', 'phone', 'code', 'discard'].includes(target) ? 'personal' : ['order', 'reorder', 'tracking'].includes(target) ? 'orders' : target.startsWith('address-') ? 'places' : target.startsWith('card') && target !== 'cards' ? 'cards' : ['notifications', 'permission', 'credits', 'privacy', 'terms', 'licenses', 'loyalty'].includes(target) ? 'settings' : ['activity'].includes(target) ? 'points' : null;
    if (branch && branch !== target) flow.push(screen(branch));
    if (target === 'code') flow.push(screen('phone'));
    if (target === 'card-bank' || target === 'card-error') flow.push(screen('card-form'));
    if (target === 'permission') flow.push(screen('notifications'));
    if (target.startsWith('address-') && target !== 'address-remove') {
      dispatch({ type: 'add' });
      if (s.scenario === 'address-selected' || target === 'address-details') dispatch({ type: 'location', location: addressSuggestions[2] });
      if (target === 'address-search') dispatch({ type: 'query', value: 'Brickell' });
      if (target !== 'address-map') flow.push(addressMapStep);
    }
    flow.push(screen(target));
  }, [flow, s.scenario, dispatch]);
  useLayoutEffect(() => {
    if (previous.current === route) return;
    s.cancelOperation();
    if (!flow.current.focusSelector) s.host?.querySelector<HTMLElement>(`[data-step="${route}"] h1, [data-step="${route}"] .profile-toolbar button, [data-step="${route}"] .address-toolbar button`)?.focus({ preventScroll: true });
    previous.current = route; document.title = `Prana — ${titles[route] ?? 'Delivery address'}`;
  }, [route, flow.current.focusSelector, s.host]);
  if (!s.host) return null;
  return <>{createPortal(<div className="profile-surface-layer"><div className="profile-blackout" /><AddressMapLayer /><motion.div className="profile-surface" initial={false} animate={{ top, opacity: tracking ? 0 : 1 }} transition={{ duration: reduced ? 0 : .32, ease: [.2, .8, .2, 1] }} /></div>, s.host)}<AddressDock host={s.host} />{tracking && createPortal(<ActiveOrderScreen onClose={() => s.backTo('orders')} returning={false} />, s.host)}</>;
}
function ProfileSession({ scenario, closeRef, ...callbacks }: ProfileCallbacks & { scenario: ProfileScenario | null; closeRef: RefObject<(() => void) | null> }) {
  const s = useProfileSessionState(scenario, callbacks), { device } = useMobileDevice(), keyboard = useKeyboard(), root = useRef<HTMLDivElement>(null), edge = useRef<{ x: number; y: number } | null>(null);
  const { state: addresses, dispatch } = useAddressBook(), geometryHeight = device.geometry.screen.height, addressGeometry = useAddressGeometry();
  const exitRef = useRef(callbacks.onExited); exitRef.current = callbacks.onExited;
  const addressDirty = () => s.flowRef.current?.current.id.startsWith('address-') && s.flowRef.current?.current.id !== 'address-remove' && !!addresses.draft;
  const leaveAddress = () => s.guard(() => s.backTo('places'), addresses.draft ? () => dispatch({ type: 'cancel-draft' }) : undefined);
  useLayoutEffect(() => {
    closeRef.current = () => s.guard(callbacks.onClose, addressDirty() ? () => dispatch({ type: 'cancel-draft' }) : undefined);
    const sheet = root.current?.closest<HTMLElement>('.bottom-sheet');
    sheet?.style.setProperty('--profile-height', `${geometryHeight - device.geometry.safeArea.top - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0)}px`);
    sheet?.style.setProperty('--profile-bottom', `${device.platform === 'android' ? device.geometry.safeArea.bottom : 0}px`);
  });
  // Radix listens on document capture; intercept Escape first without changing the runtime.
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !root.current?.closest('.bottom-sheet')?.contains(event.target as Node)) return;
      event.preventDefault();
      // Let the country field consume Escape, while preventing the parent dialog dismissal.
      if (root.current.querySelector('.phone-number-field[data-open="true"]')) return;
      event.stopPropagation();
      if (keyboard.visible) {
        keyboard.hide();
        root.current.querySelector<HTMLElement>('[data-flow-current="true"] .profile-toolbar button, [data-flow-current="true"] .address-toolbar button')?.focus({ preventScroll: true });
      } else if (addressDirty() && s.flowRef.current?.current.id === 'address-map') leaveAddress();
      else requestBack(s);
    };
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  });
  useEffect(() => () => { exitRef.current(); document.title = 'Prana — Menu'; }, []);
  return <ProfileSessionContext.Provider value={s}><AddressNavigationContext.Provider value={{ saved: () => s.backTo('places'), close: leaveAddress, back: flow => flow.current.id === 'address-map' ? leaveAddress() : flow.pop() }}>
    <div ref={root} className="profile-session" style={{ '--profile-safe-top': `${device.geometry.safeArea.top}px` } as CSSProperties}
      onPointerDownCapture={event => { if (!(s.dirty() || addressDirty())) return; const rect = root.current!.getBoundingClientRect(); if (event.clientX - rect.left > 28 * rect.width / device.geometry.screen.width) return; edge.current = { x: event.clientX, y: event.clientY }; event.stopPropagation(); }}
      onPointerUpCapture={event => { if (!edge.current) return; const start = edge.current; edge.current = null; if (event.clientX - start.x > 50 && Math.abs(event.clientY - start.y) < 50) { if (addressDirty()) leaveAddress(); else requestBack(s); } }} onPointerCancelCapture={() => { edge.current = null; }}>
      <div ref={s.setHost} className="profile-host checkout-host prana-auth" style={{ ...Object.fromEntries(Object.entries(addressGeometry).map(([key, value]) => [`--${key}-top`, `${value}px`])), '--profile-code-top': `${Math.max(device.geometry.safeArea.top, geometryHeight - keyboard.fullHeight - 405)}px` } as CSSProperties}><FlowStack initial={screen('home')} motionPreset={authStep} /></div>
    </div>
  </AddressNavigationContext.Provider></ProfileSessionContext.Provider>;
}
function DemoProfileSession(props: ProfileCallbacks & { scenario: ProfileScenario; closeRef: RefObject<(() => void) | null> }) {
  const { scenario } = props;
  const initial = { ...initialProfile, signedIn: scenario !== 'guest', details: { ...initialProfile.details, ...(scenario === 'no-name' ? { firstName: '', lastName: '' } : {}) }, cards: scenario === 'cards-empty' ? [] : initialProfile.cards, devicePush: scenario !== 'permission' };
  let addresses = { ...initialAddressBook, addresses: ['places-empty', 'no-name'].includes(scenario) ? [] : initialAddressBook.addresses };
  if (scenario.startsWith('address-') && scenario !== 'address-remove') addresses = addressReducer(addresses, { type: 'add' });
  const items = demoHistory(data.products)[0].items;
  const order = createOrder(data.products, Object.fromEntries(items.map(item => [item.id, item.quantity])), initialAddressBook.current, '+14155550123', 'idle', { leaveAtDoor: false, time: 0, payment: 0 });
  return <ProfileProvider initial={initial}><AddressBookProvider initial={addresses}><ActiveOrderProvider initial={order}><ProfileSession {...props} /></ActiveOrderProvider></AddressBookProvider></ProfileProvider>;
}
export function ProfileSheet({ open, scenario, ...callbacks }: ProfileCallbacks & { open: boolean; scenario: ProfileScenario | null }) {
  const { device } = useMobileDevice(), closeRef = useRef<(() => void) | null>(null);
  const available = device.geometry.screen.height - device.geometry.safeArea.top - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0);
  return <BottomSheet open={open} onOpenChange={next => { if (!next) closeRef.current?.(); }} title="Profile" description="Your account, orders and settings." snap={available / device.geometry.screen.height}>{scenario ? <DemoProfileSession {...callbacks} scenario={scenario} closeRef={closeRef} /> : <ProfileSession {...callbacks} scenario={null} closeRef={closeRef} />}</BottomSheet>;
}
