import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Okr, OkrFormValues } from '../types/okr'
import { toastError } from '../utils/toast'

export function useOkrs() {
  const { user } = useAuth()
  const [okrs, setOkrs] = useState<Okr[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('okrs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) { toastError('OKR 목록을 불러오지 못했습니다.'); return }
    setOkrs((data ?? []) as Okr[])
  }, [user])

  async function create(values: OkrFormValues): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase.from('okrs').insert([{ ...values, user_id: user.id }])
    if (error) { toastError('OKR 생성에 실패했습니다.'); return false }
    await fetch()
    return true
  }

  async function update(id: string, values: OkrFormValues): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase
      .from('okrs')
      .update(values)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) { toastError('OKR 수정에 실패했습니다.'); return false }
    await fetch()
    return true
  }

  async function remove(id: string): Promise<boolean> {
    if (!user) return false
    const { error } = await supabase
      .from('okrs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) { toastError('OKR 삭제에 실패했습니다.'); return false }
    await fetch()
    return true
  }

  return { okrs, loading, fetch, create, update, remove }
}
