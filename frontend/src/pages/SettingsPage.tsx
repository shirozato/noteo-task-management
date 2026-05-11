import React, { useState, useRef } from 'react'
import { C } from '../tokens'
import { GlassCard, SheetHandle } from '../components/ui'
import { createPortal } from 'react-dom'
import type { User } from '../types'

const AVATAR_EMOJIS = ['🐬','🦁','🐺','🦊','🐻','🐼','🦋','🌙','⭐','🔥','💎','🌊','🌸','🍀','⚡','🎯','🚀','🎨','🎵','🌈']
const AVATAR_COLORS = ['#c49a5a','#9ab260','#5cb090','#5ca8c0','#7099d8','#a080d0','#c8809a','#ef7060']

interface SettingsProps {
  user: User
  theme: 'dark' | 'light'
  waterGoal: number
  onClose: () => void
  onSaveUser: (u: User) => void
  onThemeChange: (t: 'dark' | 'light') => void
  onWaterGoalChange: (v: number) => void
}

function AvatarPicker({ current, onSelect, onClose }: { current: string; onSelect: (e: string) => void; onClose: () => void }) {
  const [sel, setSel] = useState(current)
  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 300, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto',
        width: '100%', maxWidth: 430, background: 'var(--c-sheet)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTop: `1px solid ${C.borderHi}`,
        zIndex: 301, animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
      }}>
        <SheetHandle />
        <div style={{ padding: '4px 20px 16px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 16 }}>Выбор аватара</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
            {AVATAR_EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => setSel(emoji)} style={{
                aspectRatio: '1', borderRadius: 16, border: sel === emoji ? '2px solid #c49a5a' : '2px solid transparent',
                background: sel === emoji ? 'rgba(196,154,90,0.12)' : C.s1, cursor: 'pointer',
                fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>{emoji}</button>
            ))}
          </div>
          <button onClick={() => { onSelect(sel); onClose() }} style={{
            width: '100%', padding: '14px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#c49a5a,#a07040)', color: 'white', fontSize: 15, fontWeight: 700,
            boxShadow: '0 4px 18px rgba(196,154,90,0.25)',
          }}>Выбрать</button>
        </div>
      </div>
    </>,
    document.body
  )
}

