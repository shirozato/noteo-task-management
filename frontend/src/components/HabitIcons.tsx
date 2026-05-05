interface IconProps { color?: string; size?: number }

export const ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  run: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="14" cy="4" r="1.5"/>
      <path d="M10.5 8.5L9 22h2l1.5-7 1.5 1.5V22h2v-7.5L13 13l.5-3c1.5 1 3 1.5 4.5 1V9c-1.5 0-3-.5-4-2L13 6c-.4-.8-1.2-1.2-2-.8L7 7v3h2V8l1.5-.5z"/>
    </svg>
  ),
  weights: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <rect x="1" y="10" width="4" height="4" rx="1.5"/><rect x="5" y="8" width="2" height="8" rx="1"/>
      <rect x="7" y="10.5" width="10" height="3" rx="1"/><rect x="17" y="8" width="2" height="8" rx="1"/>
      <rect x="19" y="10" width="4" height="4" rx="1.5"/>
    </svg>
  ),
  meditation: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" fill={color}/><path d="M12 9v5M9 12l3-2 3 2M9 22c0-1.7 1.3-3 3-3s3 1.3 3 3"/>
    </svg>
  ),
  water: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.7L6.2 9.9A7 7 0 1 0 17.8 9.9L12 2.7z"/>
    </svg>
  ),
  book: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  moon: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  sun: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  heart: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  flame: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2c-1 2.5-2 4-2 6 0 .4 0 .8.1 1.1C8.5 7.8 7.5 6 8 4.5 6 6.5 5 9 5 11a7 7 0 0 0 14 0c0-4-2.5-7.5-7-9z"/>
    </svg>
  ),
  target: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill={color}/>
    </svg>
  ),
  leaf: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.29a2 2 0 0 0 1.71 3.09C9 22 17 22 19 15c1-3.5 1-7 1-7S20 4 12 4c0 0-1 0-2 .5"/>
      <path d="M3.5 19.5L8 14"/>
    </svg>
  ),
  star: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  bolt: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  music: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  coffee: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  ),
  pill: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5-7-7a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  ),
  dollar: ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
}

export function HabitIcon({ iconId, color = 'rgba(255,255,255,0.75)', size = 24 }: { iconId: string; color?: string; size?: number }) {
  const Icon = ICONS[iconId]
  if (!Icon) return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill={color} opacity=".5"/></svg>
  return <Icon color={color} size={size} />
}

export const ICON_IDS = Object.keys(ICONS)
export const ICON_LABELS: Record<string, string> = {
  run: 'Бег', weights: 'Зал', meditation: 'Медитация', water: 'Вода',
  book: 'Чтение', moon: 'Сон', sun: 'Утро', heart: 'Здоровье',
  flame: 'Огонь', target: 'Цель', leaf: 'Природа', star: 'Успех',
  bolt: 'Энергия', music: 'Музыка', coffee: 'Кофе', pill: 'Витамины',
  dollar: 'Финансы',
}
