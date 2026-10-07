import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "./Icon.jsx";
import { motion as timings } from "../motion/tokens.js";

export function PromoCodeField({ promo }) {
  const composing = useRef(false);
  const reduced = useReducedMotion();
  const { value, status, setValue } = promo;
  const message = status === "applied" ? "Applied: -10%" : status === "invalid" ? "Promo code not found" : status === "validating" ? "Checking promo code" : "";
  return <div className="cart-promo" data-status={status}>
    <Icon name="cart-promo" />
    <input aria-label="Promo code" placeholder="Promo code" value={value} autoComplete="off" spellCheck={false}
      aria-invalid={status === "invalid"} aria-describedby="promo-status" aria-busy={status === "validating"}
      onChange={(event) => setValue(event.target.value, { composing: composing.current })}
      onCompositionStart={() => { composing.current = true; setValue(value, { composing: true }); }}
      onCompositionEnd={(event) => { composing.current = false; setValue(event.currentTarget.value); }} />
    <span className="promo-feedback" aria-hidden="true">
      <AnimatePresence initial={false}>
        {message && <motion.span key={status} className={`promo-feedback-state promo-${status}`}
          initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : timings.quantityChange}>
          {status === "validating" ? <img className="promo-loader" src="/assets/promo-loader.svg" width="24" height="24" alt="" /> : message}
        </motion.span>}
      </AnimatePresence>
      <span className="promo-feedback-sizer">{status === "validating" ? <span className="promo-loader-space" /> : message}</span>
    </span>
    <span id="promo-status" className="sr-only" role="status" aria-live="polite">{message}</span>
  </div>;
}
