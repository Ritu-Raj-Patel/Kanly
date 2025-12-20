import { NextRequest } from 'next/server'
import { createBoardSchema } from '@/lib/validations/schemas'
import { getBoardsByUserId, createBoard, createColumn } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function GET(_request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const boards = await getBoardsByUserId(userId)

    return successResponse({ boards })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to fetch boards')
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = createBoardSchema.parse(body)

    const board = await createBoard(userId, validatedData.name, validatedData.description)

    // Create default columns
    const defaultColumns = [
      { name: 'To Do', position: 0 },
      { name: 'Doing', position: 1 },
      { name: 'Done', position: 2 },
    ]

    for (const col of defaultColumns) {
      await createColumn(board.id, col.name, col.position)
    }

    return successResponse({ board }, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to create board')
  }
}
