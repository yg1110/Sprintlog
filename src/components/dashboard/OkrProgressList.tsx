import { useState } from 'react'
import type { OkrProgress } from '../../types/dashboard'
import { Button } from '../common/Button'

interface OkrProgressListProps {
  items: OkrProgress[]
}

export function OkrProgressList({ items }: OkrProgressListProps) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? items : items.slice(0, 5)

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">진행 중인 OKR이 없어요.</p>
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {displayed.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[60%]">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.current_value}/{item.target_value} {item.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary w-8 text-right">{item.progress}%</span>
            </div>
          </div>
        ))}
      </div>
      {items.length > 5 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="mt-3 text-xs">
          {showAll ? '접기' : `더보기 (${items.length - 5}개 더)`}
        </Button>
      )}
    </div>
  )
}
