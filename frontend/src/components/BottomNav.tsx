import type { TabId } from '../types'

const tabs: { id: TabId; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'tasks',
    label: 'Задачи',
    icon: (a) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'rgba(238,238,245,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'habits',
    label: 'Привычки',
    icon: (a) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={a ? '#fff' : 'rgba(238,238,245,0.4)'}>
        <path d="M12 2c-1 2.5-2 4-2 6 0 .4 0 .8.1 1.1C8.5 7.8 7.5 6 8 4.5 6 6.5 5 9 5 11a7 7 0 0 0 14 0c0-4-2.5-7.5-7-9z"/>
      </svg>
    ),
  },
  {
    id: 'sleep',
    label: 'Сон',
    icon: (a) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={a ? '#fff' : 'rgba(238,238,245,0.4)'}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Статы',
    icon: (a) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'rgba(238,238,245,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: (a) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'rgba(238,238,245,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

interface Props { active: TabId; onChange: (t: TabId) => void }

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        {tabs.map((t) => (
          <div key={t.id} className={`nav-item${active === t.id ? ' active' : ''}`} onClick={() => onChange(t.id)}>
            <div className="nav-icon">{t.icon(active === t.id)}</div>
            <span className="nav-label">{t.label}</span>
          </div>
        ))}
      </div>
    </nav>
  )
}
