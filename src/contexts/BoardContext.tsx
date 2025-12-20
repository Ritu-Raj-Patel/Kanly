'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Task {
  id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  position?: number
  column_id?: string
  labels?: Array<{ name: string; color?: string }>
}

interface ColumnData {
  id: string
  name: string
  position: number
  tasks: Task[]
}

interface BoardContextType {
  board: { id: string; name: string } | null
  columns: ColumnData[]
  activeColumnId: string | null
  isNavVisible: boolean
  setBoard: (board: { id: string; name: string } | null) => void
  setColumns: (columns: ColumnData[]) => void
  setActiveColumnId: (id: string | null) => void
  setIsNavVisible: (visible: boolean) => void
  toggleNavVisible: () => void
  isOnBoardPage: boolean
}

const BoardContext = createContext<BoardContextType | null>(null)

export function BoardProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<{ id: string; name: string } | null>(null)
  const [columns, setColumns] = useState<ColumnData[]>([])
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [isNavVisible, setIsNavVisible] = useState(true)

  const toggleNavVisible = useCallback(() => {
    setIsNavVisible(prev => !prev)
  }, [])

  const value: BoardContextType = {
    board,
    columns,
    activeColumnId,
    isNavVisible,
    setBoard,
    setColumns,
    setActiveColumnId,
    setIsNavVisible,
    toggleNavVisible,
    isOnBoardPage: board !== null,
  }

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  )
}

export function useBoardContext() {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider')
  }
  return context
}
