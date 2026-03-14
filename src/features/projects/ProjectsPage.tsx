import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

import { EmptyState, SectionHeader } from "../../components/Layout";
import { cn } from "../../lib/cn";
import type { Project, WorkLog } from "../../types";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "../../types";

const STATUS_BADGE: Record<ProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-black/8 text-black/40",
};

const PRESET_COLORS = [
  "#6366F1",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

function createEmptyProject(): Omit<Project, "id"> {
  return {
    name: "",
    description: "",
    color: "#6366F1",
    status: "active",
    start_date: "",
    end_date: "",
  };
}

interface ProjectsPageProps {
  projects: Project[];
  logs: WorkLog[];
  onSaveProject: (project: Omit<Project, "id"> & { id?: string }) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onOpenWorkLog: (date: string) => void;
}

type StatusFilter = "all" | ProjectStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "on_hold", label: "보류" },
  { value: "completed", label: "완료" },
  { value: "archived", label: "보관" },
];

export function ProjectsPage({
  projects,
  logs,
  onSaveProject,
  onDeleteProject,
  onOpenWorkLog,
}: ProjectsPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<(Omit<Project, "id"> & { id?: string }) | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const openCreate = () => {
    setEditing(createEmptyProject());
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing({ ...p });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return;
    await onSaveProject(editing);
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await onDeleteProject(deleteId);
    setDeleteId(null);
  };

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !(p.description ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const active = filtered.filter((p) => p.status !== "archived");
  const archived = filtered.filter((p) => p.status === "archived");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="프로젝트"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <Plus size={16} />
            프로젝트 추가
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
            placeholder="프로젝트 이름 또는 설명으로 검색"
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pr-4 pl-9 text-sm font-medium outline-none transition-all focus:border-black/25"
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
                  ? "bg-black text-white"
                  : "bg-white text-black/40 hover:text-black",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {projects.length === 0 && (
        <EmptyState title="등록된 프로젝트가 없어요." sub="첫 프로젝트를 만들어보세요." />
      )}

      {projects.length > 0 && filtered.length === 0 && (
        <EmptyState title="검색 결과가 없습니다." sub="다른 검색어나 필터를 사용해보세요." />
      )}

      {active.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              logs={logs}
              onEdit={() => openEdit(p)}
              onDelete={() => setDeleteId(p.id)}
              onOpenWorkLog={onOpenWorkLog}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-widest text-black/30 uppercase">보관됨</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {archived.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                logs={logs}
                onEdit={() => openEdit(p)}
                onDelete={() => setDeleteId(p.id)}
                onOpenWorkLog={onOpenWorkLog}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="mb-5 text-xl font-black tracking-tight">
              {editing.id ? "프로젝트 수정" : "프로젝트 추가"}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-black/40 uppercase">
                  프로젝트명 *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="프로젝트 이름을 입력하세요"
                  className="w-full rounded-xl border border-black/10 bg-[#f8f8f8] px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-black/25 focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-black/40 uppercase">
                  설명
                </label>
                <textarea
                  rows={2}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="프로젝트 설명 (선택)"
                  className="w-full resize-none rounded-xl border border-black/10 bg-[#f8f8f8] px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-black/25 focus:bg-white"
                />
              </div>

              {/* Color + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-black/40 uppercase">
                    색상
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditing({ ...editing, color: c })}
                        className={cn(
                          "h-7 w-7 rounded-lg transition-all",
                          editing.color === c
                            ? "ring-2 ring-black ring-offset-2"
                            : "hover:scale-110",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-black/40 uppercase">
                    상태
                  </label>
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value as ProjectStatus })
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#f8f8f8] px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-black/25 focus:bg-white"
                  >
                    {(["active", "on_hold", "completed", "archived"] as ProjectStatus[]).map(
                      (s) => (
                        <option key={s} value={s}>
                          {PROJECT_STATUS_LABEL[s]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-black/40 uppercase">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={editing.start_date ?? ""}
                    onChange={(e) => setEditing({ ...editing, start_date: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-[#f8f8f8] px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-black/25 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-black/40 uppercase">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={editing.end_date ?? ""}
                    onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-[#f8f8f8] px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-black/25 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-black/30 transition-colors hover:text-black"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!editing.name.trim()}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="text-lg font-black">프로젝트를 삭제할까요?</h3>
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

function ProjectCard({
  project,
  logs,
  onEdit,
  onDelete,
  onOpenWorkLog,
}: {
  project: Project;
  logs: WorkLog[];
  onEdit: () => void;
  onDelete: () => void;
  onOpenWorkLog: (date: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const linkedLogs = logs
    .filter((l) => (l.project_ids ?? []).includes(project.id))
    .sort((a, b) => b.log_date.localeCompare(a.log_date));

  return (
    <div className="group relative rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Edit / Delete */}
      <div className="absolute top-5 right-5 flex items-center gap-1 opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-black/5 hover:text-black"
        >
          <MoreHorizontal size={16} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-black/30 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-2xl"
          style={{ backgroundColor: project.color + "22" }}
        >
          <div
            className="flex h-full w-full items-center justify-center rounded-2xl"
            style={{ color: project.color }}
          >
            <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: project.color }} />
          </div>
        </div>
        <div>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase",
              STATUS_BADGE[project.status],
            )}
          >
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
          {(project.start_date || project.end_date) && (
            <p className="mt-0.5 text-[11px] font-medium text-black/30">
              {project.start_date || "?"} ~ {project.end_date || "?"}
            </p>
          )}
        </div>
      </div>

      <h3 className="mb-1 text-lg font-bold leading-snug">{project.name}</h3>
      {project.description && (
        <p className="mb-4 text-sm font-medium text-black/40 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Linked logs */}
      <div className="mt-4 border-t border-black/5 pt-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-[11px] font-bold tracking-widest text-black/30 uppercase transition-colors hover:text-black/60"
        >
          <span>연결된 업무일지 {linkedLogs.length > 0 ? `${linkedLogs.length}건` : ""}</span>
          <ChevronRight
            size={13}
            className={cn("transition-transform", expanded && "rotate-90")}
          />
        </button>

        {expanded && (
          <div className="mt-3 space-y-1.5">
            {linkedLogs.length === 0 ? (
              <p className="py-2 text-xs font-medium text-black/25">연결된 업무일지가 없습니다.</p>
            ) : (
              linkedLogs.map((log) => (
                <button
                  key={log.log_date}
                  onClick={() => onOpenWorkLog(log.log_date)}
                  className="group/log w-full rounded-xl bg-[#f8f8f8] px-3 py-2.5 text-left transition-all hover:bg-black/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-black/60">
                      {format(parseISO(log.log_date), "M월 d일 (EEE)", { locale: ko })}
                    </span>
                    <ChevronRight
                      size={12}
                      className="shrink-0 text-black/20 transition-transform group-hover/log:translate-x-0.5"
                    />
                  </div>
                  {log.summary && (
                    <p className="mt-0.5 line-clamp-1 text-xs font-medium text-black/40">
                      {log.summary}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
