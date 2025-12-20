'use client'

import { useBoardContext } from '@/contexts/BoardContext'

interface MobileColumnNavProps {
  onColumnSelect: (columnId: string) => void
  showToggle?: boolean
}

function getColumnAbbreviation(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return '•'

  const words = trimmed.split(/\s+/).filter(Boolean)
  const initials = words.map((w) => w[0]).join('')
  const base = (initials.length >= 2 ? initials : trimmed.slice(0, 2)).toUpperCase()
  return base.slice(0, 3)
}

export default function MobileColumnNav({ onColumnSelect, showToggle = true }: MobileColumnNavProps) {
  const { columns, activeColumnId, isNavVisible, toggleNavVisible } = useBoardContext()

  return (
    <div className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end">
      {/* Toggle Button - Always visible */}
      {showToggle && (
        <button
          onClick={toggleNavVisible}
          className="w-11 h-11 rounded-l-xl glass-card flex items-center justify-center shadow-glass transition-all duration-300 hover:bg-white/90"
          aria-label={isNavVisible ? 'Hide column navigation' : 'Show column navigation'}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Column Navigation Strip */}
      <div
        className={`${showToggle ? 'mt-2 ' : ''}flex flex-col gap-2 p-2 rounded-l-2xl glass-card shadow-glass-lg transition-all duration-300 ease-in-out ${
          isNavVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        {columns.map((column) => {
          const isActive = column.id === activeColumnId
          const abbreviation = getColumnAbbreviation(column.name)

          return (
            <button
              key={column.id}
              onClick={() => onColumnSelect(column.id)}
              className={`w-11 rounded-xl transition-all duration-200 py-3 flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80 hover:text-gray-900'
              }`}
              aria-label={`Go to ${column.name}`}
              title={column.name}
            >
              <span className="flex flex-col items-center leading-[1] text-[10px] font-extrabold tracking-wider">
                {abbreviation.split('').map((ch, index) => (
                  <span key={`${column.id}-${ch}-${index}`}>{ch}</span>
                ))}
              </span>

              <span
                className={`mt-1 text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {column.tasks.length}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
