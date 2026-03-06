import type { TodoFormItem, TodoTimeSlot } from '../../types/todo'
import { Button } from '../common/Button'

interface TodoSectionProps {
  slot: TodoTimeSlot
  title: string
  todos: TodoFormItem[]
  onChange: (todos: TodoFormItem[]) => void
}

export function TodoSection({ slot, title, todos, onChange }: TodoSectionProps) {
  const slotTodos = todos.filter((t) => t.time_slot === slot)
  const otherTodos = todos.filter((t) => t.time_slot !== slot)

  function addTodo() {
    const newTodo: TodoFormItem = {
      time_slot: slot,
      content: '',
      is_done: false,
      display_order: slotTodos.length,
    }
    onChange([...otherTodos, ...slotTodos, newTodo])
  }

  function updateTodo(index: number, patch: Partial<TodoFormItem>) {
    const updated = slotTodos.map((t, i) => (i === index ? { ...t, ...patch } : t))
    onChange([...otherTodos, ...updated])
  }

  function removeTodo(index: number) {
    const updated = slotTodos
      .filter((_, i) => i !== index)
      .map((t, i) => ({ ...t, display_order: i }))
    onChange([...otherTodos, ...updated])
  }

  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${slot === 'am' ? 'text-blue-500' : 'text-orange-500'}`}>{title}</p>
      <div className="flex flex-col gap-1.5">
        {slotTodos.map((todo, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.is_done}
              onChange={(e) => updateTodo(i, { is_done: e.target.checked })}
              className="accent-primary w-4 h-4 shrink-0"
            />
            <input
              type="text"
              value={todo.content}
              onChange={(e) => updateTodo(i, { content: e.target.value })}
              placeholder="할 일을 입력하세요"
              className={[
                'flex-1 rounded-xl border-none bg-muted px-3 py-2 text-sm font-medium',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                todo.is_done ? 'line-through text-muted-foreground' : 'text-gray-900',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={() => removeTodo(i)}
              className="text-muted-foreground hover:text-danger transition-colors p-1 shrink-0"
              aria-label="삭제"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={addTodo} className="mt-2 text-xs">
        + 추가
      </Button>
    </div>
  )
}
