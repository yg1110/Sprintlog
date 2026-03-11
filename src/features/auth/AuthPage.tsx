import { Zap } from "lucide-react";
import { useState } from "react";

import { signIn, signUp } from "../../lib/api";
import { cn } from "../../lib/cn";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // 세션 변경은 App.tsx의 onAuthStateChange가 감지
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black">
            <Zap size={22} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight">Sprintlog</h1>
            <p className="mt-1 text-sm text-black/40">OKR과 업무기록을 연결하세요</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          {/* Tab */}
          <div className="mb-6 flex rounded-xl bg-black/5 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-bold transition-all",
                  mode === m ? "bg-white text-black shadow-sm" : "text-black/40",
                )}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-widest text-black/40 uppercase">
                이메일
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm font-medium transition-all outline-none placeholder:text-black/20 focus:border-black/20 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-widest text-black/40 uppercase">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm font-medium transition-all outline-none placeholder:text-black/20 focus:border-black/20 focus:bg-white"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-black/30">
            {mode === "login" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="font-bold text-black underline-offset-2 hover:underline"
            >
              {mode === "login" ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
