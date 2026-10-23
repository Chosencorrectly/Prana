import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { KeyboardInput, MobileScroll } from './mobile';
import { callingCode, caretAfterDigits, choosePhoneCountry, PHONE_COUNTRIES, phoneCountry, phoneDetails, phoneDigits, readEditablePhone, readPhoneCode, readPhoneInput, type PhoneDraft } from './phone-model';
import './phone-input.css';

type Props = {
  value: PhoneDraft;
  onChange: (value: PhoneDraft) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  active: boolean;
  editableCallingCode?: boolean;
  invalid?: boolean;
  onInputError: (invalid: boolean) => void;
};
const flag = (country: string) => `/assets/phone/${country}.png`;

export function PhoneNumberField({ value, onChange, inputRef, active, invalid, onInputError, editableCallingCode = false }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const caret = useRef<number | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const codeCaret = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [unsupportedPaste, setUnsupported] = useState(false);
  const [edges, setEdges] = useState({ top: false, bottom: true });
  const open = expanded && active;
  const selected = phoneCountry(value);
  const formatted = phoneDetails(value).formatted;
  const prefix = value.prefix ?? callingCode(value.country);
  const unsupported = unsupportedPaste || (editableCallingCode && readPhoneCode(prefix, value).unsupported);
  const listId = `${id}-countries`;

  useLayoutEffect(() => {
    if (codeCaret.current !== null && codeInput.current) {
      const position = Math.min(prefix.length, codeCaret.current);
      codeInput.current.setSelectionRange(position, position);
      codeCaret.current = null;
    }
    if (caret.current !== null && inputRef.current) {
      const position = caretAfterDigits(formatted, caret.current);
      inputRef.current.setSelectionRange(position, position);
      caret.current = null;
    }
  });

  useEffect(() => {
    if (!active) setExpanded(false);
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener('pointerdown', dismiss, true);
    return () => document.removeEventListener('pointerdown', dismiss, true);
  }, [open]);

  useEffect(() => {
    const scroll = popup.current?.querySelector<HTMLElement>('.mobile-scroll');
    if (!scroll || !open) return;
    const update = () => setEdges({ top: scroll.scrollTop > 2, bottom: scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 2 });
    update();
    scroll.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    return () => { scroll.removeEventListener('scroll', update); observer.disconnect(); };
  }, [open]);

  function choose(index: number) {
    const next = choosePhoneCountry(value, PHONE_COUNTRIES[index].id);
    caret.current = next.digits.length;
    onChange(next);
    onInputError(false);
    setUnsupported(false);
    setExpanded(false);
    inputRef.current?.focus({ preventScroll: true });
  }
  function show() {
    setHighlight(-1);
    setExpanded(true);
  }
  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); setExpanded(false); return;
    }
    if (event.key === 'Tab') { setExpanded(false); return; }
    if (event.key === 'Enter') {
      event.preventDefault(); event.stopPropagation();
      if (highlight >= 0 || selected) choose(highlight >= 0 ? highlight : PHONE_COUNTRIES.findIndex(item => item.id === selected?.id));
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? PHONE_COUNTRIES.length - 1
      : Math.max(0, Math.min(PHONE_COUNTRIES.length - 1, highlight + (event.key === 'ArrowUp' ? -1 : 1)));
    setHighlight(next);
    const scroll = popup.current?.querySelector<HTMLElement>('.mobile-scroll');
    // Move only the inner viewport; scrollIntoView would also displace the auth form.
    if (scroll) {
      const top = next * 56;
      if (top < scroll.scrollTop + 16) scroll.scrollTop = Math.max(0, top - 16);
      else if (top + 56 > scroll.scrollTop + scroll.clientHeight - 24) scroll.scrollTop = top + 56 - scroll.clientHeight + 24;
    }
  }
  function accept(raw: string, charactersBeforeCaret: number) {
    setExpanded(false);
    if (editableCallingCode) {
      const international = /^\s*\+/.test(raw);
      const next = international ? readEditablePhone(raw, value.country).draft : { ...value, digits: phoneDigits(raw) };
      setUnsupported(false);
      caret.current = international ? next.digits.length : charactersBeforeCaret;
      onChange(next);
      onInputError(false);
      return;
    }
    const result = readPhoneInput(raw, value.country);
    setUnsupported(result.unsupported);
    if (result.unsupported) { onInputError(true); return; }
    caret.current = /^\s*\+/.test(raw) ? result.draft.digits.length : charactersBeforeCaret;
    onChange(result.draft);
  }

  const countryLabel = selected ? `Country: ${selected.name}, ${callingCode(selected.id)}` : 'Choose country';
  const countryFlag = selected ? <img className="phone-flag" src={flag(selected.id)} alt="" draggable={false} /> : <span className="phone-flag phone-flag-unknown" aria-hidden="true">—</span>;
  const toggle = () => open ? setExpanded(false) : show();
  const triggerKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show(); }
  };

  const input = <KeyboardInput ref={inputRef} className="phone-input" aria-label="Phone number" type="tel" inputMode="tel" autoComplete="tel-national"
        placeholder={selected?.placeholder ?? 'Phone number'} value={formatted} aria-invalid={invalid || unsupported || undefined}
        aria-describedby={unsupported ? `${id}-error` : invalid ? 'phone-error' : undefined}
        onPointerDown={() => setExpanded(false)}
        onChange={event => accept(event.target.value, phoneDigits(event.target.value.slice(0, event.target.selectionStart ?? 0)).length)}
        onPaste={event => {
          const pasted = event.clipboardData.getData('text');
          if (/^\s*\+/.test(pasted)) { event.preventDefault(); accept(pasted, 0); }
        }}
        onKeyDown={event => {
          if (event.key !== 'Backspace' && event.key !== 'Delete') return;
          const start = event.currentTarget.selectionStart ?? 0;
          if (start !== event.currentTarget.selectionEnd) return;
          if (event.ctrlKey || event.metaKey || event.altKey) return;
          const before = phoneDigits(formatted.slice(0, start)).length;
          const index = event.key === 'Backspace' ? before - 1 : before;
          if (index < 0 || index >= value.digits.length) return;
          event.preventDefault();
          setExpanded(false);
          caret.current = Math.max(0, index);
          setUnsupported(false);
          onChange({ ...value, digits: value.digits.slice(0, index) + value.digits.slice(index + 1) });
        }} />;

  return <div ref={root} className="phone-number-field" data-open={open} data-editable-code={editableCallingCode} onKeyDownCapture={handleKeys}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}>
    <div className="phone-number-control" data-invalid={invalid || unsupported}>
      {editableCallingCode ? <div className="phone-country-fields">
        <button className="phone-flag-trigger" type="button" aria-label="Choose country" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
          onPointerDown={event => event.preventDefault()} onClick={toggle} onKeyDown={triggerKeys}>{countryFlag}</button>
        <KeyboardInput ref={codeInput} className="phone-code-input" aria-label="Country calling code" type="tel" inputMode="tel" autoComplete="tel-country-code"
          value={prefix} placeholder="+" style={{ width: `calc(${Math.max(2, Math.min(5, prefix.length))}ch + 2px)` }}
          aria-invalid={unsupported || undefined} aria-describedby={unsupported ? `${id}-error` : undefined}
          onPointerDown={() => setExpanded(false)}
          onChange={event => {
            codeCaret.current = event.target.value.slice(0, event.target.selectionStart ?? 0).replace(/[^+\d]/g, '').length;
            onChange(readPhoneCode(event.target.value, value).draft);
            onInputError(false); setUnsupported(false); setExpanded(false);
          }}
          onPaste={event => {
            const pasted = event.clipboardData.getData('text');
            if (/^\s*\+/.test(pasted) && readEditablePhone(pasted, value.country).draft.digits) {
              event.preventDefault(); accept(pasted, 0); inputRef.current?.focus({ preventScroll: true });
            }
          }} />
        <button className="phone-chevron-trigger" type="button" role="combobox" aria-label={countryLabel}
          aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-activedescendant={open && highlight >= 0 ? `${id}-${PHONE_COUNTRIES[highlight].id}` : undefined}
          onPointerDown={event => event.preventDefault()} onClick={toggle} onKeyDown={triggerKeys}>
          <img className="phone-country-chevron" src="/assets/phone/chevron-down.svg" alt="" />
        </button>
      </div> : <button className="phone-country-trigger" type="button" role="combobox" aria-label={countryLabel}
        aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-activedescendant={open && highlight >= 0 ? `${id}-${PHONE_COUNTRIES[highlight].id}` : undefined}
        onPointerDown={event => event.preventDefault()} onClick={toggle} onKeyDown={triggerKeys}>
        {countryFlag}{selected && <span>{callingCode(selected.id)}</span>}<img className="phone-country-chevron" src="/assets/phone/chevron-down.svg" alt="" />
      </button>}
      {input}
    </div>
    {/* Block only drag initiation in the outer scroll. Move/up/cancel must reach
        PhoneFrame so its preview cursor keeps following and releases normally. */}
    <div ref={popup} className="phone-country-popup" data-open={open} inert={!open} aria-hidden={!open}
      onPointerDown={event => event.stopPropagation()}>
      <MobileScroll className="phone-country-scroll">
        <div id={listId} role="listbox" aria-label="Country calling code">
          {PHONE_COUNTRIES.map((country, index) => <button key={country.id} id={`${id}-${country.id}`} type="button" role="option"
            aria-selected={country.id === selected?.id} tabIndex={-1} className="phone-country-option" data-highlighted={highlight === index}
            onPointerDown={event => event.preventDefault()} onClick={() => choose(index)}>
            <img className="phone-flag" src={flag(country.id)} alt="" draggable={false} /><span className="phone-country-code">{callingCode(country.id)}</span><span className="phone-country-name">{country.name}</span>
            {index < PHONE_COUNTRIES.length - 1 && <img className="phone-country-divider" src="/assets/phone/divider.svg" alt="" />}
          </button>)}
        </div>
      </MobileScroll>
      <img className="phone-country-fade phone-country-fade-top" data-visible={edges.top} src="/assets/phone/fade-top.png" alt="" />
      <img className="phone-country-fade phone-country-fade-bottom" data-visible={edges.bottom} src="/assets/phone/fade-bottom.png" alt="" />
    </div>
    {(unsupported || invalid) && <p className="auth-error phone-format-error" id={unsupported ? `${id}-error` : 'phone-error'} role="alert">{unsupported ? 'This country is not in the demo list yet.' : 'Enter a complete phone number'}</p>}
  </div>;
}
