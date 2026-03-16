import { Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "../../lib/cn";
import type { OKR, Project, WorkLog } from "../../types";
import { DetailsTab } from "./tabs/DetailsTab";
import { MemoTab } from "./tabs/MemoTab";
import { OkrTab } from "./tabs/OkrTab";
import { ProjectTab } from "./tabs/ProjectTab";
import { TodoTab } from "./tabs/TodoTab";

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: WorkLog) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
  okrs: OKR[];
  projects: Project[];
  allCollaborators: string[];
}

const TABS = [
  { id: "todo", label: "할 일" },
  { id: "details", label: "상세 기록" },
  { id: "memo", label: "메모" },
  { id: "okr", label: "OKR 연결" },
  { id: "project", label: "프로젝트 연결" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const WorkLogModal: React.FC<WorkLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  log,
  setLog,
  okrs,
  projects,
  allCollaborators,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("todo");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(log);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!log.id || !onDelete) return;
    await onDelete(log.id);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-none sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 touch-none bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative flex h-[92vh] w-full flex-col overflow-hidden overscroll-none rounded-t-[28px] bg-[#f7f8fa] shadow-2xl sm:max-w-4xl sm:rounded-[32px]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-[#e5e8eb] bg-white px-5 py-4 sm:px-8 sm:py-5">
              {confirmDelete ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-red-500">업무일지를 삭제할까요?</p>
                    <p className="mt-0.5 text-xs font-medium text-[#6b7684]">
                      이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-[#6b7684] transition-colors hover:text-[#191f28]"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDelete}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight">
                      {log.log_date.replace(/-/g, ".")}
                    </h2>
                    <p className="mt-0.5 text-sm font-medium text-[#6b7684]">
                      오늘의 업무를 기록하세요
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.id && onDelete && (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f4f6] text-[#6b7684] transition-colors hover:bg-[#e5e8eb]"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f4f6] transition-colors hover:bg-[#e5e8eb]"
                    >
                      <X size={20} className="text-[#6b7684]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e5e8eb] bg-white px-5 sm:px-8">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-5 py-3.5 text-sm font-bold transition-all",
                    activeTab === tab.id
                      ? "border-[#3182f6] text-[#3182f6]"
                      : "border-transparent text-[#6b7684] hover:text-[#191f28]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-[#f7f8fa] p-4 sm:p-6">
              {activeTab === "todo" && <TodoTab log={log} setLog={setLog} />}
              {activeTab === "details" && (
                <DetailsTab log={log} setLog={setLog} allCollaborators={allCollaborators} />
              )}
              {activeTab === "memo" && <MemoTab log={log} setLog={setLog} />}
              {activeTab === "okr" && <OkrTab log={log} setLog={setLog} okrs={okrs} />}
              {activeTab === "project" && (
                <ProjectTab log={log} setLog={setLog} projects={projects} />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e5e8eb] bg-white px-5 py-4 sm:px-8 sm:py-5">
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#6b7684] transition-colors hover:text-[#191f28]"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[#3182f6] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95 disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
