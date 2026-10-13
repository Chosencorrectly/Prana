import { useReducer } from 'react';
import { canConfirmPhone, initialPhoneVerification, phoneVerificationReducer } from './phone-verification';

export function useCheckoutPhone() {
  const [state, dispatch] = useReducer(phoneVerificationReducer, initialPhoneVerification);
  return { ...state, dispatch, confirm() { dispatch({ type: 'confirm' }); return canConfirmPhone(state); } };
}
export type CheckoutPhone = ReturnType<typeof useCheckoutPhone>;
