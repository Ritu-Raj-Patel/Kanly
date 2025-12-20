'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

interface Task {
  id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  due_date?: string
  position?: number
  column_id?: string
  labels?: Array<{ name: string; color?: string }>
}

interface ColumnProps {
  id: string
  name: string
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteColumn?: () => void
  fullWidth?: boolean
}

export default function Column({ id, name, tasks, onAddTask, onEditTask, onDeleteColumn, fullWidth }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col glass-column rounded-2xl p-4 transition-all duration-200 ${
        fullWidth ? 'w-full' : 'w-80 flex-shrink-0'
      } ${isOver ? 'ring-2 ring-gray-300 ring-opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <span className="text-xs font-medium text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {onDeleteColumn && (
          <button
            onClick={onDeleteColumn}
            className="w-7 h-7 rounded-lg hover:bg-white/50 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity group"
            title="Delete column"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 min-h-[100px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                dueDate={task.dueDate || task.due_date}
                labels={task.labels}
                onEdit={() => onEditTask(task)}
              />
            ))
          )}
        </SortableContext>
      </div>

      <button
        onClick={onAddTask}
        className="mt-4 w-full py-2.5 px-4 glass-button rounded-xl text-gray-600 font-medium text-sm flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Task
      </button>
    </div>
  )
}
