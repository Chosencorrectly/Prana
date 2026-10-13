import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizePhone, validPhone, normalizeCode, verifyCode, resendRemaining, RESEND_SECONDS } from '../src/auth-model.ts';
import { iphoneGeometry } from '../src/mobile/geometry.ts';

test('phone paste keeps international digits, country prefix and prototype length limit', () => {
  assert.equal(normalizePhone('+1 (202) 555-0100'), '+12025550100');
  assert.equal(normalizePhone(''), '');
  assert.equal(normalizePhone('abc'), '');
  assert.equal(normalizePhone('+'), '+');
  assert.equal(normalizePhone('12345678901234567890'), '+123456789012345');
});
test('phone must contain a plausible international number before requesting the demo code', () => {
  for (const value of ['', '+', '+12', '+012345678', '12025550100', '+1234567890123456']) assert.equal(validPhone(value), false, value);
  for (const value of ['+12025550100', '+628123456789', '+79991234567']) assert.equal(validPhone(value), true);
});
test('OTP accepts digit-only paste and never treats a partial or different code as success', () => {
  assert.equal(normalizeCode('1 1-1 1'), '1111');
  assert.equal(normalizeCode('a53b30xx'), '5330');
  assert.equal(normalizeCode('123456'), '1234');
  assert.equal(verifyCode('1111'), true);
  for (const value of ['', '1', '111', '11111', '5330', ' 1111']) assert.equal(verifyCode(value), false);
});
test('resend countdown follows elapsed time, including background-tab delays', () => {
  const sentAt = 100_000;
  const deadline = sentAt + RESEND_SECONDS * 1000;
  assert.equal(resendRemaining(deadline, sentAt), 12);
  assert.equal(resendRemaining(deadline, sentAt + 1500), 11);
  assert.equal(resendRemaining(deadline, sentAt + 11_999), 1);
  assert.equal(resendRemaining(deadline, sentAt + 12_000), 0);
  assert.equal(resendRemaining(deadline, sentAt + 60_000), 0);
});
test('requested iPhone viewport and keyboard match the 430×932 Figma layout', () => {
  assert.equal(iphoneGeometry.screen.width, 430);
  assert.equal(iphoneGeometry.screen.height, 932);
  assert.equal(iphoneGeometry.keyboard.height, 301);
  assert.equal(iphoneGeometry.screen.height - iphoneGeometry.keyboard.height, 631);
  assert.ok(Math.abs(iphoneGeometry.screen.x / iphoneGeometry.device.width - 59 / 511) < 0.000001);
  assert.ok(Math.abs(iphoneGeometry.screen.y / iphoneGeometry.device.height - 58 / 968) < 0.000001);
  const png = readFileSync(new URL('../public/assets/auth/keyboard.png', import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 430);
  assert.equal(png.readUInt32BE(20), 301);
});
