'use client'

import { SessionProvider } from 'next-auth/react'
import { BoardProvider } from '@/contexts/BoardContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BoardProvider>
        {children}
      </BoardProvider>
    </SessionProvider>
  )
}
