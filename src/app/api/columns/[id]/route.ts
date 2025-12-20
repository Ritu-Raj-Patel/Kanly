import { NextRequest } from 'next/server'
import { updateColumnSchema } from '@/lib/validations/schemas'
import { updateColumn, deleteColumn, verifyColumnOwnership } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const isOwner = await verifyColumnOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const validatedData = updateColumnSchema.parse(body)

    const column = await updateColumn(params.id, validatedData)

    return successResponse({ column })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to update column')
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const isOwner = await verifyColumnOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    await deleteColumn(params.id)

    return successResponse({ message: 'Column deleted successfully' })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to delete column')
  }
}
