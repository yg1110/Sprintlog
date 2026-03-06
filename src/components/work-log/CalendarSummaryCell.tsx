import type { WorkLog } from '../../types/work-log'
import { ellipsis } from '../../utils/text'
import { toDateKey } from '../../utils/date'

interface CalendarSummaryCellProps {
  date: Date
  workLogMap: Map<string, WorkLog>
}

export function CalendarSummaryCell({ date, workLogMap }: CalendarSummaryCellProps) {
  const key = toDateKey(date)
  const log = workLogMap.get(key)
  const day = date.getDate()

  return (
    <div className="min-h-[72px] w-full p-1.5 text-left">
      <span className="text-xs font-bold block mb-1.5 text-gray-700">{day}</span>
      {log?.summary && (
        <span className="text-[10px] text-muted-foreground leading-tight block font-medium">
          {ellipsis(log.summary, 16)}
        </span>
      )}
      {log && !log.summary && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1" />
      )}
    </div>
  )
}
