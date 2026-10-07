export function Icon({ name, className = "" }) {
  return <span className={`icon ${className}`} aria-hidden="true"><img src={`/assets/${name}.svg`} alt="" /></span>;
}
