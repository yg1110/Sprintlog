export type TodoTimeSlot = 'am' | 'pm'

export interface TodoItem {
  id: string
  work_log_id: string
  user_id: string
  time_slot: TodoTimeSlot
  content: string
  is_done: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface TodoFormItem {
  id?: string
  time_slot: TodoTimeSlot
  content: string
  is_done: boolean
  display_order: number
}
