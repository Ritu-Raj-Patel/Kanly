'use client'

import Link from 'next/link'

interface BoardCardProps {
  id: string
  name: string
  description?: string
  taskCount: number
  columnCount?: number
}

export default function BoardCard({ id, name, description, taskCount, columnCount = 0 }: BoardCardProps) {
  return (
    <Link href={`/boards/${id}`}>
      <div className="glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-glass-lg group">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {name}
          </h3>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        </div>

        {description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
          </div>
          {columnCount > 0 && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>{columnCount} column{columnCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
