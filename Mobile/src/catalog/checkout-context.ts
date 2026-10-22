import { createContext, useContext, type Context, type RefObject } from 'react';
import type { FlowControls } from '../mobile';
import type { PromoCode } from './usePromoCode';
import type { CheckoutPhone } from './useCheckoutPhone';
import type { OrderOptions } from './order-model';
export type CheckoutState = { active: boolean; count: number; cents: number; quantities: Record<string, number>; onQuantityChange: (id: string, delta: number) => void; promo: PromoCode; accountPhone: CheckoutPhone; initialTracking: boolean; onOrdered: () => void; options: OrderOptions; setOptions: (options: OrderOptions) => void; host: HTMLDivElement | null; onActive: (active: boolean, step?: string) => void; onClose: () => void; controls: RefObject<FlowControls | null> };
export const CheckoutContext: Context<CheckoutState | null> = import.meta.hot?.data.checkoutContext ?? createContext<CheckoutState | null>(null);
if (import.meta.hot) import.meta.hot.data.checkoutContext = CheckoutContext;
export const useCheckout = () => useContext(CheckoutContext)!;
