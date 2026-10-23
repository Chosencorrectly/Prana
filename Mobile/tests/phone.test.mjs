import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PHONE, DEFAULT_LOGIN_PHONE, PHONE_COUNTRIES, callingCode, phoneDetails, readPhoneInput, caretAfterDigits, readEditablePhone, readPhoneCode, phoneCountry, choosePhoneCountry } from '../src/phone-model.ts';

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

test('editing the separate code changes country without changing any national digits', () => {
  const initial = { ...DEFAULT_LOGIN_PHONE, digits: '1111111111' };
  assert.equal(initial.prefix, '+1');
  assert.equal(phoneDetails(initial).formatted, '111 111 1111');
  for (const [prefix, country] of [['+62', 'ID'], ['+44', 'GB'], ['+971', 'AE'], ['33', 'FR']]) {
    const result = readPhoneCode(prefix, initial);
    assert.equal(result.draft.prefix, prefix);
    assert.equal(result.draft.digits, initial.digits);
    assert.equal(phoneCountry(result.draft)?.id, country);
    assert.equal(result.unsupported, false);
  }
});

test('erasing or partially typing the code preserves the independent number and disables SMS', () => {
  const initial = { ...DEFAULT_LOGIN_PHONE, digits: '1111111111' };
  for (const prefix of ['', '+', '+6', '+9', '+97']) {
    const result = readPhoneCode(prefix, initial);
    assert.equal(result.draft.prefix, prefix);
    assert.equal(result.draft.digits, initial.digits);
    assert.equal(phoneCountry(result.draft), undefined);
    assert.equal(phoneDetails(result.draft).possible, false);
    assert.equal(result.unsupported, false);
    assert.equal(phoneDetails(readPhoneCode('+1', result.draft).draft).possible, true);
  }
});

test('unsupported and oversized codes stay in the code field and never leak into the number', () => {
  const initial = { ...DEFAULT_LOGIN_PHONE, digits: '0123456789' };
  for (const prefix of ['+81', '+999', '+6112345', '+9711']) {
    const result = readPhoneCode(prefix, initial);
    assert.equal(result.draft.prefix, prefix);
    assert.equal(result.draft.digits, initial.digits);
    assert.equal(result.unsupported, true);
    assert.equal(phoneCountry(result.draft), undefined);
    assert.equal(phoneDetails(result.draft).possible, false);
  }
  assert.equal(readPhoneCode('+a44 ', initial).draft.prefix, '+44');
});

test('shared +1 defaults to US and respects explicitly selected Canada in the split fields', () => {
  const foreign = { country: 'GB', prefix: '+44', digits: '1111111111' };
  assert.equal(readPhoneCode('+1', foreign).draft.country, 'US');
  const canada = choosePhoneCountry(foreign, 'CA');
  const result = readPhoneCode('+1', readPhoneCode('', canada).draft).draft;
  assert.equal(result.country, 'CA');
  assert.equal(phoneDetails(result).international, '+11111111111');
  assert.equal(phoneDetails(result).possible, true);
  assert.deepEqual(choosePhoneCountry(DEFAULT_PHONE, 'CA'), { country: 'CA', digits: '' });
});

test('full international paste separates code and national digits including repeated ones', () => {
  for (const [text, prefix, country, digits] of [
    ['+1 (111) 111-1111', '+1', 'US', '1111111111'],
    ['+44 7700 900123', '+44', 'GB', '7700900123'],
    ['+62 812 3456 7890', '+62', 'ID', '81234567890'],
  ]) {
    const result = readEditablePhone(text, 'US');
    assert.deepEqual(result.draft, { prefix, country, digits });
    assert.equal(result.unsupported, false);
    assert.equal(phoneDetails(result.draft).possible, true);
  }
  const unsupported = readEditablePhone('+81 9012345678', 'US');
  assert.equal(unsupported.draft.prefix, '+81');
  assert.equal(unsupported.draft.digits, '9012345678');
  assert.equal(unsupported.unsupported, true);
});

test('country picker replaces a blank/unsupported code and preserves number overflow', () => {
  for (const prefix of ['', '+81', '+999123']) {
    const selected = choosePhoneCountry({ country: 'GB', prefix, digits: '1111111111123' }, 'US');
    assert.equal(selected.prefix, '+1');
    assert.equal(selected.digits, '1111111111123');
    assert.equal(phoneDetails(selected).formatted, '111 111 1111123');
    assert.equal(phoneDetails(selected).possible, false);
    assert.equal(phoneCountry(selected)?.id, 'US');
  }
});
