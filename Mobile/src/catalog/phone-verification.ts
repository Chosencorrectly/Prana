import { normalizeCode, normalizePhone, validPhone, verifyCode } from '../auth-model.ts';

// Demo interval uses the 43-second countdown shown in checkout Figma, not an API policy.
export const CHECKOUT_RESEND_SECONDS = 43;
export type PhoneVerification = { phone: string; code: string; sentPhone: string | null; deadline: number; error: boolean; confirmedPhone: string | null };
export const initialPhoneVerification: PhoneVerification = { phone: '+1', code: '', sentPhone: null, deadline: 0, error: false, confirmedPhone: null };
export type PhoneAction = { type: 'phone' | 'code'; value: string } | { type: 'send' | 'resend'; now: number } | { type: 'confirm' } | { type: 'profile-confirmed'; phone: string };
export const canConfirmPhone = (state: PhoneVerification) => validPhone(state.phone) && state.phone === state.sentPhone && verifyCode(state.code);
export function phoneVerificationReducer(state: PhoneVerification, action: PhoneAction): PhoneVerification {
  if (action.type === 'profile-confirmed') return action.phone ? { ...initialPhoneVerification, phone: action.phone, confirmedPhone: action.phone } : initialPhoneVerification;
  if (action.type === 'phone') {
    const phone = normalizePhone(action.value);
    return phone === state.phone ? state : { ...state, phone, code: '', sentPhone: null, deadline: 0, error: false };
  }
  if (action.type === 'code') return { ...state, code: normalizeCode(action.value), error: false };
  if (action.type === 'send' || action.type === 'resend') {
    if (!validPhone(state.phone)) return state;
    // Returning to the same number must not bypass the resend cooldown.
    if (state.sentPhone === state.phone && action.now < state.deadline) return state;
    return { ...state, sentPhone: state.phone, code: '', error: false, deadline: action.now + CHECKOUT_RESEND_SECONDS * 1000 };
  }
  if (state.code.length !== 4) return state;
  return canConfirmPhone(state) ? { ...state, confirmedPhone: state.phone, error: false } : { ...state, error: true };
}
