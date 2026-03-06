import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content
          className={[
            'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full mx-4 bg-surface-card rounded-3xl shadow-modal',
            maxWidth,
            'max-h-[90vh] overflow-y-auto',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-8 py-6 border-b border-border sticky top-0 bg-surface-card z-10">
            <Dialog.Title className="text-xl font-bold tracking-tight text-gray-900">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-muted-foreground hover:text-gray-700 transition-colors p-1.5 rounded-xl hover:bg-muted"
                aria-label="닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          <div className="px-8 py-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
