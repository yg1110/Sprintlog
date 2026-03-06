import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </label>
        )}

        <input
          id={id}
          ref={ref}
          {...props}
          className={[
            "w-full rounded-2xl border-none bg-muted px-4 py-3 text-sm font-medium text-gray-900",
            "placeholder:text-muted-foreground placeholder:font-normal",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            error ? "ring-2 ring-danger" : "",
            className,
          ].join(" ")}
        />

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
