import type { OKR, TodoItem, WorkLog } from "../types";
import { supabase } from "./supabase";

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // profiles 테이블에 row 생성 (이미 있으면 무시)
  if (data.user) {
    await supabase
      .from("profiles")
      .upsert({ id: data.user.id }, { onConflict: "id", ignoreDuplicates: true });
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── OKR ─────────────────────────────────────────────────────────────────────

const OKR_SELECT = "id, title, key_results, period_type, start_date, end_date, status";

export async function getOKRs(): Promise<OKR[]> {
  const { data, error } = await supabase
    .from("okrs")
    .select(OKR_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as OKR[]).map((o) => ({ ...o, key_results: o.key_results ?? [] }));
}

export async function createOKR(okr: Omit<OKR, "id">): Promise<OKR> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data, error } = await supabase
    .from("okrs")
    .insert({ ...okr, user_id: user.id })
    .select(OKR_SELECT)
    .single();
  if (error) throw error;
  return { ...(data as OKR), key_results: (data as OKR).key_results ?? [] };
}

export async function updateOKR(id: string, okr: Omit<OKR, "id">): Promise<OKR> {
  const { data, error } = await supabase
    .from("okrs")
    .update(okr)
    .eq("id", id)
    .select(OKR_SELECT)
    .single();
  if (error) throw error;
  return { ...(data as OKR), key_results: (data as OKR).key_results ?? [] };
}

export async function deleteOKR(id: string): Promise<void> {
  const { error } = await supabase.from("okrs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Work Logs ───────────────────────────────────────────────────────────────

type WorkLogRow = {
  id: string;
  log_date: string;
  summary: string | null;
  done_text: string | null;
  issue_text: string | null;
  blocked_text: string | null;
  decision_text: string | null;
  learned_text: string | null;
  tomorrow_plan_text: string | null;
  metric_change_text: string | null;
  feedback_text: string | null;
  improvement_text: string | null;
  todo_items: { id: string; time_slot: string; content: string; is_done: boolean; display_order: number }[];
  work_log_krs: { kr_id: string }[];
};

function rowToWorkLog(row: WorkLogRow): WorkLog {
  return {
    id: row.id,
    log_date: row.log_date,
    summary: row.summary ?? "",
    done_text: row.done_text ?? "",
    issue_text: row.issue_text ?? "",
    blocked_text: row.blocked_text ?? "",
    decision_text: row.decision_text ?? "",
    learned_text: row.learned_text ?? "",
    tomorrow_plan_text: row.tomorrow_plan_text ?? "",
    metric_change_text: row.metric_change_text ?? "",
    feedback_text: row.feedback_text ?? "",
    improvement_text: row.improvement_text ?? "",
    todo_items: (row.todo_items ?? []) as TodoItem[],
    kr_ids: (row.work_log_krs ?? []).map((r) => r.kr_id),
  };
}

export async function getWorkLogs(): Promise<WorkLog[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select(
      "id, log_date, summary, done_text, issue_text, blocked_text, decision_text, learned_text, tomorrow_plan_text, metric_change_text, feedback_text, improvement_text, todo_items(id, time_slot, content, is_done, display_order), work_log_krs(kr_id)",
    )
    .order("log_date", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as WorkLogRow[]).map(rowToWorkLog);
}

export async function deleteWorkLog(id: string): Promise<void> {
  const { error } = await supabase.from("work_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertWorkLog(log: WorkLog): Promise<WorkLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  // 1. work_log upsert
  const { data: logData, error: logError } = await supabase
    .from("work_logs")
    .upsert(
      {
        id: log.id,
        user_id: user.id,
        log_date: log.log_date,
        summary: log.summary,
        done_text: log.done_text,
        issue_text: log.issue_text,
        blocked_text: log.blocked_text,
        decision_text: log.decision_text,
        learned_text: log.learned_text,
        tomorrow_plan_text: log.tomorrow_plan_text,
        metric_change_text: log.metric_change_text,
        feedback_text: log.feedback_text,
        improvement_text: log.improvement_text,
      },
      { onConflict: "user_id,log_date" },
    )
    .select("id")
    .single();
  if (logError) throw logError;
  const workLogId = logData.id as string;

  // 2. todo_items 동기화 (삭제 후 재삽입)
  await supabase.from("todo_items").delete().eq("work_log_id", workLogId);
  if (log.todo_items.length > 0) {
    const { error: todoError } = await supabase.from("todo_items").insert(
      log.todo_items.map((t, i) => ({
        work_log_id: workLogId,
        user_id: user.id,
        time_slot: t.time_slot,
        content: t.content,
        is_done: t.is_done,
        display_order: i,
      })),
    );
    if (todoError) throw todoError;
  }

  // 3. work_log_krs 동기화
  await supabase.from("work_log_krs").delete().eq("work_log_id", workLogId);
  if (log.kr_ids.length > 0) {
    const { error: krLinkError } = await supabase.from("work_log_krs").insert(
      log.kr_ids.map((kr_id) => ({
        work_log_id: workLogId,
        kr_id,
        user_id: user.id,
      })),
    );
    if (krLinkError) throw krLinkError;
  }

  // 4. 최종 데이터 반환
  const { data: fullData, error: fetchError } = await supabase
    .from("work_logs")
    .select(
      "id, log_date, summary, done_text, issue_text, blocked_text, decision_text, learned_text, tomorrow_plan_text, metric_change_text, feedback_text, improvement_text, todo_items(id, time_slot, content, is_done, display_order), work_log_krs(kr_id)",
    )
    .eq("id", workLogId)
    .single();
  if (fetchError) throw fetchError;
  return rowToWorkLog(fullData as WorkLogRow);
}
