import { useEffect, useState } from 'react'
import { useOkrs } from '../hooks/useOkrs'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { OkrList } from '../components/okr/OkrList'
import { OkrFormModal } from '../components/okr/OkrFormModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import type { Okr, OkrFormValues } from '../types/okr'
import { toastSuccess } from '../utils/toast'

export function OkrsPage() {
  const { okrs, loading, fetch, create, update, remove } = useOkrs()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Okr | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Okr | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetch() }, [fetch])

  async function handleSubmit(values: OkrFormValues): Promise<boolean> {
    if (editTarget) {
      const ok = await update(editTarget.id, values)
      if (ok) toastSuccess('OKR이 수정되었습니다.')
      return ok
    } else {
      const ok = await create(values)
      if (ok) toastSuccess('OKR이 추가되었습니다.')
      return ok
    }
  }

  function handleEdit(okr: Okr) {
    setEditTarget(okr)
    setModalOpen(true)
  }

  function handleAdd() {
    setEditTarget(null)
    setModalOpen(true)
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditTarget(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const ok = await remove(deleteTarget.id)
    setDeleting(false)
    if (ok) {
      toastSuccess('OKR이 삭제되었습니다.')
      setDeleteTarget(null)
    }
  }

  if (loading && okrs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="OKR"
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            + OKR 추가
          </Button>
        }
      />

      <OkrList
        okrs={okrs}
        onEdit={handleEdit}
        onDelete={(okr) => setDeleteTarget(okr)}
        onAdd={handleAdd}
      />

      <OkrFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initial={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="OKR 삭제"
        description={`"${deleteTarget?.title}" OKR을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        loading={deleting}
      />
    </div>
  )
}
