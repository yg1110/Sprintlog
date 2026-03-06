import type { Okr } from '../../types/okr'

interface OkrMultiSelectProps {
  okrs: Okr[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function OkrMultiSelect({ okrs, selectedIds, onChange }: OkrMultiSelectProps) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (okrs.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">연결 가능한 OKR이 없습니다.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {okrs.map((okr) => {
        const checked = selectedIds.includes(okr.id)
        return (
          <label
            key={okr.id}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer transition-all',
              checked
                ? 'bg-primary/10 ring-2 ring-primary/30'
                : 'bg-muted hover:bg-primary/5',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(okr.id)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">{okr.title}</span>
            <span className="text-xs text-muted-foreground shrink-0">{okr.current_value}/{okr.target_value} {okr.unit}</span>
          </label>
        )
      })}
    </div>
  )
}
