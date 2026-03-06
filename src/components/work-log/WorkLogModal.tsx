import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { Button } from '../common/Button'
import { OkrMultiSelect } from './OkrMultiSelect'
import { TodoSection } from './TodoSection'
import type { WorkLogFormValues } from '../../types/work-log'
import type { Okr } from '../../types/okr'
import type { TodoItem } from '../../types/todo'

interface WorkLogModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: WorkLogFormValues) => Promise<boolean>
  onDelete?: () => Promise<void>
  logDate: string
  okrs: Okr[]
  initial?: {
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
    okrIds: string[]
    todos: TodoItem[]
  } | null
}

function defaultValues(logDate: string): WorkLogFormValues {
  return {
    log_date: logDate,
    summary: '',
    okr_ids: [],
    todos: [],
    done_text: '',
    issue_text: '',
    blocked_text: '',
    decision_text: '',
    learned_text: '',
    tomorrow_plan_text: '',
    metric_change_text: '',
    feedback_text: '',
    improvement_text: '',
  }
}

const retroLabels = [
  { field: 'done_text', label: '한 일' },
  { field: 'issue_text', label: '이슈 / 장애 / 버그' },
  { field: 'blocked_text', label: '막힌 것' },
  { field: 'decision_text', label: '설계 / 의사결정' },
  { field: 'learned_text', label: '배운 점' },
  { field: 'tomorrow_plan_text', label: '내일 할 일' },
  { field: 'metric_change_text', label: '수치 변화' },
  { field: 'feedback_text', label: '받은 피드백' },
  { field: 'improvement_text', label: '개선 포인트' },
] as const

export function WorkLogModal({ open, onClose, onSubmit, onDelete, logDate, okrs, initial }: WorkLogModalProps) {
  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm<WorkLogFormValues>({
    defaultValues: defaultValues(logDate),
  })

  useEffect(() => {
    if (open) {
      if (initial) {
        reset({
          log_date: logDate,
          summary: initial.summary ?? '',
          okr_ids: initial.okrIds,
          todos: initial.todos.map((t) => ({
            id: t.id,
            time_slot: t.time_slot as 'am' | 'pm',
            content: t.content,
            is_done: t.is_done,
            display_order: t.display_order,
          })),
          done_text: initial.done_text ?? '',
          issue_text: initial.issue_text ?? '',
          blocked_text: initial.blocked_text ?? '',
          decision_text: initial.decision_text ?? '',
          learned_text: initial.learned_text ?? '',
          tomorrow_plan_text: initial.tomorrow_plan_text ?? '',
          metric_change_text: initial.metric_change_text ?? '',
          feedback_text: initial.feedback_text ?? '',
          improvement_text: initial.improvement_text ?? '',
        })
      } else {
        reset(defaultValues(logDate))
      }
    }
  }, [open, initial, logDate, reset])

  async function onFormSubmit(values: WorkLogFormValues) {
    const ok = await onSubmit(values)
    if (ok) onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`업무기록 · ${logDate}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
        {/* 기본 정보 */}
        <section>
          <Input
            id="summary"
            label="한 줄 요약"
            placeholder="오늘을 한 줄로 요약하세요"
            {...register('summary')}
          />
        </section>

        {/* OKR 연결 */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">연관 OKR</p>
          <Controller
            name="okr_ids"
            control={control}
            render={({ field }) => (
              <OkrMultiSelect okrs={okrs} selectedIds={field.value} onChange={field.onChange} />
            )}
          />
        </section>

        {/* TODO */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">TODO</p>
          <div className="flex flex-col gap-4">
            <Controller
              name="todos"
              control={control}
              render={({ field }) => (
                <>
                  <TodoSection slot="am" title="오전" todos={field.value} onChange={field.onChange} />
                  <TodoSection slot="pm" title="오후" todos={field.value} onChange={field.onChange} />
                </>
              )}
            />
          </div>
        </section>

        {/* 회고 */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">회고</p>
          <div className="flex flex-col gap-3">
            {retroLabels.map(({ field, label }) => (
              <Textarea
                key={field}
                id={field}
                label={label}
                rows={2}
                placeholder={`${label}을 기록하세요`}
                {...register(field)}
              />
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {onDelete && (
              <Button type="button" variant="danger" size="sm" onClick={onDelete} disabled={isSubmitting}>
                삭제
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>취소</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
