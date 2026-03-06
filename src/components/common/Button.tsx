import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:scale-[1.02] active:scale-[0.98]',
  ghost: 'bg-transparent text-muted-foreground hover:bg-muted',
  danger: 'bg-danger text-danger-foreground hover:bg-danger-hover',
}

const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-sm px-6 py-3',
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all',
        variantStyles[variant],
        sizeStyles[size],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    />
  )
}
