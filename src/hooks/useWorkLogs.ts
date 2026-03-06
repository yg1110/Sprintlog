import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { WorkLog, WorkLogDetail, WorkLogFormValues } from '../types/work-log'
import type { Okr } from '../types/okr'
import { getMonthRange } from '../utils/date'
import { toastError } from '../utils/toast'

export function useWorkLogs() {
  const { user } = useAuth()
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [selectableOkrs, setSelectableOkrs] = useState<Okr[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMonthly = useCallback(async (baseDate: Date) => {
    if (!user) return
    setLoading(true)
    const { start, end } = getMonthRange(baseDate)
    const { data, error } = await supabase
      .from('work_logs')
      .select('id, user_id, log_date, summary, created_at, updated_at')
      .eq('user_id', user.id)
      .gte('log_date', start)
      .lte('log_date', end)
    setLoading(false)
    if (error) { toastError('업무기록을 불러오지 못했습니다.'); return }
    setWorkLogs((data ?? []) as WorkLog[])
  }, [user])

  const fetchSelectableOkrs = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('okrs')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
    setSelectableOkrs((data ?? []) as Okr[])
  }, [user])

  async function fetchDetail(workLogId: string): Promise<{
    detail: WorkLogDetail | null
    okrIds: string[]
    todos: import('../types/todo').TodoItem[]
  }> {
    const [logRes, todosRes, okrsRes] = await Promise.all([
      supabase.from('work_logs').select('*').eq('id', workLogId).single(),
      supabase.from('todo_items').select('*').eq('work_log_id', workLogId).order('display_order'),
      supabase.from('work_log_okrs').select('okr_id').eq('work_log_id', workLogId),
    ])
    return {
      detail: logRes.data as WorkLogDetail | null,
      okrIds: (okrsRes.data ?? []).map((r: { okr_id: string }) => r.okr_id),
      todos: (todosRes.data ?? []) as import('../types/todo').TodoItem[],
    }
  }

  async function create(values: WorkLogFormValues, baseDate: Date): Promise<boolean> {
    if (!user) return false

    const { data: logData, error: logError } = await supabase
      .from('work_logs')
      .insert([{
        user_id: user.id,
        log_date: values.log_date,
        summary: values.summary || null,
        done_text: values.done_text || null,
        issue_text: values.issue_text || null,
        blocked_text: values.blocked_text || null,
        decision_text: values.decision_text || null,
        learned_text: values.learned_text || null,
        tomorrow_plan_text: values.tomorrow_plan_text || null,
        metric_change_text: values.metric_change_text || null,
        feedback_text: values.feedback_text || null,
        improvement_text: values.improvement_text || null,
      }])
      .select('id')
      .single()

    if (logError || !logData) { toastError('업무기록 저장에 실패했습니다.'); return false }

    const workLogId = logData.id

    if (values.todos.length > 0) {
      await supabase.from('todo_items').insert(
        values.todos.map((t, i) => ({
          work_log_id: workLogId,
          user_id: user.id,
          time_slot: t.time_slot,
          content: t.content,
          is_done: t.is_done,
          display_order: i,
        }))
      )
    }

    if (values.okr_ids.length > 0) {
      await supabase.from('work_log_okrs').insert(
        values.okr_ids.map((okrId) => ({
          user_id: user.id,
          work_log_id: workLogId,
          okr_id: okrId,
        }))
      )
    }

    await fetchMonthly(baseDate)
    return true
  }

  async function update(workLogId: string, values: WorkLogFormValues, baseDate: Date): Promise<boolean> {
    if (!user) return false

    const { error: logError } = await supabase
      .from('work_logs')
      .update({
        summary: values.summary || null,
        done_text: values.done_text || null,
        issue_text: values.issue_text || null,
        blocked_text: values.blocked_text || null,
        decision_text: values.decision_text || null,
        learned_text: values.learned_text || null,
        tomorrow_plan_text: values.tomorrow_plan_text || null,
        metric_change_text: values.metric_change_text || null,
        feedback_text: values.feedback_text || null,
        improvement_text: values.improvement_text || null,
      })
      .eq('id', workLogId)
      .eq('user_id', user.id)

    if (logError) { toastError('업무기록 수정에 실패했습니다.'); return false }

    await supabase.from('todo_items').delete().eq('work_log_id', workLogId)
    await supabase.from('work_log_okrs').delete().eq('work_log_id', workLogId)

    if (values.todos.length > 0) {
      await supabase.from('todo_items').insert(
        values.todos.map((t, i) => ({
          work_log_id: workLogId,
          user_id: user.id,
          time_slot: t.time_slot,
          content: t.content,
          is_done: t.is_done,
          display_order: i,
        }))
      )
    }

    if (values.okr_ids.length > 0) {
      await supabase.from('work_log_okrs').insert(
        values.okr_ids.map((okrId) => ({
          user_id: user.id,
          work_log_id: workLogId,
          okr_id: okrId,
        }))
      )
    }

    await fetchMonthly(baseDate)
    return true
  }

  async function remove(workLogId: string, baseDate: Date): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase
      .from('work_logs')
      .delete()
      .eq('id', workLogId)
      .eq('user_id', user.id)
    if (error) { toastError('업무기록 삭제에 실패했습니다.'); return false }
    await fetchMonthly(baseDate)
    return true
  }

  return {
    workLogs,
    selectableOkrs,
    loading,
    fetchMonthly,
    fetchSelectableOkrs,
    fetchDetail,
    create,
    update,
    remove,
  }
}
