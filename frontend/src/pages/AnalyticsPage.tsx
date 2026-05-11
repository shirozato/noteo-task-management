import React, { useState } from 'react'
import { C, HABIT_COLORS, DAYS_SHORT, fmtDate, toMin } from '../tokens'
import { GlassCard } from '../components/ui'
import { HabitIcon } from '../components/HabitIcons'
import type { Habit, Task, SleepLog, WaterLog } from '../types'

// ─── helpers ──────────────────────────────────────────────────────────────────
const sleepHours = (bed: string, wake: string): number => {
  const b = toMin(bed), w = toMin(wake)
  return (w <= b ? 1440 - b + w : w - b) / 60
}
const fmtSleep = (h: number): string => {
  const hrs = Math.floor(h), mins = Math.round((h - hrs) * 60)
  return mins ? `${hrs}ч ${mins}м` : `${hrs}ч`
}

// ─── PERIOD PILL ──────────────────────────────────────────────────────────────
function PeriodPill({ period, setPeriod }: { period: 'week' | 'month'; setPeriod: (v: 'week' | 'month') => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: C.s1, borderRadius: 18, padding: '3px', border: `1px solid ${C.border}` }}>
      {(['week', 'month'] as const).map((v, i) => (
        <button key={v} onClick={() => setPeriod(v)} style={{
          padding: '5px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 12,
          fontWeight: period === v ? 700 : 400,
          background: period === v ? C.s3 : 'transparent',
          color: period === v ? C.text : C.textSub, transition: 'all 0.2s',
        }}>{i === 0 ? 'Неделя' : 'Месяц'}</button>
      ))}
    </div>
  )
}

