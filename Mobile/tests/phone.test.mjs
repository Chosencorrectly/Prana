import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PHONE, PHONE_COUNTRIES, callingCode, phoneDetails, readPhoneInput, caretAfterDigits } from '../src/phone-model.ts';

test('US default and demonstration country codes, including Indonesia for Bali', () => {
  assert.deepEqual(DEFAULT_PHONE, { country: 'US', digits: '' });
  assert.equal(PHONE_COUNTRIES.length, 10);
  assert.equal(callingCode('US'), '+1');
  assert.equal(callingCode('CA'), '+1');
  assert.equal(callingCode('ID'), '+62');
});

test('empty, partial and oversized US numbers cannot request SMS; complete number can', () => {
  for (const digits of ['', '305', '305555012', '30555501231234567890']) {
    assert.equal(phoneDetails({ country: 'US', digits }).possible, false, digits);
  }
  assert.deepEqual(phoneDetails({ country: 'US', digits: '3055550123' }), {
    formatted: '305 555 0123', possible: true, international: '+13055550123',
  });
});

test('international paste strips one calling code and preserves Canada in the shared +1 group', () => {
  assert.deepEqual(readPhoneInput('+1 (416) 555-0123', 'CA'), { draft: { country: 'CA', digits: '4165550123' }, unsupported: false });
  assert.deepEqual(readPhoneInput('+62 812-3456-7890', 'US'), { draft: { country: 'ID', digits: '81234567890' }, unsupported: false });
  assert.equal(readPhoneInput('+81 90 1234 5678', 'US').unsupported, true);
});

test('+1 typing follows the placeholder mask at every group boundary regardless of prefix', () => {
  for (const country of ['US', 'CA']) {
    for (const [digits, formatted] of [
      ['', ''], ['30', '30'], ['305', '305 '], ['3055', '305 5'],
      ['30555', '305 55'], ['305555', '305 555 '], ['3055550', '305 555 0'],
      ['3055550123', '305 555 0123'], ['0001234567', '000 123 4567'],
      ['1234567890', '123 456 7890'],
    ]) assert.equal(phoneDetails({ country, digits }).formatted, formatted, `${country}: ${digits}`);
  }
});

test('mask preserves oversized paste and keeps the SMS action disabled', () => {
  const draft = readPhoneInput('+1 305 555 012345', 'US').draft;
  const details = phoneDetails(draft);
  assert.equal(details.formatted, '305 555 012345');
  assert.equal(details.possible, false);
});

test('national typing never guesses a country code; other countries still normalize trunk prefixes', () => {
  assert.equal(phoneDetails({ country: 'ID', digits: '081234567890' }).international, '+6281234567890');
  assert.equal(phoneDetails({ country: 'GB', digits: '07700900123' }).international, '+447700900123');
  assert.deepEqual(readPhoneInput('305 abc 555-0123', 'US').draft, { country: 'US', digits: '3055550123' });
  assert.deepEqual(readPhoneInput('1 (305) 555-0123', 'US').draft, { country: 'US', digits: '13055550123' });
  assert.deepEqual(readPhoneInput('+1 (305) 555-0123', 'US').draft, { country: 'US', digits: '3055550123' });
});

test('every ten-digit US/Canada number enables the local SMS flow, including leading 0 and 1', () => {
  for (const country of ['US', 'CA']) {
    for (const digits of ['1111111111', '0000000000', '1234567890', '0123456789', '9999999999', '3055550123']) {
      const result = phoneDetails({ country, digits });
      assert.equal(result.possible, true, `${country}: ${digits}`);
      assert.equal(result.international, `+1${digits}`);
      assert.equal(result.formatted.replace(/\D/g, ''), digits);
    }
  }
});

test('sequential typing past ten digits never consumes the first digit or replaces earlier input', () => {
  for (const country of ['US', 'CA']) {
    for (const input of ['11111111111234567890', '123456789012345', '000000000012345']) {
      let draft = { country, digits: '' };
      for (let i = 0; i < input.length; i++) {
        const displayed = phoneDetails(draft).formatted;
        draft = readPhoneInput(displayed + input[i], country).draft;
        assert.equal(draft.digits, input.slice(0, i + 1), `${country}, after ${i + 1} digits`);
        assert.equal(phoneDetails(draft).possible, i + 1 === 10);
      }
    }
  }
});

test('explicit international paste preserves all national ones and leading zeros', () => {
  for (const country of ['US', 'CA']) {
    for (const digits of ['1111111111', '0123456789']) {
      const result = readPhoneInput(`+1 ${digits}`, country);
      assert.deepEqual(result, { draft: { country, digits }, unsupported: false });
      assert.equal(phoneDetails(result.draft).international, `+1${digits}`);
      assert.equal(phoneDetails(result.draft).possible, true);
    }
  }
});

test('changing country revalidates retained digits against its own numbering lengths', () => {
  const digits = '3055550123';
  assert.equal(phoneDetails({ country: 'US', digits }).possible, true);
  assert.equal(phoneDetails({ country: 'FR', digits }).possible, false);
  assert.equal(phoneDetails({ country: 'CA', digits }).possible, true);
});

test('caret follows digits rather than inserted formatting spaces', () => {
  assert.equal(caretAfterDigits('305 555 0123', 0), 0);
  assert.equal(caretAfterDigits('305 555 0123', 3), 4);
  assert.equal(caretAfterDigits('305 555 0123', 4), 5);
  assert.equal(caretAfterDigits('305 555 0123', 6), 8);
  assert.equal(caretAfterDigits('305 555 0123', 10), 12);
  assert.equal(caretAfterDigits('305 ', 3), 4);
  assert.equal(caretAfterDigits('305 555 ', 6), 8);
});
