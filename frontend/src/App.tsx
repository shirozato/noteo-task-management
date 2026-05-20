import React, { useState, useEffect, useCallback } from 'react'
import { C, TAB_ORDER, NOW, DAY_MS, ARCHIVE_TTL } from './tokens'
import type { Task, Habit, User, TabId, WaterLog, SleepLog } from './types'
import {
  getToken, clearToken,
  apiGetMe, apiUpdateMe,
  apiGetTasks, apiCreateTask, apiUpdateTask, apiDeleteTask,
  apiGetHabits, apiCreateHabit, apiUpdateHabit, apiDeleteHabit,
  apiCompleteHabit, apiUncompleteHabit,
  apiGetSleep, apiLogSleep, apiUpdateSleep, apiDeleteSleep,
  apiGetWater, apiLogWater, apiDeleteWaterEntry,
} from './api'
import OnboardingScreen from './pages/OnboardingScreen'
import AuthScreen from './pages/AuthScreen'
import TasksPage, { AddTaskSheet } from './pages/TasksPage'
import HabitsPage from './pages/HabitsPage'
import SleepPage from './pages/SleepPage'
import WaterPage from './pages/WaterPage'
import ProfilePage from './pages/ProfilePage'
import ArchiveScreen from './pages/ArchiveScreen'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'

