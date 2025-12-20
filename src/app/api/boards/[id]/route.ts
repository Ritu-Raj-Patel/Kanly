import { NextRequest } from 'next/server'
import { updateBoardSchema } from '@/lib/validations/schemas'
import { getBoardById, updateBoard, deleteBoard, getColumnsByBoardId, getTasksByColumnId, getTaskLabels } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const board = await getBoardById(params.id)

    if (!board) {
      return notFoundResponse('Board not found')
    }

    if (board.user_id !== userId) {
      return unauthorizedResponse('You do not have access to this board')
    }

    // Fetch columns with tasks and labels
    const columns = await getColumnsByBoardId(params.id)

    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await getTasksByColumnId(column.id)

        const tasksWithLabels = await Promise.all(
          tasks.map(async (task) => {
            const labels = await getTaskLabels(task.id)
            return { ...task, labels }
          })
        )

        return { ...column, tasks: tasksWithLabels }
      })
    )

    return successResponse({ board, columns: columnsWithTasks })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to fetch board')
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const board = await getBoardById(params.id)

    if (!board) {
      return notFoundResponse('Board not found')
    }

    if (board.user_id !== userId) {
      return unauthorizedResponse('You do not have access to this board')
    }

    const body = await request.json()
    const validatedData = updateBoardSchema.parse(body)

    const updatedBoard = await updateBoard(params.id, validatedData)

    return successResponse({ board: updatedBoard })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to update board')
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const board = await getBoardById(params.id)

    if (!board) {
      return notFoundResponse('Board not found')
    }

    if (board.user_id !== userId) {
      return unauthorizedResponse('You do not have access to this board')
    }

    await deleteBoard(params.id)

    return successResponse({ message: 'Board deleted successfully' })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to delete board')
  }
}
