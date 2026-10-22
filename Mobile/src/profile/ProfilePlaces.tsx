import { useRef } from 'react';
import { useFlow } from '../mobile';
import { useAddressBook } from '../catalog/AddressBook';
import { addressDetailsStep, addressMapStep } from '../catalog/AddressFlow';
import { fullAddress } from '../catalog/address-model';
import { useProfileSession } from './profile-session';
import { ProfileBody, ProfileButton, ProfileDock, ProfileHeading, ProfileIcon, ProfileStateView } from './ProfileUI';

export function PlacesScreen() {
  const s = useProfileSession(), { state, dispatch } = useAddressBook(), flow = useFlow();
  const add = () => { dispatch({ type: 'add' }); flow.push(addressMapStep); };
  return <>{state.addresses.length ? <ProfileBody><ProfileHeading description="Save time on your next delivery.">Your places</ProfileHeading><div className="profile-places">
    {state.addresses.map(address => <div className="profile-place" key={address.id}><div className="profile-place-heading"><ProfileIcon name={address.details.label.toLowerCase() === 'work' ? 'work' : 'home'} /><h2>{address.details.label}{(state.defaultId ?? state.addresses[0]?.id) === address.id && <span> · Default</span>}</h2></div><p>{fullAddress(address.location)}</p><div className="profile-place-actions">
      <button type="button" aria-label={`Edit ${address.details.label} address`} onClick={() => { dispatch({ type: 'edit', id: address.id }); flow.push(addressMapStep); flow.push(addressDetailsStep); }}><ProfileIcon name="edit" /></button>
      <button type="button" aria-label={`Remove ${address.details.label} address`} onClick={() => { s.setSelectedAddress(address.id); s.push('address-remove'); }}><ProfileIcon name="trash-small" /></button>
    </div></div>)}
  </div></ProfileBody> : <ProfileStateView icon="pin" title="Where should we deliver?">Save your home, work, or another address for a quicker checkout.</ProfileStateView>}<ProfileDock route="places"><ProfileButton onClick={add}>Add address</ProfileButton></ProfileDock></>;
}
export function RemoveAddressScreen() {
  const s = useProfileSession(), { state, dispatch } = useAddressBook(), flow = useFlow(), liveAddress = state.addresses.find(item => item.id === s.selectedAddress), lastAddress = useRef(liveAddress);
  if (liveAddress) lastAddress.current = liveAddress;
  const address = liveAddress ?? lastAddress.current;
  return <><ProfileStateView icon="pin" title={`Remove ${address?.details.label ?? 'this address'}?`}>This address will be removed from your saved places. Existing orders won’t change.</ProfileStateView><ProfileDock route="address-remove"><ProfileButton onClick={flow.pop}>Keep address</ProfileButton><ProfileButton secondary onClick={() => { dispatch({ type: 'remove', id: s.selectedAddress }); s.backTo('places'); }}>Remove address</ProfileButton></ProfileDock></>;
}
