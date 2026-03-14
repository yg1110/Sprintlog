import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState, SectionHeader } from "../../components/Layout";
import type { WorkLog } from "../../types";

interface ArchivePageProps {
  logs: WorkLog[];
  onOpenWorkLog: (date: string) => void;
}

const FIELDS: { key: keyof WorkLog; label: string }[] = [
  { key: "done_text", label: "한 일" },
  { key: "issue_text", label: "이슈" },
  { key: "blocked_text", label: "막힌 것" },
  { key: "decision_text", label: "설계" },
  { key: "learned_text", label: "배운 점" },
  { key: "tomorrow_plan_text", label: "내일 할 일" },
  { key: "metric_change_text", label: "수치 변화" },
  { key: "feedback_text", label: "피드백" },
  { key: "improvement_text", label: "개선 포인트" },
];

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-blue-200 px-0.5 text-black">
        {text.slice(idx, idx + query.length)}
      </mark>
      {highlight(text.slice(idx + query.length), query)}
    </>
  );
}

export function ArchivePage({ logs, onOpenWorkLog }: ArchivePageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");

  const field = FIELDS[activeTab];

  // 현재 탭 필드에 내용이 있는 로그만, 키워드 필터 적용
  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .filter((log) => {
        const val = log[field.key];
        if (typeof val !== "string" || val.trim() === "") return false;
        if (q) return val.toLowerCase().includes(q);
        return true;
      })
      .map((log) => ({ log_date: log.log_date, text: log[field.key] as string }));
  }, [logs, field, query]);

  return (
    <div className="space-y-6">
      <SectionHeader title="업무 아카이브" />

      {/* 탭 */}
      <div className="flex flex-wrap gap-2">
        {FIELDS.map((f, i) => (
          <button
            key={f.key}
            onClick={() => {
              setActiveTab(i);
              setQuery("");
            }}
            className={[
              "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === i
                ? "bg-black text-white"
                : "bg-black/5 text-black/40 hover:bg-black/10 hover:text-black",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-black/30" />
        <input
          type="text"
          placeholder={`${field.label} 검색...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white py-2.5 pr-4 pl-9 text-sm font-medium transition-all outline-none placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
        />
      </div>

      {/* 결과 수 */}
      <p className="text-xs font-bold text-black/30">{entries.length}건</p>

      {/* 엔트리 목록 */}
      {entries.length === 0 ? (
        <EmptyState
          title={query.trim() ? "검색 결과가 없습니다" : `기록된 '${field.label}'이 없습니다`}
          sub={
            query.trim()
              ? "다른 키워드로 검색해 보세요"
              : "업무기록 페이지에서 내용을 작성하면 여기에 표시됩니다"
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map(({ log_date, text }) => (
            <div
              key={log_date}
              onClick={() => onOpenWorkLog(log_date)}
              className="cursor-pointer rounded-2xl border border-black/5 bg-white px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="mb-2 text-[11px] font-black tracking-widest text-black/30 uppercase">
                {format(parseISO(log_date), "yyyy년 M월 d일 (eee)", { locale: ko })}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-black/70">
                {highlight(text, query.trim())}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
