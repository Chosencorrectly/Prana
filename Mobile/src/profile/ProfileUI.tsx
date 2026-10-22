import { useId, type ComponentProps, type PropsWithChildren, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { KeyboardInput, MobileScroll, useFlow, useKeyboardInsets, useMobileDevice } from '../mobile';
import { BottomFade } from '../catalog/BottomFade';
import { useProfileSession } from './profile-session';

export function ProfileIcon({ name, className = '' }: { name: string; className?: string }) { return <img className={`profile-icon ${className}`} src={`/assets/profile/${name}.svg`} alt="" draggable={false} />; }
export function ProfileBody({ children, className = '' }: PropsWithChildren<{ className?: string }>) { return <MobileScroll className="profile-scroll"><div className={`profile-content ${className}`}>{children}</div></MobileScroll>; }
export function ProfileHeading({ children, description }: PropsWithChildren<{ description?: string }>) { return <div className="profile-heading"><h1 tabIndex={-1}>{children}</h1>{description && <p>{description}</p>}</div>; }
export function ProfileRow({ title, description, onClick, icon, className = '', trailing }: { title: string; description?: string; onClick?: () => void; icon?: string; className?: string; trailing?: ReactNode }) {
  const content = <>{icon && <ProfileIcon name={icon} />}<span className="profile-row-copy"><span>{title}</span>{description && <small>{description}</small>}</span>{trailing ?? (onClick && <ProfileIcon name="chevron-small" />)}</>;
  return onClick ? <button type="button" className={`profile-row ${className}`} onClick={onClick}>{content}</button> : <div className={`profile-row ${className}`}>{content}</div>;
}
export function ProfileNotice({ title, children, success = false }: PropsWithChildren<{ title: string; success?: boolean }>) { return <div className={`profile-notice${success ? ' profile-notice-success' : ''}`} role={success ? 'status' : 'alert'}><strong>{title}</strong>{children && <p>{children}</p>}</div>; }
export function ProfileStateView({ icon = 'warning', title, children }: PropsWithChildren<{ icon?: string; title: string }>) { return <ProfileBody className="profile-state"><ProfileIcon name={icon} /><h1 tabIndex={-1}>{title}</h1><p>{children}</p></ProfileBody>; }
export function ProfileButton({ children, secondary = false, ...props }: ComponentProps<'button'> & { secondary?: boolean }) { return <button {...props} type={props.type ?? 'button'} className={`profile-primary${secondary ? ' profile-secondary' : ''}${props.className ? ` ${props.className}` : ''}`} onPointerDown={event => { event.preventDefault(); props.onPointerDown?.(event); }}>{children}</button>; }
// The dock lives outside StepScene opacity, so its 4/12/34px blur keeps sampling the page.
export function ProfileDock({ route, children }: PropsWithChildren<{ route: string }>) {
  const { host } = useProfileSession(), flow = useFlow(), { bottomInset, keyboardDragging } = useKeyboardInsets(), { device } = useMobileDevice();
  const reduced = !!useReducedMotion(), active = route === flow.current.id;
  if (!host) return null;
  return createPortal(<motion.div className="profile-dock" data-profile-dock={route} inert={!active} aria-hidden={!active || undefined} style={{ pointerEvents: active ? undefined : 'none' }} initial={false}
    animate={{ '--dock-fade-opacity': active ? 1 : 0, bottom: Math.max(0, bottomInset - (device.platform === 'android' && bottomInset === device.geometry.safeArea.bottom ? bottomInset : 0)) }} transition={{ duration: keyboardDragging ? 0 : reduced ? .08 : .26, ease: [.2, .8, .2, 1] }}>
    <BottomFade /><motion.div className="profile-dock-buttons" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? .08 : active ? .24 : .14 }}>{children}</motion.div>
  </motion.div>, host);
}
export function ProfileField({ label, error, ...props }: ComponentProps<typeof KeyboardInput> & { label: string; error?: string }) {
  const id = useId();
  return <label className="profile-field"><span>{label}</span><KeyboardInput {...props} aria-label={label} aria-invalid={!!error || undefined} aria-describedby={error ? id : undefined} />{error && <small id={id} role="alert">{error}</small>}</label>;
}
export function ProfileSwitch({ title, description, checked, onChange, disabled = false }: { title: string; description?: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return <button type="button" role="switch" aria-label={title} aria-checked={checked} disabled={disabled} className="profile-switch-row" onClick={onChange}><span><strong>{title}</strong>{description && <small>{description}</small>}</span><span className="profile-switch" data-checked={checked}><span /></span></button>;
}
