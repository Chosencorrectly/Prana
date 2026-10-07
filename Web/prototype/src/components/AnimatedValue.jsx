import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motion as timings } from "../motion/tokens.js";

// Current text determines width; outgoing copies never affect layout or announcements.
export function AnimatedValue({ value, children = value }) {
  const reduced = useReducedMotion();
  return <span className="animated-value">
    <span className="animated-value-sizer" aria-hidden="true">{children}</span>
    <span className="sr-only">{children}</span>
    <AnimatePresence initial={false}>
      <motion.span key={value} className="animated-value-layer" aria-hidden="true"
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -4 }}
        transition={reduced ? { duration: 0 } : timings.quantityChange}>{children}</motion.span>
    </AnimatePresence>
  </span>;
}
