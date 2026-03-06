import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { DashboardData } from '../types/dashboard'
import type { TodoItem } from '../types/todo'
import { calcProgress } from '../utils/progress'
import { toDateKey } from '../utils/date'
import { toastError } from '../utils/toast'
import dayjs from '../lib/dayjs'

export function useDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const today = toDateKey(new Date())
    const tomorrow = toDateKey(dayjs().add(1, 'day').toDate())

    const [logsCountRes, okrsRes, todayLogRes] = await Promise.all([
      supabase.from('work_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('okrs').select('*').eq('user_id', user.id).neq('status', 'archived'),
      supabase.from('work_logs').select('id, tomorrow_plan_text').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
    ])

    if (okrsRes.error) { toastError('대시보드 데이터를 불러오지 못했습니다.'); setLoading(false); return }

    const allOkrs = okrsRes.data ?? []
    const activeOkrCount = allOkrs.filter((o) => o.status === 'active').length
    const completedOkrCount = allOkrs.filter((o) => o.status === 'completed').length

    const okrProgressList = allOkrs.map((o) => ({
      id: o.id,
      title: o.title,
      current_value: o.current_value,
      target_value: o.target_value,
      unit: o.unit,
      progress: calcProgress(o.current_value, o.target_value),
      status: o.status,
    }))

    let todayTodos: TodoItem[] = []
    let tomorrowPlan: string | null = null

    if (todayLogRes.data) {
      const { data: todos } = await supabase
        .from('todo_items')
        .select('*')
        .eq('work_log_id', todayLogRes.data.id)
        .order('time_slot')
        .order('display_order')
      todayTodos = (todos ?? []) as TodoItem[]
      tomorrowPlan = todayLogRes.data.tomorrow_plan_text ?? null
    }

    // Check tomorrow's log for preview
    if (!tomorrowPlan) {
      const { data: tomorrowLog } = await supabase
        .from('work_logs')
        .select('tomorrow_plan_text')
        .eq('user_id', user.id)
        .eq('log_date', tomorrow)
        .maybeSingle()
      tomorrowPlan = tomorrowLog?.tomorrow_plan_text ?? null
    }

    setData({
      stats: {
        loggedDays: logsCountRes.count ?? 0,
        activeOkrCount,
        completedOkrCount,
      },
      okrProgressList,
      todayTodos,
      tomorrowPlan,
    })
    setLoading(false)
  }, [user])

  return { data, loading, fetch }
}
