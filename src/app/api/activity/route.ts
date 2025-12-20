import { NextRequest } from 'next/server'
import { getActivityLogsByBoardId, getBoardById } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('board_id')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    if (!boardId) {
      return errorResponse('board_id query parameter is required')
    }

    const board = await getBoardById(boardId)
    if (!board) {
      return notFoundResponse('Board not found')
    }
    if (board.user_id !== userId) {
      return unauthorizedResponse('You do not have access to this board')
    }

    const logs = await getActivityLogsByBoardId(boardId, limit)

    return successResponse({ logs })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to fetch activity logs')
  }
}
