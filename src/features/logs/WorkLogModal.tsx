import { Check, ChevronDown, Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "../../lib/cn";
import type { OKR, Project, TimeSlot, TodoItem, WorkLog } from "../../types";
import { PROJECT_STATUS_LABEL } from "../../types";

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
  const [activeTab, setActiveTab] = useState<"todo" | "details" | "okr" | "project">("todo");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaboratorDropdown, setCollaboratorDropdown] = useState(false);
  const [krSearch, setKrSearch] = useState("");
  const [krLimit, setKrLimit] = useState(10);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectLimit, setProjectLimit] = useState(10);

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

  const handleToggleProject = (projectId: string) => {
    const current = log.project_ids ?? [];
    const updated = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    setLog((prev) => ({ ...prev, project_ids: updated }));
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

  const selectableProjects = projects.filter((p) => p.status !== "archived");

  const filteredProjects = projectSearch.trim()
    ? selectableProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(projectSearch.toLowerCase()),
      )
    : selectableProjects;

  const visibleProjects = filteredProjects.slice(0, projectLimit);

  const tabs = [
    { id: "todo", label: "할 일" },
    { id: "details", label: "상세 기록" },
    { id: "okr", label: "OKR 연결" },
    { id: "project", label: "프로젝트 연결" },
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
              {tabs.map((tab) => (
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
                  {/* 동료 태그 */}
                  {(() => {
                    const current = log.collaborators ?? [];
                    const isDuplicate =
                      collaboratorInput.trim() !== "" && current.includes(collaboratorInput.trim());
                    const suggestions = allCollaborators.filter(
                      (n) =>
                        !current.includes(n) &&
                        n.toLowerCase().includes(collaboratorInput.toLowerCase()),
                    );
                    const addCollaborator = (name: string) => {
                      const trimmed = name.trim();
                      if (!trimmed || current.includes(trimmed)) return;
                      setLog((prev) => ({
                        ...prev,
                        collaborators: [...prev.collaborators, trimmed],
                      }));
                      setCollaboratorInput("");
                      setCollaboratorDropdown(false);
                    };
                    return (
                      <div className="rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5">
                        <label className="text-[12px] font-semibold text-[#6b7684]">
                          같이 일한 동료
                        </label>
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
                                  } else if (
                                    e.key === "Backspace" &&
                                    collaboratorInput === "" &&
                                    current.length > 0
                                  ) {
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
                                <span className="shrink-0 text-[11px] font-bold text-amber-500">
                                  이미 추가됨
                                </span>
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
                    );
                  })()}

                  <div className="rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5">
                    <label className="text-[12px] font-semibold text-[#6b7684]">
                      한줄 요약
                    </label>
                    <textarea
                      rows={2}
                      value={log.summary}
                      onChange={(e) => setLog({ ...log, summary: e.target.value })}
                      className="mt-2 w-full resize-none rounded-xl border border-[#e5e8eb] bg-[#f2f4f6] px-4 py-3 text-sm font-medium transition-all outline-none focus:border-[#3182f6] focus:bg-white"
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
                      <div key={field.key} className="rounded-2xl border border-[#e5e8eb] bg-white p-4">
                        <label className="text-[12px] font-semibold text-[#6b7684]">
                          {field.label}
                        </label>
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
              )}

              {activeTab === "okr" && (
                <div className="space-y-4">
                  <p className="px-1 text-[12px] font-semibold text-[#6b7684]">
                    관련 핵심 결과(KR) 선택
                  </p>

                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#b0b8c1]"
                    />
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
                              selected
                                ? "border-[#3182f6] bg-[#3182f6] text-white"
                                : "border-[#b0b8c1]",
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
              )}

              {activeTab === "project" && (
                <div className="space-y-4">
                  <p className="px-1 text-[12px] font-semibold text-[#6b7684]">
                    프로젝트 선택
                  </p>

                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#b0b8c1]"
                    />
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
    <div className="min-h-[59dvh] rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#191f28]">{title}</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg bg-[#f2f4f6] px-2.5 py-1.5 text-xs font-bold text-[#6b7684] transition-colors hover:bg-[#e5e8eb] hover:text-[#191f28]"
        >
          <Plus size={13} /> 추가
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-3 rounded-xl border border-[#e5e8eb] bg-white px-3 py-2.5"
          >
            <button
              onClick={() => onToggle(todo.id)}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                todo.is_done
                  ? "border-[#3182f6] bg-[#3182f6] text-white"
                  : "border-[#b0b8c1] hover:border-[#3182f6]",
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
                todo.is_done ? "text-[#b0b8c1] line-through" : "text-[#191f28]",
              )}
            />
            <button
              onClick={() => onRemove(todo.id)}
              className="text-[#b0b8c1] opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <p className="py-4 text-center text-sm text-[#b0b8c1]">할 일을 추가해보세요</p>
        )}
      </div>
    </div>
  );
}
