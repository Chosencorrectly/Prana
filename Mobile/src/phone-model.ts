import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import type { CountryCode } from 'libphonenumber-js';

// Demonstration choices, pending the business country list. Keep the Figma rows first.
export const PHONE_COUNTRIES = [
  { id: 'CA', name: 'Canada', placeholder: '416 555 0123' },
  { id: 'US', name: 'United States', placeholder: '000 000 0000' },
  { id: 'AU', name: 'Australia', placeholder: '412 345 678' },
  { id: 'IN', name: 'India', placeholder: '98765 43210' },
  { id: 'ID', name: 'Indonesia (Bali)', placeholder: '812 3456 7890' },
  { id: 'GB', name: 'United Kingdom', placeholder: '7700 900123' },
  { id: 'DE', name: 'Germany', placeholder: '1512 3456789' },
  { id: 'FR', name: 'France', placeholder: '6 12 34 56 78' },
  { id: 'AE', name: 'UAE', placeholder: '50 123 4567' },
  { id: 'SG', name: 'Singapore', placeholder: '8123 4567' },
] as const satisfies readonly { id: CountryCode; name: string; placeholder: string }[];
export type PhoneCountry = typeof PHONE_COUNTRIES[number]['id'];
// Login edits the prefix independently; profile keeps its original national field.
export type PhoneDraft = { country: PhoneCountry; digits: string; prefix?: string };
export const DEFAULT_PHONE: PhoneDraft = { country: 'US', digits: '' };
export const DEFAULT_LOGIN_PHONE: PhoneDraft = { ...DEFAULT_PHONE, prefix: '+1' };
export const phoneDigits = (value: string) => value.replace(/\D/g, '');
export const callingCode = (country: PhoneCountry) => `+${getCountryCallingCode(country)}`;

export function phoneDetails(draft: PhoneDraft) {
  if (!phoneCountry(draft)) return { formatted: draft.digits, possible: false, international: '' };
  // National digits never include the prefix, even when both are editable.
  if (draft.country === 'US' || draft.country === 'CA') {
    return {
      formatted: draft.digits.replace(/^(\d{3})(\d{3})?/, (_, first: string, second?: string) => `${first} ${second ? `${second} ` : ''}`),
      possible: /^\d{10}$/.test(draft.digits),
      international: draft.digits ? `+1${draft.digits}` : '',
    };
  }
  const formatter = new AsYouType(draft.country);
  const formatted = formatter.input(draft.digits).replace(/[()-]/g, ' ').replace(/\s+/g, ' ').trim();
  return { formatted, possible: formatter.isPossible(), international: formatter.getNumber()?.number ?? '' };
}

export function phoneCountry(draft: PhoneDraft) {
  return PHONE_COUNTRIES.find(item => item.id === draft.country
    && (draft.prefix === undefined || phoneDigits(draft.prefix) === getCountryCallingCode(item.id)));
}

/** Editing the code never consumes or replaces digits in the national subfield. */
export function readPhoneCode(value: string, draft: PhoneDraft) {
  const digits = phoneDigits(value);
  const prefix = (/^\s*\+/.test(value) ? '+' : '') + digits;
  const candidates = PHONE_COUNTRIES.filter(item => getCountryCallingCode(item.id) === digits);
  const country = candidates.find(item => item.id === draft.country)
    ?? candidates.find(item => item.id === 'US') ?? candidates[0];
  const parser = new AsYouType();
  parser.input(`+${digits}`);
  return {
    draft: { ...draft, country: country?.id ?? draft.country, prefix } satisfies PhoneDraft,
    unsupported: !country && (!!parser.getCallingCode() || digits.length >= 3),
  };
}

/** Read every edit as international text; never discard digits or reject a draft. */
export function readEditablePhone(value: string, preferred: PhoneCountry) {
  const digits = phoneDigits(value);
  const plus = /^\s*\+/.test(value) ? '+' : '';
  const parser = new AsYouType();
  parser.input(`+${digits}`);
  const code = parser.getCallingCode();
  const candidates = PHONE_COUNTRIES.filter(item => getCountryCallingCode(item.id) === code);
  // +1 alone cannot distinguish US/CA. Keep an explicit choice, otherwise use US.
  const country = candidates.find(item => item.id === preferred)
    ?? candidates.find(item => item.id === 'US') ?? candidates[0];
  return {
    draft: { country: country?.id ?? preferred, prefix: plus + (code ?? digits), digits: code ? digits.slice(code.length) : '' } satisfies PhoneDraft,
    unsupported: !country && (!!code || digits.length >= 3),
  };
}

export function choosePhoneCountry(draft: PhoneDraft, country: PhoneCountry): PhoneDraft {
  return { ...draft, country, ...(draft.prefix === undefined ? {} : { prefix: callingCode(country) }) };
}

/** Keep national typing intact; split a country prefix only when '+' is explicit. */
export function readPhoneInput(value: string, country: PhoneCountry): { draft: PhoneDraft; unsupported: boolean } {
  const digits = phoneDigits(value);
  if (!/^\s*\+/.test(value)) {
    return { draft: { country, digits }, unsupported: false };
  }
  const parsed = parsePhoneNumberFromString(`+${digits}`);
  const candidates = PHONE_COUNTRIES.filter(item => digits.startsWith(getCountryCallingCode(item.id)));
  // US and Canada share +1: preserve an explicitly selected country in that group.
  const match = candidates.find(item => item.id === country)
    ?? candidates.find(item => item.id === parsed?.country)
    ?? candidates[0];
  if (!match) return { draft: { country, digits: '' }, unsupported: true };
  return { draft: { country: match.id, digits: digits.slice(getCountryCallingCode(match.id).length) }, unsupported: false };
}

export function caretAfterDigits(formatted: string, count: number) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === count) {
      let position = i + 1;
      while (formatted[position] === ' ') position++;
      return position;
    }
  }
  return formatted.length;
}
