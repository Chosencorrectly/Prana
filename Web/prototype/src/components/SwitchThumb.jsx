// Shared checkout geometry and Amber on state; profile adds the working off state.
export function SwitchThumb({ checked = true }) {
  return <span className="checkout-switch" data-checked={checked} aria-hidden="true"><span /></span>;
}
