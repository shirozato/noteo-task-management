import type { Task, Habit, User, SleepLog, WaterLog } from './types'

const BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'
const TOKEN_KEY = 'noteo-token'

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.detail ?? `HTTP ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data as T
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string
  token_type: string
  user: ApiUser
}

export interface ApiUser {
  uid: string
  name: string
  email: string
  avatar?: string | null
  avatar_color?: string | null
  water_goal: number
  water_unit: string
}

function apiUserToUser(u: ApiUser): User {
  return {
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    avatarColor: u.avatar_color ?? undefined,
  }
}

export async function apiRegister(name: string, email: string, password: string): Promise<{ user: User; waterGoal: number; waterUnit: string }> {
  const data = await req<AuthResponse>('POST', '/auth/register', { name, email, password }, false)
  setToken(data.access_token)
  return { user: apiUserToUser(data.user), waterGoal: data.user.water_goal, waterUnit: data.user.water_unit }
}

export async function apiLogin(email: string, password: string): Promise<{ user: User; waterGoal: number; waterUnit: string }> {
  const data = await req<AuthResponse>('POST', '/auth/login', { email, password }, false)
  setToken(data.access_token)
  return { user: apiUserToUser(data.user), waterGoal: data.user.water_goal, waterUnit: data.user.water_unit }
}

export async function apiGetMe(): Promise<{ user: User; waterGoal: number; waterUnit: string }> {
  const data = await req<ApiUser>('GET', '/users/me')
  return { user: apiUserToUser(data), waterGoal: data.water_goal, waterUnit: data.water_unit }
}

export async function apiUpdateMe(patch: {
  name?: string
  avatar?: string
  avatarColor?: string
  waterGoal?: number
  waterUnit?: string
}): Promise<User> {
  const body: Record<string, unknown> = {}
  if (patch.name !== undefined) body.name = patch.name
  if (patch.avatar !== undefined) body.avatar = patch.avatar
  if (patch.avatarColor !== undefined) body.avatar_color = patch.avatarColor
  if (patch.waterGoal !== undefined) body.water_goal = patch.waterGoal
  if (patch.waterUnit !== undefined) body.water_unit = patch.waterUnit
  const data = await req<ApiUser>('PUT', '/users/me', body)
  return apiUserToUser(data)
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

interface ApiTask {
  id: number
  uid: string
  title: string
  description: string | null
  is_completed: boolean
  deadline: string | null
  priority: string | null
  tags: string[]
  archived_at: string | null
  done_at: string | null
  created_at: string
}

function apiTaskToTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    done: t.is_completed,
    priority: (t.priority as Task['priority']) ?? 'medium',
    dueDate: t.deadline ? t.deadline.substring(0, 10) : null,
    tags: t.tags ?? [],
    archivedAt: t.archived_at ? new Date(t.archived_at).getTime() : null,
    doneAt: t.done_at ? new Date(t.done_at).getTime() : null,
    uid: t.uid,
  }
}

export async function apiGetTasks(): Promise<Task[]> {
  const data = await req<ApiTask[]>('GET', '/tasks/')
  return data.map(apiTaskToTask)
}

export async function apiCreateTask(t: Omit<Task, 'id' | 'uid'>): Promise<Task> {
  const body = {
    title: t.title,
    priority: t.priority,
    deadline: t.dueDate ? `${t.dueDate}T00:00:00Z` : null,
    tags: t.tags,
  }
  const data = await req<ApiTask>('POST', '/tasks/', body)
  return apiTaskToTask(data)
}

export async function apiUpdateTask(uid: string, patch: Partial<Task>): Promise<Task> {
  const body: Record<string, unknown> = {}
  if (patch.title !== undefined) body.title = patch.title
  if (patch.done !== undefined) {
    body.is_completed = patch.done
    body.done_at = patch.done ? new Date().toISOString() : null
  }
  if (patch.priority !== undefined) body.priority = patch.priority
  if (patch.dueDate !== undefined) body.deadline = patch.dueDate ? `${patch.dueDate}T00:00:00Z` : null
  if (patch.tags !== undefined) body.tags = patch.tags
  if (patch.archivedAt !== undefined) body.archived_at = patch.archivedAt ? new Date(patch.archivedAt).toISOString() : null
  if (patch.doneAt !== undefined) body.done_at = patch.doneAt ? new Date(patch.doneAt).toISOString() : null

  const data = await req<ApiTask>('PUT', `/tasks/${uid}`, body)
  return apiTaskToTask(data)
}

export async function apiDeleteTask(uid: string): Promise<void> {
  await req<void>('DELETE', `/tasks/${uid}`)
}

// ─── Habits ───────────────────────────────────────────────────────────────────

interface ApiHabit {
  id: number
  uid: string
  title: string
  icon: string
  color: string
  freq: string
  days: string
  size: string
  wide: boolean
  target_count: number
  current_streak: number
  best_streak: number
  completed_today: boolean
  archived_at: string | null
}

function apiHabitToHabit(h: ApiHabit): Habit {
  return {
    id: h.id,
    title: h.title,
    icon: h.icon,
    color: h.color,
    streak: h.current_streak,
    freq: h.freq,
    days: h.days,
    completedToday: h.completed_today,
    size: (h.size as Habit['size']) ?? 'm',
    wide: h.wide,
    archivedAt: h.archived_at ? new Date(h.archived_at).getTime() : null,
    uid: h.uid,
  }
}

export async function apiGetHabits(): Promise<Habit[]> {
  const data = await req<ApiHabit[]>('GET', '/habits/')
  return data.map(apiHabitToHabit)
}

export async function apiCreateHabit(h: Omit<Habit, 'id' | 'uid' | 'streak' | 'completedToday'>): Promise<Habit> {
  const body = {
    title: h.title,
    icon: h.icon,
    color: h.color,
    freq: h.freq,
    days: h.days,
    size: h.size,
    wide: h.wide,
    target_count: 7,
  }
  const data = await req<ApiHabit>('POST', '/habits/', body)
  return apiHabitToHabit(data)
}

export async function apiUpdateHabit(uid: string, patch: Partial<Habit>): Promise<Habit> {
  const body: Record<string, unknown> = {}
  if (patch.title !== undefined) body.title = patch.title
  if (patch.icon !== undefined) body.icon = patch.icon
  if (patch.color !== undefined) body.color = patch.color
  if (patch.freq !== undefined) body.freq = patch.freq
  if (patch.days !== undefined) body.days = patch.days
  if (patch.size !== undefined) body.size = patch.size
  if (patch.wide !== undefined) body.wide = patch.wide
  if (patch.archivedAt !== undefined) body.archived_at = patch.archivedAt ? new Date(patch.archivedAt).toISOString() : null

  const data = await req<ApiHabit>('PUT', `/habits/${uid}`, body)
  return apiHabitToHabit(data)
}

export async function apiDeleteHabit(uid: string): Promise<void> {
  await req<void>('DELETE', `/habits/${uid}`)
}

export async function apiCompleteHabit(uid: string): Promise<Habit> {
  const data = await req<ApiHabit>('POST', `/habits/${uid}/complete`)
  return apiHabitToHabit(data)
}

export async function apiUncompleteHabit(uid: string): Promise<Habit> {
  const data = await req<ApiHabit>('DELETE', `/habits/${uid}/complete`)
  return apiHabitToHabit(data)
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

interface ApiSleep {
  id: number
  uid: string
  bed_time: string
  rise_time: string | null
}

function isoToTimeStr(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function isoToDateStr(iso: string): string {
  return iso.substring(0, 10)
}

export async function apiGetSleep(): Promise<SleepLog> {
  const data = await req<ApiSleep[]>('GET', '/sleep/')
  const log: SleepLog = {}
  for (const s of data) {
    const dateKey = isoToDateStr(s.bed_time)
    log[dateKey] = {
      bed: isoToTimeStr(s.bed_time),
      wake: s.rise_time ? isoToTimeStr(s.rise_time) : '',
      uid: s.uid,
    }
  }
  return log
}

export async function apiLogSleep(dateKey: string, bed: string, wake: string): Promise<{ uid: string }> {
  const bedDt = new Date(`${dateKey}T${bed}:00Z`)
  let wakeDt: Date | null = null
  if (wake) {
    wakeDt = new Date(`${dateKey}T${wake}:00Z`)
    if (wakeDt <= bedDt) {
      wakeDt = new Date(wakeDt.getTime() + 24 * 60 * 60 * 1000)
    }
  }
  const body = {
    bed_time: bedDt.toISOString(),
    rise_time: wakeDt ? wakeDt.toISOString() : null,
  }
  const data = await req<ApiSleep>('POST', '/sleep/', body)
  return { uid: data.uid }
}

export async function apiUpdateSleep(uid: string, dateKey: string, bed: string, wake: string): Promise<void> {
  const bedDt = new Date(`${dateKey}T${bed}:00Z`)
  let wakeDt: Date | null = null
  if (wake) {
    wakeDt = new Date(`${dateKey}T${wake}:00Z`)
    if (wakeDt <= bedDt) {
      wakeDt = new Date(wakeDt.getTime() + 24 * 60 * 60 * 1000)
    }
  }
  const body = {
    bed_time: bedDt.toISOString(),
    rise_time: wakeDt ? wakeDt.toISOString() : null,
  }
  await req<ApiSleep>('PUT', `/sleep/${uid}`, body)
}

export async function apiDeleteSleep(uid: string): Promise<void> {
  await req<void>('DELETE', `/sleep/${uid}`)
}

// ─── Water ────────────────────────────────────────────────────────────────────

interface ApiWaterEntry {
  id: number
  uid: string
  date: string
  amount: number
  logged_at: string
}

export async function apiGetWater(): Promise<WaterLog> {
  const data = await req<ApiWaterEntry[]>('GET', '/water/')
  const log: WaterLog = {}
  for (const e of data) {
    if (!log[e.date]) log[e.date] = { entries: [] }
    log[e.date].entries.push({
      id: e.id,
      amount: e.amount,
      time: new Date(e.logged_at).getTime(),
    })
  }
  return log
}

export async function apiLogWater(dateKey: string, amount: number): Promise<{ id: number }> {
  const data = await req<ApiWaterEntry>('POST', '/water/', { date: dateKey, amount })
  return { id: data.id }
}

export async function apiDeleteWaterEntry(id: number): Promise<void> {
  await req<void>('DELETE', `/water/${id}`)
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  period: string
  score: number
  tasks_completion: number
  habits_completion: number
  avg_water_ml: number
  avg_sleep_hours: number | null
  daily: {
    date: string
    tasks_done: number
    tasks_total: number
    habits_done: number
    habits_total: number
    water_ml: number
    sleep_hours: number | null
  }[]
}

export async function apiGetAnalytics(period: 'week' | 'month' = 'week'): Promise<AnalyticsData> {
  return req<AnalyticsData>('GET', `/analytics/?period=${period}`)
}