// ─── HERO STATS ───────────────────────────────────────────────────────────────
function HeroStats({ habits, tasks, sleepLog, waterLog, waterGoal }: {
  habits: Habit[]; tasks: Task[]; sleepLog: SleepLog; waterLog: WaterLog; waterGoal: number
}) {
  const today = fmtDate(new Date())

  // Habits today
  const live = habits.filter(h => !h.archivedAt)
  const doneToday = live.filter(h => h.completedToday).length
  const habRate = live.length ? Math.round(doneToday / live.length * 100) : 0

  // Tasks due today (have dueDate = today, not archived)
  const todayTasks = tasks.filter(t => !t.archivedAt && t.dueDate === today)
  const todayDone = todayTasks.filter(t => t.done).length
  const taskPct = todayTasks.length > 0 ? Math.round(todayDone / todayTasks.length * 100) : 0

  // Water today
  const todayWater = (waterLog[today]?.entries || []).reduce((s, e) => s + e.amount, 0)
  const waterPct = Math.min(Math.round(todayWater / waterGoal * 100), 100)

  // Sleep: today's entry, fallback to yesterday (logged after waking up)
  const yesterday = fmtDate(new Date(Date.now() - 86400000))
  const sleepEntry = sleepLog[today] || sleepLog[yesterday]
  const sleepToday = sleepEntry ? sleepHours(sleepEntry.bed, sleepEntry.wake) : 0

  // Score: weighted average of today's data
  const score = Math.round(
    (habRate * 0.35) +
    (taskPct * 0.25) +
    (waterPct * 0.20) +
    (Math.min(sleepToday / 8, 1) * 100 * 0.20)
  )
  const CIRC = 2 * Math.PI * 42
  const scoreColor = score >= 80 ? '#4ab8a0' : score >= 60 ? '#c49a5a' : score >= 40 ? '#7080e0' : '#ef7070'

  const stats = [
    { label: 'Задачи', value: todayTasks.length > 0 ? `${todayDone}/${todayTasks.length}` : '—', sub: todayTasks.length > 0 ? `${taskPct}%` : 'нет на сегодня', color: '#c49a5a' },
    { label: 'Привычки', value: `${habRate}%`, sub: `${doneToday}/${live.length}`, color: '#a080d0' },
    { label: 'Вода', value: `${Math.round(todayWater / 10) / 100}л`, sub: `${waterPct}%`, color: '#5fb8e8' },
    { label: 'Сон', value: sleepToday > 0 ? fmtSleep(sleepToday) : '—', sub: sleepToday > 0 ? (sleepToday >= 8 ? 'отлично' : sleepToday >= 6 ? 'средний' : 'мало') : 'нет данных', color: '#7aaad8' },
  ]

  return (
    <div style={{
      margin: '0 0 18px',
      background: 'linear-gradient(135deg, rgba(196,154,90,0.08) 0%, rgba(120,80,200,0.06) 50%, rgba(80,120,220,0.06) 100%)',
      border: `1px solid ${C.border}`, borderRadius: 28, padding: '22px 20px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,90,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,120,220,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Score + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, position: 'relative' }}>
        <div style={{ flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={scoreColor} />
                <stop offset="100%" stopColor={scoreColor} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" style={{ stroke: C.s3 }} strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - score / 100)}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1), stroke 0.5s' }}
            />
            <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" fill={C.text} fontSize="22" fontWeight="800" fontFamily="Manrope,sans-serif">{score}</text>
            <text x="50" y="61" textAnchor="middle" dominantBaseline="middle" fill={C.textMute} fontSize="10" fontFamily="Manrope,sans-serif">балл</text>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>
            {score >= 80 ? 'Отлично!' : score >= 60 ? 'Хороший день' : score >= 40 ? 'Неплохо' : 'Есть над чем работать'}
          </div>
          <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>
            {score >= 80 ? 'Ты молодец, продолжай в том же духе 🔥' : score >= 60 ? 'Ещё чуть-чуть до идеала' : 'Завтра будет лучше!'}
          </div>
        </div>
      </div>

      {/* 4 mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: C.s1, borderRadius: 16, padding: '12px 10px',
            border: `1px solid ${C.border}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
            <div style={{ fontSize: 9, color: C.textMute, marginTop: 3, letterSpacing: '0.05em' }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 10, color: C.textSub, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── WATER CHART ──────────────────────────────────────────────────────────────
function WaterChart({ waterLog, waterGoal, period }: { waterLog: WaterLog; waterGoal: number; period: 'week' | 'month' }) {
  const now = new Date()
  const dimM = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const days = period === 'week'
    ? Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); d.setHours(0, 0, 0, 0); return d })
    : Array.from({ length: dimM }, (_, i) => new Date(now.getFullYear(), now.getMonth(), i + 1))
  const count = days.length
  const data = days.map(d => {
    const entries = waterLog[fmtDate(d)]?.entries || []
    return entries.reduce((s, e) => s + e.amount, 0)
  })
  const total = data.reduce((a, b) => a + b, 0)
  const avg = total / count
  const daysHit = data.filter(v => v >= waterGoal).length
  const CHART_H = 80

  return (
    <GlassCard style={{ padding: '18px', marginBottom: 14, background: 'linear-gradient(135deg, rgba(95,184,232,0.07) 0%, rgba(42,127,176,0.04) 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Трекер воды</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{daysHit} из {count} дней — цель достигнута</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#5fb8e8' }}>{(total/1000).toFixed(1)}л</div>
          <div style={{ fontSize: 11, color: C.textMute }}>за {period === 'week' ? 'неделю' : 'месяц'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: period === 'week' ? 7 : 3, height: CHART_H + 20, paddingBottom: 20, position: 'relative' }}>
        {/* goal line */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: CHART_H * (1 - Math.min(waterGoal / Math.max(...data, waterGoal + 1), 1)),
          height: 1, background: 'rgba(95,184,232,0.25)', borderTop: '1px dashed rgba(95,184,232,0.35)',
        }} />
        {data.map((v, i) => {
          const d = days[i]
          const isToday = d.toDateString() === now.toDateString()
          const maxV = Math.max(...data, waterGoal, 1)
          const barH = v > 0 ? Math.max(v / maxV * CHART_H, 4) : 3
          const hitGoal = v >= waterGoal
          const lbl = period === 'week' ? DAYS_SHORT[d.getDay()] : ((i + 1) % 5 === 1 ? String(i + 1) : '')
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 4 }}>
              <div style={{
                width: '100%', borderRadius: 5,
                height: barH,
                background: isToday
                  ? 'linear-gradient(180deg,#5fb8e8,rgba(95,184,232,0.5))'
                  : hitGoal
                    ? 'linear-gradient(180deg,rgba(74,184,160,0.75),rgba(74,184,160,0.25))'
                    : v > 0
                      ? 'linear-gradient(180deg,rgba(95,184,232,0.45),rgba(95,184,232,0.12))'
                      : C.s1,
                boxShadow: isToday ? '0 2px 12px rgba(95,184,232,0.35)' : 'none',
                transition: 'height 0.4s ease',
              }} />
              <div style={{ fontSize: 9, color: isToday ? '#5fb8e8' : C.textMute, whiteSpace: 'nowrap' }}>{lbl}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
        {[
          ['rgba(74,184,160,0.7)', `цель ≥${(waterGoal/1000).toFixed(1)}л`],
          ['rgba(95,184,232,0.7)', 'в процессе'],
        ].map(([clr, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: clr }} />
            <span style={{ fontSize: 11, color: C.textMute }}>{lbl}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: C.textSub }}>
          Ср. {avg >= 1000 ? `${(avg/1000).toFixed(1)}л` : `${Math.round(avg)}мл`}/день
        </div>
      </div>
    </GlassCard>
  )
}

// ─── TASKS BAR CHART ──────────────────────────────────────────────────────────
function TasksChart({ tasks, period }: { tasks: Task[]; period: 'week' | 'month' }) {
  const nowT = new Date()
  const dimT = new Date(nowT.getFullYear(), nowT.getMonth() + 1, 0).getDate()
  const days = period === 'week'
    ? Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); d.setHours(0, 0, 0, 0); return d })
    : Array.from({ length: dimT }, (_, i) => new Date(nowT.getFullYear(), nowT.getMonth(), i + 1))
  const count = days.length
  const data = days.map(d => {
    const s = d.getTime(), e = s + 86400000
    return tasks.filter(t => t.doneAt != null && t.doneAt >= s && t.doneAt < e).length
  })
  const total = data.reduce((a, b) => a + b, 0)
  const avg = total / count
  const maxIdx = data.indexOf(Math.max(...data))
  const best = maxIdx >= 0 ? days[maxIdx] : null
  const CHART_H = 80

  return (
    <GlassCard style={{ padding: '18px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Задачи</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
            Лучший день: {best ? DAYS_SHORT[best.getDay()] : '—'} · Ср. {avg.toFixed(1)}/день
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#c49a5a' }}>
          {total} <span style={{ fontSize: 13, fontWeight: 500, color: C.textSub }}>задач</span>
        </div>
      </div>

      <div style={{ position: 'relative', height: CHART_H + 20 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, height: CHART_H, display: 'flex', alignItems: 'flex-end', gap: period === 'week' ? 7 : 2 }}>
          {data.map((v, i) => {
            const isToday = days[i].toDateString() === nowT.toDateString()
            const maxV = Math.max(...data, 1)
            const barH = v > 0 ? Math.max(v / maxV * CHART_H, 6) : 3
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                {v > 0 && period === 'week' && (
                  <div style={{ fontSize: 9, color: isToday ? '#c49a5a' : C.textSub, fontWeight: 700, marginBottom: 2 }}>{v}</div>
                )}
                <div style={{
                  width: '100%', borderRadius: 5, height: barH,
                  background: isToday
                    ? 'linear-gradient(180deg,#c49a5a,rgba(196,154,90,0.4))'
                    : v > 0
                      ? 'linear-gradient(180deg,rgba(196,154,90,0.5),rgba(196,154,90,0.12))'
                      : C.s1,
                  boxShadow: isToday ? '0 2px 12px rgba(196,154,90,0.35)' : 'none',
                }} />
              </div>
            )
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 20, display: 'flex', gap: period === 'week' ? 7 : 2 }}>
          {data.map((_, i) => {
            const d = days[i]
            const isToday = d.toDateString() === nowT.toDateString()
            const lbl = period === 'week' ? DAYS_SHORT[d.getDay()] : ((i + 1) % 5 === 1 ? String(i + 1) : '')
            return <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: isToday ? '#c49a5a' : C.textMute, fontWeight: isToday ? 700 : 400 }}>{lbl}</div>
          })}
        </div>
      </div>
    </GlassCard>
  )
}

// ─── HABITS SECTION ───────────────────────────────────────────────────────────
function HabitsSection({ habits }: { habits: Habit[] }) {
  const live = habits.filter(h => !h.archivedAt)
  const completed = live.filter(h => h.completedToday).length
  const rate = live.length ? Math.round(completed / live.length * 100) : 0
  const top5 = [...live].sort((a, b) => b.streak - a.streak).slice(0, 5)
  const CIRC = 2 * Math.PI * 28

  const ratingLabel = rate >= 90 ? 'Отлично' : rate >= 70 ? 'Хорошо' : rate >= 50 ? 'Норм' : 'Мало'
  const ratingColor = rate >= 90 ? '#4ab8a0' : rate >= 70 ? '#c49a5a' : rate >= 50 ? '#6488e0' : '#ef7070'

  return (
    <GlassCard style={{ padding: '18px', marginBottom: 14, background: 'linear-gradient(135deg, rgba(160,100,220,0.07) 0%, transparent 60%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Привычки</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Сегодня {completed} из {live.length}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <defs>
              <linearGradient id="habGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ratingColor} />
                <stop offset="100%" stopColor={ratingColor} stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <circle cx="36" cy="36" r="28" fill="none" style={{ stroke: C.s3 }} strokeWidth="7" />
            <circle cx="36" cy="36" r="28" fill="none" stroke="url(#habGrad2)" strokeWidth="7"
              strokeLinecap="round" strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - rate / 100)}
              transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
            <text x="36" y="39" textAnchor="middle" fill={C.text} fontSize="14" fontWeight="800" fontFamily="Manrope,sans-serif">{rate}%</text>
          </svg>
          <div style={{ fontSize: 11, fontWeight: 700, color: ratingColor, background: `${ratingColor}18`, padding: '4px 10px', borderRadius: 10, border: `1px solid ${ratingColor}35` }}>
            {ratingLabel}
          </div>
        </div>
      </div>

      {top5.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textMute, textAlign: 'center', padding: '12px 0' }}>Нет привычек</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, color: C.textMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Топ по серии</div>
          {top5.map((h, i) => {
            const col = HABIT_COLORS[h.color] || HABIT_COLORS.default
            const barW = live.length ? h.streak / Math.max(...live.map(x => x.streak), 1) * 100 : 0
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.textMute, width: 16, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: col.bg, border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HabitIcon iconId={h.icon} color={col.accent} size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{h.title}</div>
                  <div style={{ height: 4, borderRadius: 2, background: C.s2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barW}%`, borderRadius: 2, background: `linear-gradient(90deg, ${col.accent}, ${col.accent}88)`, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  {h.streak > 0 && <img src="/fire.gif" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />}
                  <span style={{ fontSize: 14, fontWeight: 800, color: h.streak > 0 ? col.accent : C.textMute }}>{h.streak}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}

// ─── SLEEP CHART ──────────────────────────────────────────────────────────────
function SleepChart({ sleepLog, period }: { sleepLog: SleepLog; period: 'week' | 'month' }) {
  const nowS = new Date()
  const dimS = new Date(nowS.getFullYear(), nowS.getMonth() + 1, 0).getDate()

  // Week: last 7 days ending today (matches Sleep page)
  const days = period === 'week'
    ? Array.from({ length: 7 }, (_, i) => { const d = new Date(nowS); d.setDate(d.getDate() - 6 + i); d.setHours(0, 0, 0, 0); return d })
    : Array.from({ length: dimS }, (_, i) => new Date(nowS.getFullYear(), nowS.getMonth(), i + 1))
  const count = days.length
  const data: (number | null)[] = days.map(d => {
    const e = sleepLog[fmtDate(d)]
    return e ? sleepHours(e.bed, e.wake) : null
  })
  const valid = data.filter(v => v !== null) as number[]
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  const best = valid.length ? Math.max(...valid) : 0

  const W = 300, H = 80
  const minH = 4, maxH = 10
  const xStep = count > 1 ? W / (count - 1) : W
  const yPos = (h: number) => H - Math.max(0, Math.min(1, (h - minH) / (maxH - minH))) * H

  const pts = data.map((v, i): [number, number] | null => v !== null ? [i * xStep, yPos(v)] : null)
  const segments: [number, number][][] = []
  let cur: [number, number][] = []
  pts.forEach(p => { if (p) cur.push(p); else if (cur.length) { segments.push(cur); cur = [] } })
  if (cur.length) segments.push(cur)

  const avgY = avg ? yPos(avg) : H / 2
  const yLabels = [9, 8, 7, 6]
  const Y_LABEL_W = 26 // px reserved for y-axis labels

  return (
    <GlassCard style={{ padding: '18px', marginBottom: 14, background: 'linear-gradient(135deg, rgba(100,150,220,0.07) 0%, transparent 60%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>График сна</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Среднее: {avg > 0 ? fmtSleep(avg) : '—'}</div>
        </div>
        {best > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7aaad8', background: 'rgba(100,150,220,0.12)', padding: '4px 10px', borderRadius: 10, border: '1px solid rgba(100,150,220,0.22)' }}>
            ★ лучший {fmtSleep(best)}
          </div>
        )}
      </div>

      {valid.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textMute, textAlign: 'center', padding: '20px 0' }}>Нет данных о сне</div>
      ) : (
        <>
          {/* Chart area: y-labels as HTML + SVG for the graph */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* Y-axis labels column */}
            <div style={{ width: Y_LABEL_W, flexShrink: 0, position: 'relative', height: H + 2 }}>
              {yLabels.map(h => (
                <div key={h} style={{
                  position: 'absolute',
                  right: 4,
                  top: yPos(h) - 5,
                  fontSize: 8,
                  color: C.textMute,
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                }}>{h}ч</div>
              ))}
            </div>
            {/* SVG chart (no y labels inside) */}
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="100%" height={H + 2} viewBox={`0 0 ${W} ${H + 2}`} preserveAspectRatio="none" style={{ overflow: 'visible', display: 'block' }}>
                <defs>
                  <linearGradient id="sleepGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(122,170,216,0.25)" />
                    <stop offset="100%" stopColor="rgba(122,170,216,0)" />
                  </linearGradient>
                </defs>
                {yLabels.map(h => (
                  <line key={h} x1={0} y1={yPos(h)} x2={W} y2={yPos(h)} stroke={C.border} strokeWidth="1" />
                ))}
                <line x1={0} y1={avgY} x2={W} y2={avgY} stroke="rgba(122,170,216,0.3)" strokeWidth="1" strokeDasharray="4,3" />
                {segments.map((seg, si) => {
                  if (seg.length < 2) return null
                  const d = `M${seg[0][0]},${seg[0][1]} ` + seg.slice(1).map(p => `L${p[0]},${p[1]}`).join(' ') + ` L${seg[seg.length-1][0]},${H} L${seg[0][0]},${H} Z`
                  return <path key={si} d={d} fill="url(#sleepGrad2)" />
                })}
                {segments.map((seg, si) => {
                  if (seg.length < 2) return null
                  const d = `M${seg[0][0]},${seg[0][1]} ` + seg.slice(1).map(p => `L${p[0]},${p[1]}`).join(' ')
                  return <path key={si} d={d} fill="none" stroke="#7aaad8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                })}
                {pts.map((p, i) => p ? (
                  <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#7aaad8" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
                ) : null)}
              </svg>
            </div>
          </div>
          {/* X-axis day labels */}
          <div style={{ display: 'flex', marginTop: 6, paddingLeft: Y_LABEL_W }}>
            {days.map((d, i) => {
              const isToday = d.toDateString() === nowS.toDateString()
              const lbl = period === 'week' ? DAYS_SHORT[d.getDay()] : ((i + 1) % 5 === 1 ? String(i + 1) : '')
              return <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: isToday ? '#7aaad8' : C.textMute, fontWeight: isToday ? 700 : 400 }}>{lbl}</div>
            })}
          </div>
        </>
      )}
    </GlassCard>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AnalyticsPage({ habits, tasks, sleepLog = {}, waterLog = {}, waterGoal = 2000, onBack }: {
  habits: Habit[]; tasks: Task[]; sleepLog?: SleepLog; waterLog?: WaterLog; waterGoal?: number; onBack?: () => void
}) {
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: C.s2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Аналитика</h1>
          <div style={{ marginLeft: 'auto' }}>
            <PeriodPill period={period} setPeriod={setPeriod} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        <HeroStats habits={habits} tasks={tasks} sleepLog={sleepLog} waterLog={waterLog} waterGoal={waterGoal} />
        <WaterChart waterLog={waterLog} waterGoal={waterGoal} period={period} />
        <TasksChart tasks={tasks} period={period} />
        <HabitsSection habits={habits} />
        <SleepChart sleepLog={sleepLog} period={period} />
      </div>
    </div>
  )
}
