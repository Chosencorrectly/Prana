import { useEffect, useRef, useState, type FormEvent } from 'react';
import { KeyboardInput, useFlow } from '../mobile';
import { PhoneNumberField } from '../PhoneNumberField';
import { phoneDetails } from '../phone-model';
import { normalizeCode, resendRemaining } from '../auth-model';
import { changed, cleanDetails, personalErrors } from './profile-model';
import { useProfileSession } from './profile-session';
import { ProfileBody, ProfileButton, ProfileDock, ProfileField, ProfileHeading, ProfileNotice, ProfileRow, ProfileStateView } from './ProfileUI';

export function PersonalDetailsScreen() {
  const s = useProfileSession();
  const [touched, setTouched] = useState(s.scenario === 'personal-invalid');
  const errors = personalErrors(s.draft), dirty = changed(s.draft, s.profile.data.details), feedback = s.feedback.personal;
  function save(event: FormEvent) {
    event.preventDefault(); setTouched(true);
    if (Object.keys(errors).length || !dirty || s.busy) return;
    s.run('personal', () => {
      if (!navigator.onLine || s.offline) { s.setFeedback(v => ({ ...v, personal: 'error' })); return; }
      const details = cleanDetails(s.draft); s.profile.setData(current => ({ ...current, details })); s.setDraft(details); s.setFeedback(v => ({ ...v, personal: 'saved' }));
    });
  }
  const birthdayLabel = s.draft.birthday ? new Date(`${s.draft.birthday}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Optional';
  return <><ProfileBody><ProfileHeading>Personal details</ProfileHeading>
    <form id="profile-personal-form" onSubmit={save} noValidate className="profile-fields">
      {(['firstName', 'lastName', 'email'] as const).map((key, index) => <ProfileField key={key} disabled={!!s.busy} label={['First name', 'Last name', 'Email'][index]} type={key === 'email' ? 'email' : 'text'} autoComplete={['given-name', 'family-name', 'email'][index]} maxLength={key === 'email' ? 254 : 60} value={s.draft[key]} error={touched ? errors[key] : undefined} onBlur={() => setTouched(true)} onChange={event => { s.setDraft(value => ({ ...value, [key]: event.target.value })); s.setFeedback(value => ({ ...value, personal: undefined })); }} />)}
    </form>
    <div className="profile-details-links"><ProfileRow title="Phone number" description={`${s.profile.data.phone} · Verified`} onClick={() => s.push('phone')} /><ProfileRow title="Date of birth" description={birthdayLabel} onClick={() => { s.setBirthday(s.draft.birthday || '1985-06-12'); s.push('birthday'); }} /></div>
    {feedback === 'error' && <ProfileNotice title="Couldn’t save your details">Your changes are still here. Please try again.</ProfileNotice>}
    {feedback === 'saved' && <ProfileNotice title="Your details are saved" success>Your profile is up to date.</ProfileNotice>}
  </ProfileBody><ProfileDock route="personal"><ProfileButton type="submit" form="profile-personal-form" disabled={!dirty || !!s.busy || Object.keys(errors).length > 0}>{s.busy === 'personal' ? 'Saving…' : feedback === 'error' ? 'Save again' : 'Save changes'}</ProfileButton></ProfileDock></>;
}
function DateWheel({ label, value, values, onChange }: { label: string; value: number; values: { value: number; text: string }[]; onChange: (value: number) => void }) {
  const root = useRef<HTMLDivElement>(null), start = useRef<number | null>(null), swiped = useRef(false), index = values.findIndex(item => item.value === value);
  const changeRef = useRef((delta: number) => onChange(values[Math.max(0, Math.min(values.length - 1, index + delta))].value));
  changeRef.current = delta => onChange(values[Math.max(0, Math.min(values.length - 1, index + delta))].value);
  useEffect(() => { const el = root.current; if (!el) return; const wheel = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); changeRef.current(e.deltaY > 0 ? 1 : -1); }; el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel); }, []);
  return <div ref={root} className="profile-date-column" data-scroll-drag="ignore" onPointerDown={event => { swiped.current = false; start.current = event.clientY; event.stopPropagation(); }} onPointerUp={event => { if (start.current !== null && Math.abs(event.clientY - start.current) > 12) { swiped.current = true; changeRef.current(event.clientY > start.current ? -1 : 1); } start.current = null; }} onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }} onPointerCancel={() => { start.current = null; swiped.current = false; }}>
    <button type="button" tabIndex={-1} aria-label={`Previous ${label.toLowerCase()}`} disabled={index === 0} onClick={() => changeRef.current(-1)}>{values[index - 1]?.text ?? ' '}</button>
    <div role="spinbutton" tabIndex={0} aria-label={label} aria-valuenow={value} aria-valuemin={values[0].value} aria-valuemax={values.at(-1)!.value} aria-valuetext={values[index]?.text} onKeyDown={event => { if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) { event.preventDefault(); if (event.key === 'Home') onChange(values[0].value); else if (event.key === 'End') onChange(values.at(-1)!.value); else changeRef.current(event.key === 'ArrowDown' ? 1 : -1); } }}>{values[index]?.text}</div>
    <button type="button" tabIndex={-1} aria-label={`Next ${label.toLowerCase()}`} disabled={index === values.length - 1} onClick={() => changeRef.current(1)}>{values[index + 1]?.text ?? ' '}</button>
  </div>;
}
export function BirthdayScreen() {
  const s = useProfileSession(), [year, month, day] = s.birthday.split('-').map(Number), today = new Date();
  function update(part: 'year' | 'month' | 'day', value: number) {
    const y = part === 'year' ? value : year, m = part === 'month' ? value : month, d = Math.min(part === 'day' ? value : day, new Date(y, m, 0).getDate());
    const date = new Date(y, m - 1, d); const clamped = date > today ? today : date;
    s.setBirthday(`${clamped.getFullYear()}-${String(clamped.getMonth() + 1).padStart(2, '0')}-${String(clamped.getDate()).padStart(2, '0')}`);
  }
  const done = (value: string) => { s.setDraft(current => ({ ...current, birthday: value })); s.setFeedback(current => ({ ...current, personal: undefined })); s.backTo('personal'); };
  return <><ProfileBody><ProfileHeading description="Optional. You can leave this empty.">Your birthday</ProfileHeading><div className="profile-date-wheel">
    <DateWheel label="Day" value={day} values={Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => ({ value: i + 1, text: String(i + 1) }))} onChange={value => update('day', value)} />
    <DateWheel label="Month" value={month} values={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, text: new Date(2000, i, 1).toLocaleDateString('en', { month: 'long' }) }))} onChange={value => update('month', value)} />
    <DateWheel label="Year" value={year} values={Array.from({ length: today.getFullYear() - 1899 }, (_, i) => ({ value: i + 1900, text: String(i + 1900) }))} onChange={value => update('year', value)} />
  </div>{s.draft.birthday && <button className="profile-text-button" type="button" onClick={() => done('')}>Remove birthday</button>}</ProfileBody><ProfileDock route="birthday"><ProfileButton onClick={() => done(s.birthday)}>Done</ProfileButton></ProfileDock></>;
}
export function ProfilePhoneScreen() {
  const s = useProfileSession(), flow = useFlow(), input = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);
  function send(event: FormEvent) {
    event.preventDefault(); const phone = phoneDetails(s.phone); if (!phone.possible || invalid) return;
    if (s.sentPhone.current !== phone.international || Date.now() >= s.deadline) { s.setDeadline(Date.now() + 43000); s.setCode(''); s.setCodeError(false); }
    s.sentPhone.current = phone.international; s.push('code');
  }
  return <><ProfileBody><ProfileHeading description="We’ll send a code to verify your new number.">Change your phone number</ProfileHeading><form id="profile-phone-form" onSubmit={send} className="profile-phone-form"><label className="profile-field-label">Phone number</label><PhoneNumberField value={s.phone} onChange={value => { s.setPhone(value); s.setCode(''); s.setCodeError(false); }} inputRef={input} active={flow.current.id === 'phone'} invalid={invalid} onInputError={setInvalid} /></form></ProfileBody><ProfileDock route="phone"><ProfileButton type="submit" form="profile-phone-form" disabled={!phoneDetails(s.phone).possible || invalid}>Send code</ProfileButton></ProfileDock></>;
}
export function ProfileCodeScreen() {
  const s = useProfileSession(), flow = useFlow(), input = useRef<HTMLInputElement>(null), [now, setNow] = useState(Date.now), [focused, setFocused] = useState(false);
  const active = flow.current.id === 'code', remaining = resendRemaining(s.deadline, now);
  useEffect(() => { if (!active) return; const timer = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(timer); }, [active]);
  function verify(event: FormEvent) {
    event.preventDefault(); if (s.code.length !== 4) return;
    if (s.code !== '1111' || s.sentPhone.current !== phoneDetails(s.phone).international) { s.setCodeError(true); input.current?.focus(); input.current?.select(); return; }
    const phone = s.sentPhone.current; s.profile.setData(current => ({ ...current, phone })); s.onPhone(phone); s.setCode(''); s.backTo('personal');
  }
  return <><ProfileBody className="profile-code-body"><ProfileHeading description={`Enter the code sent to ${s.sentPhone.current}.`}>Enter code</ProfileHeading><form id="profile-code-form" onSubmit={verify}>
    <div className="verification-code-field" data-error={s.codeError} data-focused={focused}><div className="verification-code-slots" aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <span key={i} data-current={i === Math.min(s.code.length, 3)}>{s.code[i] || '0'}</span>)}</div>
      <KeyboardInput ref={input} className="verification-code-input" aria-label="SMS verification code" aria-invalid={s.codeError || undefined} aria-describedby={s.codeError ? 'profile-code-error' : undefined} inputMode="numeric" autoComplete="one-time-code" value={s.code} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={event => { s.setCode(normalizeCode(event.target.value)); s.setCodeError(false); }} />
    </div>{s.codeError && <p className="profile-inline-error" role="alert" id="profile-code-error">Incorrect code. Please try again.</p>}
    <button type="button" className="verification-resend" disabled={remaining > 0} onPointerDown={event => event.preventDefault()} onClick={() => { s.setDeadline(Date.now() + 43000); setNow(Date.now()); s.setCode(''); s.setCodeError(false); input.current?.focus(); }}>{remaining ? `Resend code in ${remaining}s` : 'Resend code'}</button>
  </form></ProfileBody><ProfileDock route="code"><ProfileButton type="submit" form="profile-code-form" disabled={s.code.length !== 4}>Verify number</ProfileButton></ProfileDock></>;
}
export function DiscardScreen() {
  const s = useProfileSession(), flow = useFlow();
  return <><ProfileStateView title="Discard your changes?">Your unsaved changes will be lost. Keep editing to save them.</ProfileStateView><ProfileDock route="discard"><ProfileButton onClick={flow.pop}>Keep editing</ProfileButton><ProfileButton secondary onClick={() => { s.cancelEdit.current?.(); s.cancelOperation(); s.afterDiscard.current = s.backAction.current ?? (() => s.backTo('home')); flow.pop(); }}>Discard changes</ProfileButton></ProfileDock></>;
}
