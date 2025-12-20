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
  isDropPulsing,
  isDragActive,
  index,
  onSelect,
}: {
  id: string
  name: string
  taskCount: number
  isActive: boolean
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
      className={`fluent-card w-full max-w-[320px] text-left rounded-2xl px-5 py-4 fluent-card-in ${isActive ? 'bg-coral-500 text-white' : 'card text-primary'
        } ${isOver ? 'fluent-card-over' : ''} ${isDropPulsing ? 'fluent-card-drop' : ''} ${isDragActive && !isOver && !isDropPulsing ? 'funnel-ready' : ''
        }`}
      aria-label={`${isDragActive ? 'Drop task into' : 'Go to'} ${name}`}
      style={{
        animationDelay: isDragActive ? '0ms' : `${index * 35}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold whitespace-normal break-words leading-snug">{name}</div>
        <span
          className={`shrink-0 text-xs font-bold min-w-[26px] h-6 px-2 rounded-full flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white text-coral-500' : 'bg-[var(--card-elevated)] text-secondary'
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

  return (
    <div className="md:hidden">
      {showToggle && (
        <button
          onClick={toggleNavVisible}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-l-xl card flex items-center justify-center shadow-lg hover:bg-[var(--card-hover)]"
          aria-label={isNavVisible ? 'Hide column navigation' : 'Show column navigation'}
        >
          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {isNavVisible && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close column navigation"
            onClick={() => setIsNavVisible(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full overflow-y-auto pointer-events-none">
            <div className="px-4 py-4 flex items-center justify-end gap-3 pointer-events-auto">
              <div className="text-xs font-semibold text-muted tracking-wide uppercase bg-[var(--card-bg)] px-2 py-1 rounded-lg">
                Columns {columns.length}
              </div>
              <button
                onClick={() => setIsNavVisible(false)}
                className="w-10 h-10 rounded-xl card hover:bg-[var(--card-hover)] shadow-lg flex items-center justify-center transition-all transform active:scale-95 text-secondary"
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
                return (
                  <DroppableColumnCard
                    key={column.id}
                    id={column.id}
                    name={column.name}
                    taskCount={column.tasks.length}
                    isActive={isActive}
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
