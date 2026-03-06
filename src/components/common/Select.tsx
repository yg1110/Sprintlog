import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, id, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={[
          'w-full rounded-2xl border-none bg-muted px-4 py-3 text-sm font-medium text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none',
          error ? 'ring-2 ring-danger' : '',
          className,
        ].join(' ')}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
