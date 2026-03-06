interface EmptyStateProps {
  message: string
  subMessage?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ message, subMessage, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">{message}</p>
      {subMessage && <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
