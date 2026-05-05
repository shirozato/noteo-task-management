import type { Task, Habit, HabitLog, Sleep } from './types'

const BASE = (import.meta as any).env?.VITE_API_URL ?? ''

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export const tasksApi = {
  getAll: () => req<Task[]>('/task/all'),
  create: (d: { title: string; description?: string; priority?: string; deadline?: string }) =>
    req<Task>('/task/', { method: 'POST', body: JSON.stringify(d) }),
  update: (uid: string, d: Partial<Pick<Task, 'title' | 'description' | 'is_completed' | 'deadline' | 'priority'>>) =>
    req<Task>(`/task/${uid}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (uid: string) => req<Task>(`/task/${uid}`, { method: 'DELETE' }),
}

export const habitsApi = {
  getAll: () => req<Habit[]>('/habit/all'),
  create: (d: { title: string; icon: string; target_count: number }) =>
    req<Habit>('/habit/', { method: 'POST', body: JSON.stringify(d) }),
  update: (uid: string, d: Partial<Pick<Habit, 'title' | 'icon' | 'target_count'>>) =>
    req<Habit>(`/habit/${uid}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (uid: string) => req<Habit>(`/habit/${uid}`, { method: 'DELETE' }),
  log: (uid: string) => req<HabitLog>(`/habit/${uid}/log`, { method: 'POST' }),
}

export const sleepApi = {
  getAll: () => req<Sleep[]>('/sleep/all'),
  create: (d: { bed_time: string; rise_time?: string }) =>
    req<Sleep>('/sleep/', { method: 'POST', body: JSON.stringify(d) }),
  update: (uid: string, d: { bed_time?: string; rise_time?: string }) =>
    req<Sleep>(`/sleep/${uid}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (uid: string) => req<Sleep>(`/sleep/${uid}`, { method: 'DELETE' }),
}
