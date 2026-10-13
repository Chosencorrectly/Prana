import { createContext, useContext, useRef, useState, type PropsWithChildren, type RefObject } from 'react';
import { initialOrderPresentation, type ActiveOrder, type OrderPresentation } from './order-model';

type OrderState = { order: ActiveOrder | null; place: (order: ActiveOrder) => void; presentation: RefObject<OrderPresentation> };
const Context = createContext<OrderState | null>(null);
export const useActiveOrder = () => useContext(Context)!;
export function ActiveOrderProvider({ children }: PropsWithChildren) {
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const presentation = useRef(initialOrderPresentation());
  return <Context.Provider value={{ order, presentation, place: next => { presentation.current = initialOrderPresentation(); setOrder(next); } }}>{children}</Context.Provider>;
}
