import type { OkrStatus } from '../../types/okr'

const statusConfig: Record<OkrStatus, { label: string; className: string }> = {
  active: {
    label: 'ACTIVE',
    className: 'bg-primary/15 text-primary',
  },
  completed: {
    label: 'DONE',
    className: 'bg-green-100 text-green-700',
  },
  archived: {
    label: 'ARCHIVED',
    className: 'bg-muted text-muted-foreground',
  },
}

interface StatusBadgeProps {
  status: OkrStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest ${config.className}`}>
      {config.label}
    </span>
  )
}
