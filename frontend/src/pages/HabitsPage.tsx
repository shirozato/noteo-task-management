import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { C, HABIT_COLORS, DAYS_SHORT, MONTHS_RU, NOW } from '../tokens'
import { GlassCard, SheetHandle, AddBtn } from '../components/ui'
import { HabitIcon, HABIT_ICON_DEFS } from '../components/HabitIcons'
import type { Habit } from '../types'

const VIBRANT_GLOW: Record<string, string> = {
  default: 'rgba(200,200,200,0.14)',
  warm:    'rgba(196,154,90,0.32)',
  olive:   'rgba(140,175,80,0.28)',
  forest:  'rgba(70,180,140,0.28)',
  teal:    'rgba(70,160,190,0.28)',
  blue:    'rgba(90,140,220,0.28)',
  purple:  'rgba(160,100,230,0.28)',
  rose:    'rgba(220,100,150,0.28)',
}

// ─── FLAME ICON ───────────────────────────────────────────────────────────────
function FlameIcon({ active = true, hot = false, size = 18 }: { active?: boolean; hot?: boolean; size?: number }) {
  return (
    <img
      src="/fire.gif"
      alt=""
      style={{
        width: size, height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        filter: active
          ? hot
            ? 'drop-shadow(0 0 5px rgba(255,140,0,0.9)) drop-shadow(0 0 2px rgba(255,200,0,0.7))'
            : 'drop-shadow(0 0 3px rgba(255,100,0,0.5))'
          : 'grayscale(1) brightness(0.45) opacity(0.55)',
        animation: active ? 'fireGlow 2s ease-in-out infinite' : 'none',
        transition: 'filter 0.4s ease',
      }}
    />
  )
}

