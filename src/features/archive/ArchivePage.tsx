import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SectionHeader } from "../../components/Layout";
import { cn } from "../../lib/cn";
import type { OKR, Project, WorkLog } from "../../types";

interface ArchivePageProps {
  logs: WorkLog[];
  projects: Project[];
  okrs: OKR[];
  onOpenWorkLog: (date: string) => void;
}

const TEXT_FIELDS: { key: keyof WorkLog; label: string; emoji: string }[] = [
  { key: "summary", label: "한줄 요약", emoji: "💬" },
  { key: "done_text", label: "한 일", emoji: "✅" },
  { key: "issue_text", label: "이슈", emoji: "🚨" },
  { key: "blocked_text", label: "막힌 것", emoji: "🧱" },
  { key: "decision_text", label: "설계/의사결정", emoji: "🧠" },
  { key: "learned_text", label: "배운 점", emoji: "📚" },
  { key: "tomorrow_plan_text", label: "내일 할 일", emoji: "📌" },
  { key: "metric_change_text", label: "수치 변화", emoji: "📈" },
  { key: "feedback_text", label: "피드백", emoji: "🗣️" },
  { key: "improvement_text", label: "개선 포인트", emoji: "🎯" },
];

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-200 px-0.5 text-black not-italic">
        {text.slice(idx, idx + q.length)}
      </mark>
      {highlight(text.slice(idx + q.length), q)}
    </>
  );
}

