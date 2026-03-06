export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      okrs: {
        Row: {
          id: string
          user_id: string
          title: string
          target_value: number
          current_value: number
          unit: string
          period_type: string
          start_date: string
          end_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_value: number
          current_value: number
          unit: string
          period_type: string
          start_date: string
          end_date: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_value?: number
          current_value?: number
          unit?: string
          period_type?: string
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      work_logs: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          log_date: string
          summary?: string | null
          done_text?: string | null
          issue_text?: string | null
          blocked_text?: string | null
          decision_text?: string | null
          learned_text?: string | null
          tomorrow_plan_text?: string | null
          metric_change_text?: string | null
          feedback_text?: string | null
          improvement_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          summary?: string | null
          done_text?: string | null
          issue_text?: string | null
          blocked_text?: string | null
          decision_text?: string | null
          learned_text?: string | null
          tomorrow_plan_text?: string | null
          metric_change_text?: string | null
          feedback_text?: string | null
          improvement_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todo_items: {
        Row: {
          id: string
          work_log_id: string
          user_id: string
          time_slot: string
          content: string
          is_done: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_log_id: string
          user_id: string
          time_slot: string
          content: string
          is_done?: boolean
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_log_id?: string
          user_id?: string
          time_slot?: string
          content?: string
          is_done?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      work_log_okrs: {
        Row: {
          id: string
          user_id: string
          work_log_id: string
          okr_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          work_log_id: string
          okr_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          work_log_id?: string
          okr_id?: string
          created_at?: string
        }
      }
    }
  }
}