function SettingsRow({ icon, label, children, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', transition: 'background 0.15s' }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: C.s2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.textSub }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: C.text, fontWeight: 500 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: C.textMute, marginTop: 1 }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      width: 48, height: 28, borderRadius: 14, cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
      background: on ? '#c49a5a' : 'rgba(255,255,255,0.12)', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 22, height: 22,
        borderRadius: '50%', background: on ? '#0d0d0d' : 'white',
        transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

export default function SettingsPage({ user, theme, waterGoal, onClose, onSaveUser, onThemeChange, onWaterGoalChange }: SettingsProps) {
  const [name, setName] = useState(user.name)
  const [avatarEmoji, setAvatarEmoji] = useState(user.avatar || '')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const nameRef = useRef<HTMLInputElement>(null)

  const initials = (name || 'U').slice(0, 2).toUpperCase()
  const avatarColor = user.avatarColor || '#c49a5a'

  const saveName = () => {
    if (name.trim()) {
      onSaveUser({ ...user, name: name.trim(), avatar: avatarEmoji || undefined })
    }
    setEditingName(false)
  }

  const saveAvatar = (emoji: string) => {
    setAvatarEmoji(emoji)
    onSaveUser({ ...user, avatar: emoji })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: C.s2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Настройки</h1>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {/* Profile card */}
        <GlassCard style={{ padding: '20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowAvatarPicker(true)} style={{
                width: 68, height: 68, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                background: avatarEmoji ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg,${avatarColor},${avatarColor}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: avatarEmoji ? 32 : 22, fontWeight: 800, color: 'white',
                boxShadow: `0 4px 16px ${avatarColor}40`, border: `2px solid ${avatarColor}60`,
                transition: 'all 0.2s',
              }}>
                {avatarEmoji || initials}
              </div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0, width: 22, height: 22,
                borderRadius: '50%', background: '#c49a5a', border: `2px solid var(--c-sheet)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }} onClick={() => setShowAvatarPicker(true)}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 2 }}>{name || 'Без имени'}</div>
              <div style={{ fontSize: 13, color: C.textSub }}>{user.email}</div>
            </div>
          </div>

          {/* Name edit */}
          <div>
            <div style={{ fontSize: 12, color: C.textMute, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Имя</div>
            {editingName ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: C.s2, border: `1px solid ${C.borderHi}`, borderRadius: 12, padding: '11px 14px' }}>
                  <input
                    ref={nameRef}
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveName()}
                    autoFocus
                    style={{ fontSize: 15, color: C.text, width: '100%' }}
                  />
                </div>
                <button onClick={saveName} style={{
                  padding: '11px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#c49a5a,#a07040)', color: 'white', fontSize: 14, fontWeight: 600,
                }}>Сохранить</button>
              </div>
            ) : (
              <div onClick={() => setEditingName(true)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 15, color: C.text }}>{name || 'Нажмите чтобы изменить'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Theme */}
        <div style={{ fontSize: 12, color: C.textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>Оформление</div>
        <GlassCard style={{ marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '4px 0' }}>
            <SettingsRow
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>}
              label="Светлая тема"
              sublabel={theme === 'light' ? 'Включена' : 'Выключена'}
            >
              <Toggle on={theme === 'light'} onToggle={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} />
            </SettingsRow>
          </div>
          {/* Theme preview */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
            {(['dark', 'light'] as const).map(t => (
              <div key={t} onClick={() => onThemeChange(t)} style={{
                flex: 1, borderRadius: 14, border: theme === t ? '2px solid #c49a5a' : `2px solid ${C.border}`,
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: theme === t ? '0 4px 16px rgba(196,154,90,0.2)' : 'none',
              }}>
                <div style={{ background: t === 'dark' ? '#0d0d0d' : '#f0f0f4', padding: '10px 12px' }}>
                  <div style={{ width: '60%', height: 6, borderRadius: 3, background: t === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', marginBottom: 6 }} />
                  <div style={{ width: '40%', height: 4, borderRadius: 2, background: t === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                  <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                    {['#c49a5a','#a080d0','#5cb090'].map(c => (
                      <div key={c} style={{ width: 14, height: 14, borderRadius: 5, background: c, opacity: 0.8 }} />
                    ))}
                  </div>
                </div>
                <div style={{ background: t === 'dark' ? '#161616' : '#ffffff', padding: '6px 12px', borderTop: t === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                    {t === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Water goal */}
        <div style={{ fontSize: 12, color: C.textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>Трекер воды</div>
        <GlassCard style={{ marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 12 }}>Дневная цель</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[1500, 2000, 2500, 3000].map(v => (
                <button key={v} onClick={() => onWaterGoalChange(v)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
                  background: waterGoal === v ? 'rgba(95,184,232,0.15)' : C.s1,
                  border: `1px solid ${waterGoal === v ? 'rgba(95,184,232,0.4)' : C.border}`,
                  color: waterGoal === v ? '#5fb8e8' : C.textSub,
                  fontSize: 13, fontWeight: waterGoal === v ? 700 : 400,
                  transition: 'all 0.2s',
                }}>{v/1000}л</button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Notifications */}
        <div style={{ fontSize: 12, color: C.textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>Уведомления</div>
        <GlassCard style={{ marginBottom: 16, overflow: 'hidden' }}>
          <SettingsRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
            label="Напоминания"
            sublabel="Напоминать о привычках и воде"
          >
            <Toggle on={notifications} onToggle={() => setNotifications(v => !v)} />
          </SettingsRow>
        </GlassCard>

        {/* App info */}
        <div style={{ fontSize: 12, color: C.textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>О приложении</div>
        <GlassCard style={{ marginBottom: 16, overflow: 'hidden' }}>
          <SettingsRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>}
            label="Noteo"
            sublabel="Версия 1.0.0 — трекер привычек и задач"
          />
        </GlassCard>
      </div>

      {showAvatarPicker && (
        <AvatarPicker current={avatarEmoji} onSelect={saveAvatar} onClose={() => setShowAvatarPicker(false)} />
      )}
    </div>
  )
}
