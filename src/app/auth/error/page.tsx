'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Error</h2>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error ? (
              <p>{error}</p>
            ) : (
              <p>An error occurred during sign in. Please try again.</p>
            )}
          </div>

          <Link href="/auth/signin">
            <button className="w-full glass-button-dark text-white font-medium py-2.5 px-4 rounded-xl">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
