import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { BookOpen, CheckSquare, ChevronDown, Plus, Target, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState, SectionHeader, StatCard } from "../../components/Layout";
import { cn } from "../../lib/cn";
import type { KeyResult, OKR, PeriodType, TodoItem, WorkLog } from "../../types";
import { PERIOD_TYPE_LABEL } from "../../types";

interface DashboardPageProps {
  logs: WorkLog[];
  okrs: OKR[];
  onOpenWorkLog: (date: string) => void;
}

const PERIOD_ORDER: PeriodType[] = ["sprint", "monthly", "quarterly", "yearly"];

const PERIOD_BADGE: Record<PeriodType, string> = {
  sprint: "bg-emerald-100 text-emerald-700",
  monthly: "bg-blue-100 text-blue-700",
  quarterly: "bg-purple-100 text-purple-700",
  yearly: "bg-orange-100 text-orange-700",
};

const PERIOD_ACCENT: Record<PeriodType, string> = {
  sprint: "#10b981",
  monthly: "#3b82f6",
  quarterly: "#8b5cf6",
  yearly: "#f97316",
};

function okrProgress(okr: OKR) {
  const krs = okr.key_results ?? [];
  if (krs.length === 0) return 0;
  return (
    krs.reduce(
      (sum, kr) => sum + (kr.target_value > 0 ? (kr.current_value / kr.target_value) * 100 : 0),
      0,
    ) / krs.length
  );
}

