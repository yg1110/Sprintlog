export type OkrStatus = 'active' | 'completed' | 'archived'
export type OkrPeriodType = 'sprint' | 'monthly' | 'quarterly' | 'yearly'

export interface Okr {
  id: string
  user_id: string
  title: string
  target_value: number
  current_value: number
  unit: string
  period_type: OkrPeriodType
  start_date: string
  end_date: string
  status: OkrStatus
  created_at: string
  updated_at: string
}

export interface OkrFormValues {
  title: string
  target_value: number
  current_value: number
  unit: string
  period_type: OkrPeriodType
  start_date: string
  end_date: string
  status: OkrStatus
}
