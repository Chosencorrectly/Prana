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
export type PhoneDraft = { country: PhoneCountry; digits: string };
export const DEFAULT_PHONE: PhoneDraft = { country: 'US', digits: '' };
export const phoneDigits = (value: string) => value.replace(/\D/g, '');
export const callingCode = (country: PhoneCountry) => `+${getCountryCallingCode(country)}`;

export function phoneDetails(draft: PhoneDraft) {
  // The +1 prefix is already a separate control. Treat every typed digit as
  // national input; a leading 1 must not become a trunk/country prefix.
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
