import { Check, ChevronDown, Plus, Search, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "../../lib/cn";
import type { OKR, TimeSlot, TodoItem, WorkLog } from "../../types";

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: WorkLog) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
  okrs: OKR[];
}

export const WorkLogModal: React.FC<WorkLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  log,
  setLog,
  okrs,
}) => {
  const [activeTab, setActiveTab] = useState<"todo" | "details" | "okr">("todo");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [krSearch, setKrSearch] = useState("");
  const [krLimit, setKrLimit] = useState(10);

  const todosBySlot = (slot: TimeSlot) =>
    log.todo_items
      .filter((t) => t.time_slot === slot)
      .sort((a, b) => a.display_order - b.display_order);

  const handleAddTodo = (slot: TimeSlot) => {
    const slotTodos = todosBySlot(slot);
    const newTodo: TodoItem = {
      id: `tmp_${Date.now()}`,
      time_slot: slot,
      content: "",
      is_done: false,
      display_order: slotTodos.length,
    };
    setLog((prev) => ({ ...prev, todo_items: [...prev.todo_items, newTodo] }));
  };

  const handleUpdateTodo = (id: string, content: string) => {
    setLog((prev) => ({
      ...prev,
      todo_items: prev.todo_items.map((t) => (t.id === id ? { ...t, content } : t)),
    }));
  };

  const handleToggleTodo = (id: string) => {
    setLog((prev) => ({
      ...prev,
      todo_items: prev.todo_items.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)),
    }));
  };

  const handleRemoveTodo = (id: string) => {
    setLog((prev) => ({
      ...prev,
      todo_items: prev.todo_items.filter((t) => t.id !== id),
    }));
  };

  const handleToggleKR = (krId: string) => {
    const current = log.kr_ids ?? [];
    const updated = current.includes(krId)
      ? current.filter((id) => id !== krId)
      : [...current, krId];
    setLog((prev) => ({ ...prev, kr_ids: updated }));
  };

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

  const selectableOKRs = okrs.filter((o) => o.status !== "archived");

  // Flatten KRs sorted by OKR end_date desc (most recent first)
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

  const tabs = [
    { id: "todo", label: "할 일" },
    { id: "details", label: "상세 기록" },
    { id: "okr", label: "OKR 연결" },
  ] as const;

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
            className="relative flex h-[92vh] w-full flex-col overflow-hidden overscroll-none rounded-t-[28px] bg-[#f5f5f5] shadow-2xl sm:max-w-4xl sm:rounded-[32px]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-5 py-4 sm:px-8 sm:py-5">
              {confirmDelete ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-red-500">업무일지를 삭제할까요?</p>
                    <p className="mt-0.5 text-xs font-medium text-black/40">
                      이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-black/40 transition-colors hover:text-black"
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
                    <p className="mt-0.5 text-sm font-medium text-black/30">
                      오늘의 업무를 기록하세요
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.id && onDelete && (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black transition-colors hover:bg-black/10"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 transition-colors hover:bg-black/10"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-black/5 bg-white px-5 sm:px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-5 py-3.5 text-sm font-bold transition-all",
                    activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-black/30 hover:text-black/60",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-[#f5f5f5] p-4 sm:p-6">
              {activeTab === "todo" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TodoSection
                    title="오전 할 일"
                    todos={todosBySlot("am")}
                    onAdd={() => handleAddTodo("am")}
                    onUpdate={handleUpdateTodo}
                    onToggle={handleToggleTodo}
                    onRemove={handleRemoveTodo}
                  />
                  <TodoSection
                    title="오후 할 일"
                    todos={todosBySlot("pm")}
                    onAdd={() => handleAddTodo("pm")}
                    onUpdate={handleUpdateTodo}
                    onToggle={handleToggleTodo}
                    onRemove={handleRemoveTodo}
                  />
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                    <label className="text-[11px] font-bold tracking-widest text-black uppercase">
                      한줄 요약
                    </label>
                    <textarea
                      rows={2}
                      value={log.summary}
                      onChange={(e) => setLog({ ...log, summary: e.target.value })}
                      className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f8f8f8] px-4 py-3 text-sm font-medium transition-all outline-none focus:border-black/25 focus:bg-white"
                      placeholder="오늘 하루를 한줄로 요약해주세요"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
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
                    ].map((field) => (
                      <div key={field.key} className="rounded-2xl bg-white p-4 shadow-sm">
                        <label className="text-[11px] font-bold tracking-widest text-black uppercase">
                          {field.label}
                        </label>
                        <textarea
                          value={log[field.key]}
                          onChange={(e) => setLog({ ...log, [field.key]: e.target.value })}
                          rows={3}
                          placeholder={field.placeholder}
                          className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f8f8f8] px-4 py-3 text-sm font-medium transition-all outline-none focus:border-black/25 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "okr" && (
                <div className="space-y-4">
                  <p className="px-1 text-[11px] font-bold tracking-widest text-black/40 uppercase">
                    관련 핵심 결과(KR) 선택
                  </p>

                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-black/30"
                    />
                    <input
                      type="text"
                      value={krSearch}
                      onChange={(e) => {
                        setKrSearch(e.target.value);
                        setKrLimit(10);
                      }}
                      placeholder="KR 또는 목표 이름으로 검색"
                      className="w-full rounded-xl border border-black/10 bg-white py-2.5 pr-4 pl-9 text-sm font-medium transition-all outline-none focus:border-black/25"
                    />
                  </div>

                  {allKRs.length === 0 && (
                    <div className="rounded-2xl bg-white py-12 text-center font-bold text-black/20 shadow-sm">
                      등록된 OKR이 없습니다.
                    </div>
                  )}

                  {allKRs.length > 0 && filteredKRs.length === 0 && (
                    <div className="rounded-2xl bg-white py-12 text-center font-bold text-black/20 shadow-sm">
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
                            "flex items-start gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition-all",
                            selected
                              ? "border-black bg-black/5"
                              : "border-transparent bg-white hover:border-black/15",
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                              selected ? "border-black bg-black text-white" : "border-black/20",
                            )}
                          >
                            {selected && <Check size={12} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-black">
                              {kr.title || "제목 없음"}
                            </div>
                            <div className="mt-0.5 text-[11px] font-medium text-black/40">
                              {okr.title}
                            </div>
                            <div className="mt-0.5 text-[11px] font-medium text-black/30">
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
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-3 text-sm font-bold text-black/40 shadow-sm transition-all hover:text-black"
                    >
                      <ChevronDown size={15} />
                      더보기 ({filteredKRs.length - krLimit}개 남음)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-black/5 bg-white px-5 py-4 sm:px-8 sm:py-5">
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-black/30 transition-colors hover:text-black"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
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

function TodoSection({
  title,
  todos,
  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: {
  title: string;
  todos: TodoItem[];
  onAdd: () => void;
  onUpdate: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="min-h-[59dvh] rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-black">{title}</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg bg-black/5 px-2.5 py-1.5 text-xs font-bold text-black/50 transition-colors hover:bg-black/10 hover:text-black"
        >
          <Plus size={13} /> 추가
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-3 rounded-xl border border-black/5 bg-[#f8f8f8] px-3 py-2.5"
          >
            <button
              onClick={() => onToggle(todo.id)}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                todo.is_done
                  ? "border-black bg-black text-white"
                  : "border-black/20 hover:border-black/40",
              )}
            >
              {todo.is_done && <Check size={13} />}
            </button>
            <input
              type="text"
              value={todo.content}
              onChange={(e) => onUpdate(todo.id, e.target.value)}
              placeholder="할 일을 입력하세요"
              className={cn(
                "flex-1 border-none bg-transparent p-0 text-sm font-medium outline-none focus:ring-0",
                todo.is_done ? "text-black/30 line-through" : "text-black",
              )}
            />
            <button
              onClick={() => onRemove(todo.id)}
              className="text-black/20 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <p className="py-4 text-center text-sm text-black/25">할 일을 추가해보세요</p>
        )}
      </div>
    </div>
  );
}
