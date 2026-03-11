# Sprintlog Project Memory

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- react-router-dom v7, date-fns v4, motion (framer-motion v12), lucide-react, clsx, @supabase/supabase-js
- Supabase (connected), Vercel deploy
- Package manager: pnpm

## Supabase 설정

- .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- 클라이언트: src/lib/supabase.ts
- API 함수: src/lib/api.ts (signUp, signIn, signOut, getOKRs, createOKR, updateOKR, deleteOKR, getWorkLogs, upsertWorkLog)
- Auth 상태는 App.tsx에서 onAuthStateChange로 감지

## DB 스키마 (supabase-schema.sql)

- profiles(id uuid → auth.users)
- okrs(id uuid, user_id, title, target_value, current_value, unit, period_type, start_date, end_date, status)
  - period_type: 'sprint' | 'monthly' | 'quarterly' | 'yearly' (DB 값), UI 표시: PERIOD_TYPE_LABEL 맵 사용
  - status: 'active' | 'completed' | 'archived'
- work_logs(id uuid, user_id, log_date, summary, done_text, issue_text, blocked_text, decision_text, learned_text, tomorrow_plan_text, metric_change_text, feedback_text, improvement_text)
  - unique(user_id, log_date) → upsert 가능
- todo_items(id uuid, work_log_id, user_id, time_slot 'am'|'pm', content, is_done, display_order)
- work_log_okrs(id uuid, user_id, work_log_id, okr_id) → 다대다

## 타입 (src/types.ts)

- OKR: { id: string(uuid), title, target_value, current_value, unit, period_type: PeriodType, start_date, end_date, status }
- WorkLog: { id?: string, log_date, summary, done_text, issue_text, blocked_text, decision_text, learned_text, tomorrow_plan_text, metric_change_text, feedback_text, improvement_text, todo_items: TodoItem[], okr_ids: string[] }
- TodoItem: { id: string, time_slot: 'am'|'pm', content, is_done, display_order }
- PERIOD_TYPE_LABEL: Record<PeriodType, string> (sprint→주간, monthly→월간, quarterly→분기, yearly→연간)

## Project Structure

```
src/
  types.ts
  App.tsx                           # BrowserRouter + AppRouter (Supabase auth + state)
  index.css                         # @import "tailwindcss" + @source "../src"
  lib/
    cn.ts                           # clsx wrapper
    supabase.ts                     # createClient
    api.ts                          # Auth + OKR + WorkLog API 함수
  components/
    Layout.tsx                      # Sidebar layout, StatCard, SectionHeader, EmptyState
  features/
    auth/AuthPage.tsx               # Supabase signIn/signUp
    dashboard/DashboardPage.tsx     # Stats, OKR 달성률, 오늘 할 일
    okrs/OKRsPage.tsx               # OKR list CRUD (id: string)
    okrs/OKRModal.tsx               # OKR create/edit modal
    logs/LogsPage.tsx               # Monthly calendar (style gridTemplateColumns)
    logs/WorkLogModal.tsx           # 3탭 모달 (todo_items 배열, okr_ids: string[])
```

## Key Decisions

- Supabase Auth로 로그인, onAuthStateChange로 세션 감지
- WorkLog 저장: upsert work_log → delete+insert todo_items → delete+insert work_log_okrs
- archived OKRs는 WorkLogModal OKR 선택에서 제외
- TodoItem은 JSON 문자열이 아닌 배열 (time_slot으로 오전/오후 구분)

## Conventions

- cn() from lib/cn.ts (clsx wrapper)
- simple-import-sort enforced by ESLint
- pnpm build로 최종 확인
