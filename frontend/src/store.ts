import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, Habit, Sleep, HabitColor } from './types'
import { tasksApi, habitsApi, sleepApi } from './api'

/* ── Tasks ── */
interface TaskStore {
  tasks: Task[]
  loading: boolean
  fetch: () => Promise<void>
  add: (t: Task) => void
  toggle: (uid: string) => void
  remove: (uid: string) => void
  update: (uid: string, p: Partial<Task>) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [
        { uid: 'demo-1', title: 'Утренняя зарядка', is_completed: false, priority: 'high', created_at: new Date().toISOString() },
        { uid: 'demo-2', title: 'Прочитать 20 страниц', is_completed: false, priority: 'medium', created_at: new Date().toISOString() },
        { uid: 'demo-3', title: 'Медитация 10 минут', is_completed: true, priority: 'medium', created_at: new Date().toISOString() },
        { uid: 'demo-4', title: 'Позвонить маме', is_completed: false, priority: 'low', created_at: new Date().toISOString() },
      ],
      loading: false,
      fetch: async () => {
        set({ loading: true })
        try { set({ tasks: await tasksApi.getAll(), loading: false }) }
        catch { set({ loading: false }) }
      },
      add: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),
      toggle: (uid) => {
        const task = get().tasks.find((t) => t.uid === uid)
        if (!task) return
        set((s) => ({ tasks: s.tasks.map((t) => t.uid === uid ? { ...t, is_completed: !t.is_completed } : t) }))
        tasksApi.update(uid, { is_completed: !task.is_completed }).catch(() => {})
      },
      remove: (uid) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.uid !== uid) }))
        tasksApi.remove(uid).catch(() => {})
      },
      update: (uid, p) => set((s) => ({ tasks: s.tasks.map((t) => t.uid === uid ? { ...t, ...p } : t) })),
    }),
    { name: 'noteo-tasks' }
  )
)

/* ── Habits ── */
const DEMO_HABITS: Habit[] = [
  { uid: 'h-1', title: 'Читать книгу', icon: 'book', target_count: 7, current_streak: 7, best_streak: 14, logs: [], color: 'warm' },
  { uid: 'h-2', title: 'Медитация', icon: 'meditation', target_count: 5, current_streak: 3, best_streak: 10, logs: [], color: 'teal' },
  { uid: 'h-3', title: 'Пить воду', icon: 'water', target_count: 7, current_streak: 14, best_streak: 30, logs: [{ uid: 'l-1', logged_at: new Date().toISOString() }], color: 'blue' },
  { uid: 'h-4', title: 'Бег', icon: 'run', target_count: 5, current_streak: 5, best_streak: 12, logs: [], color: 'olive' },
]

interface HabitStore {
  habits: Habit[]
  colors: Record<string, HabitColor>
  loading: boolean
  fetch: () => Promise<void>
  add: (h: Habit) => void
  remove: (uid: string) => void
  logToday: (uid: string) => void
  setColor: (uid: string, color: HabitColor) => void
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: DEMO_HABITS,
      colors: {},
      loading: false,
      fetch: async () => {
        set({ loading: true })
        try { set({ habits: await habitsApi.getAll(), loading: false }) }
        catch { set({ loading: false }) }
      },
      add: (h) => set((s) => ({ habits: [h, ...s.habits] })),
      remove: (uid) => {
        set((s) => ({ habits: s.habits.filter((h) => h.uid !== uid) }))
        habitsApi.remove(uid).catch(() => {})
      },
      logToday: (uid) => {
        const today = new Date().toISOString()
        set((s) => ({
          habits: s.habits.map((h) =>
            h.uid === uid
              ? { ...h, logs: [...h.logs, { uid: crypto.randomUUID(), logged_at: today }], current_streak: h.current_streak + 1 }
              : h
          ),
        }))
        habitsApi.log(uid).catch(() => {})
      },
      setColor: (uid, color) => set((s) => ({ colors: { ...s.colors, [uid]: color } })),
    }),
    { name: 'noteo-habits' }
  )
)

/* ── Sleep ── */
interface SleepStore {
  records: Sleep[]
  loading: boolean
  fetch: () => Promise<void>
  add: (s: Sleep) => void
  remove: (uid: string) => void
}

export const useSleepStore = create<SleepStore>()(
  persist(
    (set) => ({
      records: [],
      loading: false,
      fetch: async () => {
        set({ loading: true })
        try { set({ records: await sleepApi.getAll(), loading: false }) }
        catch { set({ loading: false }) }
      },
      add: (r) => set((s) => ({ records: [r, ...s.records] })),
      remove: (uid) => set((s) => ({ records: s.records.filter((r) => r.uid !== uid) })),
    }),
    { name: 'noteo-sleep' }
  )
)
