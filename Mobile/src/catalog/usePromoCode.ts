import { useCallback, useEffect, useRef, useState } from 'react';
import { createPromoController, emptyPromo } from './promo-model';

export function usePromoCode(hasItems: boolean) {
  const [state, setState] = useState(emptyPromo);
  const controller = useRef<ReturnType<typeof createPromoController> | null>(null);
  useEffect(() => {
    const current = createPromoController(setState); controller.current = current;
    return () => { current.dispose(); controller.current = null; };
  }, []);
  useEffect(() => { if (!hasItems) controller.current?.clear(); }, [hasItems]);
  const setValue = useCallback((value: string, options?: { composing?: boolean }) => controller.current?.setValue(value, options), []);
  return { ...state, setValue };
}
export type PromoCode = ReturnType<typeof usePromoCode>;
