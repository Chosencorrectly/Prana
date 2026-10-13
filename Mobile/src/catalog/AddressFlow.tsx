import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { KeyboardInput, MobileScroll, useFlow, useKeyboard, useKeyboardInsets, useMobileDevice, useScreenPortal, type FlowControls, type FlowScreen } from '../mobile';
import { useAddressBook } from './AddressBook';
import { useCheckout } from './checkout-context';
import { BottomFade } from './BottomFade';
import { defaultLocation, deliveryAvailable, DEMO_ZONE_EDGE, findAddresses, fullAddress, MAP_SIZE, reverseDemoPoint, type AddressDetails, type MapPoint } from './address-model';
import './address.css';

const asset = (name: string) => `/assets/address/${name}.svg`;
const ease = [.2, .8, .2, 1] as const;
export function returnToCheckout(flow: FlowControls) {
  const checkout = flow.stack.find(entry => entry.id === 'delivery');
  if (checkout) flow.push(checkout);
}
export function addressBack(flow: FlowControls) {
  if (flow.current.id === 'address-list') returnToCheckout(flow);
  else if (flow.current.id === 'address-map') flow.push(addressListStep);
  else flow.push(addressMapStep);
}
export function useAddressGeometry() {
  const { device } = useMobileDevice(), keyboard = useKeyboard(), { state } = useAddressBook();
  const height = device.geometry.screen.height, safe = device.geometry.safeArea.top;
  return {
    'address-list': Math.max(safe, height - 442 - Math.max(0, state.addresses.length - 2) * 85),
    'address-map': height - (deliveryAvailable(state.draft?.location ?? defaultLocation) ? 263 : 407),
    'address-search': safe,
    'address-details': keyboard.visible ? safe : height - 644,
  };
}

// One map survives all address steps; moving the bitmap changes the coordinate
// under a stationary pin. No independent entering/exiting map copies.
export function AddressMapLayer() {
  const { state, dispatch } = useAddressBook(), flow = useFlow();
  const { device } = useMobileDevice(), { screenRef } = useScreenPortal();
  const reduced = !!useReducedMotion(), [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; point: MapPoint } | null>(null);
  const active = flow.current.id.startsWith('address-'), editable = flow.current.id === 'address-map';
  const selectedLocation = state.addresses.find(item => item.id === state.selectedId)?.location ?? state.current.location;
  const point = (flow.current.id === 'address-list' ? selectedLocation : state.draft?.location ?? selectedLocation).point;
  const width = device.geometry.screen.width, height = device.geometry.screen.height;
  const anchor = { x: width / 2 + 1, y: 376 };
  function move(next: MapPoint) {
    dispatch({ type: 'location', location: reverseDemoPoint({ x: Math.max(anchor.x, Math.min(anchor.x + MAP_SIZE.width - width, next.x)), y: Math.max(anchor.y, Math.min(anchor.y + MAP_SIZE.height - height, next.y)) }) });
  }
  function end(event: PointerEvent) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null; setDragging(false);
  }
  return <motion.div className="address-map-layer" inert={!active} aria-hidden={!active || undefined} initial={false}
    animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? .08 : .24 }} style={{ pointerEvents: active ? 'auto' : 'none' }}>
    <div className="address-map-gesture" role="region" aria-label="Delivery location map" aria-describedby="address-map-help" tabIndex={editable ? 0 : -1}
      onPointerDown={event => { if (!editable || event.button !== 0) return; event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, point }; setDragging(true); }}
      onPointerMove={event => { const start = drag.current; if (!start || start.id !== event.pointerId) return; const scale = (screenRef.current?.getBoundingClientRect().width ?? width) / width; move({ x: start.point.x - (event.clientX - start.x) / scale, y: start.point.y - (event.clientY - start.y) / scale }); }}
      onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
      onKeyDown={event => { if (!editable || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); event.stopPropagation(); move({ x: point.x + (event.key === 'ArrowRight' ? 32 : event.key === 'ArrowLeft' ? -32 : 0), y: point.y + (event.key === 'ArrowDown' ? 32 : event.key === 'ArrowUp' ? -32 : 0) }); }}>
      <motion.div className="address-map-world" initial={false} animate={{ x: anchor.x - point.x, y: anchor.y - point.y }} transition={{ duration: dragging || reduced ? 0 : .32, ease }}>
        <img src="/assets/address/map.png" alt="" width={889} height={1147} draggable={false} />
        <div className="address-zone" style={{ left: DEMO_ZONE_EDGE }} />
      </motion.div>
      <span className="address-map-help" id="address-map-help">Drag the map to adjust the pin, or use the arrow keys.</span>
      <motion.img className="address-pin" src={asset('pin')} alt="" aria-hidden="true" width={40} height={40} initial={false} animate={{ opacity: editable ? 1 : 0 }} transition={{ duration: reduced ? .08 : .14 }} style={{ left: anchor.x - 20, top: anchor.y - 20 }} />
    </div>
    {flow.current.id === 'address-list' && <button className="address-map-close" type="button" aria-label="Back to checkout" style={{ top: device.geometry.safeArea.top + 8 }} onClick={() => returnToCheckout(flow)}><img src="/assets/checkout/phone-back.svg" alt="" width={18} height={18} /></button>}
  </motion.div>;
}

