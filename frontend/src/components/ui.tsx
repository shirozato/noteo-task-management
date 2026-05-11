import React, { CSSProperties } from 'react'
import { C } from '../tokens'

export function GlassCard({ children, style, onClick }: { children: React.ReactNode; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: C.s1, border: `1px solid ${C.border}`, borderTop: `1px solid ${C.borderHi}`,
      borderRadius: 20, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      boxShadow: '0 2px 12px var(--c-card-shadow), 0 6px 28px var(--c-card-shadow), inset 0 1px 0 var(--c-card-inner)', ...style,
    }}>{children}</div>
  )
}

export function SheetHandle() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: C.s3 }} />
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: C.textMute, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  )
}

export function AddBtn({ onPress }: { onPress: () => void }) {
  return (
    <button onClick={onPress} style={{
      width: 36, height: 36, borderRadius: '50%', background: C.s2, border: `1px solid ${C.borderHi}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      color: C.text, fontSize: 20, lineHeight: '1', transition: 'transform 0.15s',
    }}
      onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
      onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >+</button>
  )
}

export function Pill({ children, active, onClick, color }: { children: React.ReactNode; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
      background: active ? (color || C.s3) : 'transparent',
      color: active ? C.text : C.textSub, fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.2s',
    }}>{children}</button>
  )
}
