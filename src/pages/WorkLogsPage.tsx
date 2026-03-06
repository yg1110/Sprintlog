import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import { useWorkLogs } from '../hooks/useWorkLogs'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { WorkLogModal } from '../components/work-log/WorkLogModal'
import { CalendarSummaryCell } from '../components/work-log/CalendarSummaryCell'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import type { WorkLog, WorkLogFormValues } from '../types/work-log'
import type { TodoItem } from '../types/todo'
import { toDateKey } from '../utils/date'
import { toastSuccess } from '../utils/toast'
import dayjs from '../lib/dayjs'

interface ModalState {
  mode: 'create' | 'edit'
  date: string
  workLogId?: string
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

export function WorkLogsPage() {
  const {
    workLogs,
    selectableOkrs,
    loading,
    fetchMonthly,
    fetchSelectableOkrs,
    fetchDetail,
    create,
    update,
    remove,
  } = useWorkLogs()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [modal, setModal] = useState<ModalState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkLog | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchMonthly(currentMonth)
  }, [fetchMonthly, currentMonth])

  useEffect(() => {
    fetchSelectableOkrs()
  }, [fetchSelectableOkrs])

  const workLogMap = new Map(workLogs.map((wl) => [wl.log_date, wl]))

  async function openDateModal(date: Date) {
    const key = toDateKey(date)
    const existing = workLogMap.get(key)

    if (existing) {
      const { detail, okrIds, todos } = await fetchDetail(existing.id)
      setModal({
        mode: 'edit',
        date: key,
        workLogId: existing.id,
        initial: detail ? {
          summary: detail.summary,
          done_text: detail.done_text,
          issue_text: detail.issue_text,
          blocked_text: detail.blocked_text,
          decision_text: detail.decision_text,
          learned_text: detail.learned_text,
          tomorrow_plan_text: detail.tomorrow_plan_text,
          metric_change_text: detail.metric_change_text,
          feedback_text: detail.feedback_text,
          improvement_text: detail.improvement_text,
          okrIds,
          todos,
        } : null,
      })
    } else {
      setModal({ mode: 'create', date: key, initial: null })
    }
  }

  function openTodayModal() {
    openDateModal(new Date())
  }

  async function handleSubmit(values: WorkLogFormValues): Promise<boolean> {
    if (modal?.mode === 'edit' && modal.workLogId) {
      const ok = await update(modal.workLogId, values, currentMonth)
      if (ok) toastSuccess('업무기록이 수정되었습니다.')
      return ok
    } else {
      const ok = await create(values, currentMonth)
      if (ok) toastSuccess('업무기록이 저장되었습니다.')
      return ok
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const ok = await remove(deleteTarget.id, currentMonth)
    setDeleting(false)
    if (ok) {
      toastSuccess('업무기록이 삭제되었습니다.')
      setDeleteTarget(null)
      setModal(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="업무기록"
        action={
          <Button variant="primary" size="sm" onClick={openTodayModal}>
            오늘 기록 작성
          </Button>
        }
      />

      <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6">
        <Calendar
          value={currentMonth}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) setCurrentMonth(activeStartDate)
          }}
          onClickDay={openDateModal}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null
            return (
              <CalendarSummaryCell date={date} workLogMap={workLogMap} />
            )
          }}
          formatDay={() => ''}
          showNeighboringMonth={true}
          locale="ko-KR"
        />
      </div>

      {workLogs.length === 0 && !loading && (
        <div className="mt-4">
          <EmptyState
            message="이번 달에는 아직 업무기록이 없어요."
            subMessage="날짜를 클릭해서 첫 기록을 남겨보세요."
          />
        </div>
      )}

      {modal && (
        <WorkLogModal
          open={true}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          onDelete={modal.mode === 'edit' && modal.workLogId
            ? async () => {
                const wl = workLogMap.get(modal.date)
                if (wl) setDeleteTarget(wl)
              }
            : undefined}
          logDate={modal.date}
          okrs={selectableOkrs}
          initial={modal.initial}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="업무기록 삭제"
        description={`${deleteTarget ? dayjs(deleteTarget.log_date).format('M월 D일') : ''} 업무기록을 삭제하시겠습니까?`}
        loading={deleting}
      />
    </div>
  )
}
