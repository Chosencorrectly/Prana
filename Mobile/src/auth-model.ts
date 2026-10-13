// Local prototype: no messages, account creation or authentication API.
export const DEMO_SMS_CODE = '1111';
export const RESEND_SECONDS = 12;
export const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  return digits || value.includes('+') ? `+${digits}` : '';
};
export const validPhone = (value: string) => /^\+[1-9]\d{6,14}$/.test(value);
export const normalizeCode = (value: string) => value.replace(/\D/g, '').slice(0, 4);
export const verifyCode = (value: string) => value === DEMO_SMS_CODE;
export const resendRemaining = (deadline: number, now: number) => Math.max(0, Math.ceil((deadline - now) / 1000));
