import { Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { KeyResult, OKR, PeriodType } from "../../types";
import { PERIOD_TYPE_LABEL } from "../../types";

export type OKRDraft = Omit<OKR, "id"> & { id?: string };

interface OKRModalProps {
  isOpen: boolean;
  okr: OKRDraft;
  setOkr: React.Dispatch<React.SetStateAction<OKRDraft>>;
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
}

export function OKRModal({ isOpen, okr, setOkr, onClose, onSave, isEditing }: OKRModalProps) {
  const addKR = () => {
    setOkr((prev) => ({
      ...prev,
      key_results: [
        ...prev.key_results,
        { id: crypto.randomUUID(), title: "", target_value: 0, current_value: 0, unit: "" },
      ],
    }));
  };

  const removeKR = (id: string) => {
    setOkr((prev) => ({
      ...prev,
      key_results: prev.key_results.filter((kr) => kr.id !== id),
    }));
  };

  const toNumericValue = (raw: string | number): number => {
    if (raw === "") return 0;
    const n = Number(raw);
    return isNaN(n) ? 0 : n;
  };

  const updateKR = (id: string, field: keyof KeyResult, value: string | number) => {
    setOkr((prev) => ({
      ...prev,
      key_results: prev.key_results.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr)),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-7 pb-5">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {isEditing ? "OKR 수정" : "새로운 OKR 추가"}
                </h2>
                <p className="mt-1 text-sm text-[#6b7684]">
                  달성하고자 하는 목표와 핵심 결과를 설정하세요.
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
            <div className="space-y-5 overflow-y-auto px-8 pb-4" style={{ maxHeight: "62vh" }}>
              {/* Objective */}
              <Field label="목표 (Objective)">
                <input
                  type="text"
                  value={okr.title}
                  onChange={(e) => setOkr((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 신규 기능 개발 완료"
                  className={inputClass}
                />
              </Field>

              {/* Status — 수정 시에만 표시 */}
              {isEditing && (
                <Field label="상태">
                  <select
                    value={okr.status}
                    onChange={(e) =>
                      setOkr((prev) => ({
                        ...prev,
                        status: e.target.value as OKR["status"],
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="active">진행중</option>
                    <option value="completed">완료</option>
                    <option value="archived">보관</option>
                  </select>
                </Field>
              )}

              {/* Period + Dates */}
              <div className="grid grid-cols-3 gap-3">
                <Field label="기간 유형">
                  <select
                    value={okr.period_type}
                    onChange={(e) =>
                      setOkr((prev) => ({ ...prev, period_type: e.target.value as PeriodType }))
                    }
                    className={inputClass}
                  >
                    {(["sprint", "monthly", "quarterly", "yearly"] as PeriodType[]).map((p) => (
                      <option key={p} value={p}>
                        {PERIOD_TYPE_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="시작일">
                  <input
                    type="date"
                    value={okr.start_date}
                    onChange={(e) => setOkr((prev) => ({ ...prev, start_date: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="종료일">
                  <input
                    type="date"
                    value={okr.end_date}
                    onChange={(e) => setOkr((prev) => ({ ...prev, end_date: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Key Results */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#6b7684]">
                    핵심 결과 (Key Results)
                  </label>
                  <button
                    onClick={addKR}
                    className="flex items-center gap-1 text-xs font-bold text-[#3182f6] transition-colors hover:text-[#1b6ed4]"
                  >
                    <Plus size={13} />
                    추가하기
                  </button>
                </div>
                <div className="space-y-3">
                  {okr.key_results.map((kr, idx) => (
                    <div key={kr.id} className="relative rounded-2xl border border-[#e5e8eb] bg-[#f7f8fa] p-4">
                      <button
                        onClick={() => removeKR(kr.id)}
                        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Field label={`KR${idx + 1}`}>
                        <input
                          type="text"
                          value={kr.title}
                          onChange={(e) => updateKR(kr.id, "title", e.target.value)}
                          placeholder="예: 핵심 기능 5개 개발"
                          className={inputClass}
                        />
                      </Field>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Field label="목표치">
                          <input
                            type="number"
                            value={kr.target_value}
                            onChange={(e) =>
                              updateKR(kr.id, "target_value", toNumericValue(e.target.value))
                            }
                            onFocus={(e) => e.target.select()}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="현재치">
                          <input
                            value={kr.current_value}
                            onChange={(e) =>
                              updateKR(kr.id, "current_value", toNumericValue(e.target.value))
                            }
                            onFocus={(e) => e.target.select()}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="단위">
                          <input
                            type="text"
                            value={kr.unit}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateKR(kr.id, "unit", e.target.value)}
                            placeholder="건, %, 점"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
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
                className="rounded-xl bg-[#3182f6] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ed4] active:scale-95"
              >
                {isEditing ? "저장하기" : "추가하기"}
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

const inputClass =
  "w-full rounded-xl border border-[#e5e8eb] bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-[#3182f6]";
