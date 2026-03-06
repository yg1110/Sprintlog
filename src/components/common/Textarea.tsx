import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        {...props}
        className={[
          'w-full rounded-2xl border-none bg-muted px-4 py-3 text-sm font-medium text-gray-900',
          'placeholder:text-muted-foreground placeholder:font-normal resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
          error ? 'ring-2 ring-danger' : '',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
