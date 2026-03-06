import dayjs from '../lib/dayjs'

export function toDateKey(value: Date | string): string {
  return dayjs(value).format('YYYY-MM-DD')
}

export function getMonthRange(baseDate: Date): { start: string; end: string } {
  const d = dayjs(baseDate)
  return {
    start: d.startOf('month').format('YYYY-MM-DD'),
    end: d.endOf('month').format('YYYY-MM-DD'),
  }
}
