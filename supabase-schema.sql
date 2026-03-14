-- =========================================================
-- OKR + 업무기록 서비스 MVP
-- Supabase Schema SQL
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '사용자 최소 프로필 테이블';

-- =========================================================
-- 2. okrs
--
-- key_results: JSONB 배열로 KR을 저장
-- [{ id: uuid, title: text, target_value: numeric,
--    current_value: numeric, unit: text }]
-- =========================================================
create table if not exists public.okrs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  key_results jsonb not null default '[]',

  period_type text not null check (
    period_type in ('sprint', 'monthly', 'quarterly', 'yearly')
  ),

  start_date date not null,
  end_date date not null,

  status text not null default 'active' check (
    status in ('active', 'completed', 'archived')
  ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (end_date >= start_date)
);

comment on table public.okrs is '사용자 OKR 테이블 (KR은 key_results JSONB에 포함)';
comment on column public.okrs.key_results is
  '[{id, title, target_value, current_value, unit}] 배열';

create index if not exists idx_okrs_user_id on public.okrs(user_id);
create index if not exists idx_okrs_status on public.okrs(status);
create index if not exists idx_okrs_start_date on public.okrs(start_date);
create index if not exists idx_okrs_end_date on public.okrs(end_date);

-- =========================================================
-- 3. work_logs
-- 하루 1기록
-- =========================================================
create table if not exists public.work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  log_date date not null,

  summary text,
  done_text text,
  issue_text text,
  blocked_text text,
  decision_text text,
  learned_text text,
  tomorrow_plan_text text,
  metric_change_text text,
  feedback_text text,
  improvement_text text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, log_date)
);

comment on table public.work_logs is '날짜별 업무기록 테이블';

create index if not exists idx_work_logs_user_id on public.work_logs(user_id);
create index if not exists idx_work_logs_log_date on public.work_logs(log_date);

-- =========================================================
-- 4. todo_items
-- =========================================================
create table if not exists public.todo_items (
  id uuid primary key default gen_random_uuid(),
  work_log_id uuid not null references public.work_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  time_slot text not null check (time_slot in ('am', 'pm')),
  content text not null,
  is_done boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.todo_items is '업무기록에 속한 TODO 항목';

create index if not exists idx_todo_items_work_log_id on public.todo_items(work_log_id);
create index if not exists idx_todo_items_user_id on public.todo_items(user_id);
create index if not exists idx_todo_items_time_slot on public.todo_items(time_slot);

-- =========================================================
-- 5. work_log_krs
-- 업무기록 <-> KR 다대다 연결
--
-- kr_id: okrs.key_results JSONB 배열 안의 KR id (uuid 문자열)
--        KR은 OKR JSONB 내에 포함되므로 FK 설정 불가
-- =========================================================
create table if not exists public.work_log_krs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  work_log_id uuid not null references public.work_logs(id) on delete cascade,
  kr_id text not null,  -- okrs.key_results[].id

  created_at timestamptz not null default now(),

  unique (work_log_id, kr_id)
);

comment on table public.work_log_krs is '업무기록과 핵심 결과(KR) 연결 테이블';
comment on column public.work_log_krs.kr_id is 'okrs.key_results 배열 내 KR의 id';

create index if not exists idx_work_log_krs_user_id on public.work_log_krs(user_id);
create index if not exists idx_work_log_krs_work_log_id on public.work_log_krs(work_log_id);
create index if not exists idx_work_log_krs_kr_id on public.work_log_krs(kr_id);

-- =========================================================
-- 6. updated_at 자동 갱신 함수/트리거
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_okrs_set_updated_at on public.okrs;
create trigger trg_okrs_set_updated_at
before update on public.okrs
for each row
execute function public.set_updated_at();

drop trigger if exists trg_work_logs_set_updated_at on public.work_logs;
create trigger trg_work_logs_set_updated_at
before update on public.work_logs
for each row
execute function public.set_updated_at();

drop trigger if exists trg_todo_items_set_updated_at on public.todo_items;
create trigger trg_todo_items_set_updated_at
before update on public.todo_items
for each row
execute function public.set_updated_at();

-- =========================================================
-- 7. RLS 활성화
-- =========================================================
alter table public.profiles enable row level security;
alter table public.okrs enable row level security;
alter table public.work_logs enable row level security;
alter table public.todo_items enable row level security;
alter table public.work_log_krs enable row level security;

-- =========================================================
-- 8. 기존 정책 삭제 (재실행 안전)
-- =========================================================
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

drop policy if exists "okrs_select_own" on public.okrs;
drop policy if exists "okrs_insert_own" on public.okrs;
drop policy if exists "okrs_update_own" on public.okrs;
drop policy if exists "okrs_delete_own" on public.okrs;

drop policy if exists "work_logs_select_own" on public.work_logs;
drop policy if exists "work_logs_insert_own" on public.work_logs;
drop policy if exists "work_logs_update_own" on public.work_logs;
drop policy if exists "work_logs_delete_own" on public.work_logs;

drop policy if exists "todo_items_select_own" on public.todo_items;
drop policy if exists "todo_items_insert_own" on public.todo_items;
drop policy if exists "todo_items_update_own" on public.todo_items;
drop policy if exists "todo_items_delete_own" on public.todo_items;

