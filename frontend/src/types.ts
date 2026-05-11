export interface Task {
  id: number
  uid?: string
  title: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  tags: string[]
  archivedAt: number | null
  doneAt: number | null
}

export interface Habit {
  id: number
  uid?: string
  title: string
  icon: string
  color: string
  streak: number
  freq: string
  days: string
  completedToday: boolean
  size: 's' | 'm' | 'l'
  wide: boolean
  archivedAt: number | null
}

export interface User {
  name: string
  email: string
  avatar?: string
  avatarColor?: string
}

export interface SleepEntry {
  bed: string
  wake: string
  uid?: string
}

export type SleepLog = Record<string, SleepEntry>

export interface WaterEntry {
  id?: number
  amount: number
  time: number
}

export type WaterLog = Record<string, { entries: WaterEntry[] }>

export type TabId = 'tasks' | 'habits' | 'sleep' | 'water' | 'profile'
