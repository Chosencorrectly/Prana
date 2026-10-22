import { createContext, useContext, useEffect, useRef, useState, type FormEvent } from 'react';
import { MotionConfig } from 'motion/react';
import { BottomSheet, FlowStack, KeyboardInput, MobileScroll, useFlow, type FlowScreen } from './mobile';
import { normalizeCode, RESEND_SECONDS, resendRemaining, verifyCode } from './auth-model';
import { DEFAULT_PHONE, phoneDetails, type PhoneDraft } from './phone-model';
import { PhoneNumberField } from './PhoneNumberField';
import { authStep } from './auth-motion';
import { Catalog, CatalogHeader, CatalogProvider } from './catalog/Catalog';

const asset = (name: string) => `/assets/auth/${name}`;
type Notice = { title: string; description: string; phoneAction?: boolean } | null;
type AuthState = {
  phone: PhoneDraft; setPhone: (value: PhoneDraft) => void;
  code: string; setCode: (value: string) => void;
  phoneError: boolean; setPhoneError: (value: boolean) => void;
  codeError: boolean; setCodeError: (value: boolean) => void;
  deadline: number; setDeadline: (value: number) => void;
  notice: Notice; setNotice: (notice: Notice) => void;
};
const AuthContext = createContext<AuthState | null>(null);
const useAuth = () => useContext(AuthContext)!;

