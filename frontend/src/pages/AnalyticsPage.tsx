import { useMemo } from 'react'
import { useTaskStore } from '../store'
import { useHabitStore } from '../store'
import { useSleepStore } from '../store'

const DAYS_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

function isLoggedToday(logs: { logged_at: string }[]) {
  const today = new Date().toDateString()
  return logs.some((l) => new Date(l.logged_at).toDateString() === today)
}

export function AnalyticsPage() {
  const { tasks } = useTaskStore()
  const { habits } = useHabitStore()
  const { records } = useSleepStore()

  const doneTasks = tasks.filter((t) => t.is_completed).length
  const totalTasks = tasks.length
  const taskRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0)
  const todayHabits = habits.filter((h) => isLoggedToday(h.logs)).length

  const avgSleep = useMemo(() => {
    const week: number[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i)
      const rec = records.find((r) => new Date(r.bed_time).toDateString() === d.toDateString())
      if (rec?.rise_time) {
        const b = new Date(rec.bed_time), r = new Date(rec.rise_time)
        week.push(Math.max(0, (r.getTime() - b.getTime()) / 3600000))
      }
    }
    return week.length ? week.reduce((a, b) => a + b, 0) / week.length : 0
  }, [records])

  const weekHabits = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i))
      const done = habits.filter((h) => h.logs.some((l) => new Date(l.logged_at).toDateString() === d.toDateString())).length
      return { day: DAYS_SHORT[d.getDay()], done, total: habits.length }
    })
  }, [habits])

  const weekTasks = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i))
      const dayStr = d.toDateString()
      const done = tasks.filter((t) => t.is_completed && new Date(t.created_at).toDateString() === dayStr).length
      const total = tasks.filter((t) => new Date(t.created_at).toDateString() === dayStr).length
      return { day: DAYS_SHORT[d.getDay()], done, total }
    })
  }, [tasks])

  const maxHabitDone = Math.max(...weekHabits.map((d) => d.done), 1)
  const maxTaskDone = Math.max(...weekTasks.map((d) => d.total), 1)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>Твои результаты</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Статистика</div>
        </div>
      </div>

      <div className="scroll">
        {/* Stats row */}
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-val">{taskRate}%</div>
            <div className="stat-lbl">Задач</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{bestStreak}</div>
            <div className="stat-lbl">🔥 Серия</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{avgSleep > 0 ? avgSleep.toFixed(1) + 'ч' : '—'}</div>
            <div className="stat-lbl">Сон</div>
          </div>
        </div>

        {/* Today summary */}
        <div className="glass mb16" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Сегодня</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Задачи выполнены', value: `${doneTasks}/${totalTasks}`, pct: taskRate / 100, color: '#8b5cf6' },
              { label: 'Привычки', value: `${todayHabits}/${habits.length}`, pct: habits.length > 0 ? todayHabits / habits.length : 0, color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: 'var(--sub)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{item.value}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--s3)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${item.pct * 100}%`,
                    background: item.color, transition: 'width 1s ease',
                    boxShadow: `0 0 8px ${item.color}66`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habits chart */}
        <div className="section-title">Привычки за неделю</div>
        <div className="glass mb16" style={{ padding: '16px 20px 12px' }}>
          <div className="bar-chart">
            {weekHabits.map((d, i) => (
              <div key={i} className="bar-col">
                <div
                  className="bar-fill"
                  style={{
                    height: `${(d.done / maxHabitDone) * 100}%`,
                    background: d.done > 0 ? 'linear-gradient(to top,#f59e0b,#f43f5e)' : 'var(--s2)',
                    animationDelay: `${i * 80}ms`,
                  }}
                />
                <span className="bar-lbl">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks chart */}
        <div className="section-title">Задачи за неделю</div>
        <div className="glass" style={{ padding: '16px 20px 12px' }}>
          <div className="bar-chart">
            {weekTasks.map((d, i) => (
              <div key={i} className="bar-col">
                <div
                  className="bar-fill"
                  style={{
                    height: `${(d.total / maxTaskDone) * 100}%`,
                    background: d.done > 0 ? 'linear-gradient(to top,#8b5cf6,#6366f1)' : 'var(--s2)',
                    animationDelay: `${i * 80}ms`,
                  }}
                />
                <span className="bar-lbl">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {habits.length === 0 && tasks.length === 0 && records.length === 0 && (
          <div className="empty" style={{ paddingTop: 32 }}>
            <div className="empty-icon">📊</div>
            <div className="empty-text">Нет данных</div>
            <div className="empty-sub">Добавь задачи и привычки — здесь появится статистика</div>
          </div>
        )}
      </div>
    </div>
  )
}