function HabitCard({ habit, onToggle, onTap }: { habit: Habit; onToggle: () => void; onTap: () => void }) {
  const col = HABIT_COLORS[habit.color] || HABIT_COLORS.default
  const vGlow = VIBRANT_GLOW[habit.color] || VIBRANT_GLOW.default
  const done = habit.completedToday
  const days = habit.days.split('')
  const hot = habit.streak >= 3
  // Today's index in days[] — DAYS_SHORT = ['Вс','Пн',...,'Сб'] matches getDay() 0=Вс
  const todayDayIdx = new Date().getDay() // 0=Sun,1=Mon,...,6=Sat
  // Display order: Mon(1) Tue(2) Wed(3) Thu(4) Fri(5) Sat(6) Sun(0)
  const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
  const flameActive = done || habit.streak > 0
  const flameHot    = done && hot

  return (
    <div
      onClick={onTap}
      style={{
        position: 'relative',
        background: `linear-gradient(145deg, ${vGlow} 0%, var(--c-card-bg) 65%)`,
        border: `1px solid ${done ? C.borderHi : C.border}`,
        borderRadius: 26,
        padding: '20px 20px 16px',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        boxShadow: done
          ? `0 8px 36px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 2px 18px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transition: 'box-shadow 0.35s, border-color 0.35s, transform 0.2s',
      }}
      onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
      onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onPointerLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Colored ambient glow blob top-right */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: `radial-gradient(circle, ${vGlow} 0%, transparent 68%)`,
        opacity: done ? 1 : 0.65,
        transition: 'opacity 0.5s',
        pointerEvents: 'none',
      }} />


      {/* Top row: icon + toggle button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, position: 'relative' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 16,
          background: done ? `linear-gradient(135deg, ${vGlow}, var(--c-surf-lo))` : C.s1,
          border: `1px solid ${done ? C.borderHi : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: done ? `0 4px 22px ${vGlow}` : 'none',
          transition: 'box-shadow 0.4s, background 0.4s',
        }}>
          <HabitIcon iconId={habit.icon} color={done ? col.accent : C.textSub} size={26} />
        </div>

        <div
          onClick={e => { e.stopPropagation(); onToggle() }}
          style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: done ? col.accent : C.s1,
            border: `1.5px solid ${done ? col.accent : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: done ? `0 0 22px ${vGlow}, 0 4px 12px rgba(0,0,0,0.45)` : '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {done
            ? <svg width="14" height="11" viewBox="0 0 11 9" fill="none" style={{ animation: 'popIn 0.3s ease' }}>
                <path d="M1 4.5l3 3 6-7" stroke={col.bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            : <svg width="14" height="11" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5l3 3 6-7" stroke={C.textMute} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>}
        </div>
      </div>

      {/* Title + frequency */}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 3, lineHeight: 1.2 }}>{habit.title}</div>
        <div style={{ fontSize: 12, color: C.textSub, marginBottom: 18 }}>{habit.freq.toLowerCase()}</div>
      </div>

      {/* Bottom row: day bars + streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {DISPLAY_ORDER.map((dayIdx, i) => {
            const d = days[dayIdx]
            const isToday = dayIdx === todayDayIdx
            const bg = isToday && done
              ? `linear-gradient(90deg, ${col.accent}, ${col.dot}99)`
              : isToday && d === '1'
                ? 'var(--c-surf-max)'
                : d === '1'
                  ? 'var(--c-surf-hi)'
                  : 'var(--c-surf-lo)'
            return (
              <div key={i} style={{
                flex: 1, height: 5, borderRadius: 3,
                background: bg,
                transition: 'background 0.4s',
                boxShadow: isToday && done ? `0 0 6px ${vGlow}` : 'none',
              }} />
            )
          })}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          background: C.s1,
          borderRadius: 12, padding: '4px 10px 4px 8px',
          border: `1px solid ${C.border}`,
        }}>
          <FlameIcon active={flameActive} hot={flameHot} size={26} />
          <span style={{
            fontSize: 14, fontWeight: 800,
            color: hot ? (done ? col.accent : C.textSub) : C.textMute,
          }}>{habit.streak}</span>
        </div>
      </div>
    </div>
  )
}

function IconPickerSheet({ selected, onSelect, onClose }: { selected: string; onSelect: (id: string) => void; onClose: () => void }) {
  const [tempSel, setTempSel] = useState(selected)
  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 200, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 430,
        background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 201,
        animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
      }}>
        <SheetHandle />
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
            {HABIT_ICON_DEFS.map(def => {
              const isSel = tempSel === def.id
              return (
                <button key={def.id} onClick={() => setTempSel(def.id)} style={{
                  aspectRatio: '1', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: isSel ? C.s3 : C.s1,
                  outline: isSel ? `1.5px solid ${C.borderHi}` : '1.5px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }}>
                  <HabitIcon iconId={def.id} color="#ffffff" size={22} />
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ padding: '10px 18px', paddingBottom: 'max(env(safe-area-inset-bottom,0px),16px)', flexShrink: 0 }}>
          <button onClick={() => { onSelect(tempSel); onClose() }} style={{
            width: '100%', padding: '15px', borderRadius: 18, border: `1px solid ${C.border}`, cursor: 'pointer',
            background: C.s2, color: C.text, fontSize: 16, fontWeight: 600,
          }}>Выбрать</button>
        </div>
      </div>
    </>,
    document.body
  )
}

function AddHabitSheet({ onClose, onAdd, onSave, initialHabit }: {
  onClose: () => void
  onAdd: (h: Habit) => void
  onSave?: (h: Habit) => void
  initialHabit?: Habit
}) {
  const isEdit = !!initialHabit
  const [name, setName] = useState(initialHabit?.title || '')
  const [icon, setIcon] = useState(initialHabit?.icon || 'star')
  const [color, setColor] = useState(initialHabit?.color || 'default')
  const [days, setDays] = useState<number[]>(initialHabit ? initialHabit.days.split('').map(Number) : [0, 0, 0, 0, 0, 0, 0])
  const [reminder, setReminder] = useState(false)
  const [iconPicker, setIconPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 350) }, [])

  const submit = () => {
    if (!name.trim() || !days.some(d => d === 1)) return
    const freq = days.every(d => d === 1) ? 'Каждый день' : days.map((d, i) => d ? DAYS_SHORT[i] : null).filter(Boolean).join(', ')
    const data: Omit<Habit, 'id'> = { title: name, icon, color, freq, days: days.join(''), streak: initialHabit?.streak || 0, completedToday: initialHabit?.completedToday || false, size: 'm', wide: false, archivedAt: null }
    if (isEdit && onSave && initialHabit) onSave({ ...initialHabit, ...data })
    else onAdd({ id: Date.now(), ...data })
    onClose()
  }

  const canSubmit = name.trim() && days.some(d => d === 1)
  const col = HABIT_COLORS[color] || HABIT_COLORS.default

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 430,
        background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 101,
        animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        <SheetHandle />
        <div style={{ padding: '8px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text, fontSize: 22, lineHeight: '1', padding: '4px 8px 4px 0' }}>‹</button>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{isEdit ? 'Редактировать' : 'Новая привычка'}</div>
          </div>

          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10 }}>Название</div>
          <div style={{
            background: C.s1,
            border: `1px solid ${C.border}`,
            borderRadius: 18, padding: '14px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <button onClick={() => setIconPicker(true)} style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: color === 'default' ? C.s3 : col.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${VIBRANT_GLOW[color] || VIBRANT_GLOW.default}`,
              transition: 'all 0.2s',
            }}>
              <HabitIcon iconId={icon} color={color === 'default' ? col.accent : 'rgba(255,255,255,0.92)'} size={22} />
            </button>
            <input ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Читать книгу" style={{ fontSize: 16, color: C.text, flex: 1 }} />
          </div>

          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10 }}>Цвет</div>
          <div style={{ overflow: 'hidden', margin: '0 -4px', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '6px 4px', scrollbarWidth: 'none' }}>
              {Object.entries(HABIT_COLORS).map(([k, v]) => {
                const active = color === k
                return (
                  <button key={k} onClick={() => setColor(k)} style={{
                    flexShrink: 0, width: 56, height: 56, borderRadius: 18, cursor: 'pointer',
                    background: k === 'default' ? C.s3 : v.accent,
                    border: active ? `2.5px solid ${C.text}` : `2.5px solid transparent`,
                    boxShadow: active ? `0 4px 20px ${VIBRANT_GLOW[k] || VIBRANT_GLOW.default}` : 'none',
                    opacity: active ? 1 : 0.38,
                    filter: active ? 'none' : 'saturate(0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {active && <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6l4 4 8-8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10 }}>Повторение</div>
          <div style={{
            background: C.s1,
            border: `1px solid ${C.border}`,
            borderRadius: 20, marginBottom: 24, padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span style={{ fontSize: 15, color: C.text, flex: 1 }}>Выбор дней</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {DAYS_SHORT.map((d, i) => (
                <button key={i} onClick={() => setDays(ds => ds.map((v, j) => j === i ? (v ? 0 : 1) : v))} style={{
                  flex: 1, aspectRatio: '1', borderRadius: '50%', cursor: 'pointer', fontSize: 12, fontWeight: 600, border: 'none',
                  background: days[i] ? C.s3 : C.s1,
                  color: days[i] ? C.text : C.textMute,
                  transition: 'all 0.2s',
                }}>{d}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '2px 2px' }}>
            <div style={{ fontSize: 15, color: C.text }}>Напоминание</div>
            <div onClick={() => setReminder(v => !v)} style={{
              width: 48, height: 28, borderRadius: 14, cursor: 'pointer', transition: 'background 0.3s',
              background: reminder ? '#c49a5a' : C.s3, position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: reminder ? 23 : 3, width: 22, height: 22,
                borderRadius: '50%', background: 'white',
                transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

          <button onClick={submit} disabled={!canSubmit} style={{
            width: '100%', padding: '16px', borderRadius: 18, cursor: canSubmit ? 'pointer' : 'default',
            background: canSubmit
              ? `linear-gradient(135deg, #c49a5a, #a07040)`
              : C.s2,
            border: canSubmit ? 'none' : `1px solid ${C.border}`,
            color: canSubmit ? '#fff' : C.textMute, fontSize: 16, fontWeight: 700,
            boxShadow: canSubmit ? '0 6px 24px rgba(196,154,90,0.30)' : 'none',
            transition: 'all 0.3s',
          }}>{isEdit ? 'Сохранить' : 'Создать привычку'}</button>
        </div>
      </div>
      {iconPicker && <IconPickerSheet selected={icon} onSelect={setIcon} onClose={() => setIconPicker(false)} />}
    </>,
    document.body
  )
}

function HabitInfoSheet({ habit, onClose, onEdit, onArchive, onDelete, onToggle }: {
  habit: Habit
  onClose: () => void
  onEdit: (h: Habit) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
  onToggle: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const col = HABIT_COLORS[habit.color] || HABIT_COLORS.default
  const vGlow = VIBRANT_GLOW[habit.color] || VIBRANT_GLOW.default
  const done = habit.completedToday
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yr = today.getFullYear(), mo = today.getMonth()
  const firstDay = new Date(yr, mo, 1).getDay()
  const dim = new Date(yr, mo + 1, 0).getDate()
  const todayN = today.getDate()
  const days7 = habit.days.split('')
  const isScheduled = (d: Date) => days7[d.getDay()] === '1'
  const isCompleted = (n: number) => {
    const d = new Date(yr, mo, n); if (d > today) return false
    if (n === todayN) return done
    return Math.floor((today.getTime() - d.getTime()) / 86400000) < habit.streak && isScheduled(d)
  }
  const menuItems = [
    { label: 'Редактировать', icon: 'edit',    action: () => { setMenuOpen(false); onEdit(habit) } },
    { label: 'Архивировать',  icon: 'archive', action: () => { setMenuOpen(false); onArchive(habit.id) } },
    { label: 'Удалить',       icon: 'trash',   action: () => { setMenuOpen(false); onDelete(habit.id) }, red: true },
  ]

  const streakLabel = (n: number) => n === 1 ? 'день' : n < 5 && n > 0 ? 'дня' : 'дней'

  return createPortal(
    <>
      <div onClick={() => { setMenuOpen(false); onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto',
        width: '100%', maxWidth: 430, background: 'var(--c-sheet)',
        borderTop: `1px solid ${C.borderHi}`, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        zIndex: 101, animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <SheetHandle />
        <div style={{ padding: '4px 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(v => !v)} style={{
                width: 36, height: 36, borderRadius: '50%', background: C.s2, border: `1px solid ${C.borderHi}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 3,
              }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: C.textSub }} />)}
              </button>
              {menuOpen && (
                <div onClick={e => e.stopPropagation()} style={{
                  position: 'absolute', top: 44, left: 0, minWidth: 190,
                  background: 'var(--c-sheet-alt)', border: `1px solid ${C.borderHi}`, borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 20, overflow: 'hidden',
                }}>
                  {menuItems.map((item, i) => (
                    <div key={i} onClick={item.action} style={{
                      padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                      color: item.red ? '#ef6060' : C.text, fontSize: 14, fontWeight: 500,
                    }}>
                      {item.icon === 'edit' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>}
                      {item.icon === 'archive' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>}
                      {item.icon === 'trash' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef6060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { onToggle(); onClose() }} style={{
              width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
              background: C.s2, border: `1px solid ${C.borderHi}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14l-4-4 4-4" /><path d="M5 10h9a6 6 0 0 1 6 6v2" />
              </svg>
            </button>
          </div>

          {/* Header: icon + title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 26, margin: '0 auto 14px',
              background: `linear-gradient(135deg, ${vGlow}, var(--c-s2))`,
              border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${vGlow}`,
            }}>
              <HabitIcon iconId={habit.icon} color={col.accent} size={40} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>{habit.title}</div>
            <div style={{ fontSize: 14, color: C.textSub }}>{habit.freq}</div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <div style={{
              flex: 1,
              background: habit.streak >= 3
                ? `linear-gradient(135deg, ${vGlow}, var(--c-s1))`
                : C.s1,
              borderRadius: 18, padding: '14px 16px',
              border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: habit.streak >= 3 ? `0 4px 20px ${vGlow}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: habit.streak >= 3 ? col.accent : C.text }}>{habit.streak} {streakLabel(habit.streak)}</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Подряд</div>
              </div>
              <FlameIcon active={habit.streak > 0} hot={habit.streak >= 5} size={20} />
            </div>
          </div>

          {/* Calendar */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textSub, marginBottom: 14, textAlign: 'center' }}>{MONTHS_RU[mo]} {yr}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 8 }}>
              {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: C.textMute, paddingBottom: 2 }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {Array(firstDay).fill(null).map((_, i) => <div key={'b' + i} />)}
              {Array(dim).fill(null).map((_, i) => {
                const n = i + 1, d = new Date(yr, mo, n)
                const isToday = n === todayN, sched = isScheduled(d), comp = isCompleted(n), future = d > today
                return (
                  <div key={n} style={{
                    aspectRatio: '1', borderRadius: 10, fontSize: 13, fontWeight: isToday ? 700 : 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    background: isToday ? col.accent : comp ? col.bg : C.s1,
                    border: isToday ? `1px solid ${col.accent}` : comp ? `1px solid ${C.border}` : '1px solid transparent',
                    color: isToday ? '#0d0d0d' : comp ? C.text : sched ? C.textSub : C.textMute,
                    opacity: future ? 0.35 : 1,
                    boxShadow: isToday ? `0 4px 14px ${vGlow}` : 'none',
                  }}>
                    {n}
                    {!isToday && comp && <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: col.accent, opacity: 0.8 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default function HabitsPage({ habits, setHabits, externalAddTrigger = 0, onHabitAdd, onHabitUpdate, onHabitDelete, onHabitToggle, onHabitArchive }: {
  habits: Habit[]
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>
  externalAddTrigger?: number
  onHabitAdd?: (h: Habit) => void
  onHabitUpdate?: (h: Habit) => void
  onHabitDelete?: (id: number) => void
  onHabitToggle?: (id: number) => void
  onHabitArchive?: (id: number) => void
}) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).toUpperCase()
  const live = habits.filter(h => !h.archivedAt)
  const completed = live.filter(h => h.completedToday).length
  const progressPct = live.length ? completed / live.length : 0
  const allDone = live.length > 0 && completed === live.length

  const [showAdd, setShowAdd] = useState(false)
  const [infoHabit, setInfoHabit] = useState<Habit | null>(null)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)

  // open sheet when FAB pressed in App — use ref to avoid re-triggering on remount
  const processedTrigger = useRef(externalAddTrigger)
  useEffect(() => {
    if (externalAddTrigger > processedTrigger.current) {
      processedTrigger.current = externalAddTrigger
      setShowAdd(true)
    }
  }, [externalAddTrigger])

  const toggle = (id: number) => {
    if (onHabitToggle) { onHabitToggle(id); return }
    setHabits(hs => hs.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h))
  }
  const handleAdd = (h: Habit) => {
    if (onHabitAdd) { onHabitAdd(h); return }
    setHabits(hs => [h, ...hs])
  }
  const handleSave = (upd: Habit) => {
    if (onHabitUpdate) { onHabitUpdate(upd); return }
    setHabits(hs => hs.map(h => h.id === upd.id ? upd : h))
  }
  const handleArchive = (id: number) => {
    if (onHabitArchive) { onHabitArchive(id) } else { setHabits(hs => hs.map(h => h.id === id ? { ...h, archivedAt: NOW() } : h)) }
    setInfoHabit(null)
  }
  const handleDelete = (id: number) => {
    if (onHabitDelete) { onHabitDelete(id) } else { setHabits(hs => hs.filter(h => h.id !== id)) }
    setInfoHabit(null)
  }
  const handleEdit = (h: Habit) => { setInfoHabit(null); setTimeout(() => setEditHabit(h), 300) }

  const ringR = 18
  const ringCirc = 2 * Math.PI * ringR

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 14px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: C.textMute, letterSpacing: '0.1em', marginBottom: 4 }}>{dateStr}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Привычки</h1>
          {live.length > 0 && <AddBtn onPress={() => setShowAdd(true)} />}
        </div>

        {/* Progress block */}
        {live.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: C.s1,
            border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '12px 16px',
          }}>
            {/* Circular progress ring */}
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="progGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c49a5a" />
                  <stop offset="100%" stopColor="#e0c070" />
                </linearGradient>
                <linearGradient id="progGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ab8a0" />
                  <stop offset="100%" stopColor="#7accc0" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r={ringR} fill="none" stroke={C.s3} strokeWidth="4" />
              <circle cx="24" cy="24" r={ringR} fill="none"
                stroke={allDone ? 'url(#progGreen)' : 'url(#progGold)'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${ringCirc}`}
                strokeDashoffset={`${ringCirc * (1 - progressPct)}`}
                transform="rotate(-90 24 24)"
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.34,1.56,0.64,1), stroke 0.5s' }}
              />
              <text x="24" y="28" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="800" fontFamily="Manrope,sans-serif">
                {Math.round(progressPct * 100)}%
              </text>
            </svg>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 7 }}>
                {allDone ? '🎉 Всё выполнено!' : `${completed} из ${live.length} выполнено`}
              </div>
              <div style={{ height: 3, borderRadius: 2, background: C.s3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${progressPct * 100}%`,
                  background: allDone
                    ? 'linear-gradient(90deg, #4ab8a0, #7accc0)'
                    : 'linear-gradient(90deg, #c49a5a, #e0c070)',
                  transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1), background 0.5s',
                  boxShadow: allDone ? '0 0 8px rgba(74,184,160,0.5)' : '0 0 8px rgba(196,154,90,0.4)',
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habit list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        {live.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMute }}>
            <div style={{ fontSize: 52, marginBottom: 16, animation: 'floaty 4s ease-in-out infinite' }}>◎</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.textSub, marginBottom: 8 }}>Нет привычек</div>
            <div style={{ fontSize: 14, color: C.textMute, lineHeight: 1.6 }}>Нажми кнопку ниже<br/>чтобы добавить первую привычку</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {live.map(habit => (
              <HabitCard key={habit.id} habit={habit} onToggle={() => toggle(habit.id)} onTap={() => setInfoHabit(habit)} />
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddHabitSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editHabit && <AddHabitSheet onClose={() => setEditHabit(null)} onAdd={handleAdd} onSave={handleSave} initialHabit={editHabit} />}
      {infoHabit && <HabitInfoSheet habit={infoHabit} onClose={() => setInfoHabit(null)} onToggle={() => toggle(infoHabit.id)} onEdit={handleEdit} onArchive={handleArchive} onDelete={handleDelete} />}
    </div>
  )
}
