import { addDays, format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { CheckSquare, ChevronDown, Clock, Plus, Target, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState, SectionHeader, StatCard } from "../../components/Layout";
import { cn } from "../../lib/cn";
import type { KeyResult, OKR, PeriodType, Project, TodoItem, WorkLog } from "../../types";
import { PERIOD_TYPE_LABEL } from "../../types";

interface DashboardPageProps {
  logs: WorkLog[];
  okrs: OKR[];
  projects: Project[];
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
        <div className="relative shrink-0">
          <DonutChart progress={progress} size={48} color={color} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
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

// 마감 임박 OKR 섹션
function UpcomingDeadlines({ okrs, onNavigate }: { okrs: OKR[]; onNavigate: () => void }) {
  const today = useMemo(() => new Date(), []);
  const todayStr = format(today, "yyyy-MM-dd");
  const in30Str = format(addDays(today, 30), "yyyy-MM-dd");

  const upcoming = useMemo(
    () =>
      okrs
        .filter((o) => o.status === "active" && o.end_date >= todayStr && o.end_date <= in30Str)
        .sort((a, b) => a.end_date.localeCompare(b.end_date)),
    [okrs, todayStr, in30Str],
  );

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="마감 임박 OKR"
        action={
          <button
            onClick={onNavigate}
            className="text-sm font-bold text-black/30 transition-colors hover:text-black"
          >
            전체보기 →
          </button>
        }
      />
      <div className="space-y-3">
        {upcoming.map((okr) => {
          const daysLeft = Math.ceil(
            (new Date(okr.end_date + "T23:59:59").getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const progress = Math.round(okrProgress(okr));
          const color = PERIOD_ACCENT[okr.period_type];
          const urgency =
            daysLeft <= 3
              ? "text-red-500 bg-red-50"
              : daysLeft <= 7
                ? "text-orange-500 bg-orange-50"
                : "text-black/40 bg-black/5";

          return (
            <div
              key={okr.id}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* 도넛 */}
                <div className="relative shrink-0">
                  <DonutChart progress={progress} size={44} color={color} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                    {progress}%
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-bold">{okr.title}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-black",
                        urgency,
                      )}
                    >
                      {daysLeft === 0 ? "D-DAY" : `D-${daysLeft}`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-black/30">
                    {okr.end_date} 마감 · KR {(okr.key_results ?? []).length}개
                  </p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="h-1 bg-black/5">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: color,
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 최근 이슈 & 막힌 것
function RecentIssues({
  logs,
  onOpenWorkLog,
}: {
  logs: WorkLog[];
  onOpenWorkLog: (date: string) => void;
}) {
  const recent = useMemo(
    () =>
      [...logs]
        .sort((a, b) => b.log_date.localeCompare(a.log_date))
        .flatMap((l) => {
          const items: { date: string; type: "이슈" | "막힌 것"; text: string }[] = [];
          if (l.issue_text?.trim())
            items.push({ date: l.log_date, type: "이슈", text: l.issue_text.trim() });
          if (l.blocked_text?.trim())
            items.push({ date: l.log_date, type: "막힌 것", text: l.blocked_text.trim() });
          return items;
        })
        .slice(0, 4),
    [logs],
  );

  if (recent.length === 0) return null;

  return (
    <div className="space-y-4">
      <SectionHeader title="최근 이슈 & 막힌 것" />
      <div className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
        {recent.map((item, i) => (
          <button
            key={i}
            onClick={() => onOpenWorkLog(item.date)}
            className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-black/2"
          >
            <span
              className={cn(
                "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black",
                item.type === "이슈" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600",
              )}
            >
              {item.type === "이슈" ? "🚨" : "🧱"} {item.type}
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-black/70">{item.text}</p>
              <p className="mt-0.5 text-[11px] font-medium text-black/30">{item.date}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 자주 함께한 동료
function FrequentCollaborators({ logs }: { logs: WorkLog[] }) {
  const collaborators = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      for (const name of log.collaborators ?? []) {
        counts[name] = (counts[name] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [logs]);

  if (collaborators.length === 0) return null;

  const max = collaborators[0]?.[1] ?? 1;

  return (
    <div className="space-y-4">
      <SectionHeader title="자주 함께한 동료" />
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {collaborators.map(([name, count]) => (
            <div key={name}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-black/70">@{name}</span>
                <span className="text-xs font-bold text-black/40">{count}회</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/6">
                <div
                  className="h-full rounded-full bg-black/25 transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 프로젝트별 기록 분포
function ProjectActivityBars({
  logs,
  projects,
  onNavigate,
}: {
  logs: WorkLog[];
  projects: Project[];
  onNavigate: () => void;
}) {
  const activeProjects = projects.filter((p) => p.status !== "archived");
  if (activeProjects.length === 0) return null;

  const projectStats = activeProjects
    .map((p) => ({
      project: p,
      count: logs.filter((l) => (l.project_ids ?? []).includes(p.id)).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const max = Math.max(...projectStats.map((s) => s.count), 1);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="프로젝트 기록 현황"
        action={
          <button
            onClick={onNavigate}
            className="text-sm font-bold text-black/30 transition-colors hover:text-black"
          >
            전체보기 →
          </button>
        }
      />
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        {projectStats.every((s) => s.count === 0) ? (
          <p className="text-center text-sm font-medium text-black/30">
            아직 프로젝트가 연결된 기록이 없어요.
          </p>
        ) : (
          <div className="space-y-3">
            {projectStats.map(({ project: p, count }) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate text-sm font-semibold text-black/70">{p.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-black/40">{count}건</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/6">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(count / max) * 100}%`,
                      backgroundColor: p.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage({ logs, okrs, projects, onOpenWorkLog }: DashboardPageProps) {
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
    const activeOKRs = okrs.filter((o) => o.status === "active");
    const allKRs = activeOKRs.flatMap((o) => o.key_results ?? []);
    const doneKRs = allKRs.filter(
      (kr) => kr.target_value > 0 && kr.current_value >= kr.target_value,
    ).length;
    const avgOKRProgress =
      activeOKRs.length === 0
        ? 0
        : Math.round(activeOKRs.reduce((sum, o) => sum + okrProgress(o), 0) / activeOKRs.length);

    // 이번 주 할 일 완료율 (최근 7일)
    const since7 = format(subDays(today, 6), "yyyy-MM-dd");
    const recentTodos = logs.filter((l) => l.log_date >= since7).flatMap((l) => l.todo_items ?? []);
    const todoTotal = recentTodos.length;
    const todoDone = recentTodos.filter((t) => t.is_done).length;
    const todoRate = todoTotal === 0 ? null : Math.round((todoDone / todoTotal) * 100);

    // 마감 임박 OKR 수 (30일 이내)
    const todayStr2 = format(today, "yyyy-MM-dd");
    const in30Str = format(addDays(today, 30), "yyyy-MM-dd");
    const upcomingCount = activeOKRs.filter(
      (o) => o.end_date >= todayStr2 && o.end_date <= in30Str,
    ).length;

    return {
      doneKRs,
      totalKRs: allKRs.length,
      avgOKRProgress,
      activeCount: activeOKRs.length,
      todoRate,
      todoTotal,
      todoDone,
      upcomingCount,
    };
  }, [okrs, logs, today]);

  // ── 기간별 OKR 그룹 ──────────────────────────────────────────
  const periodGroups = useMemo(() => {
    const active = okrs.filter((o) => o.status !== "archived");
    return PERIOD_ORDER.map((period) => ({
      period,
      okrs: active.filter((o) => o.period_type === period),
    })).filter((g) => g.okrs.length > 0);
  }, [okrs]);

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
          className="flex items-center gap-1.5 rounded-xl bg-[#3182f6] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95"
        >
          <Plus size={15} />
          오늘 기록
        </button>
      </div>

      {/* Stats — 4 cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="OKR 진행률"
          value={`${stats.avgOKRProgress}%`}
          icon={TrendingUp}
          sub={`활성 ${stats.activeCount}개 평균`}
        />
        <StatCard
          label="완료된 KR"
          value={`${stats.doneKRs} / ${stats.totalKRs}`}
          icon={CheckSquare}
          sub="활성 OKR 기준"
        />
        <StatCard
          label="할 일 완료율"
          value={stats.todoRate !== null ? `${stats.todoRate}%` : "-"}
          icon={Target}
          sub={
            stats.todoTotal > 0
              ? `최근 7일 ${stats.todoDone}/${stats.todoTotal}`
              : "최근 7일 기록 없음"
          }
        />
        <StatCard label="마감 임박" value={stats.upcomingCount} icon={Clock} sub="30일 이내 OKR" />
      </div>

      {/* 마감 임박 OKR */}
      <UpcomingDeadlines okrs={okrs} onNavigate={() => navigate("/okrs")} />

      {/* 오늘 할 일 */}
      <div className="space-y-4">
        <SectionHeader
          title="오늘 할 일"
          action={
            <button
              onClick={() => onOpenWorkLog(todayStr)}
              className="flex items-center gap-1.5 rounded-xl bg-[#3182f6] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95"
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

      {/* 최근 이슈 & 막힌 것 */}
      <RecentIssues logs={logs} onOpenWorkLog={onOpenWorkLog} />

      {/* 자주 함께한 동료 */}
      <FrequentCollaborators logs={logs} />

      {/* 프로젝트 기록 현황 */}
      {projects.length > 0 && (
        <ProjectActivityBars
          logs={logs}
          projects={projects}
          onNavigate={() => navigate("/projects")}
        />
      )}

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

      {periodGroups.length === 0 && (
        <div className="space-y-4">
          <SectionHeader title="기간별 OKR 통계" />
          <EmptyState title="등록된 OKR이 없어요." sub="첫 목표를 만들어보세요." />
        </div>
      )}
    </div>
  );
}