// Blur is portaled outside the opacity-animated route, like the other docks.
export function AddressDock() {
  const { host } = useCheckout(), flow = useFlow(), { state, dispatch } = useAddressBook();
  const { device } = useMobileDevice(), keyboard = useKeyboard(), { bottomInset, keyboardDragging } = useKeyboardInsets();
  const reduced = !!useReducedMotion(), step = flow.current.id;
  const searching = step === 'address-search', active = step.startsWith('address-');
  const available = deliveryAvailable(state.draft?.location ?? defaultLocation);
  const selected = state.addresses.find(item => item.id === state.selectedId);
  const disabled = step === 'address-list' ? !selected || !deliveryAvailable(selected.location) : !state.draft || !available;
  const bottom = searching ? bottomInset + 20 : Math.max(0, bottomInset - (keyboard.visible ? 0 : device.geometry.safeArea.bottom));
  function submit() {
    if (disabled) return;
    if (step === 'address-list') { dispatch({ type: 'deliver' }); returnToCheckout(flow); }
    else if (step === 'address-map') flow.push(addressDetailsStep);
    else if (step === 'address-details') { dispatch({ type: 'save' }); flow.push(addressListStep); }
  }
  return host && createPortal(<motion.div className="address-dock" data-search={searching} data-active={active} inert={!active || searching} aria-hidden={!active || searching || undefined}
    initial={{ '--dock-fade-opacity': 0 }} animate={{ bottom, '--dock-fade-opacity': active ? 1 : 0 }}
    transition={{ duration: keyboardDragging ? 0 : reduced ? .08 : .26, ease }}>
    <BottomFade />
    {!searching && <motion.button type="button" className="address-primary" disabled={disabled} onPointerDown={event => event.preventDefault()} onClick={submit}
      key={step} initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? .08 : .24 }}>
      {step === 'address-list' ? 'Deliver here' : step === 'address-map' ? 'Continue to details' : 'Save address'}
    </motion.button>}
  </motion.div>, host);
}

