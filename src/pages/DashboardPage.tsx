import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { StatCard } from '../components/dashboard/StatCard'
import { OkrProgressList } from '../components/dashboard/OkrProgressList'
import { TodayTodoList } from '../components/dashboard/TodayTodoList'
import { TomorrowPreviewCard } from '../components/dashboard/TomorrowPreviewCard'
import dayjs from '../lib/dayjs'

export function DashboardPage() {
  const { data, loading, fetch } = useDashboard()
  const navigate = useNavigate()
  const today = dayjs().format('YYYY년 M월 D일')

  useEffect(() => {
    fetch()
  }, [fetch])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="대시보드"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/work-logs')}>
              업무기록 작성
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/okrs')}>
              OKR 관리
            </Button>
          </div>
        }
      />

      <p className="text-sm text-muted-foreground mb-6">{today}</p>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="기록된 일수" value={data?.stats.loggedDays ?? 0} sub="days" />
        <StatCard label="활성 OKR" value={data?.stats.activeOkrCount ?? 0} sub="진행 중" />
        <StatCard label="완료 OKR" value={data?.stats.completedOkrCount ?? 0} sub="달성" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* OKR 달성률 */}
        <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">OKR 달성률</h2>
          <OkrProgressList items={data?.okrProgressList ?? []} />
        </div>

        {/* 오늘 TODO */}
        <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">오늘 할 일</h2>
          <TodayTodoList
            todos={data?.todayTodos ?? []}
            onAdd={() => navigate('/work-logs')}
          />
        </div>

        {/* 내일 할 일 미리보기 */}
        <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6 lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">내일 할 일 미리보기</h2>
          <TomorrowPreviewCard text={data?.tomorrowPlan ?? null} />
        </div>
      </div>
    </div>
  )
}
