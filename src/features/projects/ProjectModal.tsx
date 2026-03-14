import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import type { Project } from "../../types";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "../../types";

export type ProjectDraft = Omit<Project, "id"> & { id?: string };

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

const inputClass =
  "w-full rounded-xl border border-[#e5e8eb] bg-[#f2f4f6] px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-[#3182f6] focus:bg-white";

interface ProjectModalProps {
  isOpen: boolean;
  project: ProjectDraft;
  setProject: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
}

export function ProjectModal({
  isOpen,
  project,
  setProject,
  onClose,
  onSave,
  isEditing,
}: ProjectModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-7 pb-5">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {isEditing ? "프로젝트 수정" : "프로젝트 추가"}
                </h2>
                <p className="mt-1 text-sm text-[#6b7684]">
                  프로젝트 정보를 입력하세요.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f4f6] transition-colors hover:bg-[#e5e8eb]"
              >
                <X size={20} className="text-[#6b7684]" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5 px-8 pb-4">
              {/* Name */}
              <Field label="프로젝트명 *">
                <input
                  autoFocus
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
                  placeholder="프로젝트 이름을 입력하세요"
                  className={inputClass}
                />
              </Field>

              {/* Description */}
              <Field label="설명">
                <textarea
                  rows={2}
                  value={project.description ?? ""}
                  onChange={(e) => setProject((p) => ({ ...p, description: e.target.value }))}
                  placeholder="프로젝트 설명 (선택)"
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {/* Color + Status */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="색상">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setProject((p) => ({ ...p, color: c }))}
                        className={cn(
                          "h-7 w-7 rounded-lg transition-all",
                          project.color === c
                            ? "ring-2 ring-[#3182f6] ring-offset-2"
                            : "hover:scale-110",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="상태">
                  <select
                    value={project.status}
                    onChange={(e) =>
                      setProject((p) => ({ ...p, status: e.target.value as ProjectStatus }))
                    }
                    className={inputClass}
                  >
                    {(["active", "on_hold", "completed", "archived"] as ProjectStatus[]).map(
                      (s) => (
                        <option key={s} value={s}>
                          {PROJECT_STATUS_LABEL[s]}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="시작일">
                  <input
                    type="date"
                    value={project.start_date ?? ""}
                    onChange={(e) => setProject((p) => ({ ...p, start_date: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="종료일">
                  <input
                    type="date"
                    value={project.end_date ?? ""}
                    onChange={(e) => setProject((p) => ({ ...p, end_date: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e5e8eb] px-8 py-5">
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#6b7684] transition-colors hover:text-[#191f28]"
              >
                취소
              </button>
              <button
                onClick={onSave}
                disabled={!project.name.trim()}
                className="rounded-xl bg-[#3182f6] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95 disabled:opacity-40"
              >
                저장하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-[#6b7684]">{label}</label>
      {children}
    </div>
  );
}
