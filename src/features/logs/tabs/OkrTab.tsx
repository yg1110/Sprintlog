import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

import { cn } from "../../../lib/cn";
import type { OKR, WorkLog } from "../../../types";

interface OkrTabProps {
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
  okrs: OKR[];
}

export function OkrTab({ log, setLog, okrs }: OkrTabProps) {
  const [krSearch, setKrSearch] = useState("");
  const [krLimit, setKrLimit] = useState(10);

  const selectableOKRs = okrs.filter((o) => o.status !== "archived");

  const allKRs = selectableOKRs
    .slice()
    .sort((a, b) => b.end_date.localeCompare(a.end_date))
    .flatMap((okr) => (okr.key_results ?? []).map((kr) => ({ kr, okr })));

  const filteredKRs = krSearch.trim()
    ? allKRs.filter(
        ({ kr, okr }) =>
          kr.title.toLowerCase().includes(krSearch.toLowerCase()) ||
          okr.title.toLowerCase().includes(krSearch.toLowerCase()),
      )
    : allKRs;

  const visibleKRs = filteredKRs.slice(0, krLimit);

  const handleToggleKR = (krId: string) => {
    const current = log.kr_ids ?? [];
    const updated = current.includes(krId)
      ? current.filter((id) => id !== krId)
      : [...current, krId];
    setLog((prev) => ({ ...prev, kr_ids: updated }));
  };

  return (
    <div className="space-y-4">
      <p className="px-1 text-[12px] font-semibold text-[#6b7684]">관련 핵심 결과(KR) 선택</p>

      <div className="relative">
        <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#b0b8c1]" />
        <input
          type="text"
          value={krSearch}
          onChange={(e) => {
            setKrSearch(e.target.value);
            setKrLimit(10);
          }}
          placeholder="KR 또는 목표 이름으로 검색"
          className="w-full rounded-xl border border-[#e5e8eb] bg-white py-2.5 pr-4 pl-9 text-sm font-medium transition-all outline-none focus:border-[#3182f6]"
        />
      </div>

      {allKRs.length === 0 && (
        <div className="rounded-2xl border border-[#e5e8eb] bg-white py-12 text-center font-bold text-[#b0b8c1]">
          등록된 OKR이 없습니다.
        </div>
      )}

      {allKRs.length > 0 && filteredKRs.length === 0 && (
        <div className="rounded-2xl border border-[#e5e8eb] bg-white py-12 text-center font-bold text-[#b0b8c1]">
          검색 결과가 없습니다.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visibleKRs.map(({ kr, okr }) => {
          const selected = (log.kr_ids ?? []).includes(kr.id);
          return (
            <button
              key={kr.id}
              onClick={() => handleToggleKR(kr.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
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
                <div
                  className={cn(
                    "text-sm font-bold",
                    selected ? "text-[#3182f6]" : "text-[#191f28]",
                  )}
                >
                  {kr.title || "제목 없음"}
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-[11px] font-medium",
                    selected ? "text-[#3182f6]" : "text-[#6b7684]",
                  )}
                >
                  {okr.title}
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-[11px] font-medium",
                    selected ? "text-[#3182f6]/70" : "text-[#b0b8c1]",
                  )}
                >
                  {kr.current_value} / {kr.target_value}
                  {kr.unit ? ` ${kr.unit}` : ""}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredKRs.length > krLimit && (
        <button
          onClick={() => setKrLimit((prev) => prev + 10)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e5e8eb] bg-white py-3 text-sm font-bold text-[#6b7684] transition-all hover:text-[#191f28]"
        >
          <ChevronDown size={15} />
          더보기 ({filteredKRs.length - krLimit}개 남음)
        </button>
      )}
    </div>
  );
}