function AddressHeader({ list = false, details = false }: { list?: boolean; details?: boolean }) {
  const flow = useFlow(), { state } = useAddressBook();
  if (list) return <div className="address-list-title"><span>Delivery</span></div>;
  return <div className="address-toolbar">
    <button type="button" aria-label={details ? 'Back to map' : flow.current.id === 'address-search' ? 'Back to map' : 'Back to addresses'} onPointerDown={event => event.preventDefault()} onClick={() => addressBack(flow)}><img className="address-back" src="/assets/checkout/phone-back.svg" alt="" width={18} height={18} /></button>
    <span>{details ? 'Address details' : state.draft?.id ? 'Edit address' : 'Add address'}</span>
    <button type="button" aria-label="Close address flow" onPointerDown={event => event.preventDefault()} onClick={() => returnToCheckout(flow)}><img src="/assets/checkout/close.svg" alt="" width={11.6667} height={11.6667} /></button>
  </div>;
}
function AddressList() {
  const { state, dispatch } = useAddressBook(), flow = useFlow();
  return <MobileScroll className="address-list-scroll"><div className="address-list-content" role="group" aria-label="Saved delivery addresses">
    {state.addresses.map(address => <div className="address-row" key={address.id} data-selected={state.selectedId === address.id}>
      <button className="address-select" type="button" aria-pressed={state.selectedId === address.id} aria-label={`${address.details.label}: ${fullAddress(address.location)}`} onClick={() => dispatch({ type: 'select', id: address.id })}>
        <img className="address-radio" src={asset(state.selectedId === address.id ? 'selected' : 'unselected')} alt="" width={22} height={22} />
        <span className="address-row-text"><span>{fullAddress(address.location)}</span><small>{address.details.label.toLowerCase() === 'home' ? <img src={asset('home')} alt="" width={13} height={13} /> : <i className="address-work-icon" aria-hidden="true" />}{address.details.label}</small></span>
      </button>
      <button className="address-edit" type="button" aria-label={`Edit ${address.details.label} address`} onClick={() => {
        dispatch({ type: 'edit', id: address.id });
        // Seed the map underneath details in the same event, so Back is a reverse
        // transition even when editing an existing address directly from the list.
        flow.push(addressMapStep); flow.push(addressDetailsStep);
      }}><img src={asset('edit')} alt="" width={18} height={18} /></button>
    </div>)}
    <button className="address-add" type="button" onClick={() => { dispatch({ type: 'add' }); flow.push(addressMapStep); }}>+ Add</button>
  </div></MobileScroll>;
}
function AddressMapBody() {
  const { state, dispatch } = useAddressBook(), flow = useFlow();
  const location = state.draft?.location ?? defaultLocation, available = deliveryAvailable(location);
  return <MobileScroll><div className="address-map-content">
    <button className="address-location-field" type="button" aria-label="Search address" onClick={() => { dispatch({ type: 'query', value: '' }); flow.push(addressSearchStep); }}><small>Address</small><span>{fullAddress(location)}</span></button>
    {!available && <div className="address-warning" role="status"><h2>Delivery unavailable here</h2><p>This address is outside our delivery area. Choose another location.</p></div>}
  </div></MobileScroll>;
}
function AddressSearch() {
  const { state, dispatch } = useAddressBook(), flow = useFlow(), keyboard = useKeyboard();
  const { bottomInset } = useKeyboardInsets();
  const results = findAddresses(state.query);
  return <div className="address-search-content" style={{ '--address-results-bottom': `${bottomInset + 20}px` } as CSSProperties}>
    <label className="address-location-field"><small>Address</small><KeyboardInput className="address-search-input" type="search" aria-label="Search address" autoComplete="off" placeholder="Search address" value={state.query} onChange={event => dispatch({ type: 'query', value: event.target.value })} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); keyboard.hide(); } }} /></label>
    <div className="address-results"><MobileScroll><div className="address-results-list" role="group" aria-label="Address suggestions">
      {results.map(location => <button key={location.street} type="button" onPointerDown={event => event.preventDefault()} onClick={() => { dispatch({ type: 'location', location }); flow.push(addressMapStep); }}><span>{location.street}</span><small>{location.locality}</small><img src={asset('result-divider')} alt="" width={370} height={1} /></button>)}
      {!results.length && <p className="address-no-results" role="status">No addresses found. Try another street or choose a point on the map.</p>}
    </div></MobileScroll></div>
  </div>;
}
const detailFields: { field: keyof AddressDetails; label: string; maxLength: number }[] = [
  { field: 'unit', label: 'Apartment / Suite / Unit', maxLength: 60 },
  { field: 'building', label: 'Building / Residence name', maxLength: 100 },
  { field: 'floor', label: 'Floor', maxLength: 20 }, { field: 'access', label: 'Access code', maxLength: 40 },
  { field: 'instructions', label: 'Delivery instructions', maxLength: 240 }, { field: 'label', label: 'Address label', maxLength: 40 },
];
function AddressDetailsBody() {
  const { state, dispatch } = useAddressBook(), flow = useFlow(), keyboard = useKeyboard();
  // Saving clears the model's draft. Keep the outgoing visual intact for authStep.
  const lastDraft = useRef(state.draft);
  if (state.draft) lastDraft.current = state.draft;
  const draft = state.draft ?? lastDraft.current;
  return <MobileScroll className="address-details-scroll"><div className="address-details-content">
    <button className="address-location-summary" type="button" aria-label="Edit delivery location on map" onClick={() => flow.push(addressMapStep)}><span><span>{draft?.location.street ?? ''}</span><small>{draft?.location.locality ?? ''}</small></span><img src={asset('edit-location')} alt="" width={24} height={24} /></button>
    <div className="address-detail-fields">{detailFields.map(({ field, label, maxLength }) => <label className="address-detail-field" data-half={field === 'floor' || field === 'access'} key={field}>
      <KeyboardInput type="text" aria-label={label} placeholder={label} value={draft?.details[field] ?? ''} maxLength={maxLength} autoComplete="off" onChange={event => dispatch({ type: 'detail', field, value: event.target.value })} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); keyboard.hide(); event.currentTarget.blur(); } }} />
    </label>)}</div>
  </div></MobileScroll>;
}
export const addressListStep: FlowScreen = { id: 'address-list', headerHeight: 74, header: () => <AddressHeader list />, footerHeight: 110, render: () => <AddressList /> };
export const addressMapStep: FlowScreen = { id: 'address-map', headerHeight: 60, header: () => <AddressHeader />, footerHeight: 110, render: () => <AddressMapBody /> };
const addressSearchStep: FlowScreen = { id: 'address-search', headerHeight: 60, header: () => <AddressHeader />, focusSelector: '.address-search-input', render: () => <AddressSearch /> };
const addressDetailsStep: FlowScreen = { id: 'address-details', headerHeight: 60, header: () => <AddressHeader details />, footerHeight: 110, render: () => <AddressDetailsBody /> };
