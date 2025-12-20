'use client'

import { SessionProvider } from 'next-auth/react'
import { BoardProvider } from '@/contexts/BoardContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <BoardProvider>
          {children}
        </BoardProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
