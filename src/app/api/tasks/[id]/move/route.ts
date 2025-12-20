import { NextRequest } from 'next/server'
import { moveTaskSchema } from '@/lib/validations/schemas'
import { moveTask, verifyTaskOwnership, verifyColumnOwnership } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const isTaskOwner = await verifyTaskOwnership(params.id, userId)
    if (!isTaskOwner) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const validatedData = moveTaskSchema.parse(body)

    // Also verify the target column belongs to the user
    const isColumnOwner = await verifyColumnOwnership(validatedData.column_id, userId)
    if (!isColumnOwner) {
      return forbiddenResponse('Cannot move task to a column you do not own')
    }

    const task = await moveTask(params.id, validatedData.column_id, validatedData.position)

    return successResponse({ task })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to move task')
  }
}
