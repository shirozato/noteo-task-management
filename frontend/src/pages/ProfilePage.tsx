import React from 'react'
import { C } from '../tokens'
import { GlassCard } from '../components/ui'
import type { Habit, Task, User } from '../types'

export default function ProfilePage({
  user, habits, tasks, onLogout, onOpenArchive, onOpenAnalytics, onOpenSettings,
}: {
  user: User
  habits: Habit[]
  tasks: Task[]
  onLogout: () => void
  onOpenArchive?: () => void
  onOpenAnalytics?: () => void
  onOpenSettings?: () => void
}) {
  const initials = (user.name || 'U').slice(0, 2).toUpperCase()
  const avatarColor = user.avatarColor || '#c49a5a'
  const archiveCount = tasks.filter(t => t.archivedAt).length + habits.filter(h => h.archivedAt).length

  const live = habits.filter(h => !h.archivedAt)
  const doneTasks = tasks.filter(t => t.done && !t.archivedAt).length
  const totalTasks = tasks.filter(t => !t.archivedAt).length
  const topStreak = live.reduce((max, h) => h.streak > max ? h.streak : max, 0)

  const menuItems = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="14" width="4" height="6" rx="1.5" /><rect x="10" y="9" width="4" height="11" rx="1.5" /><rect x="16" y="4" width="4" height="16" rx="1.5" /></svg>,
      label: 'Аналитика', color: '#c49a5a', action: onOpenAnalytics,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>,
      label: 'Архив', color: '#7aaad8', count: archiveCount, action: onOpenArchive,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
      label: 'Настройки', color: '#a080d0', action: onOpenSettings,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 20px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Профиль</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        {/* Profile card */}
        <GlassCard style={{ padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: user.avatar ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg,${avatarColor},${avatarColor}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: user.avatar ? 30 : 20, fontWeight: 800, color: 'white',
              boxShadow: `0 4px 16px ${avatarColor}30`,
              border: `2px solid ${avatarColor}50`,
            }}>{user.avatar || initials}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{user.name}</div>
              <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>{user.email}</div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: 'Привычки', value: live.length, sub: 'активных' },
              { label: 'Задачи', value: `${doneTasks}/${totalTasks}`, sub: 'выполнено' },
              { label: 'Серия', value: topStreak, sub: 'дней макс.' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.s1, borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{s.value}</div>
                <div style={{ fontSize: 9, color: C.textMute, marginTop: 2, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard style={{ marginBottom: 14, overflow: 'hidden' }}>
          {menuItems.map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div style={{ height: 1, background: C.border, margin: '0 16px' }} />}
              <div onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', cursor: item.action ? 'pointer' : 'default', transition: 'background 0.15s' }}
                onPointerDown={e => { if (item.action) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                onPointerUp={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                onPointerLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  {item.icon}
                </div>
                <span style={{ flex: 1, fontSize: 15, color: C.text }}>{item.label}</span>
                {(item as any).count > 0 && (
                  <span style={{ fontSize: 12, color: C.gold, background: 'rgba(196,154,90,0.12)', padding: '3px 8px', borderRadius: 8, fontWeight: 600, border: '1px solid rgba(196,154,90,0.2)' }}>
                    {(item as any).count}
                  </span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </div>
          ))}
        </GlassCard>

        <button onClick={onLogout} style={{
          width: '100%', padding: '14px', borderRadius: 16, cursor: 'pointer',
          background: 'rgba(239,96,96,0.08)', border: '1px solid rgba(239,96,96,0.2)',
          color: '#ef6060', fontSize: 15, fontWeight: 600, transition: 'all 0.2s',
        }}>Выйти из аккаунта</button>
      </div>
    </div>
  )
}
