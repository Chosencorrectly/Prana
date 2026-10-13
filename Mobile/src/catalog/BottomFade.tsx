import './bottom-fade.css';

// The same progressive blur used by the catalogue dock. Keep its ancestors opaque.
export function BottomFade({ className = '' }: { className?: string }) {
  return <div className={`prana-bottom-fade ${className}`} aria-hidden="true">
    <span className="prana-fade-soft" /><span className="prana-fade-medium" /><span className="prana-fade-deep" /><span className="prana-fade-shade" />
  </div>;
}
