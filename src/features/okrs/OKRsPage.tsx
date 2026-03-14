import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Archive, ChevronDown, ChevronRight, CircleDot, MoreHorizontal, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useState } from "react";

import { EmptyState, SectionHeader } from "../../components/Layout";
import { cn } from "../../lib/cn";
import type { OKR, WorkLog } from "../../types";
import { PERIOD_TYPE_LABEL, type PeriodType } from "../../types";
import type { OKRDraft } from "./OKRModal";
import { OKRModal } from "./OKRModal";

function createEmptyOKR(): OKRDraft {
  const today = new Date().toISOString().split("T")[0];
  return {
    title: "",
    key_results: [
      { id: crypto.randomUUID(), title: "", target_value: 0, current_value: 0, unit: "" },
    ],
    period_type: "sprint",
    start_date: today,
    end_date: today,
    status: "active",
  };
}

interface OKRsPageProps {
  okrs: OKR[];
  logs: WorkLog[];
  onSaveOKR: (okr: OKRDraft) => Promise<void>;
  onDeleteOKR: (id: string) => Promise<void>;
  onOpenWorkLog: (date: string) => void;
}

const PERIOD_BADGE_STYLES: Record<OKR["period_type"], string> = {
  sprint: "bg-emerald-100 text-emerald-700",
  monthly: "bg-blue-100 text-blue-700",
  quarterly: "bg-purple-100 text-purple-700",
  yearly: "bg-orange-100 text-orange-700",
};

type OKRStatusFilter = "all" | OKR["status"];
type PeriodFilter = "all" | PeriodType;

const STATUS_FILTERS: { value: OKRStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
  { value: "archived", label: "보관" },
];

const PERIOD_FILTERS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "sprint", label: "주간" },
  { value: "monthly", label: "월간" },
  { value: "quarterly", label: "분기" },
  { value: "yearly", label: "연간" },
];

