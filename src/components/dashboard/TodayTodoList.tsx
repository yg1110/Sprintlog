import type { TodoItem } from '../../types/todo'

interface TodayTodoListProps {
  todos: TodoItem[]
  onAdd?: () => void
}

export function TodayTodoList({ todos, onAdd }: TodayTodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">오늘 작성된 업무기록이 없어요.</p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors mt-2"
          >
            오늘 기록 작성하기
          </button>
        )}
      </div>
    )
  }

  const amTodos = todos.filter((t) => t.time_slot === 'am')
  const pmTodos = todos.filter((t) => t.time_slot === 'pm')

  function renderGroup(label: string, items: TodoItem[]) {
    if (items.length === 0) return null
    return (
      <div className="mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
        <ul className="flex flex-col gap-1.5">
          {items.map((todo) => (
            <li key={todo.id} className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${todo.is_done ? 'bg-primary border-primary' : 'border-border'}`}>
                {todo.is_done && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2.5 2.5L7 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${todo.is_done ? 'line-through text-muted-foreground' : 'text-gray-900'}`}>
                {todo.content}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      {renderGroup('오전', amTodos)}
      {renderGroup('오후', pmTodos)}
    </div>
  )
}
