import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motion as timings } from "../motion/tokens.js";

export function ClearCartDialog({ onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const decision = useRef(null);
  const completed = useRef(false);
  const [closing, setClosing] = useState(false);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    // Native modal semantics provide a focus trap and make the background inert.
    dialog.showModal();
    root.style.overflow = "hidden";
    cancelRef.current.focus({ preventScroll: true });
    return () => {
      dialog.close();
      root.style.overflow = overflow;
    };
  }, []);

  function close(action) {
    if (decision.current) return;
    decision.current = action;
    setClosing(true);
  }

  return <motion.dialog ref={dialogRef} className="cart-confirmation" data-closing={closing}
    aria-labelledby="cart-confirmation-title" aria-describedby="cart-confirmation-description"
    initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 4 }}
    animate={{ opacity: closing ? 0 : 1, y: !reduced && closing ? 4 : 0 }}
    transition={reduced ? { duration: 0 } : timings[closing ? "dialogExit" : "dialogEnter"]}
    onAnimationComplete={() => {
      if (!decision.current || completed.current) return;
      completed.current = true;
      dialogRef.current.close();
      if (decision.current === "confirm") onConfirm();
      else onCancel();
    }}
    onCancel={(event) => { event.preventDefault(); close("cancel"); }}
    onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const buttons = [...event.currentTarget.querySelectorAll("button:not(:disabled)")];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (closing || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus({ preventScroll: true });
      }
    }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close("cancel");
    }}>
    <h2 id="cart-confirmation-title">Clear your cart?</h2>
    <p id="cart-confirmation-description">All items will be removed.</p>
    <div className="cart-confirmation-actions">
      <button ref={cancelRef} type="button" className="cart-button cart-button-secondary" disabled={closing} onClick={() => close("cancel")}>Cancel</button>
      <button type="button" className="cart-button cart-button-primary" disabled={closing} onClick={() => close("confirm")}>Clear cart</button>
    </div>
  </motion.dialog>;
}
