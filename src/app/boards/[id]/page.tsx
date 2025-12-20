'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import Column from '@/components/Column'
import MobileColumnNav from '@/components/MobileColumnNav'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import ColumnModal from '@/components/ColumnModal'
import { useBoardContext } from '@/contexts/BoardContext'
import { boardsApi, tasksApi, columnsApi } from '@/lib/api/client'

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

interface PageProps {
  params: {
    id: string
  }
}

export default function BoardDetailPage({ params }: PageProps) {
  const { status } = useSession()
  const router = useRouter()
  const {
    setBoard: setBoardInContext,
    setColumns: setColumnsInContext,
    activeColumnId,
    setActiveColumnId,
    setIsNavVisible,
    isNavVisible,
    toggleNavVisible,
  } = useBoardContext()

  const [board, setBoard] = useState<any>(null)
  const [columns, setColumns] = useState<ColumnData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await boardsApi.get(params.id)
      setBoard(response.board)
      setColumns(response.columns || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      loadBoardData()
    }
  }, [status, router, loadBoardData])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setBoardInContext(board)
    return () => setBoardInContext(null)
  }, [board, setBoardInContext])

  useEffect(() => {
    setColumnsInContext(columns)
  }, [columns, setColumnsInContext])

  useEffect(() => {
    if (columns.length === 0) {
      setActiveColumnId(null)
      return
    }

    if (!activeColumnId || !columns.some((c) => c.id === activeColumnId)) {
      setActiveColumnId(columns[0].id)
    }
  }, [columns, activeColumnId, setActiveColumnId])

  const findColumnByTaskId = (taskId: string): ColumnData | undefined => {
    return columns.find((col) => col.tasks.some((task) => task.id === taskId))
  }

  const handleMobileColumnSelect = (columnId: string) => {
    setActiveColumnId(columnId)
    setIsNavVisible(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const column = findColumnByTaskId(active.id as string)
    if (column) {
      const task = column.tasks.find((t) => t.id === active.id)
      if (task) setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumnByTaskId(activeId)
    let overColumn = findColumnByTaskId(overId)

    // If over is a column (not a task), use that column
    if (!overColumn) {
      overColumn = columns.find((col) => col.id === overId)
    }

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return

    setColumns((prev) => {
      const activeTask = activeColumn.tasks.find((t) => t.id === activeId)
      if (!activeTask) return prev

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== activeId),
          }
        }
        if (col.id === overColumn!.id) {
          const overTaskIndex = col.tasks.findIndex((t) => t.id === overId)
          const newTasks = [...col.tasks]
          if (overTaskIndex >= 0) {
            newTasks.splice(overTaskIndex, 0, { ...activeTask, column_id: col.id })
          } else {
            newTasks.push({ ...activeTask, column_id: col.id })
          }
          return { ...col, tasks: newTasks }
        }
        return col
      })
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumnByTaskId(activeId)
    let overColumn = findColumnByTaskId(overId)

    if (!overColumn) {
      overColumn = columns.find((col) => col.id === overId)
    }

    if (!activeColumn || !overColumn) return

    if (activeColumn.id === overColumn.id) {
      // Reordering within the same column
      const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId)
      const newIndex = activeColumn.tasks.findIndex((t) => t.id === overId)

      if (oldIndex !== newIndex) {
        setColumns((prev) =>
          prev.map((col) => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                tasks: arrayMove(col.tasks, oldIndex, newIndex),
              }
            }
            return col
          })
        )

        // Persist to backend
        try {
          await tasksApi.move(activeId, {
            column_id: activeColumn.id,
            position: newIndex,
          })
        } catch (err) {
          console.error('Failed to move task:', err)
          loadBoardData() // Reload on error
        }
      }
    } else {
      // Moving to a different column
      const newPosition = overColumn.tasks.findIndex((t) => t.id === overId)
      const position = newPosition >= 0 ? newPosition : overColumn.tasks.length

      try {
        await tasksApi.move(activeId, {
          column_id: overColumn.id,
          position,
        })
      } catch (err) {
        console.error('Failed to move task:', err)
        loadBoardData() // Reload on error
      }
    }
  }

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setSelectedTask(null)
    setTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setSelectedColumnId(task.column_id || null)
    setTaskModalOpen(true)
  }

  const handleSaveTask = async (taskData: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; due_date?: string | null }) => {
    if (selectedTask) {
      // Update existing task
      await tasksApi.update(selectedTask.id, taskData)
    } else if (selectedColumnId) {
      // Create new task
      const column = columns.find((c) => c.id === selectedColumnId)
      await tasksApi.create({
        column_id: selectedColumnId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
        position: column ? column.tasks.length : 0,
      })
    }
    await loadBoardData()
  }

  const handleDeleteTask = async () => {
    if (selectedTask) {
      await tasksApi.delete(selectedTask.id)
      await loadBoardData()
    }
  }

  const handleAddColumn = async (name: string) => {
    await columnsApi.create({
      board_id: params.id,
      name,
      position: columns.length,
    })
    await loadBoardData()
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Are you sure you want to delete this column? All tasks in it will be deleted.')) return
    await columnsApi.delete(columnId)
    await loadBoardData()
  }

  const handleDeleteBoard = async () => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) return
    try {
      await boardsApi.delete(params.id)
      router.push('/')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete board')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="glass-card rounded-2xl px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-gray-600">Loading board...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <button className="glass-button-dark text-white px-6 py-2 rounded-xl font-medium">
              Back to Boards
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-500 mb-4">Board not found</p>
          <Link href="/">
            <button className="glass-button-dark text-white px-6 py-2 rounded-xl font-medium">
              Back to Boards
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/">
              <button className="text-gray-500 hover:text-gray-700 font-medium mb-2 flex items-center gap-1 text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Boards
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
            {board.description && (
              <p className="text-gray-500 mt-1">{board.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setColumnModalOpen(true)}
              className="glass-button px-4 py-2 rounded-xl text-gray-700 font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Column
            </button>

            {/* Mobile: Column navigation toggle aligned with actions */}
            <button
              onClick={toggleNavVisible}
              className="md:hidden glass-button px-4 py-2 rounded-xl text-gray-700 font-medium text-sm flex items-center justify-center"
              aria-label={isNavVisible ? 'Hide column navigation' : 'Show column navigation'}
              title={isNavVisible ? 'Hide columns' : 'Show columns'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={handleDeleteBoard}
              className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition-colors"
            >
              Delete Board
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className={isMobile ? 'pb-4' : 'overflow-x-auto pb-4'}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {isMobile ? (
            <div className="relative px-0">
              <MobileColumnNav onColumnSelect={handleMobileColumnSelect} showToggle={false} />
              {(() => {
                const activeColumn = columns.find((c) => c.id === activeColumnId) || columns[0]
                if (!activeColumn) return null
                return (
                  <div className={`px-4 ${isNavVisible ? 'pr-16' : ''}`}>
                    <Column
                      key={activeColumn.id}
                      id={activeColumn.id}
                      name={activeColumn.name}
                      tasks={activeColumn.tasks}
                      onAddTask={() => handleAddTask(activeColumn.id)}
                      onEditTask={handleEditTask}
                      onDeleteColumn={() => handleDeleteColumn(activeColumn.id)}
                      fullWidth
                    />
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="flex gap-6 min-w-max px-4 sm:px-0">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  id={column.id}
                  name={column.name}
                  tasks={column.tasks}
                  onAddTask={() => handleAddTask(column.id)}
                  onEditTask={handleEditTask}
                  onDeleteColumn={() => handleDeleteColumn(column.id)}
                />
              ))}

              {/* Add Column Placeholder */}
              <button
                onClick={() => setColumnModalOpen(true)}
                className="w-80 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors min-h-[200px]"
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Add Column</span>
                </div>
              </button>
            </div>
          )}

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                id={activeTask.id}
                title={activeTask.title}
                description={activeTask.description}
                priority={activeTask.priority}
                dueDate={activeTask.due_date}
                labels={activeTask.labels}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false)
          setSelectedTask(null)
          setSelectedColumnId(null)
        }}
        onSave={handleSaveTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
        task={selectedTask}
        mode={selectedTask ? 'edit' : 'create'}
      />

      {/* Column Modal */}
      <ColumnModal
        isOpen={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSave={handleAddColumn}
        mode="create"
      />
    </div>
  )
}