// SVG 도넛 차트
function DonutChart({
  progress,
  size = 52,
  color,
}: {
  progress: number;
  size?: number;
  color: string;
}) {
  const strokeWidth = 5;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

// OKR 하나 + KR 바 목록
function OKRStatRow({ okr, color }: { okr: OKR; color: string }) {
  const [expanded, setExpanded] = useState(true);
  const progress = okrProgress(okr);
  const krs: KeyResult[] = okr.key_results ?? [];

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-black/3"
      >
        {/* 도넛 + % */}
        <div className="relative shrink-0">
          <DonutChart progress={progress} size={48} color={color} />
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-black"
            style={{ transform: "rotate(0deg)" }}
          >
            {Math.round(progress)}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{okr.title}</p>
          <p className="text-[10px] font-medium text-black/30">
            KR {krs.length}개
            {okr.start_date && okr.end_date && ` · ${okr.start_date} ~ ${okr.end_date}`}
          </p>
        </div>

        <ChevronDown
          size={14}
          className={cn("shrink-0 text-black/25 transition-transform", expanded && "rotate-180")}
        />
      </button>

      {/* KR 바 */}
      {expanded && krs.length > 0 && (
        <div className="ml-14 space-y-2 pr-3 pb-2">
          {krs.map((kr) => {
            const krP =
              kr.target_value > 0 ? Math.min((kr.current_value / kr.target_value) * 100, 100) : 0;
            return (
              <div key={kr.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-black/60">
                    {kr.title || "제목 없음"}
                  </span>
                  <span className="shrink-0 text-[10px] font-bold text-black/40">
                    {kr.current_value} / {kr.target_value}
                    {kr.unit ? ` ${kr.unit}` : ""}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/6">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${krP}%`, backgroundColor: color, opacity: 0.7 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardPage({ logs, okrs, onOpenWorkLog }: DashboardPageProps) {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrowStr = format(subDays(today, -1), "yyyy-MM-dd");

  const todayLog = logs.find((l) => l.log_date === todayStr);
  const tomorrowLog = logs.find((l) => l.log_date === tomorrowStr);
  const allTodayTodos: TodoItem[] = [...(todayLog?.todo_items ?? [])].sort((a, b) => {
    if (a.time_slot !== b.time_slot) return a.time_slot === "am" ? -1 : 1;
    return a.display_order - b.display_order;
  });
  const allTomorrowTodos: TodoItem[] = (tomorrowLog?.todo_items ?? []).filter((t) => !t.is_done);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    // 완료된 KR / 전체 KR
    const activeOKRs = okrs.filter((o) => o.status === "active");
    const allKRs = activeOKRs.flatMap((o) => o.key_results ?? []);
    const doneKRs = allKRs.filter(
      (kr) => kr.target_value > 0 && kr.current_value >= kr.target_value,
    ).length;

    const avgOKRProgress =
      activeOKRs.length === 0
        ? 0
        : Math.round(activeOKRs.reduce((sum, o) => sum + okrProgress(o), 0) / activeOKRs.length);

    return {
      doneKRs,
      totalKRs: allKRs.length,
      avgOKRProgress,
      activeCount: activeOKRs.length,
    };
  }, [okrs]);

  // ── 기간별 OKR 그룹 ──────────────────────────────────────────
  const periodGroups = useMemo(() => {
    const active = okrs.filter((o) => o.status !== "archived");
    return PERIOD_ORDER.map((period) => ({
      period,
      okrs: active.filter((o) => o.period_type === period),
    })).filter((g) => g.okrs.length > 0);
  }, [okrs]);

  // 대시보드 OKR 목록 (기존 섹션용)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">안녕하세요 👋</h1>
          <p className="mt-1 text-black/40">
            {format(today, "yyyy년 MM월 dd일 (EEE)", { locale: ko })} · 오늘도 기록해봐요
          </p>
        </div>
        <button
          onClick={() => onOpenWorkLog(todayStr)}
          className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
        >
          <Plus size={15} />
          오늘 기록
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="총 기록" value={logs.length} icon={BookOpen} sub="누적 업무일지" />
        <StatCard
          label="완료된 KR"
          value={`${stats.doneKRs} / ${stats.totalKRs}`}
          icon={CheckSquare}
          sub="활성 OKR 기준"
        />
        <StatCard
          label="OKR 진행률"
          value={`${stats.avgOKRProgress}%`}
          icon={TrendingUp}
          sub={`활성 ${stats.activeCount}개 평균`}
        />
      </div>

      {/* 오늘 할 일 */}
      <div className="space-y-4">
        <SectionHeader
          title="오늘 할 일"
          action={
            <button
              onClick={() => onOpenWorkLog(todayStr)}
              className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            >
              <Plus size={14} />
              기록 작성
            </button>
          }
        />

        {allTodayTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 px-6 py-10 text-center">
            <p className="font-bold text-black/30">오늘 작성된 업무기록이 없어요.</p>
            <button
              onClick={() => onOpenWorkLog(todayStr)}
              className="mt-3 text-sm font-bold text-black underline-offset-2 hover:underline"
            >
              오늘 기록 작성하기
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
            {allTodayTodos.map((todo, i) => (
              <div
                key={todo.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5",
                  i !== allTodayTodos.length - 1 && "border-b border-black/5",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                    todo.is_done ? "border-black bg-black" : "border-black/15",
                  )}
                >
                  {todo.is_done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    todo.is_done && "text-black/30 line-through",
                  )}
                >
                  {todo.content || "(제목 없음)"}
                </span>
                <span className="ml-auto shrink-0 text-[10px] font-bold text-black/20">
                  {todo.time_slot === "am" ? "오전" : "오후"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내일 할 일 */}
      {allTomorrowTodos.length > 0 && (
        <div className="space-y-4">
          <SectionHeader title="내일 할 일" />
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
            {allTomorrowTodos.slice(0, 5).map((todo, i) => (
              <div
                key={todo.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5",
                  i !== Math.min(allTomorrowTodos.length, 5) - 1 && "border-b border-black/5",
                )}
              >
                <div className="h-5 w-5 shrink-0 rounded-md border-2 border-black/10" />
                <span className="text-sm font-medium text-black/50">
                  {todo.content || "(제목 없음)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기간별 OKR 통계 */}
      {periodGroups.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="기간별 OKR 통계"
            action={
              <button
                onClick={() => navigate("/okrs")}
                className="text-sm font-bold text-black/30 transition-colors hover:text-black"
              >
                전체보기 →
              </button>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {periodGroups.map(({ period, okrs: groupOKRs }) => {
              const color = PERIOD_ACCENT[period];
              const avgP = Math.round(
                groupOKRs.reduce((sum, o) => sum + okrProgress(o), 0) / groupOKRs.length,
              );
              const totalKRs = groupOKRs.reduce((sum, o) => sum + (o.key_results ?? []).length, 0);
              const completedKRs = groupOKRs.reduce(
                (sum, o) =>
                  sum +
                  (o.key_results ?? []).filter(
                    (kr) => kr.target_value > 0 && kr.current_value >= kr.target_value,
                  ).length,
                0,
              );

              return (
                <div
                  key={period}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase",
                          PERIOD_BADGE[period],
                        )}
                      >
                        {PERIOD_TYPE_LABEL[period]}
                      </span>
                      <span className="text-sm font-bold text-black/50">
                        {groupOKRs.length}개 OKR
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black" style={{ color }}>
                        {avgP}%
                      </p>
                      <p className="text-[10px] font-medium text-black/30">
                        KR {completedKRs}/{totalKRs} 완료
                      </p>
                    </div>
                  </div>

                  {/* 전체 진행률 바 */}
                  <div className="h-1 bg-black/5">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(avgP, 100)}%`,
                        backgroundColor: color,
                        opacity: 0.6,
                      }}
                    />
                  </div>

                  {/* OKR 목록 */}
                  <div className="divide-y divide-black/5 px-2 py-1">
                    {groupOKRs.map((okr) => (
                      <OKRStatRow key={okr.id} okr={okr} color={color} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OKR 없을 때 빈 상태 */}
      {periodGroups.length === 0 && (
        <div className="space-y-4">
          <SectionHeader title="기간별 OKR 통계" />
          <EmptyState title="등록된 OKR이 없어요." sub="첫 목표를 만들어보세요." />
        </div>
      )}

      {/* 빠른 이동 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/work-logs")}
          className="rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
        >
          <BookOpen size={20} className="mb-3 text-black/30" />
          <p className="font-bold">업무기록 보기</p>
          <p className="mt-1 text-sm text-black/30">월간 캘린더로 확인</p>
        </button>
        <button
          onClick={() => navigate("/okrs")}
          className="rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
        >
          <Target size={20} className="mb-3 text-black/30" />
          <p className="font-bold">OKR 관리</p>
          <p className="mt-1 text-sm text-black/30">목표를 추가하거나 수정</p>
        </button>
      </div>
    </div>
  );
}
