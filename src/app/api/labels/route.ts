import { NextRequest } from 'next/server'
import { createLabelSchema } from '@/lib/validations/schemas'
import { createLabel, getLabelsByBoardId, getBoardById } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('board_id')

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

    const labels = await getLabelsByBoardId(boardId)

    return successResponse({ labels })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to fetch labels')
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = createLabelSchema.parse(body)

    const board = await getBoardById(validatedData.board_id)
    if (!board) {
      return notFoundResponse('Board not found')
    }
    if (board.user_id !== userId) {
      return unauthorizedResponse('You do not have access to this board')
    }

    const label = await createLabel(validatedData.board_id, validatedData.name, validatedData.color)

    return successResponse({ label }, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to create label')
  }
}
