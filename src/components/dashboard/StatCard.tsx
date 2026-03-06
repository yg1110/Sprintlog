interface StatCardProps {
  label: string
  value: number | string
  sub?: string
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
      <p className="text-4xl font-light tracking-tighter text-gray-900">
        {value}
        {sub && <span className="text-base ml-1.5 text-muted-foreground font-medium">{sub}</span>}
      </p>
    </div>
  )
}
