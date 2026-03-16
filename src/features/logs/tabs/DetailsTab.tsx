import { UserPlus, X } from "lucide-react";
import { useState } from "react";

import { cn } from "../../../lib/cn";
import type { WorkLog } from "../../../types";

interface DetailsTabProps {
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
  allCollaborators: string[];
}

const DETAIL_FIELDS = [
  {
    key: "done_text" as const,
    label: "✅ 한 일",
    placeholder:
      "예: 결제 API 엔드포인트 3개 구현 완료\n예: 대시보드 로딩 속도 4.2s → 1.8s 개선\n예: 유닛 테스트 커버리지 62% → 78% 달성",
  },
  {
    key: "issue_text" as const,
    label: "🚨 이슈 / 장애 / 버그",
    placeholder:
      "예: 결제 완료 후 DB 트랜잭션 실패율 3% 발생 (원인: 타임아웃 5s → 15s로 조정)\n예: 모바일 Safari에서 모달 스크롤 불가 재현율 100%",
  },
  {
    key: "blocked_text" as const,
    label: "🧱 막힌 것",
    placeholder:
      "예: 외부 결제 API 응답 지연으로 테스트 불가 (평균 8s, SLA 2s 초과)\n예: 디자인 시안 미확정으로 신규 화면 개발 착수 불가",
  },
  {
    key: "decision_text" as const,
    label: "🧠 설계 / 의사결정",
    placeholder:
      "예: 알림 발송을 동기 → 비동기 큐 방식으로 변경 (처리량 200/min → 2,000/min 예상)\n예: 이미지 CDN 도입으로 월 트래픽 비용 40% 절감 예상",
  },
  {
    key: "learned_text" as const,
    label: "📚 배운점",
    placeholder:
      "예: React Query staleTime 조정으로 불필요한 API 호출 70% 감소\n예: DB 인덱스 추가 후 쿼리 실행 시간 1.2s → 0.08s",
  },
  {
    key: "tomorrow_plan_text" as const,
    label: "📌 내일 할일",
    placeholder:
      "예: 알림 발송 모듈 구현 (목표: 발송 성공률 99.5% 이상)\n예: 상품 검색 응답 속도 현재 3s → 목표 1s 이하로 최적화",
  },
  {
    key: "metric_change_text" as const,
    label: "📈 수치 변화",
    placeholder:
      "예: 일일 활성 사용자 1,200명 → 1,450명 (+20.8%)\n예: API 에러율 2.1% → 0.4% / 페이지 이탈률 68% → 52%",
  },
  {
    key: "feedback_text" as const,
    label: "🗣️ 받은 피드백",
    placeholder:
      "예: 코드 리뷰 — 쿼리 N+1 문제 지적, 배치 조회로 수정 필요\n예: PM — 온보딩 완료율 목표 60%인데 현재 38%, UX 개선 요청",
  },
  {
    key: "improvement_text" as const,
    label: "🎯 개선 포인트",
    placeholder:
      "예: 작업 전 예상 소요 시간 기록 → 실제와 비교해 추정 정확도 높이기\n예: PR 단위를 기능 전체가 아닌 500줄 이하로 쪼개 리뷰 속도 개선",
  },
] as const;

export function DetailsTab({ log, setLog, allCollaborators }: DetailsTabProps) {
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaboratorDropdown, setCollaboratorDropdown] = useState(false);

  const current = log.collaborators ?? [];
  const isDuplicate = collaboratorInput.trim() !== "" && current.includes(collaboratorInput.trim());
  const suggestions = allCollaborators.filter(
    (n) => !current.includes(n) && n.toLowerCase().includes(collaboratorInput.toLowerCase()),
  );

  const addCollaborator = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || current.includes(trimmed)) return;
    setLog((prev) => ({ ...prev, collaborators: [...prev.collaborators, trimmed] }));
    setCollaboratorInput("");
    setCollaboratorDropdown(false);
  };

  return (
    <div className="space-y-4">
      {/* 동료 태그 */}
      <div className="rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5">
        <label className="text-[12px] font-semibold text-[#6b7684]">같이 일한 동료</label>
        <div className="relative mt-2">
          <div
            className={cn(
              "flex flex-wrap gap-1.5 rounded-xl border bg-[#f2f4f6] px-3 py-2.5 transition-all",
              collaboratorDropdown ? "border-[#3182f6] bg-white" : "border-[#e5e8eb]",
            )}
          >
            {current.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 rounded-lg bg-[#ebf3ff] px-2.5 py-1 text-sm font-bold text-[#3182f6]"
              >
                {name}
                <button
                  onClick={() =>
                    setLog((prev) => ({
                      ...prev,
                      collaborators: prev.collaborators.filter((n) => n !== name),
                    }))
                  }
                  className="ml-0.5 text-[#3182f6]/50 hover:text-[#3182f6]"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <div className="flex min-w-[120px] flex-1 items-center gap-1.5">
              <UserPlus size={14} className="shrink-0 text-[#6b7684]" />
              <input
                type="text"
                value={collaboratorInput}
                onChange={(e) => {
                  setCollaboratorInput(e.target.value);
                  setCollaboratorDropdown(true);
                }}
                onFocus={() => setCollaboratorDropdown(true)}
                onBlur={() => setTimeout(() => setCollaboratorDropdown(false), 150)}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === ",") &&
                    !e.nativeEvent.isComposing &&
                    collaboratorInput.trim()
                  ) {
                    e.preventDefault();
                    addCollaborator(collaboratorInput);
                  } else if (e.key === "Backspace" && collaboratorInput === "" && current.length > 0) {
                    setLog((prev) => ({
                      ...prev,
                      collaborators: prev.collaborators.slice(0, -1),
                    }));
                  }
                }}
                placeholder={current.length === 0 ? "이름 입력 후 Enter" : ""}
                className="flex-1 border-none bg-transparent p-0 text-sm font-medium outline-none placeholder:text-[#b0b8c1]"
              />
              {isDuplicate && (
                <span className="shrink-0 text-[11px] font-bold text-amber-500">이미 추가됨</span>
              )}
            </div>
          </div>

          {/* 자동완성 드롭다운 */}
          {collaboratorDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-[#e5e8eb] bg-white shadow-lg">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onMouseDown={() => addCollaborator(name)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-[#f2f4f6]"
                >
                  <UserPlus size={13} className="shrink-0 text-[#6b7684]" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5">
        <label className="text-[12px] font-semibold text-[#6b7684]">한줄 요약</label>
        <textarea
          rows={2}
          value={log.summary}
          onChange={(e) => setLog({ ...log, summary: e.target.value })}
          className="mt-2 w-full resize-none rounded-xl border border-[#e5e8eb] bg-[#f2f4f6] px-4 py-3 text-sm font-medium transition-all outline-none focus:border-[#3182f6] focus:bg-white"
          placeholder="오늘 하루를 한줄로 요약해주세요"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DETAIL_FIELDS.map((field) => (
          <div key={field.key} className="rounded-2xl border border-[#e5e8eb] bg-white p-4">
            <label className="text-[12px] font-semibold text-[#6b7684]">{field.label}</label>
            <textarea
              value={log[field.key]}
              onChange={(e) => setLog({ ...log, [field.key]: e.target.value })}
              rows={3}
              placeholder={field.placeholder}
              className="mt-2 w-full resize-none rounded-xl border border-[#e5e8eb] bg-[#f2f4f6] px-4 py-3 text-sm font-medium transition-all outline-none focus:border-[#3182f6] focus:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
