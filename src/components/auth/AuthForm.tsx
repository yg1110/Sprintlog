import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { toastError, toastSuccess } from "../../utils/toast";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력해 주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

type FormValues = z.infer<typeof schema>;

export function AuthForm() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    if (mode === "login") {
      const { error } = await login(values.email, values.password);
      if (error) toastError(error);
    } else {
      const { error } = await signup(values.email, values.password);
      if (error) toastError(error);
      else toastSuccess("가입 완료! 이메일을 확인해 주세요.");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-card rounded-3xl shadow-modal p-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Sprintlog</h1>
        <p className="text-sm text-muted-foreground mb-10">
          {mode === "login"
            ? "로그인하여 기록을 시작하세요."
            : "계정을 만들어 기록을 시작하세요."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="email"
            label="이메일"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="password"
            label="비밀번호"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="mt-2 w-full"
          >
            {submitting
              ? "처리 중..."
              : mode === "login"
                ? "로그인"
                : "회원가입"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {mode === "login"
            ? "아직 계정이 없으신가요?"
            : "이미 계정이 있으신가요?"}{" "}
          <button
            className="font-medium text-primary hover:text-primary-hover transition-colors"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "회원가입" : "로그인"}
          </button>
        </p>
      </div>
    </div>
  );
}