export function OKRsPage({ okrs, logs, onSaveOKR, onDeleteOKR, onOpenWorkLog }: OKRsPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOKR, setEditingOKR] = useState<OKRDraft>(createEmptyOKR());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OKRStatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const openCreate = () => {
    setEditingOKR(createEmptyOKR());
    setModalOpen(true);
  };

  const openEdit = (okr: OKR) => {
    setEditingOKR(okr);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingOKR.title.trim()) return;
    await onSaveOKR(editingOKR);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await onDeleteOKR(deleteId);
      setDeleteId(null);
    }
  };

  const handleArchive = async (okr: OKR) => {
    const nextStatus = okr.status === "archived" ? "active" : "archived";
    await onSaveOKR({ ...okr, status: nextStatus });
  };

  const filtered = okrs.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (periodFilter !== "all" && o.period_type !== periodFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTitle = o.title.toLowerCase().includes(q);
      const inKR = (o.key_results ?? []).some((kr) => kr.title.toLowerCase().includes(q));
      if (!inTitle && !inKR) return false;
    }
    return true;
  });

  const active = filtered.filter((o) => o.status !== "archived");
  const archived = filtered.filter((o) => o.status === "archived");
  const isFiltering = search.trim() || statusFilter !== "all" || periodFilter !== "all";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="OKR"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#3182f6] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95"
          >
            <Plus size={16} />
            OKR 추가
          </button>
        }
      />

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="목표 또는 KR 이름으로 검색"
            className="w-full rounded-xl border border-[#e5e8eb] bg-white py-2.5 pr-4 pl-9 text-sm font-medium outline-none transition-all focus:border-[#3182f6]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                statusFilter === f.value
                  ? "bg-[#3182f6] text-white"
                  : "bg-white text-[#6b7684] hover:text-[#191f28]",
              )}
            >
              {f.label}
            </button>
          ))}
          <div className="mx-1 w-px self-stretch bg-black/10" />
          {PERIOD_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPeriodFilter(f.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                periodFilter === f.value
                  ? "bg-[#3182f6] text-white"
                  : "bg-white text-[#6b7684] hover:text-[#191f28]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {okrs.length === 0 && (
        <EmptyState title="등록된 OKR이 없어요." sub="첫 목표를 만들어보세요." />
      )}

      {okrs.length > 0 && filtered.length === 0 && (
        <EmptyState title="검색 결과가 없습니다." sub="다른 검색어나 필터를 사용해보세요." />
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          {!isFiltering && (
            <h3 className="text-xs font-bold tracking-widest text-black/30 uppercase">진행중</h3>
          )}
          {active.map((okr) => (
            <OKRCard
              key={okr.id}
              okr={okr}
              logs={logs}
              onEdit={() => openEdit(okr)}
              onDelete={() => setDeleteId(okr.id)}
              onArchive={() => handleArchive(okr)}
              onOpenWorkLog={onOpenWorkLog}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-widest text-black/30 uppercase">보관됨</h3>
          {archived.map((okr) => (
            <OKRCard
              key={okr.id}
              okr={okr}
              logs={logs}
              onEdit={() => openEdit(okr)}
              onDelete={() => setDeleteId(okr.id)}
              onArchive={() => handleArchive(okr)}
              onOpenWorkLog={onOpenWorkLog}
            />
          ))}
        </div>
      )}

      <OKRModal
        isOpen={modalOpen}
        okr={editingOKR}
        setOkr={setEditingOKR}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isEditing={!!editingOKR.id}
      />

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="text-lg font-black">OKR을 삭제할까요?</h3>
            <p className="mt-2 text-sm text-black/40">이 작업은 되돌릴 수 없습니다.</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-black/40 transition-colors hover:text-black"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OKRCard({
  okr,
  logs,
  onEdit,
  onDelete,
  onArchive,
  onOpenWorkLog,
}: {
  okr: OKR;
  logs: WorkLog[];
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onOpenWorkLog: (date: string) => void;
}) {
  const krs = okr.key_results ?? [];
  const [expandedKrId, setExpandedKrId] = useState<string | null>(null);

  // KR별 연결된 업무일지 수 → current_value로 사용
  const linkedLogsMap = Object.fromEntries(
    krs.map((kr) => [kr.id, logs.filter((l) => (l.kr_ids ?? []).includes(kr.id))]),
  );

  const overallProgress =
    krs.length === 0
      ? 0
      : krs.reduce((sum, kr) => {
          const current = linkedLogsMap[kr.id].length;
          const p = kr.target_value > 0 ? (current / kr.target_value) * 100 : 0;
          return sum + p;
        }, 0) / krs.length;

  const toggleKR = (krId: string) => {
    setExpandedKrId((prev) => (prev === krId ? null : krId));
  };

  return (
    <div className="group relative rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Edit / Archive / Delete buttons */}
      <div className="absolute top-5 right-5 flex items-center gap-1 opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-black/5 hover:text-black"
        >
          <MoreHorizontal size={16} />
        </button>
        <button
          onClick={onArchive}
          title={okr.status === "archived" ? "복원" : "보관"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-amber-50 hover:text-amber-500"
        >
          {okr.status === "archived" ? <RotateCcw size={14} /> : <Archive size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Top row: icon + badge + date */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5">
          <CircleDot size={20} className="text-black/40" />
        </div>
        <div>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase",
              PERIOD_BADGE_STYLES[okr.period_type],
            )}
          >
            {PERIOD_TYPE_LABEL[okr.period_type]}
          </span>
          {(okr.start_date || okr.end_date) && (
            <p className="mt-0.5 text-[11px] font-medium text-black/30">
              {okr.start_date} ~ {okr.end_date}
            </p>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-4 text-lg leading-snug font-bold">{okr.title}</h3>

      {/* Overall progress */}
      <div className="mb-1 flex items-center justify-between text-sm font-bold">
        <span className="text-black/40">전체 진행률</span>
        <span>{Math.round(overallProgress)}%</span>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Key Results */}
      {krs.length > 0 && (
        <>
          <div className="mb-3 border-t border-black/5" />
          <p className="mb-3 text-[11px] font-bold tracking-widest text-black/30 uppercase">
            핵심 결과
          </p>
          <div className="space-y-2">
            {krs.map((kr) => {
              const linkedLogs = [...linkedLogsMap[kr.id]].sort((a, b) =>
                b.log_date.localeCompare(a.log_date),
              );
              const krProgress =
                kr.target_value > 0 ? Math.min((kr.current_value / kr.target_value) * 100, 100) : 0;
              const isExpanded = expandedKrId === kr.id;

              return (
                <div key={kr.id} className="overflow-hidden rounded-2xl">
                  {/* KR row — clickable */}
                  <button
                    onClick={() => toggleKR(kr.id)}
                    className={cn(
                      "w-full rounded-2xl px-4 py-3 text-left transition-colors",
                      isExpanded ? "rounded-b-none bg-black/5" : "hover:bg-black/3",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {kr.title || <span className="text-black/20">제목 없음</span>}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {linkedLogs.length > 0 && (
                          <span className="rounded-md bg-black/8 px-1.5 py-0.5 text-[10px] font-bold text-black/40">
                            {linkedLogs.length}건
                          </span>
                        )}
                        <span className="text-xs font-bold text-black/30">
                          {kr.current_value} / {kr.target_value}
                          {kr.unit ? ` ${kr.unit}` : ""}
                        </span>
                        <ChevronDown
                          size={14}
                          className={cn(
                            "text-black/30 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full bg-black/20 transition-all"
                        style={{ width: `${krProgress}%` }}
                      />
                    </div>
                  </button>

                  {/* Expanded: linked work logs */}
                  {isExpanded && (
                    <div className="rounded-b-2xl bg-black/5 px-4 pb-3">
                      <p className="mb-2 pt-1 text-[10px] font-bold tracking-widest text-black/30 uppercase">
                        연결된 업무일지 {linkedLogs.length > 0 ? `${linkedLogs.length}건` : ""}
                      </p>
                      {linkedLogs.length === 0 ? (
                        <p className="py-2 text-xs font-medium text-black/25">
                          연결된 업무일지가 없습니다.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {linkedLogs.map((log) => (
                            <button
                              key={log.log_date}
                              onClick={() => onOpenWorkLog(log.log_date)}
                              className="group/log w-full rounded-xl bg-white px-3 py-2.5 text-left shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-black/10"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-black/60">
                                  {format(parseISO(log.log_date), "M월 d일 (EEE)", { locale: ko })}
                                </span>
                                <ChevronRight
                                  size={12}
                                  className="shrink-0 text-black/20 transition-transform group-hover/log:translate-x-0.5 group-hover/log:text-black/40"
                                />
                              </div>
                              {log.summary && (
                                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-black/50">
                                  {log.summary}
                                </p>
                              )}
                              {!log.summary && log.done_text && (
                                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-black/40">
                                  {log.done_text}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
