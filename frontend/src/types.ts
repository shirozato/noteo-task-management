export type Priority = 'low' | 'medium' | 'high'
export type HabitColor = 'warm' | 'blue' | 'teal' | 'purple' | 'rose' | 'olive' | 'forest' | 'default'

export interface Task {
  uid: string
  title: string
  description?: string | null
  is_completed: boolean
  deadline?: string | null
  priority?: Priority | null
  created_at: string
}

export interface HabitLog {
  uid: string
  logged_at: string
}

export interface Habit {
  uid: string
  title: string
  icon: string
  target_count: number
  current_streak: number
  best_streak: number
  logs: HabitLog[]
  color?: HabitColor
}

export interface Sleep {
  uid: string
  bed_time: string
  rise_time?: string | null
}

export interface User {
  uid: string
  name: string
  email: string
}

export type TabId = 'tasks' | 'habits' | 'sleep' | 'analytics' | 'profile'
