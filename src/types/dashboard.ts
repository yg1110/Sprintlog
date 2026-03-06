import type { TodoItem } from './todo'

export interface DashboardStats {
  loggedDays: number
  activeOkrCount: number
  completedOkrCount: number
}

export interface OkrProgress {
  id: string
  title: string
  current_value: number
  target_value: number
  unit: string
  progress: number
  status: string
}

export interface DashboardData {
  stats: DashboardStats
  okrProgressList: OkrProgress[]
  todayTodos: TodoItem[]
  tomorrowPlan: string | null
}
