import type { TodoFormItem } from './todo'

export interface WorkLog {
  id: string
  user_id: string
  log_date: string
  summary: string | null
  created_at: string
  updated_at: string
}

export interface WorkLogDetail {
  id: string
  user_id: string
  log_date: string
  summary: string | null
  done_text: string | null
  issue_text: string | null
  blocked_text: string | null
  decision_text: string | null
  learned_text: string | null
  tomorrow_plan_text: string | null
  metric_change_text: string | null
  feedback_text: string | null
  improvement_text: string | null
  created_at: string
  updated_at: string
}

export interface WorkLogFormValues {
  log_date: string
  summary: string
  okr_ids: string[]
  todos: TodoFormItem[]
  done_text: string
  issue_text: string
  blocked_text: string
  decision_text: string
  learned_text: string
  tomorrow_plan_text: string
  metric_change_text: string
  feedback_text: string
  improvement_text: string
}
