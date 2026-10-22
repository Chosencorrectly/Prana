import { useState } from 'react';
import { createPortal } from 'react-dom';
import { profileScenarios, type ProfileScenario } from './profile-model';

export function ProfilePreview({ onOpen }: { onOpen: (scenario: ProfileScenario, trigger: HTMLButtonElement) => void }) {
  const [expanded, setExpanded] = useState(false);
  return createPortal(<aside className="profile-preview" aria-label="Демосценарии профиля"><button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>Состояния профиля <span>{expanded ? '−' : '+'}</span></button>
    {expanded && <div className="profile-preview-options"><p>Отдельный демоаккаунт. Изменения в этих сценариях не затрагивают ваш профиль, адреса и корзину. SMS: 1111. Тестовая карта: 4242 4242 4242 4242.</p>{profileScenarios.map(([id, title]) => <button type="button" key={id} onClick={event => onOpen(id, event.currentTarget)}>{title}</button>)}</div>}
  </aside>, document.body);
}
