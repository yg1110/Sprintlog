import { Check, Plus, Trash2 } from "lucide-react";

import { cn } from "../../../lib/cn";
import type { TimeSlot, TodoItem, WorkLog } from "../../../types";

interface TodoTabProps {
  log: WorkLog;
  setLog: React.Dispatch<React.SetStateAction<WorkLog>>;
}

export function TodoTab({ log, setLog }: TodoTabProps) {
  const todosBySlot = (slot: TimeSlot) =>
    log.todo_items
      .filter((t) => t.time_slot === slot)
      .sort((a, b) => a.display_order - b.display_order);

  const handleAddTodo = (slot: TimeSlot) => {
    const slotTodos = todosBySlot(slot);
    const newTodo: TodoItem = {
      id: `tmp_${Date.now()}`,
      time_slot: slot,
      content: "",
      is_done: false,
      display_order: slotTodos.length,
    };
    setLog((prev) => ({ ...prev, todo_items: [...prev.todo_items, newTodo] }));
  };

  const handleUpdateTodo = (id: string, content: string) => {
    setLog((prev) => ({
      ...prev,
      todo_items: prev.todo_items.map((t) => (t.id === id ? { ...t, content } : t)),
    }));
  };

  const handleToggleTodo = (id: string) => {
    setLog((prev) => ({
      ...prev,
      todo_items: prev.todo_items.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)),
    }));
  };

  const handleRemoveTodo = (id: string) => {
    setLog((prev) => ({
      ...prev,
      todo_items: prev.todo_items.filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TodoSection
        title="오전 할 일"
        todos={todosBySlot("am")}
        onAdd={() => handleAddTodo("am")}
        onUpdate={handleUpdateTodo}
        onToggle={handleToggleTodo}
        onRemove={handleRemoveTodo}
      />
      <TodoSection
        title="오후 할 일"
        todos={todosBySlot("pm")}
        onAdd={() => handleAddTodo("pm")}
        onUpdate={handleUpdateTodo}
        onToggle={handleToggleTodo}
        onRemove={handleRemoveTodo}
      />
    </div>
  );
}

function TodoSection({
  title,
  todos,
  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: {
  title: string;
  todos: TodoItem[];
  onAdd: () => void;
  onUpdate: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="min-h-[59dvh] rounded-2xl border border-[#e5e8eb] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#191f28]">{title}</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg bg-[#f2f4f6] px-2.5 py-1.5 text-xs font-bold text-[#6b7684] transition-colors hover:bg-[#e5e8eb] hover:text-[#191f28]"
        >
          <Plus size={13} /> 추가
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-3 rounded-xl border border-[#e5e8eb] bg-white px-3 py-2.5"
          >
            <button
              onClick={() => onToggle(todo.id)}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                todo.is_done
                  ? "border-[#3182f6] bg-[#3182f6] text-white"
                  : "border-[#b0b8c1] hover:border-[#3182f6]",
              )}
            >
              {todo.is_done && <Check size={13} />}
            </button>
            <input
              type="text"
              value={todo.content}
              onChange={(e) => onUpdate(todo.id, e.target.value)}
              placeholder="할 일을 입력하세요"
              className={cn(
                "flex-1 border-none bg-transparent p-0 text-sm font-medium outline-none focus:ring-0",
                todo.is_done ? "text-[#b0b8c1] line-through" : "text-[#191f28]",
              )}
            />
            <button
              onClick={() => onRemove(todo.id)}
              className="text-[#b0b8c1] opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <p className="py-4 text-center text-sm text-[#b0b8c1]">할 일을 추가해보세요</p>
        )}
      </div>
    </div>
  );
}
