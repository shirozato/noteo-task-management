import { useState } from 'react'
import { useTaskStore } from '../store'
import { useHabitStore } from '../store'
import { useSleepStore } from '../store'

const GRAD_LIST = [
  'linear-gradient(135deg,#8b5cf6,#6366f1)',
  'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#14b8a6)',
  'linear-gradient(135deg,#f43f5e,#ec4899)',
]

interface SettingsRowProps {
  icon: string
  label: string
  value?: string
  onClick?: () => void
}

function SettingsRow({ icon, label, value, onClick }: SettingsRowProps) {
  return (
    <div className="settings-row" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && <span style={{ fontSize: 14, color: 'var(--muted)' }}>{value}</span>}
        {onClick && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { tasks } = useTaskStore()
  const { habits } = useHabitStore()
  const { records } = useSleepStore()
  const [gradIdx, setGradIdx] = useState(0)
  const [name] = useState('Пользователь')

  const doneTasks = tasks.filter((t) => t.is_completed).length
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0)
  const totalSleeps = records.length

  const initial = name.charAt(0).toUpperCase()
  const grad = GRAD_LIST[gradIdx]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>Твой аккаунт</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Профиль</div>
        </div>
      </div>

      <div className="scroll">
        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 28px' }}>
          <div
            className="avatar"
            style={{ background: grad, boxShadow: '0 8px 32px rgba(139,92,246,.35)', cursor: 'pointer' }}
            onClick={() => setGradIdx((i) => (i + 1) % GRAD_LIST.length)}
          >
            {initial}
          </div>
          <div style={{ marginTop: 14, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Нажми на аватар чтобы сменить цвет</div>
        </div>

        {/* Stats */}
        <div className="stat-row mb16">
          <div className="stat-card">
            <div className="stat-val">{doneTasks}</div>
            <div className="stat-lbl">Задач</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{habits.length}</div>
            <div className="stat-lbl">Привычек</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{bestStreak}</div>
            <div className="stat-lbl">🔥 Рекорд</div>
          </div>
        </div>

        {/* Settings */}
        <div className="section-title">Настройки</div>
        <div className="glass" style={{ padding: '0 16px' }}>
          <SettingsRow icon="🌙" label="Тема" value="Тёмная" />
          <SettingsRow icon="🎯" label="Цель сна" value="8 часов" onClick={() => {}} />
          <SettingsRow icon="🔔" label="Уведомления" value="Вкл" onClick={() => {}} />
          <SettingsRow icon="📊" label="Экспорт данных" onClick={() => {}} />
        </div>

        <div className="section-title mt16">Приложение</div>
        <div className="glass" style={{ padding: '0 16px' }}>
          <SettingsRow icon="📱" label="Версия" value="0.1.0" />
          <SettingsRow icon="🔒" label="Конфиденциальность" onClick={() => {}} />
          <SettingsRow icon="💬" label="Обратная связь" onClick={() => {}} />
        </div>

        {totalSleeps === 0 && doneTasks === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--muted)' }}>
            Начни использовать Noteo чтобы увидеть статистику
          </div>
        )}

        <div style={{ height: 8 }} />

        {/* Logout (decorative since auth not implemented) */}
        <button
          className="btn"
          style={{
            width: '100%', padding: '14px', borderRadius: 16, marginTop: 8,
            background: 'rgba(244,63,94,.1)', color: 'var(--rose)',
            border: '1px solid rgba(244,63,94,.2)', fontSize: 15, fontWeight: 700,
          }}
          onClick={() => alert('Аутентификация ещё в разработке')}
        >
          Выйти
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 24, paddingBottom: 8 }}>
          Noteo • Создан с ❤️
        </div>
      </div>
    </div>
  )
}
