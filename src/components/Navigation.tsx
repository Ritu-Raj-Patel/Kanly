'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 cursor-pointer tracking-tight">
              Kanboard
            </h1>
          </Link>

          {session?.user ? (
            <div className="flex gap-6 items-center">
              <div className="text-sm text-gray-600">
                <span className="hidden sm:inline">Welcome, </span>
                <span className="font-medium text-gray-900">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="glass-button text-gray-700 font-medium py-2 px-4 rounded-xl text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/signin">
                <button className="glass-button text-gray-700 font-medium py-2 px-4 rounded-xl text-sm">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="glass-button-dark text-white font-medium py-2 px-5 rounded-xl text-sm">
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