const TABS: { id: TabId; label: string; icon: (active: boolean, theme: 'dark' | 'light') => React.ReactElement }[] = [
  { id: 'tasks',   label: 'Задачи',   icon: (a, t) => { const s = a ? (t==='light'?'#0d0d10':'white') : (t==='light'?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.45)'); return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 11l2 2 4-4" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="16" height="16" rx="4" stroke={s} strokeWidth="1.8"/></svg> } },
  { id: 'habits',  label: 'Привычки', icon: (a, t) => { const s = a ? (t==='light'?'#0d0d10':'white') : (t==='light'?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.45)'); return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 1 0 10 10" stroke={s} strokeWidth="1.8" strokeLinecap="round"/><path d="M18 2l2 2-6 6" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> } },
  { id: 'sleep',   label: 'Сон',      icon: (a, t) => { const s = a ? (t==='light'?'#0d0d10':'white') : (t==='light'?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.45)'); return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> } },
  { id: 'water',   label: 'Вода',     icon: (a, t) => { const s = a ? (t==='light'?'#0d0d10':'white') : (t==='light'?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.45)'); return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2.7L6.2 9.9A7 7 0 1 0 17.8 9.9L12 2.7z" stroke={s} strokeWidth="1.8" strokeLinejoin="round"/></svg> } },
  { id: 'profile', label: 'Профиль',  icon: (a, t) => { const s = a ? (t==='light'?'#0d0d10':'white') : (t==='light'?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.45)'); return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={s} strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={s} strokeWidth="1.8" strokeLinecap="round"/></svg> } },
]

function TabBar({ active, onChange, theme }: { active: TabId; onChange: (t: TabId) => void; theme: 'dark' | 'light' }) {
  const [pressed, setPressed] = useState<TabId | null>(null)
  return (
    <div style={{ padding: '0 14px', paddingBottom: 'max(env(safe-area-inset-bottom,0px),18px)', flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--c-tabbar)',
        backdropFilter: 'blur(50px) saturate(200%)', WebkitBackdropFilter: 'blur(50px) saturate(200%)',
        borderRadius: 42,
        border: '1px solid var(--c-tabbar-border)',
        borderTop: '1px solid var(--c-tabbar-border-top)',
        boxShadow: '0 12px 56px var(--c-card-shadow), inset 0 1px 0 var(--c-card-inner)',
        padding: '7px', gap: '2px',
      }}>
        {TABS.map(tab => {
          const a = active === tab.id
          const p = pressed === tab.id
          return (
            <button key={tab.id}
              onClick={() => onChange(tab.id)}
              onPointerDown={() => setPressed(tab.id)}
              onPointerUp={() => setPressed(null)}
              onPointerLeave={() => setPressed(null)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '11px 4px 9px', borderRadius: 36, border: 'none', cursor: 'pointer',
                background: a ? (theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.11)') : 'transparent',
                boxShadow: a ? 'inset 0 1px 0 var(--c-card-inner), 0 2px 12px rgba(0,0,0,0.15)' : 'none',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s',
                transform: p ? 'scale(0.85)' : a ? 'scale(1.06)' : 'scale(1)',
              }}>
              <div style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', transform: a ? 'translateY(-1px)' : 'translateY(0)' }}>
                {tab.icon(a, theme)}
              </div>
              <span style={{
                fontSize: 10, fontWeight: a ? 700 : 400, letterSpacing: '0.01em',
                color: a ? C.text : (theme === 'light' ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.32)'),
                transition: 'all 0.2s', opacity: a ? 1 : 0.7,
              }}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [introDone, setIntroDone] = useState(() => !!localStorage.getItem('noteo-onboarded'))
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('tasks')
  const [animKey, setAnimKey] = useState(0)
  const [slideDir, setSlideDir] = useState(1)
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [sleepPickerOpen, setSleepPickerOpen] = useState(false)
  const [sleepLog, setSleepLog] = useState<SleepLog>({})
  const [waterLog, setWaterLog] = useState<WaterLog>({})
  const [waterGoal, setWaterGoal] = useState(2000)
  const [waterUnit, setWaterUnit] = useState('ml')
  const [waterReminders, setWaterReminders] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('noteo-theme') as 'dark' | 'light') || 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('noteo-theme', theme)
  }, [theme])

  const [showArchive, setShowArchive] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [habitAddTrigger, setHabitAddTrigger] = useState(0)

  // Load data from API after login
  const loadAllData = useCallback(async () => {
    try {
      const [t, h, s, w] = await Promise.allSettled([
        apiGetTasks(),
        apiGetHabits(),
        apiGetSleep(),
        apiGetWater(),
      ])
      if (t.status === 'fulfilled') setTasks(t.value)
      else console.error('[loadAllData] tasks:', t.reason)
      if (h.status === 'fulfilled') setHabits(h.value)
      else console.error('[loadAllData] habits:', h.reason)
      if (s.status === 'fulfilled') setSleepLog(s.value)
      else console.error('[loadAllData] sleep:', s.reason)
      if (w.status === 'fulfilled') setWaterLog(w.value)
      else console.error('[loadAllData] water:', w.reason)
    } catch (e) {
      console.error('[loadAllData] unexpected:', e)
    } finally {
      setDataLoaded(true)
    }
  }, [])

  // Try to restore session from token on mount
  useEffect(() => {
    const token = getToken()
    if (!token) { setDataLoaded(true); return }
    apiGetMe()
      .then(({ user: u, waterGoal: wg, waterUnit: wu }) => {
        setUser(u)
        setWaterGoal(wg)
        setWaterUnit(wu)
        setIntroDone(true)
        return loadAllData()
      })
      .catch(() => {
        clearToken()
        setIntroDone(true)
        setDataLoaded(true)
      })
  }, [loadAllData])

  // Auto-archive done tasks after 24h; purge archived items after 7 days
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = NOW()
      setTasks(ts => {
        const next = ts
          .map(t => (!t.archivedAt && t.done && t.doneAt && now - t.doneAt > DAY_MS)
            ? { ...t, archivedAt: now }
            : t
          )
          .filter(t => !(t.archivedAt && now - t.archivedAt > ARCHIVE_TTL))

        // Sync auto-archive to backend
        next.forEach(t => {
          const old = ts.find(x => x.id === t.id)
          if (old && t.uid && old.archivedAt !== t.archivedAt) {
            apiUpdateTask(t.uid, { archivedAt: t.archivedAt }).catch(() => {})
          }
        })
        ts.filter(t => t.uid && !next.find(n => n.id === t.id)).forEach(t => {
          if (t.uid) apiDeleteTask(t.uid).catch(() => {})
        })
        return next
      })
      setHabits(hs => {
        const next = hs.filter(h => !(h.archivedAt && now - h.archivedAt > ARCHIVE_TTL))
        hs.filter(h => h.uid && !next.find(n => n.id === h.id)).forEach(h => {
          if (h.uid) apiDeleteHabit(h.uid).catch(() => {})
        })
        return next
      })
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const handleTabChange = (t: TabId) => {
    if (t === activeTab) return
    setShowArchive(false); setShowAnalytics(false); setShowSettings(false)
    const d = TAB_ORDER.indexOf(t) - TAB_ORDER.indexOf(activeTab)
    setSlideDir(d > 0 ? 1 : -1)
    setActiveTab(t)
    setAnimKey(k => k + 1)
  }

  const handleLogin = (u: User, wg: number, wu: string) => {
    setUser(u)
    setWaterGoal(wg)
    setWaterUnit(wu)
    loadAllData()
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setTasks([])
    setHabits([])
    setSleepLog({})
    setWaterLog({})
  }

  // ─── Tasks API sync ────────────────────────────────────────────────────────

  const handleTaskAdd = async (t: Task) => {
    try {
      const created = await apiCreateTask(t)
      setTasks(ts => [...ts, created])
    } catch {
      setTasks(ts => [...ts, t])
    }
    setShowAddTask(false)
  }

  const handleTaskSave = async (t: Task) => {
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, ...t } : x))
    if (t.uid) {
      apiUpdateTask(t.uid, t).catch(() => {})
    }
    setEditingTask(null)
  }

  const handleTaskArchive = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    const now = NOW()
    setTasks(ts => ts.map(t => t.id === id ? { ...t, archivedAt: now } : t))
    if (task?.uid) {
      apiUpdateTask(task.uid, { archivedAt: now }).catch(() => {})
    }
    setEditingTask(null)
  }

  const handleTaskDelete = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    setTasks(ts => ts.filter(t => t.id !== id))
    if (task?.uid) {
      apiDeleteTask(task.uid).catch(() => {})
    }
    setEditingTask(null)
  }

  const handleTaskToggle = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newDone = !task.done
    const newDoneAt = newDone ? NOW() : null
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: newDone, doneAt: newDoneAt } : t))
    if (task.uid) {
      apiUpdateTask(task.uid, { done: newDone, doneAt: newDoneAt }).catch(() => {})
    }
  }

  // ─── Habits API sync ───────────────────────────────────────────────────────

  const handleHabitAdd = async (h: Habit) => {
    try {
      const created = await apiCreateHabit(h)
      setHabits(hs => [...hs, created])
    } catch {
      setHabits(hs => [...hs, h])
    }
  }

  const handleHabitUpdate = async (h: Habit) => {
    setHabits(hs => hs.map(x => x.id === h.id ? { ...x, ...h } : x))
    if (h.uid) {
      apiUpdateHabit(h.uid, h).catch(() => {})
    }
  }

  const handleHabitDelete = async (id: number) => {
    const habit = habits.find(h => h.id === id)
    setHabits(hs => hs.filter(h => h.id !== id))
    if (habit?.uid) {
      apiDeleteHabit(habit.uid).catch(() => {})
    }
  }

  const handleHabitToggle = async (id: number) => {
    const habit = habits.find(h => h.id === id)
    if (!habit?.uid) {
      setHabits(hs => hs.map(h => h.id === id
        ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? Math.max(0, h.streak - 1) : h.streak + 1 }
        : h
      ))
      return
    }
    try {
      if (habit.completedToday) {
        const updated = await apiUncompleteHabit(habit.uid)
        setHabits(hs => hs.map(h => h.id === id ? { ...h, ...updated } : h))
      } else {
        const updated = await apiCompleteHabit(habit.uid)
        setHabits(hs => hs.map(h => h.id === id ? { ...h, ...updated } : h))
      }
    } catch {
      // silent fallback
    }
  }

  const handleHabitArchive = async (id: number) => {
    const habit = habits.find(h => h.id === id)
    const now = NOW()
    setHabits(hs => hs.map(h => h.id === id ? { ...h, archivedAt: now } : h))
    if (habit?.uid) {
      apiUpdateHabit(habit.uid, { archivedAt: now }).catch(() => {})
    }
  }

  // ─── Sleep API sync ────────────────────────────────────────────────────────

  const handleSleepLog = async (dateKey: string, bed: string, wake: string) => {
    const existing = sleepLog[dateKey]
    if (existing?.uid) {
      setSleepLog(s => ({ ...s, [dateKey]: { ...s[dateKey], bed, wake } }))
      apiUpdateSleep(existing.uid, dateKey, bed, wake).catch(() => {})
    } else {
      setSleepLog(s => ({ ...s, [dateKey]: { bed, wake } }))
      apiLogSleep(dateKey, bed, wake)
        .then(({ uid }) => setSleepLog(s => ({ ...s, [dateKey]: { ...s[dateKey], uid } })))
        .catch(() => {})
    }
  }

  // ─── Water API sync ────────────────────────────────────────────────────────

  const handleWaterAdd = async (dateKey: string, amount: number) => {
    setWaterLog(w => {
      const existing = w[dateKey]?.entries?.[0]
      const newAmount = Math.min((existing?.amount ?? 0) + amount, 5000)
      return { ...w, [dateKey]: { entries: [{ amount: newAmount, time: existing?.time ?? Date.now(), id: existing?.id }] } }
    })
    apiLogWater(dateKey, amount)
      .then(({ id }) => {
        setWaterLog(w => {
          const existing = w[dateKey]?.entries?.[0]
          if (!existing) return w
          return { ...w, [dateKey]: { entries: [{ ...existing, id }] } }
        })
      })
      .catch(() => {})
  }

  const handleWaterDelete = async (dateKey: string, entryId: number) => {
    setWaterLog(w => {
      const next = { ...w }
      delete next[dateKey]
      return next
    })
    apiDeleteWaterEntry(entryId).catch(() => {})
  }

  // ─── Settings sync ─────────────────────────────────────────────────────────

  const handleSaveUser = async (u: User) => {
    setUser(u)
    apiUpdateMe({
      name: u.name,
      avatar: u.avatar,
      avatarColor: u.avatarColor,
    }).catch(() => {})
  }

  const handleWaterGoalChange = async (goal: number) => {
    setWaterGoal(goal)
    apiUpdateMe({ waterGoal: goal }).catch(() => {})
  }

  if (!introDone || !dataLoaded) return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: '100%', background: 'var(--c-bg)', overflow: 'hidden' }}>
      <OnboardingScreen onDone={() => {
        localStorage.setItem('noteo-onboarded', '1')
        setIntroDone(true)
      }} />
    </div>
  )

  if (!user) return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: '100%', background: 'var(--c-bg)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,90,0.1),transparent 70%)', pointerEvents: 'none' }} />
      <AuthScreen onLogin={handleLogin} />
    </div>
  )

  const anim = slideDir > 0
    ? 'slideInRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94)'
    : 'slideInLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94)'

  const liveTasks = tasks.filter(t => !t.archivedAt)
  const liveHabits = habits.filter(h => !h.archivedAt)
  const showFab = !showArchive && !showAnalytics && !showSettings &&
    ((activeTab === 'tasks' && liveTasks.length === 0) ||
     (activeTab === 'habits' && liveHabits.length === 0))

  const handleFabPress = () => {
    if (activeTab === 'tasks') setShowAddTask(true)
    else if (activeTab === 'habits') setHabitAddTrigger(t => t + 1)
  }

  return (
    <div style={{
      width: '100%', maxWidth: 430, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: theme === 'dark'
        ? 'radial-gradient(ellipse 80% 50% at 70% 5%, rgba(160,100,200,0.07) 0%,transparent 55%), radial-gradient(ellipse 70% 50% at 15% 85%, rgba(80,130,220,0.06) 0%,transparent 55%), var(--c-bg)'
        : 'radial-gradient(ellipse 90% 55% at 80% 0%, rgba(196,154,90,0.12) 0%,transparent 50%), radial-gradient(ellipse 70% 50% at 10% 90%, rgba(95,184,232,0.08) 0%,transparent 55%), var(--c-bg)',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,90,0.06),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: 80, left: -100, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(80,130,220,0.05),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {showSettings ? (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <SettingsPage
              user={user}
              theme={theme}
              waterGoal={waterGoal}
              onClose={() => setShowSettings(false)}
              onSaveUser={handleSaveUser}
              onThemeChange={setTheme}
              onWaterGoalChange={handleWaterGoalChange}
            />
          </div>
        ) : showArchive ? (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <ArchiveScreen
              tasks={tasks} setTasks={setTasks}
              habits={habits} setHabits={setHabits}
              onBack={() => setShowArchive(false)}
            />
          </div>
        ) : showAnalytics ? (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <AnalyticsPage
              habits={habits} tasks={tasks} sleepLog={sleepLog}
              waterLog={waterLog} waterGoal={waterGoal}
              onBack={() => setShowAnalytics(false)}
            />
          </div>
        ) : (
          <div key={animKey} style={{ position: 'absolute', inset: 0, overflowY: 'auto', animation: anim }}>
            {activeTab === 'tasks' && (
              <TasksPage
                tasks={tasks} setTasks={setTasks}
                onAdd={() => setShowAddTask(true)}
                onEdit={t => setEditingTask(t)}
              />
            )}
            {activeTab === 'habits' && (
              <HabitsPage
                habits={habits} setHabits={setHabits}
                externalAddTrigger={habitAddTrigger}
                onHabitAdd={handleHabitAdd}
                onHabitUpdate={handleHabitUpdate}
                onHabitDelete={handleHabitDelete}
                onHabitToggle={handleHabitToggle}
                onHabitArchive={handleHabitArchive}
              />
            )}
            {activeTab === 'sleep' && (
              <SleepPage
                onPickerToggle={setSleepPickerOpen}
                sleepLog={sleepLog}
                setSleepLog={setSleepLog}
                onSleepLog={handleSleepLog}
              />
            )}
            {activeTab === 'water' && (
              <WaterPage
                waterLog={waterLog} setWaterLog={setWaterLog}
                waterGoal={waterGoal} setWaterGoal={setWaterGoal}
                waterUnit={waterUnit} setWaterUnit={setWaterUnit}
                waterReminders={waterReminders} setWaterReminders={setWaterReminders}
                onWaterAdd={handleWaterAdd}
                onWaterDelete={handleWaterDelete}
              />
            )}
            {activeTab === 'profile' && (
              <ProfilePage
                user={user} habits={habits} tasks={tasks}
                onLogout={handleLogout}
                onOpenArchive={() => setShowArchive(true)}
                onOpenAnalytics={() => setShowAnalytics(true)}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
          </div>
        )}
      </div>

      {showAddTask && (
        <AddTaskSheet
          onClose={() => setShowAddTask(false)}
          onAdd={handleTaskAdd}
        />
      )}

      {editingTask && (
        <AddTaskSheet
          initialTask={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskSave}
          onArchive={() => handleTaskArchive(editingTask.id)}
          onDelete={() => handleTaskDelete(editingTask.id)}
          onToggleDone={() => handleTaskToggle(editingTask.id)}
        />
      )}

      {showFab && (
        <div style={{ position: 'absolute', bottom: 'calc(max(env(safe-area-inset-bottom,0px),15px) + 130px)', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <button onClick={handleFabPress} style={{
            width: 80, height: 80, borderRadius: '50%', cursor: 'pointer',
            background: 'rgba(22,22,26,0.93)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: 'rgba(255,255,255,0.9)', fontSize: 34, fontWeight: 200, lineHeight: '1',
            boxShadow: '0 8px 36px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(16px)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}
            onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
            onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onPointerLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >+</button>
        </div>
      )}

      <div style={{ position: 'relative', transition: 'opacity 0.2s', opacity: sleepPickerOpen ? 0 : 1, pointerEvents: sleepPickerOpen ? 'none' : 'auto' }}>
        <TabBar active={activeTab} onChange={handleTabChange} theme={theme} />
      </div>
    </div>
  )
}
