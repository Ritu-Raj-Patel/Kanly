import { NextRequest } from 'next/server'
import { createColumnSchema } from '@/lib/validations/schemas'
import { createColumn, getBoardById } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = createColumnSchema.parse(body)

    const board = await getBoardById(validatedData.board_id)
    if (!board) {
      return notFoundResponse('Board not found')
    }
    if (board.user_id !== userId) {
      return unauthorizedResponse('You do not have access to this board')
    }

    const column = await createColumn(validatedData.board_id, validatedData.name, validatedData.position)

    return successResponse({ column }, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to create column')
  }
}
