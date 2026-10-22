import { createContext, useContext, useEffect, useRef, useState, type Context } from 'react';
import type { FlowControls } from '../mobile';
import { useProfile } from './ProfileState';
import { blankCard, changed, demoHistory, type HistoryOrder, type ProfileScenario } from './profile-model';
import { DEFAULT_PHONE, readPhoneInput } from '../phone-model';
import data from '../catalog/catalog.json';

export type ProfileRoute = 'home' | 'guest' | 'promos' | 'personal' | 'birthday' | 'phone' | 'code' | 'discard' | 'orders' | 'order' | 'reorder' | 'tracking' | 'places' | 'address-remove' | 'cards' | 'card-form' | 'card' | 'card-bank' | 'card-error' | 'card-remove' | 'points' | 'activity' | 'loyalty' | 'settings' | 'notifications' | 'permission' | 'device-settings' | 'credits' | 'licenses' | 'privacy' | 'terms' | 'logout' | 'logout-error' | 'support';
export type ProfileCallbacks = { onClose: () => void; onExited: () => void; onSignIn: () => void; onCart: (order: HistoryOrder, isolated: boolean) => void; onPhone: (phone: string) => void };
export function scenarioRoute(scenario: ProfileScenario | null): ProfileRoute | string {
  if (!scenario || ['ready', 'no-name', 'loading', 'offline'].includes(scenario)) return 'home';
  if (scenario.startsWith('personal')) return 'personal';
  if (scenario.startsWith('orders')) return 'orders';
  if (scenario === 'cancelled') return 'order';
  if (scenario === 'reorder-empty') return 'reorder';
  if (scenario.startsWith('places')) return 'places';
  if (scenario.startsWith('cards')) return 'cards';
  if (['card-invalid', 'card-verifying'].includes(scenario)) return 'card-form';
  if (scenario === 'address-selected') return 'address-map';
  if (['points-error', 'points-empty'].includes(scenario)) return 'points';
  if (scenario.endsWith('-error') && scenario !== 'card-error' && scenario !== 'logout-error') return scenario.replace('-error', '');
  return scenario;
}
export function useProfileSessionState(scenario: ProfileScenario | null, callbacks: ProfileCallbacks) {
  const profile = useProfile();
  const [draft, setDraft] = useState(() => ({ ...profile.data.details, ...(scenario === 'personal-invalid' ? { email: 'mike@' } : {}), ...(['personal-dirty', 'personal-error', 'discard'].includes(scenario ?? '') ? { lastName: 'Jerliss' } : {}) }));
  const [preferences, setPreferences] = useState(() => ({ ...profile.data.preferences, ...(scenario === 'notifications-error' ? { email: true } : {}) }));
  const [birthday, setBirthday] = useState(profile.data.details.birthday || '1985-06-12');
  const [phone, setPhone] = useState(scenario === 'code' ? readPhoneInput('+14155550123', 'US').draft : DEFAULT_PHONE);
  const [code, setCode] = useState(''), [codeError, setCodeError] = useState(false), [deadline, setDeadline] = useState(scenario === 'code' ? Date.now() + 43000 : 0);
  const sentPhone = useRef(scenario === 'code' ? '+14155550123' : '');
  const [cardDraft, setCardDraft] = useState(() => ['card-verifying', 'card-bank', 'card-error'].includes(scenario ?? '') ? { number: '4242 4242 4242 4242', expiry: '12/29', cvc: '123', name: 'Michael Jerlis', isDefault: false } : scenario === 'card-invalid' ? { number: '4242 42', expiry: '01/24', cvc: '123', name: 'Michael Jerlis', isDefault: false } : blankCard());
  const [cardBaseline, setCardBaseline] = useState(blankCard);
  const [editingCard, setEditingCard] = useState<string | undefined>();
  const [selectedCard, setSelectedCard] = useState(profile.data.cards[0]?.id ?? '');
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [order, setOrder] = useState(() => {
    const result = demoHistory(data.products)[scenario === 'cancelled' ? 1 : 0];
    if (scenario === 'reorder') return { ...result, items: [...result.items, { id: 'unavailable-prana-oats', name: 'Prana oats', quantity: 1, priceCents: 800 }] };
    if (scenario === 'reorder-empty') return { ...result, items: [{ id: 'unavailable-prana-oats', name: 'Prana oats', quantity: 1, priceCents: 800 }] };
    return result;
  });
  const [feedback, setFeedback] = useState<Record<string, 'error' | 'saved' | undefined>>(() => {
    const result: Record<string, 'error' | 'saved'> = {};
    if (scenario?.endsWith('-error')) result[scenario.replace('-error', '')] = 'error';
    if (scenario === 'personal-saved') result.personal = 'saved';
    return result;
  });
  const [loading, setLoading] = useState(scenario === 'loading');
  const [offline, setOffline] = useState(scenario === 'offline' || !navigator.onLine);
  useEffect(() => { const update = () => setOffline(!navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);
  const [busy, setBusy] = useState<string | null>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const flowRef = useRef<FlowControls | null>(null), backAction = useRef<(() => void) | null>(null), cancelEdit = useRef<(() => void) | null>(null), afterDiscard = useRef<(() => void) | null>(null);
  const navigate = useRef<(route: string, replace?: boolean) => void>(() => {});
  const generation = useRef(0), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const push = (route: string, replace = false) => navigate.current(route, replace);
  function cancelOperation() { generation.current++; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(null); }
  function run(kind: string, done: () => void, duration = 850) {
    if (timer.current) return;
    const token = ++generation.current; setBusy(kind);
    timer.current = setTimeout(() => { timer.current = null; if (token !== generation.current) return; setBusy(null); done(); }, duration);
  }
  useEffect(() => () => { generation.current++; if (timer.current) clearTimeout(timer.current); }, []);
  const dirty = () => {
    const route = flowRef.current?.current.id;
    return route === 'personal' ? changed(draft, profile.data.details) : route === 'notifications' ? changed(preferences, profile.data.preferences) : route === 'card-form' ? changed(cardDraft, cardBaseline) : false;
  };
  const backTo = (route: string) => {
    const flow = flowRef.current; if (!flow) return;
    const index = flow.stack.findIndex(entry => entry.id === route);
    if (index < 0) { push(route, true); return; }
    for (let i = flow.stack.length - 1; i > index; i--) flow.pop();
  };
  const guard = (action: () => void, discard?: () => void) => {
    if (dirty() || discard) {
      backAction.current = action;
      cancelEdit.current = discard ?? (() => { setDraft(profile.data.details); setPreferences(profile.data.preferences); setCardDraft(blankCard()); });
      push('discard');
    } else { cancelOperation(); action(); }
  };
  return { ...callbacks, profile, scenario, draft, setDraft, preferences, setPreferences, birthday, setBirthday, phone, setPhone, code, setCode, codeError, setCodeError, deadline, setDeadline, sentPhone, cardDraft, setCardDraft, cardBaseline, setCardBaseline, editingCard, setEditingCard, selectedCard, setSelectedCard, selectedAddress, setSelectedAddress, order, setOrder, feedback, setFeedback, loading, setLoading, offline, setOffline, busy, run, cancelOperation, host, setHost, flowRef, backAction, cancelEdit, afterDiscard, navigate, push, backTo, guard, dirty };
}
type Session = ReturnType<typeof useProfileSessionState>;
export const ProfileSessionContext: Context<Session | null> = import.meta.hot?.data.profileSessionContext ?? createContext<Session | null>(null);
if (import.meta.hot) import.meta.hot.data.profileSessionContext = ProfileSessionContext;
export const useProfileSession = () => useContext(ProfileSessionContext)!;
