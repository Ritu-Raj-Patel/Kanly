'use client'

import Link from 'next/link'
import { FormEvent, useState, useEffect } from 'react'
import { boardsApi } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function CreateBoardPage() {
  const { status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      const response = await boardsApi.create(formData)
      router.push(`/boards/${response.board.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/">
        <button className="text-gray-500 hover:text-gray-700 font-medium mb-6 flex items-center gap-1 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Boards
        </button>
      </Link>

      <div className="glass-card rounded-2xl p-8 animate-scale-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Board</h1>
          <p className="text-gray-500 mt-1">Set up a new kanban board for your project</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Board Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Product Roadmap"
              className="w-full px-4 py-2.5 glass-input rounded-xl outline-none text-gray-900"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this board for? (optional)"
              rows={4}
              className="w-full px-4 py-2.5 glass-input rounded-xl outline-none text-gray-900 resize-none"
              disabled={loading}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600">
              Your board will be created with default columns: <span className="font-medium text-gray-900">To Do</span>, <span className="font-medium text-gray-900">Doing</span>, and <span className="font-medium text-gray-900">Done</span>. You can customize them later.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/" className="flex-1">
              <button
                type="button"
                disabled={loading}
                className="w-full glass-button px-6 py-2.5 rounded-xl text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 glass-button-dark text-white font-medium py-2.5 px-6 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Board'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
