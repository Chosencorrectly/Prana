import { useEffect, useRef, useState } from "react";
import { createPromoController, emptyPromo } from "./promo.js";

export function usePromoCode() {
  const [state, setState] = useState(emptyPromo);
  const controller = useRef(null);
  useEffect(() => {
    const current = createPromoController(setState);
    controller.current = current;
    return () => { current.dispose(); controller.current = null; };
  }, []);
  return {
    ...state,
    setValue: (value, options) => controller.current?.setValue(value, options),
    clear: () => controller.current?.clear(),
  };
}
