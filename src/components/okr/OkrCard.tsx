import type { Okr } from '../../types/okr'
import { calcProgress } from '../../utils/progress'
import { StatusBadge } from '../common/StatusBadge'
import { Button } from '../common/Button'

interface OkrCardProps {
  okr: Okr
  onEdit: () => void
  onDelete: () => void
}

const periodBadge: Record<string, { label: string; className: string }> = {
  sprint:    { label: 'Sprint',  className: 'bg-blue-50 text-blue-600' },
  monthly:   { label: '월간',    className: 'bg-purple-50 text-purple-600' },
  quarterly: { label: '분기',    className: 'bg-orange-50 text-orange-600' },
  yearly:    { label: '연간',    className: 'bg-emerald-50 text-emerald-600' },
}

export function OkrCard({ okr, onEdit, onDelete }: OkrCardProps) {
  const progress = calcProgress(okr.current_value, okr.target_value)

  return (
    <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <StatusBadge status={okr.status} />
          <p className="font-bold text-gray-900 mt-2 text-lg leading-snug">{okr.title}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className={`font-semibold px-1.5 py-0.5 rounded-md text-xs ${periodBadge[okr.period_type]?.className ?? ''}`}>
              {periodBadge[okr.period_type]?.label ?? okr.period_type}
            </span>
            <span>·</span>
            <span>{okr.start_date} ~ {okr.end_date}</span>
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <p className="text-3xl font-light tracking-tighter text-gray-900">{progress}%</p>
          <span className="text-sm font-bold text-muted-foreground">
            {okr.current_value} / {okr.target_value} {okr.unit}
          </span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>수정</Button>
        <Button variant="danger" size="sm" onClick={onDelete}>삭제</Button>
      </div>
    </div>
  )
}
