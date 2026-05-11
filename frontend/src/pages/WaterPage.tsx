import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { C, WATER_C, DAYS_SHORT, MONTHS_RU, fmtDate, NOW } from '../tokens'
import { GlassCard } from '../components/ui'
import type { WaterLog } from '../types'

// ─── WAVE GLASS ───────────────────────────────────────────────────────────────
function WaterWaveGlass({ progress, total, goal, unit }: { progress: number; total: number; goal: number; unit: string }) {
  const [phase, setPhase] = useState(0)
  // Animated fill level — smoothly interpolates when progress changes
  const animProgRef = useRef(progress)
  const [animProg, setAnimProg]   = useState(progress)
  const fillAnimRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const from = animProgRef.current
    const to   = progress
    if (from === to) return
    if (fillAnimRef.current) cancelAnimationFrame(fillAnimRef.current)
    const start = performance.now()
    const dur   = 900
    const tick  = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - t, 3)
      const val = from + (to - from) * e
      animProgRef.current = val
      setAnimProg(val)
      if (t < 1) fillAnimRef.current = requestAnimationFrame(tick)
    }
    fillAnimRef.current = requestAnimationFrame(tick)
    return () => { if (fillAnimRef.current) cancelAnimationFrame(fillAnimRef.current) }
  }, [progress])

  useEffect(() => {
    let raf: number
    const t0 = performance.now()
    const tick = (t: number) => { setPhase((t - t0) / 1000); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const W = 200, H = 270
  const topY = 30, botY = H - 26, topW = 140, botW = 110
  const topL = (W - topW) / 2, topR = topL + topW
  const botL = (W - botW) / 2, botR = botL + botW
  const glassPath = `M${topL} ${topY} L${botL} ${botY} Q${botL} ${botY + 12} ${botL + 12} ${botY + 12} L${botR - 12} ${botY + 12} Q${botR} ${botY + 12} ${botR} ${botY} Z`
  const cap = Math.max(0, Math.min(animProg, 1))
  const waterTopY = topY + (botY + 12 - topY) * (1 - cap)

  const buildWave = (offset: number, amp: number, period: number) => {
    const points: string[] = []
    const segs = 40
    for (let i = 0; i <= segs; i++) {
      const x = (i / segs) * W
      const y = waterTopY + Math.sin((i / segs) * period * Math.PI * 2 + phase * 1.4 + offset) * amp
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
    }
    return `M${points[0]} L${points.slice(1).join(' L ')} L${W} ${botY + 14} L0 ${botY + 14} Z`
  }

  return (
    <div style={{ position: 'relative', width: W, height: H + 10, display: 'flex', justifyContent: 'center' }}>
      <svg width={W} height={H + 10} viewBox={`0 0 ${W} ${H + 10}`}>
        <defs>
          <clipPath id="glassClip">
            <path d={glassPath} />
          </clipPath>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7fcef0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2a7fb0" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="waterGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9adff5" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5fb8e8" stopOpacity="0.5" />
          </linearGradient>
          <filter id="waterGlow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={glassPath} fill="rgba(95,184,232,0.07)" style={{ stroke: 'rgba(95,184,232,0.4)' }} strokeWidth="1.5" />
        <g clipPath="url(#glassClip)">
          {cap > 0 && <>
            <path d={buildWave(0, 5, 1.4)} fill="url(#waterGrad)" filter="url(#waterGlow)" />
            <path d={buildWave(1.6, 3, 1.8)} fill="url(#waterGrad2)" opacity="0.85" />
            {[0.2, 0.45, 0.7].map((bx, i) => {
              const yJitter = ((phase * 30 + i * 40) % (botY - waterTopY + 20))
              const cy = botY + 10 - yJitter
              return cy > waterTopY + 8 ? <circle key={i} cx={W * bx} cy={cy} r={1.8 + i * 0.6} fill="rgba(255,255,255,0.4)" /> : null
            })}
          </>}
        </g>
        <path d={`M${topL + 10} ${topY + 8} L${botL + 18} ${botY - 12}`} style={{ stroke: 'rgba(95,184,232,0.28)' }} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d={`M${topR - 22} ${topY + 12} L${botR - 26} ${botY - 30}`} style={{ stroke: 'rgba(95,184,232,0.12)' }} strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx={W / 2} cy={topY} rx={topW / 2} ry={4} fill="rgba(95,184,232,0.06)" style={{ stroke: 'rgba(95,184,232,0.35)' }} strokeWidth="1.5" />
      </svg>
      <div style={{ position: 'absolute', top: '42%', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: cap > 0.2 ? '#fff' : WATER_C.primary, letterSpacing: '-0.5px', textShadow: cap > 0.2 ? '0 2px 12px rgba(0,0,0,0.5)' : 'none' }}>{Math.round(Math.max(0, Math.min(animProg, 1)) * 100)}%</div>
        <div style={{ fontSize: 13, color: cap > 0.2 ? 'rgba(255,255,255,0.85)' : WATER_C.primary, marginTop: 2, textShadow: cap > 0.2 ? '0 1px 6px rgba(0,0,0,0.5)' : 'none' }}>
          {unit === 'cup' ? `${(total / 250).toFixed(1)} / ${(goal / 250).toFixed(0)} ст.` : `${total} / ${goal} мл`}
        </div>
      </div>
    </div>
  )
}

// ─── HELPER BUTTON STYLES ─────────────────────────────────────────────────────
function stepperBtnStyle(plus: boolean): React.CSSProperties {
  return {
    width: 54, height: 54, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
    background: plus ? `linear-gradient(135deg,${WATER_C.primary},${WATER_C.primaryDeep})` : C.s1,
    border: plus ? 'none' : `1px solid ${C.border}`,
    color: '#fff', fontSize: 28, fontWeight: 300, lineHeight: '1',
    boxShadow: plus ? `0 4px 16px ${WATER_C.glow}` : 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

function quickBtnStyle(): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
    padding: '14px 6px', borderRadius: 18, cursor: 'pointer',
    background: 'rgba(95,184,232,0.06)',
    border: '1px solid rgba(95,184,232,0.18)',
    transition: 'transform 0.15s, background 0.2s',
  }
}

function dayActionBtnStyle(primary?: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '12px 8px', borderRadius: 14, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: 'none',
    background: primary ? `linear-gradient(135deg,${WATER_C.primary},${WATER_C.primaryDeep})` : 'rgba(95,184,232,0.1)',
    ...(primary ? {} : { border: '1px solid rgba(95,184,232,0.2)' }),
    color: primary ? '#fff' : WATER_C.primary,
    boxShadow: primary ? `0 4px 14px ${WATER_C.glow}` : 'none',
  }
}

// ─── WATER CUSTOM SHEET ───────────────────────────────────────────────────────
function WaterCustomSheet({ onClose, onAdd, initial }: { onClose: () => void; onAdd: (ml: number) => void; initial?: number }) {
  const [val, setVal] = useState(initial || 250)
  const [pulse, setPulse] = useState(false)

  const bump = (delta: number) => {
    setVal(v => Math.round(Math.max(50, Math.min(3000, (v || 0) + delta)) / 10) * 10)
    setPulse(true)
    setTimeout(() => setPulse(false), 200)
  }

  const presets = [200, 250, 300, 500, 750]

  const sheet = (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 300, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', marginLeft: -215, width: '100%', maxWidth: 430,
        background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 301,
        animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.s3 }} />
        </div>
        <div style={{ padding: '12px 22px 22px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Свой объём</div>
          <div style={{ fontSize: 13, color: C.textMute, marginBottom: 22 }}>Сколько воды добавить</div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
            background: `radial-gradient(ellipse 100% 100% at 50% 50%, rgba(95,184,232,0.08), transparent 70%)`,
            borderRadius: 24, padding: '18px 8px', marginBottom: 18,
            border: '1px solid rgba(95,184,232,0.12)',
          }}>
            <button onClick={() => bump(-50)} style={stepperBtnStyle(false)}>−</button>
            <div style={{ textAlign: 'center', minWidth: 140, transform: pulse ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: WATER_C.primary, lineHeight: 1, letterSpacing: '-1px', textShadow: `0 0 30px ${WATER_C.glow}` }}>{val}</div>
              <div style={{ fontSize: 13, color: C.textSub, marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>мл</div>
            </div>
            <button onClick={() => bump(50)} style={stepperBtnStyle(true)}>+</button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 22 }}>
            {presets.map(v => (
              <button key={v} onClick={() => setVal(v)} style={{
                padding: '9px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: val === v ? 'rgba(95,184,232,0.18)' : C.s1,
                border: val === v ? `1px solid ${WATER_C.primary}` : `1px solid ${C.border}`,
                color: val === v ? WATER_C.primary : C.textSub,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{v} мл</button>
            ))}
          </div>

          <button onClick={() => { if (val > 0) { onAdd(val); onClose() } }} style={{
            width: '100%', padding: '15px', borderRadius: 18, border: 'none', cursor: val ? 'pointer' : 'default',
            background: val ? `linear-gradient(135deg,${WATER_C.primary},${WATER_C.primaryDeep})` : C.s1,
            color: val ? 'white' : C.textMute, fontSize: 16, fontWeight: 700,
            boxShadow: val ? `0 6px 24px ${WATER_C.glow}` : 'none',
          }}>Добавить</button>
        </div>
      </div>
    </>
  )
  return ReactDOM.createPortal(sheet, document.body)
}

// ─── WATER DAY EDIT SHEET ─────────────────────────────────────────────────────
function WaterDayEditSheet({ date, entries, onClose, onAdd, onRemove }: {
  date: Date
  entries: { amount: number; time: number }[]
  onClose: () => void
  onAdd: (ml: number) => void
  onRemove: (idx: number) => void
}) {
  const [showCustom, setShowCustom] = useState(false)
  const total = entries.reduce((a, b) => a + b.amount, 0)
  const dateLabel = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  const sheet = (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 250, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', marginLeft: -215, width: '100%', maxWidth: 430,
        background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 251,
        animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.s3 }} />
        </div>
        <div style={{ padding: '12px 22px 0' }}>
          <div style={{ fontSize: 11, color: C.textMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dateLabel}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4, marginBottom: 18 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{(total / 1000).toFixed(2)}</div>
            <div style={{ fontSize: 14, color: C.textSub, fontWeight: 600 }}>литра</div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 22px' }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMute, fontSize: 13 }}>В этот день записей нет</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {entries.slice().sort((a, b) => a.time - b.time).map((e, i) => {
                const t = new Date(e.time)
                const tStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: 'rgba(95,184,232,0.06)', borderRadius: 12,
                    border: '1px solid rgba(95,184,232,0.1)',
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(95,184,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={WATER_C.primary}><path d="M12 2.7L6.2 9.9A7 7 0 1 0 17.8 9.9L12 2.7z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{e.amount} мл</div>
                      <div style={{ fontSize: 11, color: C.textMute }}>{tStr}</div>
                    </div>
                    <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={{ padding: '14px 22px 4px', display: 'flex', gap: 8 }}>
          <button onClick={() => onAdd(250)} style={dayActionBtnStyle()}>+ 250 мл</button>
          <button onClick={() => onAdd(500)} style={dayActionBtnStyle()}>+ 500 мл</button>
          <button onClick={() => setShowCustom(true)} style={dayActionBtnStyle(true)}>+ Свой</button>
        </div>
      </div>
      {showCustom && <WaterCustomSheet onClose={() => setShowCustom(false)} onAdd={ml => onAdd(ml)} initial={250} />}
    </>
  )
  return ReactDOM.createPortal(sheet, document.body)
}

// ─── WATER GOAL SHEET ─────────────────────────────────────────────────────────
function WaterGoalSheet({ goal, unit, reminders, onSave, onClose, onRemindersChange, onUnitChange }: {
  goal: number; unit: string; reminders: boolean
  onSave: (g: number) => void; onClose: () => void
  onRemindersChange: (v: boolean) => void; onUnitChange: (v: string) => void
}) {
  const [g, setG] = useState(goal)
  const [u, setU] = useState(unit)
  const sliderRef = useRef<HTMLDivElement>(null)
  const min = 500, max = 5000, step = 100
  const pct = (g - min) / (max - min)

  const handleSlide = (clientX: number) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const r = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + r * (max - min)
    setG(Math.max(min, Math.min(max, Math.round(raw / step) * step)))
  }
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    handleSlide(e.clientX)
    const move = (ev: PointerEvent) => handleSlide(ev.clientX)
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const sheet = (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 250, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', marginLeft: -215, width: '100%', maxWidth: 430,
        background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 251,
        animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.s3 }} />
        </div>
        <div style={{ padding: '12px 22px 22px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Настройки воды</div>
          <div style={{ fontSize: 13, color: C.textMute, marginBottom: 22 }}>Цель, единицы и напоминания</div>

          <div style={{
            background: 'linear-gradient(135deg,rgba(95,184,232,0.10),rgba(95,184,232,0.02))',
            border: '1px solid rgba(95,184,232,0.18)', borderRadius: 22, padding: '22px 18px', marginBottom: 18,
          }}>
            <div style={{ fontSize: 11, color: C.textMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Цель в день</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 54, fontWeight: 800, color: WATER_C.primary, letterSpacing: '-1.5px', lineHeight: 1, textShadow: `0 0 30px ${WATER_C.glow}` }}>{(g / 1000).toFixed(g % 1000 ? 1 : 0)}</span>
              <span style={{ fontSize: 18, color: C.textSub, fontWeight: 600 }}>л</span>
            </div>
            <div ref={sliderRef} onPointerDown={onPointerDown} style={{ position: 'relative', height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', touchAction: 'none' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, background: C.s2 }} />
              <div style={{ position: 'absolute', left: 0, height: 6, borderRadius: 3, width: `${pct * 100}%`, background: `linear-gradient(90deg,${WATER_C.primary},${WATER_C.primaryDeep})`, boxShadow: `0 0 12px ${WATER_C.glow}` }} />
              <div style={{ position: 'absolute', left: `calc(${pct * 100}% - 14px)`, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: `3px solid ${WATER_C.primary}`, boxShadow: `0 4px 14px ${WATER_C.glow},0 0 0 6px rgba(95,184,232,0.12)` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textMute, marginTop: 6 }}>
              <span>0.5 л</span><span>2.5 л</span><span>5 л</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center' }}>
              {[1500, 2000, 2500, 3000].map(v => (
                <button key={v} onClick={() => setG(v)} style={{
                  padding: '5px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                  background: g === v ? 'rgba(95,184,232,0.2)' : C.s1,
                  border: `1px solid ${g === v ? WATER_C.primary : 'transparent'}`,
                  color: g === v ? WATER_C.primary : C.textSub, cursor: 'pointer',
                }}>{v / 1000} л</button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: C.textMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Единицы</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: C.s1, borderRadius: 14, padding: 4, border: `1px solid ${C.border}` }}>
            {[['cup', 'Стаканы'], ['ml', 'Миллилитры']].map(([v, l]) => (
              <button key={v} onClick={() => setU(v)} style={{
                flex: 1, padding: '10px', borderRadius: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: 'none',
                background: u === v ? 'rgba(95,184,232,0.18)' : 'transparent',
                color: u === v ? WATER_C.primary : C.textSub,
                boxShadow: u === v ? `inset 0 0 0 1px ${WATER_C.primary}55` : 'none',
                transition: 'all 0.2s',
              }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, padding: '4px 2px' }}>
            <div>
              <div style={{ fontSize: 15, color: C.text, fontWeight: 500 }}>Напоминания</div>
              <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>Каждые 2 часа с 9:00 до 21:00</div>
            </div>
            <div onClick={() => onRemindersChange(!reminders)} style={{ width: 48, height: 28, borderRadius: 14, cursor: 'pointer', transition: 'background 0.3s', background: reminders ? WATER_C.primary : C.s3, position: 'relative', flexShrink: 0, marginLeft: 10 }}>
              <div style={{ position: 'absolute', top: 3, left: reminders ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </div>
          </div>

          <button onClick={() => { onSave(g); onUnitChange(u); onClose() }} style={{
            width: '100%', padding: '15px', borderRadius: 18, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg,${WATER_C.primary},${WATER_C.primaryDeep})`,
            color: 'white', fontSize: 16, fontWeight: 700,
            boxShadow: `0 6px 24px ${WATER_C.glow}`,
          }}>Сохранить</button>
        </div>
      </div>
    </>
  )
  return ReactDOM.createPortal(sheet, document.body)
}

// ─── WATER SCREEN ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: C.textMute, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
)

const Pill = ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
    background: active ? C.s3 : 'transparent',
    color: active ? C.text : C.textSub, fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.2s',
  }}>{children}</button>
)

export default function WaterPage({ waterLog, setWaterLog, waterGoal, setWaterGoal, waterUnit, setWaterUnit, waterReminders, setWaterReminders, onWaterAdd, onWaterDelete }: {
  waterLog: WaterLog; setWaterLog: React.Dispatch<React.SetStateAction<WaterLog>>
  waterGoal: number; setWaterGoal: React.Dispatch<React.SetStateAction<number>>
  waterUnit: string; setWaterUnit: React.Dispatch<React.SetStateAction<string>>
  waterReminders: boolean; setWaterReminders: React.Dispatch<React.SetStateAction<boolean>>
  onWaterAdd?: (dateKey: string, amount: number) => void
  onWaterDelete?: (dateKey: string, entryId: number) => void
}) {
  const todayKey = fmtDate(new Date())
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [customOpen, setCustomOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())
  const [editDay, setEditDay] = useState<Date | null>(null)

  const todayEntries = waterLog[todayKey]?.entries || []
  const todayTotal = todayEntries.reduce((a, b) => a + b.amount, 0)
  const progress = todayTotal / waterGoal
  const dateStr = new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).toUpperCase()

  const addAmountForDate = (key: string, ml: number, date: Date) => {
    if (onWaterAdd) { onWaterAdd(key, ml); return }
    setWaterLog(l => {
      const day = l[key] || { entries: [] }
      const isToday = key === todayKey
      const t = isToday ? NOW() : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0).getTime()
      return { ...l, [key]: { entries: [...day.entries, { amount: ml, time: t }] } }
    })
  }
  const removeEntryForDate = (key: string, idx: number) => {
    const entries = waterLog[key]?.entries ?? []
    const entry = entries[idx]
    if (onWaterDelete && entry?.id) { onWaterDelete(key, entry.id); return }
    setWaterLog(l => {
      const day = l[key]
      if (!day) return l
      return { ...l, [key]: { entries: day.entries.filter((_, i) => i !== idx) } }
    })
  }
  const addAmount = (ml: number) => addAmountForDate(todayKey, ml, new Date())
  const removeEntry = (idx: number) => removeEntryForDate(todayKey, idx)

  const totalForDate = (key: string) => (waterLog[key]?.entries || []).reduce((a, b) => a + b.amount, 0)

  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d })
  const nowW = new Date(); const dimW = new Date(nowW.getFullYear(), nowW.getMonth() + 1, 0).getDate()
  const currentMonthDays = Array.from({ length: dimW }, (_, i) => new Date(nowW.getFullYear(), nowW.getMonth(), i + 1))
  const chartDays = period === 'week' ? last7 : currentMonthDays
  const chartData = chartDays.map(d => totalForDate(fmtDate(d)))
  const maxBar = Math.max(...chartData, waterGoal * 1.1, 1)
  const CHART_H = 90

  const cMo = calMonth.getMonth(), cYr = calMonth.getFullYear()
  const dim = new Date(cYr, cMo + 1, 0).getDate()
  const blank = new Date(cYr, cMo, 1).getDay()

  const streak = (() => {
    let s = 0
    const t = new Date(); t.setHours(0, 0, 0, 0)
    for (let i = 0; i < 60; i++) {
      const d = new Date(t); d.setDate(t.getDate() - i)
      if (totalForDate(fmtDate(d)) >= waterGoal) s++; else break
    }
    return s
  })()

  const formatAmount = (ml: number) => waterUnit === 'cup' ? `${(ml / 250).toFixed(1)} ст.` : `${ml} мл`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 14px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: C.textMute, letterSpacing: '0.1em', marginBottom: 4 }}>{dateStr}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Вода</h1>
          <button onClick={() => setSettingsOpen(true)} style={{ width: 36, height: 36, borderRadius: '50%', background: C.s2, border: `1px solid ${C.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        {/* Glass */}
        <GlassCard style={{
          padding: '16px 16px 20px', marginBottom: 14,
          background: `radial-gradient(ellipse 100% 70% at 50% 100%, ${WATER_C.bgGlow} 0%, transparent 60%), rgba(255,255,255,0.025)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <WaterWaveGlass progress={progress} total={todayTotal} goal={waterGoal} unit={waterUnit} />
          </div>
          {streak > 0 && (
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: WATER_C.primary, background: 'rgba(95,184,232,0.12)', padding: '4px 12px', borderRadius: 12, border: '1px solid rgba(95,184,232,0.25)' }}>
                💧 {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд
              </span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
            <button onClick={() => addAmount(250)} style={quickBtnStyle()}>
              <svg width="22" height="26" viewBox="0 0 24 28" fill="none"><path d="M5 6 L7 24 Q7.3 26 9.3 26 L14.7 26 Q16.7 26 17 24 L19 6 Z" fill="rgba(95,184,232,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" /><ellipse cx="12" cy="6" rx="7" ry="1.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" /></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 5 }}>250 мл</span>
              <span style={{ fontSize: 10, color: C.textMute }}>стакан</span>
            </button>
            <button onClick={() => addAmount(500)} style={quickBtnStyle()}>
              <svg width="22" height="26" viewBox="0 0 22 28" fill="none"><path d="M7 4 L7 7 Q5 8 5 11 L5 24 Q5 26 7 26 L15 26 Q17 26 17 24 L17 11 Q17 8 15 7 L15 4 Z" fill="rgba(95,184,232,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" /><rect x="7" y="2" width="8" height="3" rx="1" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" /></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 5 }}>500 мл</span>
              <span style={{ fontSize: 10, color: C.textMute }}>бутылка</span>
            </button>
            <button onClick={() => setCustomOpen(true)} style={quickBtnStyle()}>
              <svg width="22" height="26" viewBox="0 0 24 28" fill="none"><circle cx="12" cy="14" r="9" fill="rgba(95,184,232,0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" /><line x1="12" y1="10" x2="12" y2="18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /><line x1="8" y1="14" x2="16" y2="14" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 5 }}>Свой</span>
              <span style={{ fontSize: 10, color: C.textMute }}>объём</span>
            </button>
          </div>
        </GlassCard>

        {/* Today's entries */}
        {todayEntries.length > 0 && (
          <GlassCard style={{ padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <SectionLabel>Сегодня · {todayEntries.length}</SectionLabel>
              <span style={{ fontSize: 12, color: WATER_C.primary, fontWeight: 600 }}>{formatAmount(todayTotal)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {todayEntries.slice().reverse().map((e, i) => {
                const realIdx = todayEntries.length - 1 - i
                const t = new Date(e.time)
                const tStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(95,184,232,0.05)', borderRadius: 10, border: '1px solid rgba(95,184,232,0.08)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(95,184,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={WATER_C.primary}><path d="M12 2.7L6.2 9.9A7 7 0 1 0 17.8 9.9L12 2.7z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{formatAmount(e.amount)}</div>
                      <div style={{ fontSize: 11, color: C.textMute }}>{tStr}</div>
                    </div>
                    <button onClick={() => removeEntry(realIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        )}

        {/* History chart */}
        <GlassCard style={{ padding: '16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel>История</SectionLabel>
            <div style={{ display: 'flex', gap: 4 }}>
              <Pill active={period === 'week'} onClick={() => setPeriod('week')}>Неделя</Pill>
              <Pill active={period === 'month'} onClick={() => setPeriod('month')}>Месяц</Pill>
            </div>
          </div>
          <div style={{ position: 'relative', height: CHART_H + 18 }}>
            <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, height: CHART_H, display: 'flex', alignItems: 'flex-end', gap: period === 'week' ? 6 : 2 }}>
              {chartData.map((v, i) => {
                const isToday = chartDays[i] ? chartDays[i].toDateString() === nowW.toDateString() : false
                const goalReached = v >= waterGoal
                const barH = v > 0 ? Math.max(v / maxBar * CHART_H, 4) : 3
                const bg = isToday
                  ? `linear-gradient(180deg,${WATER_C.primary},${WATER_C.primaryDeep})`
                  : goalReached
                    ? 'linear-gradient(180deg,rgba(95,184,232,0.85),rgba(95,184,232,0.35))'
                    : v > 0 ? 'linear-gradient(180deg,rgba(95,184,232,0.35),rgba(95,184,232,0.10))' : C.s1
                const sloshDurs = [1.9, 2.3, 1.6, 2.7, 2.1, 1.8, 2.5, 2.0, 1.7, 2.4]
                const sloshDelays = [0, 0.45, 0.9, 0.2, 0.7, 1.2, 0.5, 1.4, 0.3, 0.8]
                const sloshAnim = i % 2 === 0 ? 'waterBarBob' : 'waterBarBob2'
                const sloshStyle = v > 0 ? {
                  animation: `${sloshAnim} ${sloshDurs[i % 10]}s ease-in-out ${sloshDelays[i % 10]}s infinite`,
                  transformOrigin: 'bottom',
                } : {}
                return (
                  <div key={i} style={{ flex: 1, height: barH, borderRadius: 4, background: bg, opacity: v <= 0 ? 0.5 : 1, transition: 'height 0.5s ease', ...sloshStyle }} />
                )
              })}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 18, display: 'flex', gap: period === 'week' ? 6 : 2 }}>
              {chartDays.map((d, i) => {
                const isToday = d.toDateString() === nowW.toDateString()
                const lbl = period === 'week' ? DAYS_SHORT[d.getDay()] : ((i + 1) % 5 === 1 ? String(i + 1) : '')
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: isToday ? WATER_C.primary : C.textMute, overflow: 'hidden' }}>{lbl}</div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: C.textMute }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 3, background: WATER_C.primary }} />сегодня</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 3, background: 'rgba(95,184,232,0.6)' }} />цель достигнута</div>
          </div>
        </GlassCard>

        {/* Calendar */}
        <GlassCard style={{ padding: '16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub, fontSize: 18, padding: '4px 8px' }}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{MONTHS_RU[cMo]} {cYr}</span>
            <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub, fontSize: 18, padding: '4px 8px' }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
            {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: C.textMute, padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
            {Array(blank).fill(null).map((_, i) => <div key={'b' + i} />)}
            {Array(dim).fill(null).map((_, i) => {
              const n = i + 1
              const d = new Date(cYr, cMo, n)
              const key = fmtDate(d)
              const t = totalForDate(key)
              const ratio = Math.min(t / waterGoal, 1)
              const td = new Date(); td.setHours(0, 0, 0, 0)
              const isToday = d.toDateString() === td.toDateString()
              const future = d > td
              return (
                <div key={n}
                  onClick={future ? undefined : () => setEditDay(new Date(cYr, cMo, n))}
                  style={{
                    aspectRatio: '1', borderRadius: 8, position: 'relative',
                    background: C.s1,
                    outline: isToday ? `1.5px solid ${WATER_C.primary}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    opacity: future ? 0.4 : 1,
                    cursor: future ? 'default' : 'pointer',
                  }}>
                  {ratio > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${ratio * 100}%`, background: `linear-gradient(180deg,rgba(95,184,232,0.85),${WATER_C.primaryDeep})` }} />}
                  <span style={{ position: 'relative', fontSize: 11, fontWeight: isToday ? 700 : 500, color: ratio > 0.4 ? '#fff' : C.textSub }}>{n}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {customOpen && <WaterCustomSheet onClose={() => setCustomOpen(false)} onAdd={addAmount} />}
      {settingsOpen && <WaterGoalSheet goal={waterGoal} unit={waterUnit} reminders={waterReminders}
        onSave={setWaterGoal} onUnitChange={setWaterUnit} onRemindersChange={setWaterReminders}
        onClose={() => setSettingsOpen(false)} />}
      {editDay && (() => {
        const k = fmtDate(editDay)
        const dayEntries = waterLog[k]?.entries || []
        return (
          <WaterDayEditSheet date={editDay} entries={dayEntries}
            onAdd={ml => addAmountForDate(k, ml, editDay)}
            onRemove={idx => removeEntryForDate(k, idx)}
            onClose={() => setEditDay(null)} />
        )
      })()}
    </div>
  )
}
