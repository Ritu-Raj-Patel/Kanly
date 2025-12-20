'use client'

import { useBoardContext } from '@/contexts/BoardContext'
import { useDroppable } from '@dnd-kit/core'

const FUNNEL_COLUMN_PREFIX = 'funnel:'

interface MobileColumnNavProps {
  onColumnSelect: (columnId: string) => void
  showToggle?: boolean
  dropPulseColumnId?: string | null
  isDragActive?: boolean
}

function DroppableColumnCard({
  id,
  name,
  taskCount,
  isActive,
  colorClass,
  isDropPulsing,
  isDragActive,
  index,
  onSelect,
}: {
  id: string
  name: string
  taskCount: number
  isActive: boolean
  colorClass: string
  isDropPulsing: boolean
  isDragActive: boolean
  index: number
  onSelect: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${FUNNEL_COLUMN_PREFIX}${id}` })

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      className={`fluent-card w-full max-w-[320px] text-left rounded-2xl px-5 py-4 fluent-card-in ${
        isActive ? 'bg-gray-900 text-white' : colorClass
      } ${isOver ? 'fluent-card-over' : ''} ${isDropPulsing ? 'fluent-card-drop' : ''} ${
        isDragActive && !isOver && !isDropPulsing ? 'funnel-ready' : ''
      }`}
      aria-label={`${isDragActive ? 'Drop task into' : 'Go to'} ${name}`}
      style={{
        animationDelay: isDragActive ? '0ms' : `${index * 35}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold whitespace-normal break-words leading-snug">{name}</div>
        <span
          className={`shrink-0 text-xs font-bold min-w-[26px] h-6 px-2 rounded-full flex items-center justify-center transition-all duration-200 ${
            isActive ? 'bg-white text-gray-900' : 'bg-black/10 text-current'
          } ${isOver ? 'scale-110' : ''}`}
        >
          {taskCount}
        </span>
      </div>
    </button>
  )
}

export default function MobileColumnNav({ onColumnSelect, showToggle = true, dropPulseColumnId, isDragActive = false }: MobileColumnNavProps) {
  const { columns, activeColumnId, isNavVisible, toggleNavVisible, setIsNavVisible } = useBoardContext()

  const stickyColors = [
    'bg-rose-100 text-rose-900',
    'bg-amber-100 text-amber-900',
    'bg-lime-100 text-lime-900',
    'bg-emerald-100 text-emerald-900',
    'bg-sky-100 text-sky-900',
    'bg-indigo-100 text-indigo-900',
    'bg-fuchsia-100 text-fuchsia-900',
  ]

  return (
    <div className="md:hidden">
      {showToggle && (
        <button
          onClick={toggleNavVisible}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-l-xl glass-card flex items-center justify-center shadow-glass hover:bg-white/90"
          aria-label={isNavVisible ? 'Hide column navigation' : 'Show column navigation'}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {isNavVisible && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-transparent"
            aria-label="Close column navigation"
            onClick={() => setIsNavVisible(false)}
          />

          {/* Right-seated floating column cards (no surrounding container) */}
          <div className="absolute right-0 top-0 h-full w-full overflow-y-auto pointer-events-none">
            <div className="px-4 py-4 flex items-center justify-end gap-3 pointer-events-auto">
              <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase shadow-sm bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                Columns {columns.length}
              </div>
              <button
                onClick={() => setIsNavVisible(false)}
                className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white shadow-lg backdrop-blur-md flex items-center justify-center transition-all transform active:scale-95 text-gray-600"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-6 flex flex-col items-end gap-3 pointer-events-auto">
              {columns.map((column, index) => {
                const isActive = column.id === activeColumnId
                const colorClass = stickyColors[index % stickyColors.length]
                return (
                  <DroppableColumnCard
                    key={column.id}
                    id={column.id}
                    name={column.name}
                    taskCount={column.tasks.length}
                    isActive={isActive}
                    colorClass={colorClass}
                    isDropPulsing={Boolean(dropPulseColumnId && dropPulseColumnId === column.id)}
                    isDragActive={isDragActive}
                    index={index}
                    onSelect={() => onColumnSelect(column.id)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
