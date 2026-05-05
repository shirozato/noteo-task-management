import { useState } from 'react'
import { useHabitStore } from '../store'
import { Sheet } from '../components/Sheet'
import { HabitIcon, ICON_IDS, ICON_LABELS } from '../components/HabitIcons'
import { habitsApi } from '../api'
import type { HabitColor } from '../types'

const COLORS: { id: HabitColor; label: string; hue: string }[] = [
  { id: 'warm',    label: 'Тёплый',   hue: '#f59e0b' },
  { id: 'blue',    label: 'Синий',    hue: '#3b82f6' },
  { id: 'teal',    label: 'Бирюза',   hue: '#14b8a6' },
  { id: 'purple',  label: 'Фиолет',   hue: '#8b5cf6' },
  { id: 'rose',    label: 'Роза',     hue: '#f43f5e' },
  { id: 'olive',   label: 'Лайм',     hue: '#84cc16' },
  { id: 'forest',  label: 'Зелёный',  hue: '#10b981' },
  { id: 'default', label: 'Серый',    hue: '#6b7280' },
]

const GRAD: Record<HabitColor, string> = {
  warm: 'linear-gradient(135deg,#f59e0b,#ef4444)',
  blue: 'linear-gradient(135deg,#3b82f6,#6366f1)',
  teal: 'linear-gradient(135deg,#14b8a6,#3b82f6)',
  purple: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  rose: 'linear-gradient(135deg,#f43f5e,#ec4899)',
  olive: 'linear-gradient(135deg,#84cc16,#14b8a6)',
  forest: 'linear-gradient(135deg,#10b981,#14b8a6)',
  default: 'linear-gradient(135deg,#6b7280,#4b5563)',
}

function isLoggedToday(logs: { logged_at: string }[]) {
  const today = new Date().toDateString()
  return logs.some((l) => new Date(l.logged_at).toDateString() === today)
}

function getWeekDots(logs: { logged_at: string }[], target: number) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i))
    return logs.some((l) => new Date(l.logged_at).toDateString() === d.toDateString())
  })
}

