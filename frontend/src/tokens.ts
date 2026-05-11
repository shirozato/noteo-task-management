export const C = {
  bg:       'var(--c-bg)',
  s1:       'var(--c-s1)',
  s2:       'var(--c-s2)',
  s3:       'var(--c-s3)',
  border:   'var(--c-border)',
  borderHi: 'var(--c-border-hi)',
  text:     'var(--c-text)',
  textSub:  'var(--c-text-sub)',
  textMute: 'var(--c-text-mute)',
  sheet:    'var(--c-sheet)',
  gold:     '#c49a5a',
  goldDim:  'rgba(196,154,90,0.15)',
}

export const HABIT_COLORS: Record<string, { bg: string; glow: string; dot: string; accent: string }> = {
  default: { bg: '#1a1a1c', glow: 'rgba(255,255,255,0.04)', dot: '#9a9a9a', accent: 'rgba(255,255,255,0.85)' },
  warm:    { bg: '#1f1814', glow: 'rgba(160,110,60,0.10)',  dot: '#a87a4a', accent: '#c49a5a' },
  olive:   { bg: '#161a12', glow: 'rgba(90,120,50,0.10)',   dot: '#7a9050', accent: '#9ab260' },
  forest:  { bg: '#10211c', glow: 'rgba(40,120,90,0.10)',   dot: '#4a9078', accent: '#5cb090' },
  teal:    { bg: '#0e2024', glow: 'rgba(40,110,130,0.10)',  dot: '#4a8a9c', accent: '#5ca8c0' },
  blue:    { bg: '#101828', glow: 'rgba(60,100,180,0.10)',  dot: '#5a82c0', accent: '#7099d8' },
  purple:  { bg: '#1a1424', glow: 'rgba(120,80,180,0.10)',  dot: '#8868b8', accent: '#a080d0' },
  rose:    { bg: '#241420', glow: 'rgba(180,80,120,0.10)',  dot: '#b06880', accent: '#c8809a' },
}

export const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
export const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
export const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
export const TAB_ORDER = ['tasks', 'habits', 'sleep', 'water', 'profile']

export const WATER_C = {
  primary: '#5fb8e8',
  primaryDeep: '#2d7fb0',
  glow: 'rgba(95,184,232,0.35)',
  bg: '#0e1d2a',
  bgGlow: 'rgba(95,184,232,0.06)',
}

export const NOW = () => Date.now()
export const DAY_MS = 86400000
export const ARCHIVE_TTL = 7 * DAY_MS

export const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const fmtDateDisplay = (s: string | null) => {
  if (!s) return 'Сегодня'
  const d = new Date(s + 'T00:00')
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const minToTime = (m: number) =>
  `${String(Math.floor((((m % 1440) + 1440) % 1440) / 60)).padStart(2, '0')}:${String((((m % 1440) + 1440) % 1440) % 60).padStart(2, '0')}`

export const timeToDeg = (t: string) => (toMin(t) / 1440) * 360

export const degToTime = (deg: number) => {
  const n = ((deg % 360) + 360) % 360
  return minToTime(Math.round((n / 360) * 1440 / 15) * 15)
}
