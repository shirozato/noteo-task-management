import { useState, useMemo } from 'react'
import { useSleepStore } from '../store'
import { sleepApi } from '../api'

function parseDuration(bed: string, rise: string): number {
  if (!bed || !rise) return 0
  const bh = parseInt(bed.split(':')[0]), bm = parseInt(bed.split(':')[1])
  const rh = parseInt(rise.split(':')[0]), rm = parseInt(rise.split(':')[1])
  let mins = (rh * 60 + rm) - (bh * 60 + bm)
  if (mins < 0) mins += 24 * 60
  return mins / 60
}

function formatHours(h: number): string {
  if (h <= 0) return '—'
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

const DAYS = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
const GOAL_HOURS = 8

export function SleepPage() {
  const { records, add } = useSleepStore()
  const [bedTime, setBedTime] = useState('23:00')
  const [riseTime, setRiseTime] = useState('07:00')
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState('')

  const showNotif = (msg: string) => { setNotif(msg); setTimeout(() => setNotif(''), 2200) }

  const todaySleep = useMemo(() => {
    const today = new Date().toDateString()
    const rec = records.find((r) => new Date(r.bed_time).toDateString() === today)
    if (!rec || !rec.rise_time) return 0
    const bed = new Date(rec.bed_time)
    const rise = new Date(rec.rise_time)
    return (rise.getTime() - bed.getTime()) / 3600000
  }, [records])

  const weekData = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i))
      const rec = records.find((r) => new Date(r.bed_time).toDateString() === d.toDateString())
      let hours = 0
      if (rec?.rise_time) {
        const b = new Date(rec.bed_time), r = new Date(rec.rise_time)
        hours = Math.max(0, (r.getTime() - b.getTime()) / 3600000)
      }
      return { day: DAYS[d.getDay()], hours }
    })
  }, [records])

  const avgSleep = useMemo(() => {
    const with_data = weekData.filter((d) => d.hours > 0)
    if (!with_data.length) return 0
    return with_data.reduce((s, d) => s + d.hours, 0) / with_data.length
  }, [weekData])

  const maxHours = Math.max(...weekData.map((d) => d.hours), GOAL_HOURS)

  const currentHours = useMemo(() => parseDuration(bedTime, riseTime), [bedTime, riseTime])

  const ringRadius = 70
  const ringCircumference = 2 * Math.PI * ringRadius
  const displayHours = todaySleep || currentHours
  const progress = Math.min(displayHours / GOAL_HOURS, 1)
  const dashOffset = ringCircumference * (1 - progress)

  const handleSave = async () => {
    if (!bedTime || !riseTime) return
    setSaving(true)
    const today = new Date()
    const bedDate = new Date(today)
    bedDate.setHours(parseInt(bedTime.split(':')[0]), parseInt(bedTime.split(':')[1]), 0, 0)
    if (parseInt(bedTime.split(':')[0]) >= 20) bedDate.setDate(bedDate.getDate() - 1)
    const riseDate = new Date(today)
    riseDate.setHours(parseInt(riseTime.split(':')[0]), parseInt(riseTime.split(':')[1]), 0, 0)

    try {
      const rec = await sleepApi.create({ bed_time: bedDate.toISOString(), rise_time: riseDate.toISOString() })
      add(rec)
    } catch {
      add({ uid: crypto.randomUUID(), bed_time: bedDate.toISOString(), rise_time: riseDate.toISOString() })
    } finally {
      setSaving(false)
      showNotif('🌙 Сон записан!')
    }
  }

  return (
    <div className="page">
      {notif && <div className="notif">{notif}</div>}

      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
            Цель: {GOAL_HOURS}ч • Ср: {formatHours(avgSleep)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Сон</div>
        </div>
      </div>

      <div className="scroll">
        {/* Sleep ring */}
        <div className="sleep-ring-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180" className="sleep-ring">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={ringRadius} fill="none"
              stroke="url(#ringGrad)" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 1s ease', filter: 'drop-shadow(0 0 8px rgba(139,92,246,.6))' }}
            />
          </svg>
          <div style={{ marginTop: -140, marginBottom: 100, textAlign: 'center', zIndex: 1, position: 'relative' }}>
            <div className="sleep-hrs">{formatHours(displayHours)}</div>
            <div className="sleep-lbl">{displayHours >= GOAL_HOURS ? '✅ Цель достигнута' : `до цели ${formatHours(GOAL_HOURS - displayHours)}`}</div>
          </div>
        </div>

        {/* Time inputs */}
        <div className="time-input-row mt8">
          <div className="time-card">
            <div className="time-card-label">🌙 Отбой</div>
            <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
          </div>
          <div className="time-card">
            <div className="time-card-label">☀️ Подъём</div>
            <input type="time" value={riseTime} onChange={(e) => setRiseTime(e.target.value)} />
          </div>
        </div>

        {currentHours > 0 && (
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--sub)', marginBottom: 12 }}>
            Продолжительность: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{formatHours(currentHours)}</span>
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : '🌙 Записать сон'}
        </button>

        {/* Weekly chart */}
        <div className="section-title">Последние 7 дней</div>
        <div className="glass" style={{ padding: '16px 20px 12px' }}>
          <div className="bar-chart">
            {weekData.map((d, i) => {
              const heightPct = maxHours > 0 ? (d.hours / maxHours) * 100 : 0
              const isGoal = d.hours >= GOAL_HOURS
              return (
                <div key={i} className="bar-col">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      background: isGoal
                        ? 'linear-gradient(to top,#8b5cf6,#6366f1)'
                        : d.hours > 0
                          ? 'linear-gradient(to top,rgba(139,92,246,.5),rgba(99,102,241,.3))'
                          : 'var(--s2)',
                      animationDelay: `${i * 80}ms`,
                      boxShadow: isGoal ? '0 0 8px rgba(139,92,246,.4)' : 'none',
                    }}
                  />
                  <span className="bar-lbl">{d.day}</span>
                </div>
              )
            })}
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
            <span>Среднее: <strong style={{ color: 'var(--text)' }}>{formatHours(avgSleep)}</strong></span>
            <span>Цель: <strong style={{ color: 'var(--purple)' }}>{GOAL_HOURS}ч</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}