export function HabitsPage() {
  const { habits, logToday, add, remove, colors, setColor } = useHabitStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('flame')
  const [selectedColor, setSelectedColor] = useState<HabitColor>('purple')
  const [targetCount, setTargetCount] = useState(7)
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState('')
  const [burst, setBurst] = useState<string | null>(null)

  const showNotif = (msg: string) => {
    setNotif(msg); setTimeout(() => setNotif(''), 2500)
  }

  const handleLog = (uid: string, already: boolean) => {
    if (already) return
    setBurst(uid)
    setTimeout(() => setBurst(null), 600)
    logToday(uid)
    showNotif('🔥 Отличная работа! Серия продолжается!')
  }

  const handleSave = async () => {
    if (!titleVal.trim()) return
    setSaving(true)
    try {
      const h = await habitsApi.create({ title: titleVal.trim(), icon: selectedIcon, target_count: targetCount })
      add({ ...h, color: selectedColor })
      setColor(h.uid, selectedColor)
    } catch {
      const uid = crypto.randomUUID()
      add({ uid, title: titleVal.trim(), icon: selectedIcon, target_count: targetCount, current_streak: 0, best_streak: 0, logs: [], color: selectedColor })
      setColor(uid, selectedColor)
    } finally {
      setSaving(false); setSheetOpen(false)
      setTitleVal(''); setSelectedIcon('flame'); setSelectedColor('purple'); setTargetCount(7)
      showNotif('✨ Привычка добавлена!')
    }
  }

  const doneToday = habits.filter((h) => isLoggedToday(h.logs)).length

  return (
    <div className="page">
      {notif && <div className="notif">{notif}</div>}

      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
            {doneToday === habits.length && habits.length > 0 ? '🎉 Все выполнены!' : `Сегодня ${doneToday}/${habits.length}`}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Привычки</div>
        </div>
      </div>

      <div className="scroll">
        {habits.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🌱</div>
            <div className="empty-text">Нет привычек</div>
            <div className="empty-sub">Нажми + и начни строить свой день</div>
          </div>
        ) : (
          <div className="habit-grid">
            {habits.map((h, i) => {
              const color = (h.color ?? colors[h.uid] ?? 'default') as HabitColor
              const done = isLoggedToday(h.logs)
              const grad = GRAD[color]
              const dots = getWeekDots(h.logs, h.target_count)
              const isBursting = burst === h.uid

              return (
                <div
                  key={h.uid}
                  className={`habit-card${done ? ' done' : ''}${isBursting ? ' bursting' : ''}`}
                  data-hc={color}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animation: isBursting ? 'burst .5s cubic-bezier(.34,1.56,.64,1)' : undefined,
                  }}
                  onClick={() => handleLog(h.uid, done)}
                  onContextMenu={(e) => { e.preventDefault(); remove(h.uid) }}
                >
                  <div
                    className="hbg"
                    style={{ background: grad, borderRadius: 24 }}
                  />
                  <div className="habit-done-mark">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div
                    className="habit-icon-wrap"
                    style={{ background: done ? grad : `${grad.replace('linear-gradient(135deg,', '').split(',')[0]}22` }}
                  >
                    <HabitIcon iconId={h.icon} color={done ? '#fff' : `var(--hc, rgba(255,255,255,.7))`} size={22} />
                  </div>
                  <div className="habit-name">{h.title}</div>
                  <div className="habit-streak">
                    <span className="fire">🔥</span>
                    <span style={{ animation: isBursting ? 'streakPop .4s cubic-bezier(.34,1.56,.64,1)' : undefined }}>
                      {h.current_streak}
                    </span>
                  </div>
                  <div className="habit-dots" style={{ color: `var(--hc, rgba(255,255,255,.5))` }}>
                    {dots.map((on, j) => (
                      <div
                        key={j}
                        className={`hdot ${on ? 'on' : 'off'}`}
                        style={on ? { background: `var(--hc, rgba(255,255,255,.7))` } : {}}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ height: 16 }} />
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          Нажми на карточку, чтобы отметить выполнение<br />Удержи для удаления
        </div>
      </div>

      <button className="fab" style={{ bottom: 'calc(var(--nav-h) + 16px)' }} onClick={() => setSheetOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Новая привычка">
        <div className="input-wrap">
          <label className="input-label">Название</label>
          <input className="input-field" placeholder="Читать, Медитировать..." value={titleVal} onChange={(e) => setTitleVal(e.target.value)} autoFocus />
        </div>

        <div className="input-wrap">
          <label className="input-label">Иконка</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ICON_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedIcon(id)}
                title={ICON_LABELS[id] ?? id}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: selectedIcon === id ? 'var(--gp)' : 'var(--s2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s',
                  boxShadow: selectedIcon === id ? '0 4px 14px rgba(139,92,246,.4)' : 'none',
                }}
              >
                <HabitIcon iconId={id} color={selectedIcon === id ? '#fff' : 'var(--sub)'} size={20} />
              </button>
            ))}
          </div>
        </div>

        <div className="input-wrap">
          <label className="input-label">Цвет</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: c.hue,
                  boxShadow: selectedColor === c.id ? `0 0 0 3px rgba(255,255,255,.9), 0 0 0 5px ${c.hue}` : 'none',
                  transition: 'all .2s',
                }}
              />
            ))}
          </div>
        </div>

        <div className="input-wrap">
          <label className="input-label">Дней в неделю: {targetCount}</label>
          <input
            type="range" min="1" max="7" value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--purple)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            <span>1 день</span><span>7 дней</span>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave} disabled={saving || !titleVal.trim()}>
          {saving ? 'Сохранение...' : 'Добавить привычку'}
        </button>
      </Sheet>
    </div>
  )
}