drop policy if exists "work_log_krs_select_own" on public.work_log_krs;
drop policy if exists "work_log_krs_insert_own" on public.work_log_krs;
drop policy if exists "work_log_krs_update_own" on public.work_log_krs;
drop policy if exists "work_log_krs_delete_own" on public.work_log_krs;

-- =========================================================
-- 9. profiles 정책
-- =========================================================
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- =========================================================
-- 10. okrs 정책
-- =========================================================
create policy "okrs_select_own"
on public.okrs
for select
using (user_id = auth.uid());

create policy "okrs_insert_own"
on public.okrs
for insert
with check (user_id = auth.uid());

create policy "okrs_update_own"
on public.okrs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "okrs_delete_own"
on public.okrs
for delete
using (user_id = auth.uid());

-- =========================================================
-- 11. work_logs 정책
-- =========================================================
create policy "work_logs_select_own"
on public.work_logs
for select
using (user_id = auth.uid());

create policy "work_logs_insert_own"
on public.work_logs
for insert
with check (user_id = auth.uid());

create policy "work_logs_update_own"
on public.work_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "work_logs_delete_own"
on public.work_logs
for delete
using (user_id = auth.uid());

-- =========================================================
-- 12. todo_items 정책
-- =========================================================
create policy "todo_items_select_own"
on public.todo_items
for select
using (user_id = auth.uid());

create policy "todo_items_insert_own"
on public.todo_items
for insert
with check (user_id = auth.uid());

create policy "todo_items_update_own"
on public.todo_items
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "todo_items_delete_own"
on public.todo_items
for delete
using (user_id = auth.uid());

-- =========================================================
-- 13. work_log_krs 정책
-- =========================================================
create policy "work_log_krs_select_own"
on public.work_log_krs
for select
using (user_id = auth.uid());

create policy "work_log_krs_insert_own"
on public.work_log_krs
for insert
with check (user_id = auth.uid());

create policy "work_log_krs_update_own"
on public.work_log_krs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "work_log_krs_delete_own"
on public.work_log_krs
for delete
using (user_id = auth.uid());

-- =========================================================
-- 14. projects
--
-- 프로젝트 단위 관리 테이블
-- status: active(진행중) | on_hold(보류) | completed(완료) | archived(보관)
-- color: 태그·캘린더 표시용 hex 코드 (예: '#3B82F6')
-- =========================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  description text,
  color text not null default '#6B7280',  -- 기본: gray-500

  status text not null default 'active' check (
    status in ('active', 'on_hold', 'completed', 'archived')
  ),

  start_date date,
  end_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (end_date is null or start_date is null or end_date >= start_date)
);

comment on table public.projects is '프로젝트 관리 테이블';
comment on column public.projects.color is '표시용 hex 색상 코드 (예: #3B82F6)';

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_status on public.projects(status);

-- =========================================================
-- 15. work_log_projects
-- 업무기록 <-> 프로젝트 다대다 연결
-- (하나의 업무일지에 여러 프로젝트, 하나의 프로젝트에 여러 업무일지)
-- =========================================================
create table if not exists public.work_log_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  work_log_id uuid not null references public.work_logs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,

  created_at timestamptz not null default now(),

  unique (work_log_id, project_id)
);

comment on table public.work_log_projects is '업무기록과 프로젝트 연결 테이블';

create index if not exists idx_work_log_projects_user_id on public.work_log_projects(user_id);
create index if not exists idx_work_log_projects_work_log_id on public.work_log_projects(work_log_id);
create index if not exists idx_work_log_projects_project_id on public.work_log_projects(project_id);

-- =========================================================
-- 16. projects updated_at 트리거
-- =========================================================
drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- =========================================================
-- 17. projects / work_log_projects RLS 활성화
-- =========================================================
alter table public.projects enable row level security;
alter table public.work_log_projects enable row level security;

-- =========================================================
-- 18. 기존 정책 삭제 (재실행 안전)
-- =========================================================
drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

drop policy if exists "work_log_projects_select_own" on public.work_log_projects;
drop policy if exists "work_log_projects_insert_own" on public.work_log_projects;
drop policy if exists "work_log_projects_update_own" on public.work_log_projects;
drop policy if exists "work_log_projects_delete_own" on public.work_log_projects;

-- =========================================================
-- 19. projects 정책
-- =========================================================
create policy "projects_select_own"
on public.projects
for select
using (user_id = auth.uid());

create policy "projects_insert_own"
on public.projects
for insert
with check (user_id = auth.uid());

create policy "projects_update_own"
on public.projects
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "projects_delete_own"
on public.projects
for delete
using (user_id = auth.uid());

-- =========================================================
-- 20. work_log_projects 정책
-- =========================================================
create policy "work_log_projects_select_own"
on public.work_log_projects
for select
using (user_id = auth.uid());

create policy "work_log_projects_insert_own"
on public.work_log_projects
for insert
with check (user_id = auth.uid());

create policy "work_log_projects_update_own"
on public.work_log_projects
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "work_log_projects_delete_own"
on public.work_log_projects
for delete
using (user_id = auth.uid());