function Toolbar() {
  const flow = useFlow();
  return <button className="auth-back" type="button" aria-label="Back" onPointerDown={event => event.preventDefault()} onClick={flow.pop}><img src={asset('back.svg')} alt="" /></button>;
}
function FormFooter({ kind }: { kind: 'phone' | 'code' }) {
  const auth = useAuth();
  return <div className="auth-footer"><button className="auth-primary" type="submit" form={`${kind}-form`} disabled={kind === 'phone' && (!phoneDetails(auth.phone).possible || auth.phoneError)} onPointerDown={(event) => event.preventDefault()}>{kind === 'phone' ? 'Get the code via SMS' : 'Confirm'}</button></div>;
}
function Splash() {
  const flow = useFlow();
  const replace = useRef(flow.replace);
  useEffect(() => {
    const timer = window.setTimeout(() => replace.current(signInScreen), 950);
    return () => window.clearTimeout(timer);
  }, []);
  return <div className="auth-splash" aria-label="Prana is loading">
    <img className="splash-mark" src={asset('brand-mark.svg')} alt="Prana" />
    <div className="splash-word" aria-hidden="true"><img src={asset('brand-word.svg')} alt="" /><img className="splash-word-detail" src={asset('brand-word-detail.svg')} alt="" /></div>
    <p className="splash-version">Version 1.1</p>
  </div>;
}
function NoticeSheet() {
  const auth = useAuth();
  const flow = useFlow();
  return <BottomSheet open={!!auth.notice} onOpenChange={(open) => { if (!open) auth.setNotice(null); }} title={auth.notice?.title ?? ''} description={auth.notice?.description} snap={0.36}>
    <button type="button" className="auth-primary notice-action" onClick={() => {
      const phoneAction = auth.notice?.phoneAction;
      auth.setNotice(null);
      if (phoneAction && flow.current.id === 'sign-in') flow.push(phoneScreen);
    }}>{auth.notice?.phoneAction ? 'Continue with Phone' : 'Got it'}</button>
  </BottomSheet>;
}
function SignIn() {
  const flow = useFlow();
  const auth = useAuth();
  const active = flow.current.id === 'sign-in';
  const social = (provider: string) => auth.setNotice({ title: `Sign in with ${provider}`, description: `${provider} sign-in is not connected yet. You can continue with your phone.`, phoneAction: true });
  return <section className="auth-welcome" inert={!active} aria-hidden={!active || undefined} aria-label="Sign in">
    <MobileScroll className="welcome-scroll"><div className="welcome-panel">
      <div className="auth-bag" aria-hidden="true"><img src={asset('auth-bag.png')} alt="" /></div>
      <div className="bag-shade shade-one" /><div className="bag-shade shade-two" /><div className="bag-shade shade-three" />
      <div className="welcome-content">
        <h1>Sign in</h1><p className="welcome-description">Choose a convenient way<br />to sign in to your profile</p>
        <button type="button" className="auth-primary" onClick={() => flow.push(phoneScreen)}>Continue with Phone</button>
        <div className="social-divider"><img src={asset('divider.svg')} alt="" /><span>Or continue with</span><img src={asset('divider.svg')} alt="" /></div>
        <div className="social-actions">
          <button type="button" onClick={() => social('Apple')}><span className="social-icon"><img src={asset('apple.svg')} alt="" /></span>Apple</button>
          <button type="button" onClick={() => social('Google')}><span className="social-icon"><img src={asset('google.svg')} alt="" /></span>Google</button>
        </div>
        <p className="auth-legal">By clicking this button, I accept<br />the <button type="button" onClick={() => auth.setNotice({ title: 'Public Offer', description: 'The Public Offer has not been added to this prototype yet.' })}>Public Offer</button> and <button type="button" onClick={() => auth.setNotice({ title: 'Privacy Policy', description: 'The Privacy Policy has not been added to this prototype yet.' })}>Privacy Policy</button>.</p>
      </div>
    </div></MobileScroll>
    <button type="button" className="auth-skip" onClick={() => flow.reset(catalogScreen)}>Skip</button>
    {active && <NoticeSheet />}
  </section>;
}
function Phone() {
  const auth = useAuth();
  const flow = useFlow();
  const input = useRef<HTMLInputElement>(null);
  const active = flow.current.id === 'phone';
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!phoneDetails(auth.phone).possible || auth.phoneError) { auth.setPhoneError(true); input.current?.focus({ preventScroll: true }); return; }
    auth.setCode(''); auth.setCodeError(false); auth.setDeadline(Date.now() + RESEND_SECONDS * 1000);
    flow.push(codeScreen);
  }
  return <section className="auth-form-screen" inert={!active} aria-hidden={!active || undefined}>
    <MobileScroll className="auth-scroll"><form id="phone-form" className="auth-form phone-form" onSubmit={submit} noValidate>
      <h1>Enter Phone</h1><p className="auth-description">Enter your phone number to<br />get the authorization code</p>
      <PhoneNumberField inputRef={input} value={auth.phone} active={active} invalid={auth.phoneError} onInputError={auth.setPhoneError}
        onChange={value => { auth.setPhone(value); auth.setPhoneError(false); }} />
    </form></MobileScroll>
  </section>;
}
function Code() {
  const auth = useAuth();
  const flow = useFlow();
  const input = useRef<HTMLInputElement>(null);
  const active = flow.current.id === 'code';
  const [now, setNow] = useState(Date.now);
  const [incomplete, setIncomplete] = useState(false);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);
  const remaining = resendRemaining(auth.deadline, now);
  useEffect(() => {
    if (!active) return;
    setIncomplete(false);
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, [active]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (auth.code.length !== 4) { setIncomplete(true); input.current?.focus({ preventScroll: true }); return; }
    if (!verifyCode(auth.code)) {
      auth.setCodeError(true); input.current?.focus({ preventScroll: true }); input.current?.select(); return;
    }
    auth.setNotice(null);
    flow.reset(catalogScreen);
  }
  return <section className="auth-form-screen" inert={!active} aria-hidden={!active || undefined}>
    <MobileScroll className="auth-scroll"><form id="code-form" className="auth-form code-form" onSubmit={submit} noValidate>
      <h1>Enter code</h1><p className="auth-description">Enter the code from the SMS</p>
      <div className="code-field" data-error={auth.codeError} data-focused={focused}>
        <div className="code-slots" aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <span key={i} className="code-slot" data-empty={!auth.code[i]} data-current={i === Math.min(caret, 3)}>{auth.code[i] || '0'}</span>)}</div>
        <KeyboardInput ref={input} className="code-input" aria-label="SMS verification code" type="text" inputMode="numeric" autoComplete="one-time-code" value={auth.code}
          aria-invalid={auth.codeError || incomplete || undefined} aria-describedby={auth.codeError || incomplete ? 'code-error' : undefined}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onSelect={(event) => setCaret(event.currentTarget.selectionStart ?? auth.code.length)}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const index = Math.min(auth.code.length, Math.max(0, Math.floor((event.clientX - rect.left) / (rect.width / 4))));
            event.currentTarget.setSelectionRange(index, index); setCaret(index);
          }}
          onChange={(event) => { auth.setCode(normalizeCode(event.target.value)); auth.setCodeError(false); setIncomplete(false); }} />
      </div>
      {(auth.codeError || incomplete) && <p className="auth-error code-error" id="code-error" role="alert">{auth.codeError ? <>the code was entered<br />incorrectly</> : 'Enter all four digits'}</p>}
      {remaining > 0 ? <p className="resend-wait">If the code has not arrived, request<br />a new one in {remaining} {remaining === 1 ? 'second' : 'seconds'}.</p> : <button className={`resend-code${auth.codeError || incomplete ? ' resend-below-error' : ''}`} type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => {
        const sentAt = Date.now(); auth.setDeadline(sentAt + RESEND_SECONDS * 1000); setNow(sentAt);
        auth.setCode(''); auth.setCodeError(false); setIncomplete(false); input.current?.focus({ preventScroll: true });
      }}>Resend the code</button>}
    </form></MobileScroll>
    {active && <NoticeSheet />}
  </section>;
}
const splashScreen: FlowScreen = { id: 'splash', render: () => <Splash /> };
const signInScreen: FlowScreen = { id: 'sign-in', render: () => <SignIn /> };
const phoneScreen: FlowScreen = { id: 'phone', focusSelector: '.phone-input', headerHeight: 60, header: () => <Toolbar />, footerHeight: 79, footer: () => <FormFooter kind="phone" />, render: () => <Phone /> };
const codeScreen: FlowScreen = { id: 'code', focusSelector: '.code-input', headerHeight: 60, header: () => <Toolbar />, footerHeight: 79, footer: () => <FormFooter kind="code" />, render: () => <Code /> };
const catalogScreen: FlowScreen = { id: 'catalog', headerHeight: 117, header: () => <CatalogHeader />, render: () => <Catalog /> };
export default function Prototype() {
  const [phone, setPhone] = useState<PhoneDraft>(DEFAULT_PHONE); const [code, setCode] = useState('');
  const [phoneError, setPhoneError] = useState(false); const [codeError, setCodeError] = useState(false);
  const [deadline, setDeadline] = useState(0); const [notice, setNotice] = useState<Notice>(null);
  useEffect(() => { document.title = 'Prana — Mobile sign in'; }, []);
  return <MotionConfig reducedMotion="user"><AuthContext.Provider value={{ phone, setPhone, code, setCode, phoneError, setPhoneError, codeError, setCodeError, deadline, setDeadline, notice, setNotice }}>
    <CatalogProvider><div className="prana-auth"><FlowStack initial={splashScreen} motionPreset={authStep} /></div></CatalogProvider>
  </AuthContext.Provider></MotionConfig>;
}
