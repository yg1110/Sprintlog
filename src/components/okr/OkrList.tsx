import type { Okr } from '../../types/okr'
import { OkrCard } from './OkrCard'
import { EmptyState } from '../common/EmptyState'

interface OkrListProps {
  okrs: Okr[]
  onEdit: (okr: Okr) => void
  onDelete: (okr: Okr) => void
  onAdd: () => void
}

export function OkrList({ okrs, onEdit, onDelete, onAdd }: OkrListProps) {
  if (okrs.length === 0) {
    return (
      <EmptyState
        message="등록된 OKR이 없어요."
        subMessage="첫 목표를 만들어보세요."
        action={{ label: 'OKR 추가하기', onClick: onAdd }}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {okrs.map((okr) => (
        <OkrCard
          key={okr.id}
          okr={okr}
          onEdit={() => onEdit(okr)}
          onDelete={() => onDelete(okr)}
        />
      ))}
    </div>
  )
}
