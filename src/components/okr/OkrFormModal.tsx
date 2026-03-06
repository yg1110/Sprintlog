import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import type { Okr, OkrFormValues } from '../../types/okr'
import dayjs from '../../lib/dayjs'

const schema = z.object({
  title: z.string().min(1, '목표를 입력해 주세요.'),
  target_value: z.coerce.number().min(0),
  current_value: z.coerce.number().min(0),
  unit: z.string().min(1, '단위를 입력해 주세요.'),
  period_type: z.enum(['sprint', 'monthly', 'quarterly', 'yearly']),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  status: z.enum(['active', 'completed', 'archived']),
})

interface OkrFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: OkrFormValues) => Promise<boolean>
  initial?: Okr | null
}

const periodOptions = [
  { value: 'sprint', label: 'Sprint' },
  { value: 'monthly', label: '월간' },
  { value: 'quarterly', label: '분기' },
  { value: 'yearly', label: '연간' },
]

const statusOptions = [
  { value: 'active', label: '진행 중' },
  { value: 'completed', label: '완료' },
  { value: 'archived', label: '보관' },
]

export function OkrFormModal({ open, onClose, onSubmit, initial }: OkrFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OkrFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      target_value: 0,
      current_value: 0,
      unit: '',
      period_type: 'monthly',
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
      status: 'active',
    },
  })

  useEffect(() => {
    if (open) {
      reset(initial ? {
        title: initial.title,
        target_value: initial.target_value,
        current_value: initial.current_value,
        unit: initial.unit,
        period_type: initial.period_type,
        start_date: initial.start_date,
        end_date: initial.end_date,
        status: initial.status,
      } : {
        title: '',
        target_value: 0,
        current_value: 0,
        unit: '',
        period_type: 'monthly',
        start_date: dayjs().format('YYYY-MM-DD'),
        end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
        status: 'active',
      })
    }
  }, [open, initial, reset])

  async function onFormSubmit(values: OkrFormValues) {
    const ok = await onSubmit(values)
    if (ok) onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'OKR 수정' : 'OKR 추가'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
        <Input id="title" label="목표" placeholder="목표를 입력하세요" error={errors.title?.message} {...register('title')} />

        <div className="grid grid-cols-3 gap-3">
          <Input id="target_value" label="목표 수치" type="number" step="any" error={errors.target_value?.message} {...register('target_value')} />
          <Input id="current_value" label="현재 수치" type="number" step="any" error={errors.current_value?.message} {...register('current_value')} />
          <Input id="unit" label="단위" placeholder="건, %, km..." error={errors.unit?.message} {...register('unit')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select id="period_type" label="기간 유형" options={periodOptions} {...register('period_type')} />
          <Select id="status" label="상태" options={statusOptions} {...register('status')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input id="start_date" label="시작일" type="date" {...register('start_date')} />
          <Input id="end_date" label="종료일" type="date" {...register('end_date')} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>취소</Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : initial ? '수정하기' : '추가하기'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
