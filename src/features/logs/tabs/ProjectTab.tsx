import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

import { cn } from "../../../lib/cn";
import type { Project, WorkLog } from "../../../types";
import { PROJECT_STATUS_LABEL } from "../../../types";

interface ProjectTabProps {
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
  projects: Project[];
}

export function ProjectTab({ log, setLog, projects }: ProjectTabProps) {
  const [projectSearch, setProjectSearch] = useState("");
  const [projectLimit, setProjectLimit] = useState(10);

  const selectableProjects = projects.filter((p) => p.status !== "archived");

  const filteredProjects = projectSearch.trim()
    ? selectableProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(projectSearch.toLowerCase()),
      )
    : selectableProjects;

  const visibleProjects = filteredProjects.slice(0, projectLimit);

  const handleToggleProject = (projectId: string) => {
    const current = log.project_ids ?? [];
    const updated = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    setLog((prev) => ({ ...prev, project_ids: updated }));
  };

  return (
    <div className="space-y-4">
      <p className="px-1 text-[12px] font-semibold text-[#6b7684]">프로젝트 선택</p>

      <div className="relative">
        <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#b0b8c1]" />
        <input
          type="text"
          value={projectSearch}
          onChange={(e) => {
            setProjectSearch(e.target.value);
            setProjectLimit(10);
          }}
          placeholder="프로젝트 이름으로 검색"
          className="w-full rounded-xl border border-[#e5e8eb] bg-white py-2.5 pr-4 pl-9 text-sm font-medium transition-all outline-none focus:border-[#3182f6]"
        />
      </div>

      {selectableProjects.length === 0 && (
        <div className="rounded-2xl border border-[#e5e8eb] bg-white py-12 text-center font-bold text-[#b0b8c1]">
          등록된 프로젝트가 없습니다.
        </div>
      )}

      {selectableProjects.length > 0 && filteredProjects.length === 0 && (
        <div className="rounded-2xl border border-[#e5e8eb] bg-white py-12 text-center font-bold text-[#b0b8c1]">
          검색 결과가 없습니다.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visibleProjects.map((project) => {
          const selected = (log.project_ids ?? []).includes(project.id);
          return (
            <button
              key={project.id}
              onClick={() => handleToggleProject(project.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition-all",
                selected
                  ? "border-[#3182f6] bg-[#ebf3ff]"
                  : "border-transparent bg-white hover:border-[#e5e8eb]",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                  selected ? "border-[#3182f6] bg-[#3182f6] text-white" : "border-[#b0b8c1]",
                )}
              >
                {selected && <Check size={12} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="text-sm font-bold text-[#191f28]">{project.name}</div>
                </div>
                {project.description && (
                  <div className="mt-0.5 line-clamp-1 text-[11px] font-medium text-[#6b7684]">
                    {project.description}
                  </div>
                )}
                <div className="mt-0.5 text-[11px] font-medium text-[#b0b8c1]">
                  {PROJECT_STATUS_LABEL[project.status]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredProjects.length > projectLimit && (
        <button
          onClick={() => setProjectLimit((prev) => prev + 10)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e5e8eb] bg-white py-3 text-sm font-bold text-[#6b7684] transition-all hover:text-[#191f28]"
        >
          <ChevronDown size={15} />
          더보기 ({filteredProjects.length - projectLimit}개 남음)
        </button>
      )}
    </div>
  );
}
