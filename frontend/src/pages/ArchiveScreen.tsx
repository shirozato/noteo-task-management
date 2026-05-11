import React, { useState } from 'react'
import { C, HABIT_COLORS, NOW, DAY_MS, ARCHIVE_TTL } from '../tokens'
import { GlassCard } from '../components/ui'
import { HabitIcon } from '../components/HabitIcons'
import type { Task, Habit } from '../types'
import { apiUpdateTask, apiDeleteTask, apiUpdateHabit, apiDeleteHabit } from '../api'

export default function ArchiveScreen({ tasks, setTasks, habits, setHabits, onBack }: {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  habits: Habit[]
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>
  onBack: () => void
}) {
  const [tab, setTab] = useState<'tasks' | 'habits'>('tasks')

  const aTasks = tasks.filter(t => t.archivedAt).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0))
  const aHabits = habits.filter(h => h.archivedAt).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0))

  const restoreTask = (id: number) => {
    const t = tasks.find(x => x.id === id)
    setTasks(ts => ts.map(t => t.id === id ? { ...t, archivedAt: null } : t))
    if (t?.uid) apiUpdateTask(t.uid, { archivedAt: null }).catch(() => {})
  }
  const deleteTask = (id: number) => {
    const t = tasks.find(x => x.id === id)
    setTasks(ts => ts.filter(t => t.id !== id))
    if (t?.uid) apiDeleteTask(t.uid).catch(() => {})
  }
  const restoreHabit = (id: number) => {
    const h = habits.find(x => x.id === id)
    setHabits(hs => hs.map(h => h.id === id ? { ...h, archivedAt: null } : h))
    if (h?.uid) apiUpdateHabit(h.uid, { archivedAt: null }).catch(() => {})
  }
  const deleteHabit = (id: number) => {
    const h = habits.find(x => x.id === id)
    setHabits(hs => hs.filter(h => h.id !== id))
    if (h?.uid) apiDeleteHabit(h.uid).catch(() => {})
  }

  const daysLeft = (archivedAt: number) => Math.max(0, Math.ceil((archivedAt + ARCHIVE_TTL - NOW()) / DAY_MS))

  const TrashBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(239,96,96,0.2)', background: 'rgba(239,96,96,0.08)', color: '#ef6060', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </svg>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'slideInRight 0.28s ease' }}>
      <div style={{ padding: '24px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: C.s2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Архив</h1>
        </div>
        <div style={{ fontSize: 11, color: C.textMute, marginBottom: 12, padding: '8px 12px', background: 'rgba(196,154,90,0.08)', border: '1px solid rgba(196,154,90,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c49a5a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          Элементы хранятся 7 дней, затем удаляются автоматически
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {([['tasks', `Задачи · ${aTasks.length}`], ['habits', `Привычки · ${aHabits.length}`]] as [string, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v as 'tasks' | 'habits')} style={{
              padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: tab === v ? C.s3 : 'transparent',
              color: tab === v ? C.text : C.textSub, fontSize: 13, fontWeight: tab === v ? 600 : 400, transition: 'all 0.2s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        {tab === 'tasks' && (
          aTasks.length === 0
            ? <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMute, fontSize: 14 }}>Архив задач пуст</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aTasks.map(task => (
                <GlassCard key={task.id} style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: C.text, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>{task.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: C.textMute }}>удаление через {daysLeft(task.archivedAt!)} дн.</span>
                        {task.tags.map(tag => <span key={tag} style={{ fontSize: 10, color: C.textSub, background: C.s2, padding: '2px 6px', borderRadius: 6 }}>#{tag}</span>)}
                      </div>
                    </div>
                    <button onClick={() => restoreTask(task.id)} style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.s2, color: C.text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Восстановить</button>
                    <TrashBtn onClick={() => deleteTask(task.id)} />
                  </div>
                </GlassCard>
              ))}
            </div>
        )}
        {tab === 'habits' && (
          aHabits.length === 0
            ? <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMute, fontSize: 14 }}>Архив привычек пуст</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aHabits.map(habit => {
                const col = HABIT_COLORS[habit.color] || HABIT_COLORS.default
                return (
                  <div key={habit.id} style={{ background: col.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HabitIcon iconId={habit.icon} color="#fff" size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{habit.title}</div>
                      <div style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>удаление через {daysLeft(habit.archivedAt!)} дн.</div>
                    </div>
                    <button onClick={() => restoreHabit(habit.id)} style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.s2, color: C.text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Восстановить</button>
                    <TrashBtn onClick={() => deleteHabit(habit.id)} />
                  </div>
                )
              })}
            </div>
        )}
      </div>
    </div>
  )
}