export function ArchivePage({ logs, projects, okrs, onOpenWorkLog }: ArchivePageProps) {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [collaboratorFilter, setCollaboratorFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // 필터 옵션 데이터
  const availableMonths = useMemo(() => {
    const months = [...new Set(logs.map((l) => l.log_date.slice(0, 7)))].sort().reverse();
    return months;
  }, [logs]);

  const allCollaborators = useMemo(
    () => [...new Set(logs.flatMap((l) => l.collaborators ?? []))].sort(),
    [logs],
  );

  const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

  const okrKrMap = useMemo(() => {
    const map: Record<string, { krTitle: string; okrTitle: string }> = {};
    for (const okr of okrs) {
      for (const kr of okr.key_results ?? []) {
        map[kr.id] = { krTitle: kr.title, okrTitle: okr.title };
      }
    }
    return map;
  }, [okrs]);

  // 필터 적용
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (monthFilter !== "all" && !log.log_date.startsWith(monthFilter)) return false;
      if (collaboratorFilter !== "all" && !(log.collaborators ?? []).includes(collaboratorFilter))
        return false;
      if (projectFilter !== "all" && !(log.project_ids ?? []).includes(projectFilter)) return false;
      if (fieldFilter !== "all") {
        const val = log[fieldFilter as keyof WorkLog];
        if (typeof val !== "string" || !val.trim()) return false;
        if (q && !val.toLowerCase().includes(q)) return false;
        return true;
      }
      if (q) {
        const inText = TEXT_FIELDS.some((f) => {
          const val = log[f.key];
          return typeof val === "string" && val.toLowerCase().includes(q);
        });
        const inCollaborators = (log.collaborators ?? []).some((c) => c.toLowerCase().includes(q));
        const inProjects = (log.project_ids ?? []).some((id) =>
          (projectMap[id]?.name ?? "").toLowerCase().includes(q),
        );
        const inKRs = (log.kr_ids ?? []).some((id) => {
          const entry = okrKrMap[id];
          if (!entry) return false;
          return (
            entry.krTitle.toLowerCase().includes(q) || entry.okrTitle.toLowerCase().includes(q)
          );
        });
        if (!inText && !inCollaborators && !inProjects && !inKRs) return false;
      }
      return true;
    });
  }, [
    logs,
    search,
    monthFilter,
    collaboratorFilter,
    projectFilter,
    fieldFilter,
    projectMap,
    okrKrMap,
  ]);

  const activeFilterCount = [
    monthFilter !== "all",
    collaboratorFilter !== "all",
    projectFilter !== "all",
    fieldFilter !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setMonthFilter("all");
    setCollaboratorFilter("all");
    setProjectFilter("all");
    setFieldFilter("all");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="업무 검색"
        action={
          <span className="text-sm font-bold text-black/30">
            {filtered.length} / {logs.length}건
          </span>
        }
      />

      {/* 검색 + 필터 토글 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-black/30"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="전체 내용 검색 (한 일, 이슈, 배운 점 등)"
              className="w-full rounded-xl border border-[#e5e8eb] bg-white py-2.5 pr-4 pl-9 text-sm font-medium transition-all outline-none focus:border-[#3182f6]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black/30 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all",
              showFilters || activeFilterCount > 0
                ? "border-[#3182f6] bg-[#3182f6] text-white"
                : "border-[#e5e8eb] bg-white text-[#6b7684] hover:text-[#191f28]",
            )}
          >
            <SlidersHorizontal size={15} />
            필터
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 월 */}
              <FilterSelect
                label="기간"
                icon={<CalendarDays size={13} />}
                value={monthFilter}
                onChange={setMonthFilter}
                options={[
                  { value: "all", label: "전체 기간" },
                  ...availableMonths.map((m) => ({
                    value: m,
                    label: format(parseISO(m + "-01"), "yyyy년 M월", { locale: ko }),
                  })),
                ]}
              />

              {/* 동료 */}
              <FilterSelect
                label="동료"
                value={collaboratorFilter}
                onChange={setCollaboratorFilter}
                options={[
                  { value: "all", label: "전체 동료" },
                  ...allCollaborators.map((c) => ({ value: c, label: c })),
                ]}
              />

              {/* 프로젝트 */}
              <FilterSelect
                label="프로젝트"
                value={projectFilter}
                onChange={setProjectFilter}
                options={[
                  { value: "all", label: "전체 프로젝트" },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />

              {/* 필드 */}
              <FilterSelect
                label="항목"
                value={fieldFilter}
                onChange={setFieldFilter}
                options={[
                  { value: "all", label: "전체 항목" },
                  ...TEXT_FIELDS.map((f) => ({ value: f.key as string, label: f.label })),
                ]}
              />
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-3 flex items-center gap-1 text-xs font-bold text-black/40 hover:text-black"
              >
                <X size={12} /> 필터 초기화
              </button>
            )}
          </div>
        )}
      </div>

      {/* 결과 */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 py-20 text-center">
          <p className="font-bold text-black/30">기록된 업무일지가 없습니다.</p>
          <p className="mt-1 text-sm text-black/20">업무기록 페이지에서 일지를 작성해보세요.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 py-20 text-center">
          <p className="font-bold text-black/30">검색 결과가 없습니다.</p>
          <p className="mt-1 text-sm text-black/20">다른 검색어나 필터를 사용해보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <LogCard
              key={log.log_date}
              log={log}
              search={search.trim()}
              fieldFilter={fieldFilter}
              projectMap={projectMap}
              okrKrMap={okrKrMap}
              onOpen={() => onOpenWorkLog(log.log_date)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LogCard({
  log,
  search,
  fieldFilter,
  projectMap,
  okrKrMap,
  onOpen,
}: {
  log: WorkLog;
  search: string;
  fieldFilter: string;
  projectMap: Record<string, Project>;
  okrKrMap: Record<string, { krTitle: string; okrTitle: string }>;
  onOpen: () => void;
}) {
  const [expandedTags, setExpandedTags] = useState(false);
  const [expandedFields, setExpandedFields] = useState(false);

  // 표시할 필드: fieldFilter가 있으면 해당 필드만, 없으면 내용 있는 필드 전체
  const matchingFields =
    fieldFilter !== "all"
      ? TEXT_FIELDS.filter((f) => {
          const val = log[f.key];
          return typeof val === "string" && val.trim();
        }).filter((f) => f.key === fieldFilter)
      : TEXT_FIELDS.filter((f) => {
          const val = log[f.key];
          if (typeof val !== "string" || !val.trim()) return false;
          if (search) return val.toLowerCase().includes(search.toLowerCase());
          return true;
        });

  // 검색 없을 때 기본 표시 필드 (접기/펼치기)
  const defaultFields =
    !search && fieldFilter === "all"
      ? TEXT_FIELDS.filter((f) => {
          const val = log[f.key];
          return typeof val === "string" && val.trim();
        })
      : matchingFields;

  const visibleFields = expandedFields ? defaultFields : defaultFields.slice(0, 1);

  const linkedProjects = (log.project_ids ?? []).map((id) => projectMap[id]).filter(Boolean);
  const linkedKRs = (log.kr_ids ?? []).map((id) => okrKrMap[id]).filter(Boolean);

  const tagGroups = [
    { key: "projects", show: linkedProjects.length > 0 },
    { key: "krs", show: linkedKRs.length > 0 },
    { key: "collaborators", show: (log.collaborators ?? []).length > 0 },
  ].filter((g) => g.show);

  return (
    <div
      className="cursor-pointer rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:shadow-md"
      onClick={onOpen}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5">
            <CalendarDays size={16} className="text-black/40" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-black">
              {format(parseISO(log.log_date), "yyyy년 M월 d일 (eee)", { locale: ko })}
            </p>
            {log.summary && (
              <p className="mt-0.5 line-clamp-1 text-xs font-medium text-black/40">
                {search ? highlight(log.summary, search) : log.summary}
              </p>
            )}
          </div>
        </div>
        <div className="mt-1 flex shrink-0 items-center gap-1 text-[11px] font-bold text-black/25">
          {defaultFields.length > 0 && <span>{defaultFields.length}개 항목</span>}
        </div>
      </div>

      {/* 연결 태그 — 구분 행 */}
      {tagGroups.length > 0 && (
        <div
          className="border-t border-black/5 px-5 py-3 sm:px-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 섹션 헤더: 레이블(좌) + 토글(우) */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-black/25 uppercase">
              내용
            </span>
            {tagGroups.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedTags((v) => !v);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-black/30 hover:text-black/60"
              >
                <ChevronDown
                  size={12}
                  className={cn("transition-transform", expandedTags && "rotate-180")}
                />
                {expandedTags ? "접기" : `${tagGroups.length - 1}개 더 보기`}
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {/* 첫 번째 그룹은 항상 표시 */}
            {linkedProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[10px] font-bold tracking-widest text-black/25 uppercase">
                  프로젝트
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {linkedProjects.map((p) => (
                    <span
                      key={p.id}
                      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: p.color + "18", color: p.color }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 펼쳐진 경우에만 표시되는 나머지 그룹 */}
            {expandedTags && (
              <>
                {linkedKRs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-[10px] font-bold tracking-widest text-black/25 uppercase">
                      OKR
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedKRs.map((kr, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-600"
                          title={kr.okrTitle}
                        >
                          {kr.krTitle || kr.okrTitle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(log.collaborators ?? []).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-[10px] font-bold tracking-widest text-black/25 uppercase">
                      동료
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(log.collaborators ?? []).map((name) => (
                        <span
                          key={name}
                          className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold text-black/50"
                        >
                          @{name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 프로젝트가 없을 때 첫 표시 그룹 처리 */}
            {!expandedTags && linkedProjects.length === 0 && linkedKRs.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[10px] font-bold tracking-widest text-black/25 uppercase">
                  OKR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {linkedKRs.map((kr, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-600"
                      title={kr.okrTitle}
                    >
                      {kr.krTitle || kr.okrTitle}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!expandedTags &&
              linkedProjects.length === 0 &&
              linkedKRs.length === 0 &&
              (log.collaborators ?? []).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[10px] font-bold tracking-widest text-black/25 uppercase">
                    동료
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(log.collaborators ?? []).map((name) => (
                      <span
                        key={name}
                        className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold text-black/50"
                      >
                        @{name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* 내용 필드 */}
      {defaultFields.length > 0 && (
        <div
          className="border-t border-black/5 px-5 py-3 sm:px-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 섹션 헤더: 레이블(좌) + 토글(우) */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-black/25 uppercase">
              내용
            </span>
            {defaultFields.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedFields((v) => !v);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-black/30 hover:text-black/60"
              >
                <ChevronDown
                  size={12}
                  className={cn("transition-transform", expandedFields && "rotate-180")}
                />
                {expandedFields ? "접기" : `${defaultFields.length - 1}개 더 보기`}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {visibleFields.map((f) => {
              const val = log[f.key] as string;
              return (
                <div key={f.key}>
                  <p className="mb-0.5 text-[10px] font-bold tracking-widest text-black/40 uppercase">
                    {f.emoji} {f.label}
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-black/70">
                    {search ? highlight(val, search) : val}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 열기 버튼 */}
      <div className="border-t border-black/5 px-5 py-2.5 sm:px-6">
        <button
          onClick={onOpen}
          className="text-xs font-bold text-black/30 transition-colors hover:text-black"
        >
          업무일지 열기 →
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold tracking-widest text-black/40 uppercase">
        {label}
      </p>
      <div className="relative">
        {icon && (
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-black/30">{icon}</span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border border-[#e5e8eb] bg-[#f2f4f6] py-2 pr-7 text-sm font-medium transition-all outline-none focus:border-[#3182f6] focus:bg-white",
            icon ? "pl-8" : "pl-3",
            value !== "all" && "border-black bg-black/5 font-bold",
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-black/30"
        />
      </div>
    </div>
  );
}
