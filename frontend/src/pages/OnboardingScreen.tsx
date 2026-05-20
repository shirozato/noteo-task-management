import React, { useState, useEffect, useRef } from 'react'
import { C } from '../tokens'

// ─── HABITS VISUAL (animated counter + ring fill) ─────────────────────────────
function HabitsVisual() {
  const [count, setCount] = useState(1)
  const CIRC = 427
  const TARGET = 21

  useEffect(() => {
    const dur = 1800
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setCount(Math.max(1, Math.round(e * TARGET)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // offset: 427 (empty) → 107 (75% full) as count goes 1→21
  const dashOffset = CIRC - (CIRC - 107) * (count / TARGET)

  return (
    <div style={{ position: 'relative', width: 240, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="220" height="200" viewBox="0 0 220 200" style={{ position: 'absolute', overflow: 'visible' }}>
        <defs>
          <linearGradient id="hbArc1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ab8a0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c49a5a" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="hbArc2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c49a5a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ab8a0" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="hbCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196,154,90,0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="hbGlowF" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="110" cy="100" r="88" fill="url(#hbCenter)" />
        <circle cx="110" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <circle cx="110" cy="100" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {/* Animated progress arc */}
        <circle cx="110" cy="100" r="68" fill="none" stroke="url(#hbArc1)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dashOffset}
          transform="rotate(-90 110 100)" filter="url(#hbGlowF)" />
        <circle cx="110" cy="100" r="84" fill="none" stroke="url(#hbArc2)" strokeWidth="1.5"
          strokeLinecap="round" strokeDasharray="528" strokeDashoffset="220"
          transform="rotate(-90 110 100)" />
        <g style={{ animation: 'orbit 18s linear infinite', transformOrigin: '110px 100px' }}>
          <circle cx="110" cy="32" r="5" fill="#c49a5a" opacity="0.95" filter="url(#hbGlowF)" />
        </g>
        <g style={{ animation: 'orbitRev 24s linear infinite', transformOrigin: '110px 100px' }}>
          <circle cx="110" cy="16" r="3" fill="#4ab8a0" opacity="0.7" />
        </g>
        <text x="30"  y="40"  fill="rgba(196,154,90,0.7)"  fontSize="11" style={{ animation: 'starPulse 2.8s ease-in-out 0s infinite' }}>✦</text>
        <text x="178" y="44"  fill="rgba(74,184,160,0.65)" fontSize="8"  style={{ animation: 'starPulse 2.8s ease-in-out 1s infinite' }}>✦</text>
        <text x="20"  y="158" fill="rgba(196,154,90,0.5)"  fontSize="7"  style={{ animation: 'starPulse 2.8s ease-in-out 1.8s infinite' }}>✦</text>
        <text x="186" y="162" fill="rgba(74,184,160,0.6)"  fontSize="10" style={{ animation: 'starPulse 2.8s ease-in-out 0.6s infinite' }}>✦</text>
        <text x="14"  y="100" fill="rgba(255,255,255,0.2)" fontSize="6"  style={{ animation: 'starPulse 3.2s ease-in-out 2.2s infinite' }}>✦</text>
        <text x="196" y="96"  fill="rgba(255,255,255,0.18)" fontSize="6" style={{ animation: 'starPulse 3.2s ease-in-out 1.4s infinite' }}>✦</text>
        <text x="110" y="97" textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize="52" fontWeight="900" fontFamily="Manrope,sans-serif"
          style={{ filter: 'drop-shadow(0 0 20px rgba(196,154,90,0.55))' }}>{count}</text>
        <text x="110" y="123" textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Manrope,sans-serif" letterSpacing="3">ДЕНЬ ПОДРЯД</text>
      </svg>
    </div>
  )
}

// ─── SLEEP STARFIELD — absolute overlay across entire slide ───────────────────
function SleepStarField() {
  const stars = [
    { x: '4%',  y: '5%',  r: 1.8, d: '0s',    dur: '3.4s' },
    { x: '22%', y: '2%',  r: 1.2, d: '1.2s',  dur: '2.9s' },
    { x: '48%', y: '3%',  r: 1.5, d: '0.6s',  dur: '3.7s' },
    { x: '72%', y: '5%',  r: 1.0, d: '2.1s',  dur: '3.1s' },
    { x: '91%', y: '4%',  r: 2.0, d: '0.3s',  dur: '2.7s' },
    { x: '96%', y: '18%', r: 1.3, d: '1.7s',  dur: '4.0s' },
    { x: '94%', y: '36%', r: 1.6, d: '0.9s',  dur: '3.2s' },
    { x: '97%', y: '54%', r: 1.1, d: '2.5s',  dur: '2.8s' },
    { x: '93%', y: '70%', r: 1.4, d: '0.4s',  dur: '3.5s' },
    { x: '88%', y: '84%', r: 1.7, d: '1.4s',  dur: '3.0s' },
    { x: '72%', y: '92%', r: 1.2, d: '2.8s',  dur: '2.6s' },
    { x: '52%', y: '95%', r: 1.5, d: '0.7s',  dur: '3.8s' },
    { x: '30%', y: '93%', r: 1.0, d: '1.9s',  dur: '3.3s' },
    { x: '10%', y: '88%', r: 1.3, d: '0.5s',  dur: '2.9s' },
    { x: '3%',  y: '72%', r: 1.6, d: '2.3s',  dur: '4.1s' },
    { x: '2%',  y: '52%', r: 1.1, d: '1.0s',  dur: '3.6s' },
    { x: '4%',  y: '34%', r: 1.4, d: '2.7s',  dur: '2.8s' },
    { x: '7%',  y: '16%', r: 1.9, d: '0.2s',  dur: '3.2s' },
    // Interior stars (not hugging edges)
    { x: '15%', y: '22%', r: 1.0, d: '1.5s',  dur: '4.2s' },
    { x: '35%', y: '12%', r: 1.3, d: '3.0s',  dur: '3.0s' },
    { x: '62%', y: '14%', r: 1.1, d: '0.8s',  dur: '2.9s' },
    { x: '82%', y: '24%', r: 1.4, d: '2.0s',  dur: '3.5s' },
    { x: '78%', y: '72%', r: 1.2, d: '1.3s',  dur: '3.1s' },
    { x: '18%', y: '76%', r: 1.5, d: '0.6s',  dur: '2.7s' },
    { x: '40%', y: '84%', r: 1.0, d: '2.4s',  dur: '3.9s' },
    { x: '14%', y: '48%', r: 0.9, d: '3.2s',  dur: '4.0s' },
    { x: '83%', y: '46%', r: 1.1, d: '1.8s',  dur: '3.3s' },
    { x: '56%', y: '8%',  r: 0.8, d: '0.4s',  dur: '3.6s' },
    { x: '28%', y: '60%', r: 0.9, d: '2.6s',  dur: '2.8s' },
    { x: '68%', y: '56%', r: 0.8, d: '1.1s',  dur: '4.1s' },
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.r * 2.2, height: s.r * 2.2, borderRadius: '50%',
          background: '#ffffff',
          boxShadow: `0 0 ${s.r * 5}px rgba(255,255,255,0.85)`,
          animation: `starPulse ${s.dur} ease-in-out ${s.d} infinite`,
        }} />
      ))}
    </div>
  )
}

// ─── SLEEP VISUAL (moon only — stars handled by SleepStarField overlay) ───────
function SleepVisual() {
  return (
    <div style={{ position: 'relative', width: 220, height: 220 }}>
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="moonFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f4e8d0" />
            <stop offset="100%" stopColor="#c49a5a" />
          </linearGradient>
          <filter id="moonGlowBlur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <radialGradient id="moonAmbient" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(196,154,90,0.38)" />
            <stop offset="45%" stopColor="rgba(196,154,90,0.12)" />
            <stop offset="100%" stopColor="rgba(196,154,90,0)" />
          </radialGradient>
        </defs>

        {/* Entire moon group floats gently */}
        <g style={{ animation: 'moonFloat 5s ease-in-out infinite', transformOrigin: '110px 110px' }}>
          {/* Large soft glow */}
          <circle cx="110" cy="110" r="65" fill="rgba(196,154,90,0.50)"
            filter="url(#moonGlowBlur)"
            style={{ animation: 'moonGlowAnim 3s ease-in-out infinite' }} />
          {/* Ambient halo ring */}
          <circle cx="110" cy="110" r="100" fill="url(#moonAmbient)"
            style={{ animation: 'moonGlowAnim 4s ease-in-out 1s infinite' }} />

          {/* Moon crescent */}
          <mask id="crescent">
            <rect width="220" height="220" fill="black" />
            <circle cx="110" cy="110" r="52" fill="white" />
            <circle cx="130" cy="101" r="48" fill="black" />
          </mask>
          <circle cx="110" cy="110" r="52" fill="url(#moonFill)" mask="url(#crescent)" />

          {/* Z letters — each with own staggered smooth fade+rise */}
          <text x="62" y="88" fill="white" fontSize="13" fontWeight="700" fontFamily="Manrope,sans-serif"
            style={{ animation: 'zRise1 3.6s ease-in-out 0s infinite' }}>z</text>
          <text x="78" y="70" fill="white" fontSize="18" fontWeight="700" fontFamily="Manrope,sans-serif"
            style={{ animation: 'zRise2 3.6s ease-in-out 0.55s infinite' }}>z</text>
          <text x="98" y="50" fill="white" fontSize="24" fontWeight="700" fontFamily="Manrope,sans-serif"
            style={{ animation: 'zRise3 3.6s ease-in-out 1.1s infinite' }}>z</text>
        </g>
      </svg>
    </div>
  )
}

// ─── WATER VISUAL (animated fill 0→70% + counting %) ─────────────────────────
function WaterVisual() {
  const [pct, setPct] = useState(0)
  const [sloshing, setSloshing] = useState(false)

  useEffect(() => {
    const dur = 1900
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - t, 2.2)
      setPct(Math.round(e * 70))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setSloshing(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // waterY: bottom=178, top-at-70%=83 → waterY = 178 - (pct/100)*136
  const waterY = Math.round(178 - (pct / 100) * 136)
  const waveOffset = waterY - 68 // waves are authored at y≈74, translate down by this delta

  return (
    <div style={{ position: 'relative', width: 240, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="240" height="220" viewBox="0 0 240 220" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="onbWaterFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7fcef0" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#3a9bd5" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#1a6fa8" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="onbWave2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ae0f8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5fb8e8" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="onbHalo" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(95,184,232,0.22)" />
            <stop offset="55%" stopColor="rgba(95,184,232,0.07)" />
            <stop offset="100%" stopColor="rgba(95,184,232,0)" />
          </radialGradient>
          <radialGradient id="onbSphereHighlight" cx="36%" cy="28%" r="38%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="onbSphereBase" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="rgba(10,25,45,0.55)" />
            <stop offset="100%" stopColor="rgba(5,15,30,0.80)" />
          </radialGradient>
          <clipPath id="onbCircleClip">
            <circle cx="120" cy="110" r="68" />
          </clipPath>
          <filter id="onbRimGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="onbInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ambient halo */}
        <circle cx="120" cy="110" r="102" fill="url(#onbHalo)" />

        {/* Orbiting droplets */}
        <g style={{ animation: 'orbit 12s linear 0s infinite', transformOrigin: '120px 110px' }}>
          <circle cx="196" cy="110" r="4" fill="rgba(95,184,232,0.75)" filter="url(#onbInnerGlow)" />
        </g>
        <g style={{ animation: 'orbitRev 17s linear 0s infinite', transformOrigin: '120px 110px' }}>
          <circle cx="44" cy="110" r="2.5" fill="rgba(95,184,232,0.55)" />
        </g>
        <g style={{ animation: 'orbit 22s linear 3s infinite', transformOrigin: '120px 110px' }}>
          <circle cx="120" cy="34" r="3" fill="rgba(180,230,255,0.6)" />
        </g>

        {/* Sphere base */}
        <circle cx="120" cy="110" r="68" fill="url(#onbSphereBase)" />

        {/* Water fill — animated */}
        <g clipPath="url(#onbCircleClip)">
          <rect x="40" y={waterY + 18} width="160" height={180 - waterY} fill="url(#onbWaterFill)" opacity={pct > 0 ? 0.9 : 0} />
          {pct > 2 && (
            <g style={{ transform: `translateY(${waveOffset}px)` }}>
              <path d="M40 74 Q72 62 104 74 T168 74 T232 74 V200 H40 Z"
                fill="rgba(255,255,255,0.14)"
                style={{ animation: sloshing ? 'waterSloshA 1.8s ease-in-out infinite' : 'onbWaveA 4.5s ease-in-out infinite' }} />
              <path d="M40 84 Q80 94 120 84 T200 84 T280 84 V200 H40 Z"
                fill="url(#onbWave2Grad)"
                style={{ animation: sloshing ? 'waterSloshB 2.2s ease-in-out 0.3s infinite' : 'onbWaveB 6s ease-in-out infinite' }} />
              {[{ x: 86, d: 0, r: 2.4 }, { x: 130, d: 1.8, r: 3 }, { x: 106, d: 3.2, r: 2 }, { x: 152, d: 4.8, r: 2.6 }].map((b, i) => (
                <circle key={i} cx={b.x} cy="0" r={b.r} fill="rgba(255,255,255,0.65)"
                  style={{ animation: `onbBubble ${5 + i * 0.8}s ease-in ${b.d}s infinite` }} />
              ))}
            </g>
          )}
        </g>

        {/* 3D highlight */}
        <circle cx="120" cy="110" r="68" fill="url(#onbSphereHighlight)" />

        {/* Glowing rim */}
        <circle cx="120" cy="110" r="68" fill="none" stroke="rgba(95,184,232,0.60)" strokeWidth="2" filter="url(#onbRimGlow)" />
        <circle cx="120" cy="110" r="68" fill="none" stroke="rgba(95,184,232,0.30)" strokeWidth="1" />

        {/* Animated percentage text */}
        <text x="120" y="116" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="900"
          fontFamily="Manrope,sans-serif" letterSpacing="-1.5">{pct}%</text>
        <text x="120" y="135" textAnchor="middle" fill="rgba(255,255,255,0.60)" fontSize="9"
          fontWeight="700" fontFamily="Manrope,sans-serif" letterSpacing="2.5">ОТ ЦЕЛИ</text>
      </svg>
    </div>
  )
}

// ─── OTHER VISUALS ─────────────────────────────────────────────────────────────
function Visual({ k }: { k: string }) {
  if (k === 'habits') return <HabitsVisual />
  if (k === 'sleep')  return <SleepVisual />
  if (k === 'water')  return <WaterVisual />

  if (k === 'star') return (
    <div style={{ position: 'relative', width: 240, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,90,0.22),transparent 65%)', animation: 'pulseGlow 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, animation: 'orbit 14s linear infinite' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', width: 8, height: 8, marginLeft: -4, borderRadius: '50%', background: '#c49a5a', boxShadow: '0 0 12px rgba(196,154,90,0.7)' }} />
      </div>
      <div style={{ position: 'absolute', width: 140, height: 140, animation: 'orbitRev 10s linear infinite' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 6, height: 6, marginLeft: -3, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
      </div>
      <div style={{ fontSize: 120, color: '#fff', lineHeight: 1, animation: 'popIn 0.8s cubic-bezier(0.34,1.56,0.64,1), glowPulse 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 30px rgba(196,154,90,0.4))' }}>✦</div>
    </div>
  )
  if (k === 'tasks') return (
    <div style={{ position: 'relative', width: 240, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 230 }}>
        {[
          { t: 'Утренняя зарядка', done: true, p: 'high' },
          { t: 'Прочитать главу', done: false, p: 'med' },
          { t: 'Медитация', done: false, p: 'low' },
        ].map((it, i) => {
          const pColor = it.p === 'high' ? '#ef7060' : it.p === 'med' ? '#c49a5a' : '#4ab8a0'
          return (
            <div key={i} style={{
              padding: '12px 14px', borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
              border: `1px solid rgba(255,255,255,0.08)`, borderLeft: `3px solid ${pColor}`,
              display: 'flex', alignItems: 'center', gap: 12,
              animation: `rowFly 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.18}s both`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: it.done ? pColor : 'transparent',
                border: `1.6px solid ${it.done ? pColor : 'rgba(255,255,255,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: it.done ? `0 0 12px ${pColor}88` : 'none',
              }}>
                {it.done && <svg width="10" height="8" viewBox="0 0 11 9" fill="none" style={{ animation: `checkBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.18 + 0.4}s both` }}><path d="M1 4.5l3 3 6-7" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: 13.5, color: it.done ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: it.done ? 'line-through' : 'none', flex: 1 }}>{it.t}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
  return (
    <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.6s ease' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray="439.8" strokeDashoffset="110" transform="rotate(-90 90 90)" />
        <text x="90" y="86" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800" fontFamily="Manrope,sans-serif">7ч 30м</text>
        <text x="90" y="106" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Manrope,sans-serif">Хороший</text>
      </svg>
    </div>
  )
}

const SLIDES = [
  { key: 'star',   title: 'Noteo',          subtitle: 'твой день — короче, чем кажется',  tagline: 'Привычки, задачи и сон в одном месте' },
  { key: 'habits', title: 'Строй привычки', subtitle: 'мягко и без давления',              tagline: 'Серии, напоминания и календарь — чтобы не сбиться' },
  { key: 'tasks',  title: 'Веди задачи',    subtitle: 'фокус на главном',                  tagline: 'Приоритеты, теги и чистый список на сегодня' },
  { key: 'sleep',  title: 'Следи за сном',  subtitle: 'отдых — это привычка',              tagline: 'График сна, цели и история — на одном экране' },
  { key: 'water',  title: 'Пей воду',       subtitle: 'тело скажет спасибо',               tagline: 'Цель в литрах, удобный учёт и напоминания в течение дня' },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(0)
  const cur = SLIDES[slide]
  const next = () => slide < SLIDES.length - 1 ? setSlide(slide + 1) : onDone()

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -50 && slide < SLIDES.length - 1) setSlide(s => s + 1)
    else if (dx > 50 && slide > 0) setSlide(s => s - 1)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,154,90,0.08) 0%, transparent 60%), #0d0d0d',
        animation: 'fadeIn 0.4s ease',
      }}>
      <div style={{ padding: '22px', paddingTop: 'max(env(safe-area-inset-top, 0px) + 8px, 20px)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: C.textSub, fontSize: 14, cursor: 'pointer', padding: '6px 4px' }}>
          Пропустить
        </button>
      </div>

      <div key={slide} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', animation: 'authIn 0.45s cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden' }}>
        {cur.key === 'sleep' && <SleepStarField />}
        <div style={{ marginBottom: cur.key === 'sleep' ? 20 : 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Visual k={cur.key} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.6px', marginBottom: 8, textAlign: 'center', position: 'relative', zIndex: 1 }}>{cur.title}</div>
        <div style={{ fontSize: 15, color: C.gold, marginBottom: 14, textAlign: 'center', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>{cur.subtitle}</div>
        <div style={{ fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 1.5, maxWidth: 300, position: 'relative', zIndex: 1 }}>{cur.tagline}</div>
      </div>

      <div style={{ padding: '0 28px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 16px, 36px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 3,
              width: i === slide ? 22 : 6,
              background: i === slide ? C.gold : 'rgba(255,255,255,0.18)',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
        </div>
        <button onClick={next} style={{
          width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#c49a5a,#a07040)',
          color: 'white', fontSize: 16, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(196,154,90,0.3)',
        }}>
          {slide < SLIDES.length - 1 ? 'Далее' : 'Начать'}
        </button>
      </div>
    </div>
  )
}
