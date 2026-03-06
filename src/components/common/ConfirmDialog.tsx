import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '삭제',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4 bg-surface-card rounded-3xl shadow-modal p-8">
          <Dialog.Title className="text-xl font-bold tracking-tight text-gray-900 mb-2">{title}</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-8">{description}</Dialog.Description>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button variant="danger" size="sm" onClick={onConfirm} disabled={loading}>
              {loading ? '처리 중...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
