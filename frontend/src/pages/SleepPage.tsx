import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { C, DAYS_SHORT, fmtDate, toMin, timeToDeg, degToTime, minToTime } from '../tokens'
import { GlassCard, SheetHandle, SectionLabel, Pill, useSheetSwipe } from '../components/ui'
import type { SleepLog } from '../types'

const SLEEP_BLUE = '#7aaad8'

function DrumColumn({ items, selectedIdx, onScrollEnd, formatFn }: {
  items: number[]
  selectedIdx: number
  onScrollEnd: (i: number) => void
  formatFn: (v: number) => string
}) {
  const ITEM_H = 46
  const ref = useRef<HTMLDivElement>(null)
  const lastIdx = useRef(selectedIdx)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selectedIdx * ITEM_H
  }, [])

  const handleScroll = () => {
    if (!ref.current) return
    const idx = Math.round(ref.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    if (clamped !== lastIdx.current) { lastIdx.current = clamped; onScrollEnd(clamped) }
  }

  return (
    <div style={{ position: 'relative', height: ITEM_H * 5, overflow: 'hidden', flex: 1 }}>
      <div ref={ref} onScroll={handleScroll} style={{ height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' as 'touch' }}>
        {[0, 1].map(i => <div key={'t' + i} style={{ height: ITEM_H, scrollSnapAlign: 'center' }} />)}
        {items.map((item, i) => {
          const dist = Math.abs(i - lastIdx.current)
          return (
            <div key={i} style={{
              height: ITEM_H, scrollSnapAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: dist === 0 ? 30 : dist === 1 ? 20 : 15,
              fontWeight: dist === 0 ? 800 : 400,
              color: dist === 0 ? C.text : dist === 1 ? C.textSub : C.textMute,
              fontFamily: 'Manrope,sans-serif', userSelect: 'none',
            }}>{formatFn(item)}</div>
          )
        })}
        {[0, 1].map(i => <div key={'b' + i} style={{ height: ITEM_H, scrollSnapAlign: 'center' }} />)}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 2, background: 'linear-gradient(to bottom,var(--c-sheet) 0%,transparent 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 2, background: 'linear-gradient(to top,var(--c-sheet) 0%,transparent 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: 6, right: 6, height: ITEM_H, transform: 'translateY(-50%)', background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12, pointerEvents: 'none' }} />
    </div>
  )
}

function TimeDrumPicker({ value, label, accentColor, onConfirm, onClose }: { value: string; label: string; accentColor: string; onConfirm: (v: string) => void; onClose: () => void }) {
  const parts = value.split(':')
  const initH = parseInt(parts[0]) || 0
  const initM = Math.round((parseInt(parts[1]) || 0) / 5) * 5 % 60
  const [selH, setSelH] = useState(initH)
  const [selM, setSelM] = useState(initM)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const mIdx = minutes.indexOf(selM) >= 0 ? minutes.indexOf(selM) : 0
  const { dragStyle, handleProps } = useSheetSwipe(onClose)

  const confirm = () => { onConfirm(`${String(selH).padStart(2, '0')}:${String(selM).padStart(2, '0')}`); onClose() }

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 200, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto',
        width: '100%', maxWidth: 430, background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 201, animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
        display: 'flex', flexDirection: 'column', ...dragStyle,
      }}>
        <SheetHandle dragProps={handleProps} />
        <div style={{ padding: '0 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub, textAlign: 'center', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DrumColumn items={hours} selectedIdx={selH} onScrollEnd={setSelH} formatFn={v => String(v).padStart(2, '0')} />
            <div style={{ fontSize: 32, fontWeight: 800, color: C.textSub, flexShrink: 0, width: 22, textAlign: 'center', marginBottom: 4 }}>:</div>
            <DrumColumn items={minutes} selectedIdx={mIdx} onScrollEnd={i => setSelM(minutes[i])} formatFn={v => String(v).padStart(2, '0')} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, textAlign: 'center', marginTop: 10, letterSpacing: '0.03em' }}>
            {String(selH).padStart(2, '0')}:{String(selM).padStart(2, '0')}
          </div>
        </div>
        <div style={{ padding: '12px 24px', paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)', flexShrink: 0 }}>
          <button onClick={confirm} style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg,${accentColor},${accentColor}aa)`, color: 'white', fontSize: 16, fontWeight: 700,
            boxShadow: `0 4px 20px ${accentColor}40`,
          }}>Готово</button>
        </div>
      </div>
    </>,
    document.body
  )
}

function TimeButton({ label, value, color, onTap }: { label: string; value: string; color: string; onTap: () => void }) {
  const bg = `${color}18`
  const bd = `${color}40`
  return (
    <button onClick={onTap} style={{
      flex: 1, background: bg, borderRadius: 14, padding: '12px 14px',
      border: `1px solid ${bd}`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
    }}
      onPointerDown={e => (e.currentTarget.style.background = `${color}28`)}
      onPointerUp={e => (e.currentTarget.style.background = bg)}
      onPointerLeave={e => (e.currentTarget.style.background = bg)}
    >
      <div style={{ fontSize: 10, color: C.textMute, marginBottom: 5, letterSpacing: '0.07em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '0.02em' }}>{value}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2.5 2.5" /></svg>
      </div>
    </button>
  )
}

export default function SleepPage({ onPickerToggle, sleepLog, setSleepLog, onSleepLog }: {
  onPickerToggle?: (open: boolean) => void
  sleepLog: SleepLog
  setSleepLog: React.Dispatch<React.SetStateAction<SleepLog>>
  onSleepLog?: (dateKey: string, bed: string, wake: string) => void
}) {
  const todayKey = fmtDate(new Date())
  const [editDay, setEditDay] = useState(todayKey)
  const [editBed, setEditBed] = useState('23:00')
  const [editWake, setEditWake] = useState('07:00')
  const [savedFlash, setSavedFlash] = useState(false)
  const [sleepGoal] = useState(8)
  const [dragging, setDragging] = useState<'bed' | 'wake' | null>(null)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [picker, setPicker] = useState<{ target: 'bed' | 'wake'; value: string; label: string } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const entry = sleepLog[editDay]
    setEditBed(entry?.bed || '23:00')
    setEditWake(entry?.wake || '07:00')
  }, [editDay])

  const saveEntry = () => {
    setSleepLog(l => ({ ...l, [editDay]: { ...l[editDay], bed: editBed, wake: editWake } }))
    onSleepLog?.(editDay, editBed, editWake)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1400)
  }

  const bed = toMin(editBed), wake = toMin(editWake)
  const duration = wake <= bed ? 1440 - bed + wake : wake - bed
  const hrs = Math.floor(duration / 60), mns = duration % 60
  const quality = Math.min(duration / (sleepGoal * 60), 1)
  const qColor = quality >= 0.9 ? '#4ab8a0' : quality >= 0.7 ? SLEEP_BLUE : '#ef7060'

  const CX = 110, CY = 110, R = 82
  const degToXY = (deg: number) => ({ x: CX + R * Math.cos((deg - 90) * Math.PI / 180), y: CY + R * Math.sin((deg - 90) * Math.PI / 180) })
  const bedDeg = timeToDeg(editBed)
  const wakeDeg = timeToDeg(editWake)
  const bedPt = degToXY(bedDeg)
  const wakePt = degToXY(wakeDeg)
  const sleepDeg = duration / 1440 * 360
  const largeArc = sleepDeg > 180 ? 1 : 0

  const arcPath = () => {
    const sRad = (bedDeg - 90) * Math.PI / 180
    const eDeg = (bedDeg + sleepDeg) % 360
    const eRad = (eDeg - 90) * Math.PI / 180
    return `M${CX + R * Math.cos(sRad)},${CY + R * Math.sin(sRad)} A${R},${R} 0 ${largeArc},1 ${CX + R * Math.cos(eRad)},${CY + R * Math.sin(eRad)}`
  }

  const getSVGPt = (e: MouseEvent | TouchEvent) => {
    const svg = svgRef.current; if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
    return { x: (cx - rect.left) / rect.width * 220, y: (cy - rect.top) / rect.height * 220 }
  }

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging) return
    if (e.cancelable) e.preventDefault()
    const pt = getSVGPt(e); if (!pt) return
    const t = degToTime(((Math.atan2(pt.x - CX, -(pt.y - CY)) * 180 / Math.PI) + 360) % 360)
    if (dragging === 'bed') setEditBed(t); else setEditWake(t)
  }, [dragging])

  useEffect(() => {
    if (!dragging) return
    const up = () => setDragging(null)
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('mouseup', up)
    document.addEventListener('touchend', up)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', up)
      document.removeEventListener('touchend', up)
    }
  }, [dragging, handleMove])

  const CHART_H = 80
  const today2 = new Date(); today2.setHours(0, 0, 0, 0)
  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(today2); d.setDate(d.getDate() - 6 + i); return d })

  const buildChart = (n: number) => Array.from({ length: n }, (_, i) => {
    const d = new Date(today2); d.setDate(d.getDate() - (n - 1) + i)
    const key = fmtDate(d)
    if (sleepLog[key]) { const { bed: b, wake: w } = sleepLog[key]; const bm = toMin(b), wm = toMin(w); return (wm <= bm ? 1440 - bm + wm : wm - bm) / 60 }
    if (i === n - 1) return hrs + mns / 60
    return 0
  })

  const buildMonthChart = () => {
    const yr = today2.getFullYear(), mo = today2.getMonth()
    const dim = new Date(yr, mo + 1, 0).getDate()
    return Array.from({ length: dim }, (_, i) => {
      const d = new Date(yr, mo, i + 1)
      const key = fmtDate(d)
      if (sleepLog[key]) { const { bed: b, wake: w } = sleepLog[key]; const bm = toMin(b), wm = toMin(w); return (wm <= bm ? 1440 - bm + wm : wm - bm) / 60 }
      if (d.toDateString() === today2.toDateString()) return hrs + mns / 60
      return 0
    })
  }

  const monthDim = new Date(today2.getFullYear(), today2.getMonth() + 1, 0).getDate()
  const chartData = period === 'week' ? buildChart(7) : buildMonthChart()
  const chartLabels = period === 'week'
    ? Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return DAYS_SHORT[d.getDay()] })
    : Array.from({ length: monthDim }, (_, i) => (i + 1) % 5 === 1 ? String(i + 1) : '')
  const maxSleep = Math.max(...chartData.filter(v => v > 0), sleepGoal + 0.5, 1)

  const openPicker = (p: typeof picker) => { setPicker(p); onPickerToggle?.(true) }
  const closePicker = () => { setPicker(null); onPickerToggle?.(false) }

  const gDeg = (bedDeg + sleepGoal / 24 * 360) % 360
  const gRad = (gDeg - 90) * Math.PI / 180

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 14px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Сон</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        <GlassCard style={{ padding: '16px 16px 14px', marginBottom: 14, background: 'radial-gradient(ellipse 130% 80% at 0% 110%, rgba(60,100,200,0.13) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 50% 10%, rgba(80,120,220,0.09) 0%, transparent 65%), var(--c-s1)' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            {days7.map(d => {
              const key = fmtDate(d)
              const isToday = d.toDateString() === today2.toDateString()
              const isSel = editDay === key
              const hasLog = !!sleepLog[key]
              return (
                <button key={key} onClick={() => setEditDay(key)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '7px 3px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: isSel ? 'rgba(100,150,220,0.15)' : isToday ? C.s2 : C.s1,
                  outline: isSel ? `1.5px solid rgba(100,150,220,0.45)` : `1.5px solid ${isToday ? C.borderHi : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 9, color: isSel ? SLEEP_BLUE : C.textMute }}>{DAYS_SHORT[d.getDay()]}</span>
                  <span style={{ fontSize: 13, fontWeight: isSel || isToday ? 700 : 400, color: isSel ? SLEEP_BLUE : C.text }}>{d.getDate()}</span>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: hasLog ? '#5fb8e8' : 'transparent', transition: 'background 0.2s' }} />
                </button>
              )
            })}
          </div>

          <svg ref={svgRef} width="220" height="220" viewBox="-16 -16 252 252" style={{ display: 'block', margin: '0 auto', touchAction: 'none', userSelect: 'none' }}>
            <defs>
              <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={qColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={qColor} stopOpacity="0.4" />
              </linearGradient>
              <filter id="hGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            {Array.from({ length: 24 }, (_, i) => {
              const rad = (i / 24 * 360 - 90) * Math.PI / 180, r1 = R + 14, r2 = R + 18 + (i % 6 === 0 ? 4 : 0)
              return <line key={i} x1={CX + r1 * Math.cos(rad)} y1={CY + r1 * Math.sin(rad)} x2={CX + r2 * Math.cos(rad)} y2={CY + r2 * Math.sin(rad)} style={{ stroke: C.border }} strokeWidth={i % 6 === 0 ? 1.5 : 1} />
            })}
            {([[0, '12'], [90, '3'], [180, '6'], [270, '9']] as [number, string][]).map(([deg, lbl]) => {
              const rad = (deg - 90) * Math.PI / 180, r = R + 31
              return <text key={deg} x={CX + r * Math.cos(rad)} y={CY + r * Math.sin(rad)} textAnchor="middle" dominantBaseline="middle" style={{ fill: C.textSub }} fontSize="13" fontWeight="700" fontFamily="Manrope,sans-serif">{lbl}</text>
            })}
            <circle cx={CX} cy={CY} r={R} fill="none" style={{ stroke: C.s3 }} strokeWidth="14" />
            <path d={arcPath()} fill="none" stroke="url(#sGrad)" strokeWidth="14" strokeLinecap="round" filter="url(#hGlow)" />
            <line x1={CX + (R - 7) * Math.cos(gRad)} y1={CY + (R - 7) * Math.sin(gRad)} x2={CX + (R + 7) * Math.cos(gRad)} y2={CY + (R + 7) * Math.sin(gRad)} stroke={qColor} strokeWidth="2" strokeDasharray="3,2" opacity="0.6" />
            <circle cx={CX} cy={CY} r={60} style={{ fill: C.s1, stroke: C.border }} strokeWidth="1" />
            <text x={CX} y={CY - 14} textAnchor="middle" style={{ fill: C.text }} fontSize="26" fontWeight="800" fontFamily="Manrope,sans-serif">{hrs}ч {mns}м</text>
            <text x={CX} y={CY + 12} textAnchor="middle" style={{ fill: qColor }} fontSize="11" fontFamily="Manrope,sans-serif">{quality >= 0.9 ? 'Отличный' : quality >= 0.7 ? 'Хороший' : 'Мало сна'}</text>
            <text x={CX} y={CY + 28} textAnchor="middle" style={{ fill: C.textMute }} fontSize="10" fontFamily="Manrope,sans-serif">цель {sleepGoal}ч</text>
            <circle cx={bedPt.x} cy={bedPt.y} r={14} style={{ fill: C.s2, stroke: qColor }} strokeWidth="2.5" filter="url(#hGlow)" />
            <text x={bedPt.x} y={bedPt.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontFamily="Manrope,sans-serif">🌙</text>
            <circle cx={bedPt.x} cy={bedPt.y} r={28} fill="transparent" style={{ cursor: 'grab' }}
              onMouseDown={e => { e.stopPropagation(); setDragging('bed') }}
              onTouchStart={e => { e.stopPropagation(); setDragging('bed') }} />
            <circle cx={wakePt.x} cy={wakePt.y} r={14} style={{ fill: C.s2, stroke: qColor }} strokeWidth="2.5" filter="url(#hGlow)" />
            <text x={wakePt.x} y={wakePt.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontFamily="Manrope,sans-serif">☀️</text>
            <circle cx={wakePt.x} cy={wakePt.y} r={28} fill="transparent" style={{ cursor: 'grab' }}
              onMouseDown={e => { e.stopPropagation(); setDragging('wake') }}
              onTouchStart={e => { e.stopPropagation(); setDragging('wake') }} />
          </svg>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <TimeButton label="ОТБОЙ"  value={editBed}  color={qColor} onTap={() => openPicker({ target: 'bed',  value: editBed,  label: 'Время отбоя' })} />
            <TimeButton label="ПОДЪЁМ" value={editWake} color={qColor} onTap={() => openPicker({ target: 'wake', value: editWake, label: 'Время подъёма' })} />
          </div>

          <button onClick={saveEntry} style={{
            width: '100%', marginTop: 10, padding: '13px', borderRadius: 14, cursor: 'pointer', border: 'none',
            background: savedFlash ? 'rgba(74,184,160,0.25)' : `linear-gradient(135deg,${qColor},${qColor}bb)`,
            color: 'white', fontSize: 15, fontWeight: 700,
            boxShadow: savedFlash ? '0 4px 16px rgba(74,184,160,0.25)' : `0 4px 16px ${qColor}44`,
            transition: 'all 0.3s',
          }}>
            {savedFlash ? '✓ Сохранено' : 'Сохранить'}
          </button>
        </GlassCard>

        <GlassCard style={{ padding: '16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel>История сна</SectionLabel>
            <div style={{ display: 'flex', gap: 4 }}>
              {([['week', 'Неделя'], ['month', 'Месяц']] as const).map(([v, l]) => <Pill key={v} active={period === v} onClick={() => setPeriod(v)}>{l}</Pill>)}
            </div>
          </div>
          <div style={{ position: 'relative', height: CHART_H + 16 }}>
            <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, height: CHART_H, display: 'flex', alignItems: 'flex-end', gap: period === 'week' ? 6 : 2 }}>
              {chartData.map((h, i) => {
                const isToday = (period === 'week' && i === 6) || (period === 'month' && i === today2.getDate() - 1)
                const barH = h > 0 ? Math.max(h / maxSleep * CHART_H, 4) : 3
                const barColor = h >= 8
                  ? 'linear-gradient(180deg,rgba(74,184,160,0.85),rgba(74,184,160,0.35))'
                  : h >= 6
                    ? 'linear-gradient(180deg,rgba(120,140,210,0.85),rgba(120,140,210,0.30))'
                    : h > 0
                      ? 'linear-gradient(180deg,rgba(239,112,96,0.75),rgba(239,112,96,0.25))'
                      : C.s2
                return (
                  <div key={i} style={{ flex: 1, height: barH, borderRadius: 4, background: barColor, opacity: h <= 0 ? 0.5 : 1, transition: 'height 0.5s ease', boxShadow: isToday ? '0 0 8px rgba(196,154,90,0.3)' : 'none' }} />
                )
              })}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, display: 'flex', gap: period === 'week' ? 6 : 2 }}>
              {chartLabels.map((lbl, i) => {
                const isToday = (period === 'week' && i === 6) || (period === 'month' && i === today2.getDate() - 1)
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: isToday ? C.gold : C.textMute, whiteSpace: 'nowrap', overflow: 'hidden' }}>{lbl}</div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { color: 'rgba(120,140,210,0.85)', label: 'Хороший сон' },
              { color: 'rgba(74,184,160,0.85)',  label: 'Отличный (≥8ч)' },
              { color: 'rgba(239,112,96,0.75)',  label: 'Мало сна' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.textMute }}>
                <div style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {picker && (
        <TimeDrumPicker value={picker.value} label={picker.label} accentColor={qColor}
          onConfirm={val => { if (picker.target === 'bed') setEditBed(val); else setEditWake(val) }}
          onClose={closePicker}
        />
      )}
    </div>
  )
}
