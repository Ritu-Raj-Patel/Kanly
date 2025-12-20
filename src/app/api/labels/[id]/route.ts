import { NextRequest } from 'next/server'
import { updateLabelSchema } from '@/lib/validations/schemas'
import { updateLabel, deleteLabel, verifyLabelOwnership } from '@/lib/db/queries'
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

    const isOwner = await verifyLabelOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const validatedData = updateLabelSchema.parse(body)

    const label = await updateLabel(params.id, validatedData)

    return successResponse({ label })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to update label')
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const isOwner = await verifyLabelOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    await deleteLabel(params.id)

    return successResponse({ message: 'Label deleted successfully' })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to delete label')
  }
}
