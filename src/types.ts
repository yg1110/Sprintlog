// DB schema: todo_items.time_slot
export type TimeSlot = "am" | "pm";

// DB schema: okrs.period_type
export type PeriodType = "sprint" | "monthly" | "quarterly" | "yearly";

export const PERIOD_TYPE_LABEL: Record<PeriodType, string> = {
  sprint: "주간",
  monthly: "월간",
  quarterly: "분기",
  yearly: "연간",
};

export interface TodoItem {
  id: string; // uuid (기존) 또는 임시 id (신규)
  time_slot: TimeSlot; // 'am' | 'pm'
  content: string;
  is_done: boolean;
  display_order: number;
}

export interface KeyResult {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
}

export interface WorkLog {
  id?: string; // uuid
  log_date: string; // 'yyyy-MM-dd'
  summary: string;
  done_text: string;
  issue_text: string;
  blocked_text: string;
  decision_text: string;
  learned_text: string;
  tomorrow_plan_text: string;
  metric_change_text: string;
  feedback_text: string;
  improvement_text: string;
  todo_items: TodoItem[]; // todo_items 테이블에서 join
  kr_ids: string[]; // work_log_krs 테이블에서 join (KR 단위 연결)
  project_ids: string[]; // work_log_projects 테이블에서 join
  collaborators: string[]; // 같이 일한 동료 이름 태그
}

export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "진행중",
  on_hold: "보류",
  completed: "완료",
  archived: "보관",
};

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

export interface OKR {
  id: string; // uuid
  title: string;
  key_results: KeyResult[]; // JSONB 컬럼
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "archived";
}
