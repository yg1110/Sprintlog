import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { WorkLog } from "../../../types";

interface MemoEntry {
  id: string;
  timestamp: string; // YY.MM.DD HH:MM
  content: string;
}

interface MemoTabProps {
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
}

function nowTimestamp(): string {
  return format(new Date(), "yy.MM.dd HH:mm");
}

function parseMemos(raw: string): MemoEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MemoEntry[];
  } catch {
    // ignore
  }
  return [];
}

export function MemoTab({ log, setLog }: MemoTabProps) {
  const [entries, setEntries] = useState<MemoEntry[]>(() => parseMemos(log.memo_text));
  const newEntryIdRef = useRef<string | null>(null);
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // 다른 날짜의 로그를 열 때 entries 재초기화 (log_date 또는 id가 바뀔 때)
  const logKeyRef = useRef(log.id ?? log.log_date);
  useEffect(() => {
    const key = log.id ?? log.log_date;
    if (logKeyRef.current !== key) {
      logKeyRef.current = key;
      setEntries(parseMemos(log.memo_text));
    }
    // log.memo_text는 의도적으로 제외 — log identity가 바뀔 때만 재초기화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log.id, log.log_date]);

  // entries 변경을 log.memo_text로 즉시 반영 (useEffect 없이 핸들러에서 직접 처리)
  const commit = (next: MemoEntry[]) => {
    setEntries(next);
    setLog((prev) => ({ ...prev, memo_text: JSON.stringify(next) }));
  };

  const handleAdd = () => {
    const id = `memo_${Date.now()}`;
    newEntryIdRef.current = id;
    commit([{ id, timestamp: nowTimestamp(), content: "" }, ...entries]);
  };

  const handleFocus = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    // 내용이 없을 때만 타임스탬프 갱신 (이미 내용이 있으면 타임스탬프 유지)
    if (!entry || entry.content !== "") return;
    commit(entries.map((e) => (e.id === id ? { ...e, timestamp: nowTimestamp() } : e)));
  };

  const handleChange = (id: string, content: string) => {
    commit(entries.map((e) => (e.id === id ? { ...e, content } : e)));
  };

  const handleRemove = (id: string) => {
    commit(entries.filter((e) => e.id !== id));
  };

  // 새 항목 추가 후 textarea 자동 포커스
  useEffect(() => {
    const id = newEntryIdRef.current;
    if (!id) return;
    const el = textareaRefs.current.get(id);
    if (el) {
      el.focus();
      newEntryIdRef.current = null;
    }
  }, [entries]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[12px] font-semibold text-[#6b7684]">메모</p>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-xl bg-[#3182f6] px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95"
        >
          <Plus size={13} />새 메모
        </button>
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d1d8e0] bg-white py-16 text-center">
          <p className="text-sm font-bold text-[#b0b8c1]">메모가 없습니다</p>
          <p className="mt-1 text-xs font-medium text-[#b0b8c1]">
            새 메모 버튼을 눌러 기록을 시작해보세요
          </p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="group rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-lg bg-[#f2f4f6] px-2.5 py-1 text-[11px] font-bold text-[#6b7684] tabular-nums">
                {entry.timestamp}
              </span>
              <button
                onClick={() => handleRemove(entry.id)}
                className="text-[#b0b8c1] opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              ref={(el) => {
                if (el) textareaRefs.current.set(entry.id, el);
                else textareaRefs.current.delete(entry.id);
              }}
              value={entry.content}
              onChange={(e) => handleChange(entry.id, e.target.value)}
              onFocus={() => handleFocus(entry.id)}
              rows={15}
              placeholder="메모를 입력하세요..."
              className="w-full resize-none rounded-xl border border-[#e5e8eb] bg-[#f2f4f6] px-4 py-3 text-sm font-medium transition-all outline-none focus:border-[#3182f6] focus:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
