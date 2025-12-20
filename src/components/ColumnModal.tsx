'use client'

import { useState, useEffect } from 'react'

interface ColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void>
  initialName?: string
  mode: 'create' | 'edit'
}

export default function ColumnModal({ isOpen, onClose, onSave, initialName = '', mode }: ColumnModalProps) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initialName)
    setError(null)
  }, [initialName, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Column name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSave(name.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save column')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="glass-card rounded-2xl p-6 w-full max-w-sm animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'New Column' : 'Edit Column'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Column Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., To Do, In Progress, Done"
              className="w-full px-4 py-2.5 glass-input rounded-xl outline-none text-gray-900"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 glass-button rounded-xl text-gray-700 font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 glass-button-dark rounded-xl text-white font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Add Column' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
