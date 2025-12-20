'use client'

import BoardCard from '@/components/BoardCard'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { boardsApi } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Board {
  id: string
  name: string
  description?: string
  task_count?: number
  column_count?: number
}

export default function Home() {
  const { status } = useSession()
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      loadBoards()
    }
  }, [status, router])

  async function loadBoards() {
    try {
      setLoading(true)
      setError(null)
      const response = await boardsApi.list()
      setBoards(response.boards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-card rounded-2xl px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-gray-600">Loading your boards...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBoards}
            className="glass-button-dark text-white px-6 py-2 rounded-xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Boards</h2>
          <p className="text-gray-500 mt-1">
            {boards.length === 0
              ? 'Create your first board to get started'
              : `${boards.length} board${boards.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/boards/new">
          <button className="glass-button-dark text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </Link>
      </div>

      {boards.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No boards yet</h3>
          <p className="text-gray-500 mb-6">
            Create a board to start organizing your tasks with columns and cards.
          </p>
          <Link href="/boards/new">
            <button className="glass-button-dark text-white font-medium py-2.5 px-6 rounded-xl inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Board
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              id={board.id}
              name={board.name}
              description={board.description}
              taskCount={board.task_count || 0}
              columnCount={board.column_count || 0}
            />
          ))}

          {/* Add New Board Card */}
          <Link href="/boards/new">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-gray-400 hover:bg-white/30 flex flex-col items-center justify-center min-h-[160px] group">
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-colors">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-gray-500 font-medium group-hover:text-gray-600">Add New Board</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
