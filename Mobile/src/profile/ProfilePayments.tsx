import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useFlow } from '../mobile';
import { blankCard, cardErrors, changed, removeCard, saveCard, type SavedCard } from './profile-model';
import { useProfileSession } from './profile-session';
import { ProfileBody, ProfileButton, ProfileDock, ProfileField, ProfileHeading, ProfileIcon, ProfileStateView, ProfileSwitch } from './ProfileUI';

function CardTile({ card, isDefault, onClick }: { card: SavedCard; isDefault: boolean; onClick?: () => void }) {
  const content = <><ProfileIcon name="card-tile" /><strong>{card.brand}</strong><span className="profile-card-digits">•••• {card.last4}</span>{isDefault && <small>Default payment method</small>}</>;
  return onClick ? <button type="button" className="profile-card-tile" aria-label={`${card.brand} ending in ${card.last4}${isDefault ? ', default' : ''}`} onClick={onClick}>{content}</button> : <div className="profile-card-tile">{content}</div>;
}
export function PaymentMethodsScreen() {
  const s = useProfileSession(), { cards, defaultCardId } = s.profile.data;
  const add = () => { s.setEditingCard(undefined); s.setCardDraft(blankCard()); s.setCardBaseline(blankCard()); s.push('card-form'); };
  return <>{cards.length ? <ProfileBody><ProfileHeading description="Choose a payment method at checkout.">Your cards</ProfileHeading><div className="profile-card-list">{cards.map(card => <CardTile key={card.id} card={card} isDefault={card.id === defaultCardId} onClick={() => { s.setSelectedCard(card.id); s.push('card'); }} />)}</div></ProfileBody> : <ProfileStateView icon="card" title="No saved cards yet">Add a card to make checkout quicker.</ProfileStateView>}<ProfileDock route="cards"><ProfileButton onClick={add}>Add card</ProfileButton></ProfileDock></>;
}
export function CardFormScreen() {
  const s = useProfileSession(), flow = useFlow(), [touched, setTouched] = useState(s.scenario === 'card-invalid');
  const errors = cardErrors(s.cardDraft, new Date(), !!s.editingCard), autoStarted = useRef(false);
  const startVerification = () => {
    if (Object.keys(errors).length || s.busy) return;
    s.run('card', () => { if (!navigator.onLine) s.push('card-error'); else s.push('card-bank'); }, 1800);
  };
  useEffect(() => { if (s.scenario === 'card-verifying' && flow.current.id === 'card-form' && !autoStarted.current) { autoStarted.current = true; startVerification(); } }, [flow.current.id]);
  function submit(event: FormEvent) { event.preventDefault(); setTouched(true); startVerification(); }
  const update = (key: 'number' | 'expiry' | 'cvc' | 'name', value: string) => {
    if (key === 'number') value = value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
    if (key === 'expiry') { const digits = value.replace(/\D/g, '').slice(0, 4); value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; }
    if (key === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    s.setCardDraft(current => ({ ...current, [key]: value }));
  };
  return <><ProfileBody><ProfileHeading>{s.editingCard ? 'Edit card details' : 'Add a card'}</ProfileHeading><form id="profile-card-form" onSubmit={submit} className="profile-fields" noValidate>
    <ProfileField label="Card number" value={s.editingCard ? `•••• ${s.profile.data.cards.find(card => card.id === s.editingCard)?.last4}` : s.cardDraft.number} disabled={!!s.editingCard || !!s.busy} inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" error={touched ? errors.number : undefined} onBlur={() => setTouched(true)} onChange={event => update('number', event.target.value)} />
    <div className="profile-form-pair"><ProfileField label="Expiry date" placeholder="MM/YY" value={s.cardDraft.expiry} inputMode="numeric" autoComplete="off" disabled={!!s.busy} error={touched ? errors.expiry : undefined} onBlur={() => setTouched(true)} onChange={event => update('expiry', event.target.value)} />
    {!s.editingCard && <ProfileField label="Security code" placeholder="CVC" type="password" inputMode="numeric" autoComplete="off" value={s.cardDraft.cvc} disabled={!!s.busy} error={touched ? errors.cvc : undefined} onBlur={() => setTouched(true)} onChange={event => update('cvc', event.target.value)} />}</div>
    <ProfileField label="Name on card" placeholder="Full name" value={s.cardDraft.name} maxLength={100} autoComplete="off" disabled={!!s.busy} error={touched ? errors.name : undefined} onBlur={() => setTouched(true)} onChange={event => update('name', event.target.value)} />
    <ProfileSwitch title="Use as default" description="Selected first at checkout." checked={s.cardDraft.isDefault} disabled={!!s.busy} onChange={() => s.setCardDraft(current => ({ ...current, isDefault: !current.isDefault }))} />
  </form></ProfileBody><ProfileDock route="card-form"><ProfileButton type="submit" form="profile-card-form" disabled={Object.keys(errors).length > 0 || !!s.busy || (!!s.editingCard && !changed(s.cardDraft, s.cardBaseline))}>{s.busy === 'card' ? <><span className="profile-spinner" />Verifying…</> : s.editingCard ? 'Save changes' : 'Save card'}</ProfileButton></ProfileDock></>;
}
export function CardBankScreen() {
  const s = useProfileSession();
  const confirm = () => s.run('bank', () => {
    if (!navigator.onLine) { s.push('card-error', true); return; }
    const id = `local-card-${Date.now()}`;
    s.profile.setData(current => saveCard(current, s.cardDraft, id, s.editingCard));
    s.setCardDraft(blankCard()); s.setEditingCard(undefined); s.backTo('cards');
  });
  return <><ProfileStateView icon="shield" title="Confirm with your bank">Your bank may ask you to verify this card before it can be saved.</ProfileStateView><ProfileDock route="card-bank"><ProfileButton disabled={!!s.busy} onClick={confirm}>{s.busy ? 'Verifying…' : 'Continue verification'}</ProfileButton><ProfileButton secondary onClick={() => { s.cancelOperation(); s.backTo('card-form'); }}>Cancel</ProfileButton></ProfileDock></>;
}
export function CardErrorScreen() {
  const s = useProfileSession();
  return <><ProfileStateView title="Card wasn’t saved">Your card details are still here. Try again or use a different card.</ProfileStateView><ProfileDock route="card-error"><ProfileButton onClick={() => s.backTo('card-form')}>Try again</ProfileButton><ProfileButton secondary onClick={() => { s.setCardDraft(blankCard()); s.backTo('cards'); }}>Back to payment methods</ProfileButton></ProfileDock></>;
}
export function CardDetailsScreen() {
  const s = useProfileSession(), found = s.profile.data.cards.find(item => item.id === s.selectedCard), lastCard = useRef(found);
  if (found) lastCard.current = found;
  const card = found ?? lastCard.current;
  if (!card) return null;
  const isDefault = card.id === s.profile.data.defaultCardId;
  return <><ProfileBody><ProfileHeading>Card details</ProfileHeading><CardTile card={card} isDefault={isDefault} />
    <ProfileSwitch title="Default payment method" description="Selected first at checkout." checked={isDefault} onChange={() => s.profile.setData(current => ({ ...current, defaultCardId: isDefault ? '' : card.id }))} />
    <p className="profile-help">You can choose a different card when you place an order.</p>
  </ProfileBody><ProfileDock route="card"><ProfileButton onClick={() => { s.setEditingCard(card.id); const draft = { ...blankCard(), name: card.name, expiry: card.expiry, isDefault }; s.setCardDraft(draft); s.setCardBaseline(draft); s.push('card-form'); }}>Edit details</ProfileButton><ProfileButton secondary onClick={() => s.push('card-remove')}>Remove card</ProfileButton></ProfileDock></>;
}
export function CardRemoveScreen() {
  const s = useProfileSession(), liveCard = s.profile.data.cards.find(item => item.id === s.selectedCard), flow = useFlow(), lastCard = useRef(liveCard);
  if (liveCard) lastCard.current = liveCard;
  const card = liveCard ?? lastCard.current;
  return <><ProfileStateView icon="trash" title="Remove this card?">{card?.brand} ending in {card?.last4} will be removed from your saved payment methods. Existing orders won’t change.</ProfileStateView><ProfileDock route="card-remove"><ProfileButton onClick={flow.pop}>Keep card</ProfileButton><ProfileButton secondary onClick={() => { s.profile.setData(current => removeCard(current, s.selectedCard)); s.backTo('cards'); }}>Remove card</ProfileButton></ProfileDock></>;
}
