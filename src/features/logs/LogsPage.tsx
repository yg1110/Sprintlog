import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { cn } from "../../lib/cn";
import type { OKR, Project, WorkLog } from "../../types";
import { WorkLogModal } from "./WorkLogModal";

const EMPTY_LOG = (dateStr: string): WorkLog => ({
  log_date: dateStr,
  summary: "",
  done_text: "",
  issue_text: "",
  blocked_text: "",
  decision_text: "",
  learned_text: "",
  tomorrow_plan_text: "",
  metric_change_text: "",
  feedback_text: "",
  improvement_text: "",
  memo_text: "[]",
  todo_items: [],
  kr_ids: [],
  project_ids: [],
  collaborators: [],
});

interface LogsPageProps {
  logs: WorkLog[];
  okrs: OKR[];
  projects: Project[];
  onSaveLog: (log: WorkLog) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
}

export const LogsPage: React.FC<LogsPageProps> = ({ logs, okrs, projects, onSaveLog, onDeleteLog }) => {
  const location = useLocation();
  const openDate = (location.state as { openDate?: string } | null)?.openDate;

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (openDate) return new Date(openDate + "T00:00:00");
    return new Date();
  });
  const [isModalOpen, setIsModalOpen] = useState(!!openDate);
  const [editingLog, setEditingLog] = useState<WorkLog>(() => {
    if (openDate) {
      const existing = logs.find((l) => l.log_date === openDate);
      return existing ? { ...existing } : EMPTY_LOG(openDate);
    }
    return EMPTY_LOG(format(new Date(), "yyyy-MM-dd"));
  });

  // location state 소비 후 클리어 (뒤로가기 시 재오픈 방지)
  useEffect(() => {
    if (openDate) {
      window.history.replaceState({}, "");
    }
  }, [openDate]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const openModal = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = logs.find((l) => l.log_date === dateStr);
    setEditingLog(existing ? { ...existing } : EMPTY_LOG(dateStr));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {format(currentMonth, "yyyy년 MM월")}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-black/30 transition-colors hover:bg-black/5 hover:text-black"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-black/30 transition-colors hover:bg-black/5 hover:text-black"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <button
          onClick={() => openModal(new Date())}
          className="flex items-center gap-2 rounded-xl bg-[#3182f6] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95 sm:px-5"
        >
          <Plus size={16} />
          오늘 기록하기
        </button>
      </div>

      {/* Calendar */}
      <div>
        <div
          className="mb-2"
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}
        >
          {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
            <div
              key={day}
              className={cn(
                "py-2 text-center text-[11px] font-bold tracking-widest uppercase",
                i === 0 ? "text-red-400/60" : i === 6 ? "text-blue-400/60" : "text-black/20",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: "1/1" }} />
          ))}

          {days.map((day) => {
            const log = logs.find((l) => isSameDay(new Date(l.log_date + "T00:00:00"), day));
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <motion.button
                key={day.toString()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openModal(day)}
                style={{ aspectRatio: "1/1" }}
                className={cn(
                  "flex flex-col justify-between rounded-2xl p-2 text-left transition-all xl:p-3",
                  log ? "bg-[#3182f6] text-white shadow-md" : "bg-white shadow-sm hover:shadow-md",
                  isToday(day) && !log && "ring-2 ring-[#3182f6] ring-offset-2",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-black",
                      log
                        ? "text-white"
                        : isToday(day)
                          ? "text-black"
                          : isWeekend
                            ? day.getDay() === 0
                              ? "text-red-400"
                              : "text-blue-400"
                            : "text-black/25",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {log && <div className="hidden h-1.5 w-1.5 rounded-full bg-white/50 md:block" />}
                </div>
                {log && (
                  <div className="mt-1 hidden md:block">
                    <div className="truncate text-[10px] leading-tight font-bold text-white/80">
                      {log.summary || "기록됨"}
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <WorkLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (log) => {
          await onSaveLog(log);
          setIsModalOpen(false);
        }}
        onDelete={async (id) => {
          await onDeleteLog(id);
          setIsModalOpen(false);
        }}
        log={editingLog}
        setLog={setEditingLog}
        okrs={okrs}
        projects={projects}
        allCollaborators={[...new Set(logs.flatMap((l) => l.collaborators ?? []))]}
      />
    </div>
  );
};
