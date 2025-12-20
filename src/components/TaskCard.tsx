'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
  id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  labels?: Array<{ name: string; color?: string }>
  onEdit?: () => void
  isDragging?: boolean
  isOverlay?: boolean
  onLongPress?: () => void
  longPressDelayMs?: number
}

const priorityConfig = {
  low: { class: 'priority-low', label: 'Low' },
  medium: { class: 'priority-medium', label: 'Medium' },
  high: { class: 'priority-high', label: 'High' },
}

export default function TaskCard({
  id,
  title,
  description,
  priority = 'medium',
  dueDate,
  labels = [],
  onEdit,
  isDragging,
  isOverlay,
  onLongPress,
  longPressDelayMs = 260,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCurrentlyDragging = isDragging || isSortableDragging

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = dueDate && new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card task-card rounded-xl p-4 cursor-grab active:cursor-grabbing group ${
        isOverlay ? 'task-card-overlay' : ''
      } ${
        isCurrentlyDragging ? 'task-card-dragging' : 'hover:shadow-glass'
      }`}
      onPointerDownCapture={(e) => {
        if (!onLongPress) return
        if (e.pointerType !== 'touch') return

        const startX = e.clientX
        const startY = e.clientY
        let cancelled = false
        let timer: number | null = null

        const cleanup = () => {
          if (timer !== null) window.clearTimeout(timer)
          window.removeEventListener('pointermove', onMove, true)
          window.removeEventListener('pointerup', onUp, true)
          window.removeEventListener('pointercancel', onUp, true)
        }

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - startX
          const dy = ev.clientY - startY
          if (Math.hypot(dx, dy) > 6) {
            cancelled = true
            cleanup()
          }
        }

        const onUp = () => cleanup()

        window.addEventListener('pointermove', onMove, true)
        window.addEventListener('pointerup', onUp, true)
        window.addEventListener('pointercancel', onUp, true)

        timer = window.setTimeout(() => {
          if (cancelled) return
          onLongPress()
        }, longPressDelayMs)
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-snug flex-1">{title}</h4>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {priority && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${priorityConfig[priority].class}`}>
            {priorityConfig[priority].label}
          </span>
        )}

        {labels.map((label, index) => (
          <span
            key={index}
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{
              backgroundColor: label.color ? `${label.color}20` : '#f3f4f6',
              color: label.color || '#4b5563',
            }}
          >
            {label.name}
          </span>
        ))}

        {dueDate && (
          <span className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 ${
            isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
