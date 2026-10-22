import { useEffect, useState } from 'react';
import { useFlow } from '../mobile';
import { useAddressBook } from '../catalog/AddressBook';
import { changed, initials } from './profile-model';
import { profileDocuments } from './profile-documents';
import { useProfileSession } from './profile-session';
import { ProfileBody, ProfileButton, ProfileDock, ProfileHeading, ProfileIcon, ProfileNotice, ProfileRow, ProfileStateView, ProfileSwitch } from './ProfileUI';

export function ProfileHomeScreen() {
  const s = useProfileSession(), { state } = useAddressBook(), { data } = s.profile;
  useEffect(() => { if (!s.loading) return; const timer = setTimeout(() => s.setLoading(false), 2400); return () => clearTimeout(timer); }, [s.loading]);
  if (!data.signedIn) return <GuestScreen route="home" />;
  if (s.loading) return <ProfileBody><div className="profile-skeleton" role="status" aria-label="Loading profile"><div /><div />{Array.from({ length: 5 }, (_, i) => <span key={i} />)}</div></ProfileBody>;
  const name = [data.details.firstName, data.details.lastName].filter(Boolean).join(' '), address = state.addresses.find(a => a.id === (state.defaultId ?? state.addresses[0]?.id));
  return <><ProfileBody className="profile-home">
    <button type="button" className="profile-identity" onClick={() => { s.setDraft(data.details); s.push('personal'); }}><span className="profile-avatar">{initials(data.details) || <ProfileIcon name="person" />}</span><span><strong>{name || data.phone}</strong><small>{name ? 'Personal details' : 'Add your name'}</small></span><ProfileIcon name="chevron" /></button>
    {s.offline && <ProfileNotice title="You’re offline">Showing your last saved details. Connect to update your account.</ProfileNotice>}
    {state.addresses.length ? <ProfileRow className="profile-points-summary" icon="points" title={`${s.scenario === 'points-empty' ? 0 : 476} Prana points`} description="Balance & activity →" trailing={<span />} onClick={() => s.push('points')} /> : <ProfileRow className="profile-points-summary" title="Make your next order easier" description="Add a delivery address to get started." onClick={() => s.push('places')} />}
    <ProfileRow title="Promo code available" description="WELCOME1010 · View & copy" onClick={() => s.push('promos')} /><hr />
    <ProfileRow title="My orders" description="Current delivery & order history" onClick={() => s.push('orders')} />
    <ProfileRow title="Delivery addresses" description={address ? `${address.details.label} · ${address.location.street}` : 'Add your first address'} onClick={() => s.push('places')} />
    <ProfileRow title="Payment methods" description={data.cards.length ? `${data.cards.length} saved ${data.cards.length === 1 ? 'card' : 'cards'}` : 'Add a payment method'} onClick={() => s.push('cards')} /><hr />
    <ProfileRow title="Settings & information" description="Notifications, loyalty terms, Credits" onClick={() => s.push('settings')} />
  </ProfileBody><ProfileDock route="home"><ProfileButton secondary={!s.offline} disabled={!!s.busy} onClick={() => s.offline ? s.run('offline', () => s.setOffline(!navigator.onLine)) : s.push('logout')}>{s.offline ? s.busy ? 'Connecting…' : 'Try again' : 'Log out'}</ProfileButton></ProfileDock></>;
}
export function GuestScreen({ route = 'guest' }: { route?: string }) {
  const s = useProfileSession();
  return <><ProfileStateView icon="user-circle" title="Your Prana account">Sign in to save your details, manage addresses and cards, and see your orders.</ProfileStateView><ProfileDock route={route}><ProfileButton onClick={s.onSignIn}>Sign in</ProfileButton><ProfileButton secondary onClick={s.onClose}>Browse menu</ProfileButton></ProfileDock></>;
}
export function PromoCodesScreen() {
  const [copied, setCopied] = useState(''), [failed, setFailed] = useState(false);
  useEffect(() => { if (!copied) return; const timer = setTimeout(() => setCopied(''), 2400); return () => clearTimeout(timer); }, [copied]);
  return <ProfileBody><ProfileHeading description="Copy this code and enter it at checkout.">Your promo codes</ProfileHeading><div className="profile-promo-list">{['WELCOME1010', 'CONTINUE2020'].map(code => <button type="button" key={code} className="profile-promo-code" aria-label={`Copy ${code}`} onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(code); setFailed(false); } catch { setFailed(true); } }}><span>{code}</span>{copied === code ? <small role="status">Copied</small> : <ProfileIcon name="copy" />}</button>)}</div>{failed && <ProfileNotice title="Couldn’t copy the code">Select the code text and copy it manually.</ProfileNotice>}</ProfileBody>;
}
export function SettingsScreen() {
  const s = useProfileSession();
  return <ProfileBody><ProfileHeading>Make Prana yours</ProfileHeading><ProfileRow title="Notifications & offers" description="Choose how we keep in touch" onClick={() => { s.setPreferences(s.profile.data.preferences); s.push('notifications'); }} /><hr />{[['Loyalty program terms', 'loyalty'], ['Credits', 'credits'], ['Privacy policy', 'privacy'], ['Terms and conditions', 'terms']].map(([title, route]) => <ProfileRow key={route} title={title} onClick={() => s.push(route)} />)}</ProfileBody>;
}
export function NotificationsScreen() {
  const s = useProfileSession(), dirty = changed(s.preferences, s.profile.data.preferences);
  const save = () => s.run('notifications', () => {
    if (!navigator.onLine || s.offline) { s.setFeedback(v => ({ ...v, notifications: 'error' })); return; }
    s.profile.setData(current => ({ ...current, preferences: s.preferences })); s.setFeedback(v => ({ ...v, notifications: 'saved' }));
    if (s.preferences.push && !s.profile.data.devicePush) s.push('permission');
  });
  return <><ProfileBody><ProfileHeading description="Choose your promotional messages.">Stay in the loop</ProfileHeading><h2 className="profile-section-heading">Promotions & offers</h2>
    {(['push', 'email', 'sms'] as const).map((key, index) => <ProfileSwitch key={key} disabled={!!s.busy} title={['Push notifications', 'Email offers', 'SMS offers'][index]} description={['Offers on this device.', 'Occasional promotions by email.', 'Promotions to your verified number.'][index]} checked={s.preferences[key]} onChange={() => { s.setPreferences(current => ({ ...current, [key]: !current[key] })); s.setFeedback(v => ({ ...v, notifications: undefined })); }} />)}
    <div className="profile-info-card"><strong>Order updates</strong><p>Messages needed to complete your order are managed separately.</p></div><p className="profile-help">You can change these choices at any time.</p>
    {s.feedback.notifications === 'error' && <ProfileNotice title="Preference wasn’t saved">Your previous setting is still active. Try again.</ProfileNotice>}
    {s.feedback.notifications === 'saved' && <ProfileNotice title="Preferences saved" success>Your choices are up to date.</ProfileNotice>}
    {!s.profile.data.devicePush && s.preferences.push && <ProfileRow title="Notifications blocked on this device" description="Review device permission" onClick={() => s.push('permission')} />}
  </ProfileBody><ProfileDock route="notifications"><ProfileButton disabled={(!dirty && s.feedback.notifications !== 'error') || !!s.busy} onClick={save}>{s.busy ? 'Saving…' : 'Save changes'}</ProfileButton></ProfileDock></>;
}
export function PermissionScreen() {
  const s = useProfileSession(), flow = useFlow();
  return <><ProfileStateView icon="bell" title="Allow notifications in Settings">Push notifications are enabled in Prana, but this device is blocking them. You can allow them in your device settings.</ProfileStateView><ProfileDock route="permission"><ProfileButton onClick={() => s.push('device-settings')}>Open settings</ProfileButton><ProfileButton secondary onClick={flow.pop}>Not now</ProfileButton></ProfileDock></>;
}
export function DeviceSettingsScreen() {
  const s = useProfileSession();
  return <><ProfileBody><ProfileHeading description="Choose whether Prana can show notifications on this device.">Prana notifications</ProfileHeading><ProfileSwitch title="Allow notifications" checked={s.profile.data.devicePush} onChange={() => s.profile.setData(current => ({ ...current, devicePush: !current.devicePush }))} /></ProfileBody><ProfileDock route="device-settings"><ProfileButton onClick={() => s.backTo('notifications')}>Back to Prana</ProfileButton></ProfileDock></>;
}
export function PointsScreen({ activity = false }: { activity?: boolean }) {
  const s = useProfileSession(), empty = s.scenario === 'points-empty', route = activity ? 'activity' : 'points';
  if (s.feedback.points === 'error') return <><ProfileStateView title="Couldn’t load your points">Your points haven’t been removed. Please try again.</ProfileStateView><ProfileDock route="points"><ProfileButton disabled={!!s.busy} onClick={() => s.run('points', () => s.setFeedback(v => ({ ...v, points: navigator.onLine ? undefined : 'error' })))}>{s.busy ? 'Loading…' : 'Try again'}</ProfileButton><ProfileButton secondary onClick={() => s.backTo('home')}>Back</ProfileButton></ProfileDock></>;
  return <ProfileBody><ProfileHeading>{activity ? 'Points activity' : 'Your Prana points'}</ProfileHeading><div className="profile-balance"><span>{empty ? 0 : 476}</span><p>Available Prana points</p></div>
    {empty ? <div className="profile-points-empty"><ProfileIcon name="bag" /><h2>Your activity will appear here</h2><p>See the loyalty terms to learn about earning and using points.</p></div> : activity ? <><h2 className="profile-section-heading">Pending</h2><ProfileRow title="Order #139" description="Points will be available after the order is completed" trailing={<strong className="profile-green">+200</strong>} /><h2 className="profile-section-heading">Recent activity</h2><ProfileRow title="Order #138" description="16 Oct 2026" trailing={<strong className="profile-green">+200</strong>} /><ProfileRow title="Order #137" description="14 Oct 2026" trailing={<strong>−24</strong>} /></> : <ProfileRow title="Points activity" description="View earned, used & pending points" onClick={() => s.push('activity')} />}
    {!activity && <><div className="profile-info-card"><strong>Using your points</strong><p>Available rewards are shown before you place an order.</p></div><ProfileRow title="Loyalty program terms" onClick={() => s.push('loyalty')} /></>}
    {activity && <p className="profile-help">Pending points are not included in your available balance.</p>}<span data-points-page={route} />
  </ProfileBody>;
}
export function DocumentScreen({ kind }: { kind: string }) {
  const s = useProfileSession(), flow = useFlow(), doc = profileDocuments[kind];
  if (s.feedback[kind] === 'error') return <><ProfileStateView icon="info" title={`${kind === 'loyalty' ? 'Loyalty terms' : kind === 'licenses' ? 'Licenses' : doc.title} unavailable`}>We couldn’t load this page. Please try again.</ProfileStateView><ProfileDock route={kind}><ProfileButton disabled={!!s.busy} onClick={() => s.run(kind, () => s.setFeedback(v => ({ ...v, [kind]: navigator.onLine ? undefined : 'error' })))}>{s.busy ? 'Loading…' : 'Try again'}</ProfileButton><ProfileButton secondary onClick={flow.pop}>Back</ProfileButton></ProfileDock></>;
  return <ProfileBody className="profile-document"><ProfileHeading description={doc.intro}>{doc.title}</ProfileHeading>{doc.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}</ProfileBody>;
}
export function CreditsScreen() {
  const s = useProfileSession();
  return <ProfileBody><ProfileHeading description="Food delivery">Prana</ProfileHeading><p className="profile-help">App information and acknowledgements.</p><ProfileRow title="Open-source licenses" onClick={() => s.push('licenses')} /><ProfileRow title="Privacy policy" onClick={() => s.push('privacy')} /><ProfileRow title="Terms and conditions" onClick={() => s.push('terms')} /><p className="profile-help">Account settings and order history are available from your profile.</p></ProfileBody>;
}
export function LogoutScreen({ error = false }: { error?: boolean }) {
  const s = useProfileSession(), flow = useFlow();
  const logout = () => s.run('logout', () => {
    if (!navigator.onLine) { s.push('logout-error', true); return; }
    s.profile.setData(current => ({ ...current, signedIn: false })); s.onPhone(''); s.setCardDraft({ number: '', expiry: '', cvc: '', name: '', isDefault: false }); s.backTo('home');
  });
  return <><ProfileStateView icon={error ? 'warning' : 'user-circle'} title={error ? 'You’re still signed in' : 'Log out of Prana?'}>{error ? 'We couldn’t finish logging you out. Please try again.' : 'You can sign in again anytime to access your orders and saved details.'}</ProfileStateView><ProfileDock route={error ? 'logout-error' : 'logout'}>{error ? <><ProfileButton disabled={!!s.busy} onClick={logout}>{s.busy ? 'Logging out…' : 'Try again'}</ProfileButton><ProfileButton secondary onClick={flow.pop}>Back</ProfileButton></> : <><ProfileButton onClick={flow.pop}>Stay signed in</ProfileButton><ProfileButton secondary disabled={!!s.busy} onClick={logout}>{s.busy ? 'Logging out…' : 'Log out'}</ProfileButton></>}</ProfileDock></>;
}
