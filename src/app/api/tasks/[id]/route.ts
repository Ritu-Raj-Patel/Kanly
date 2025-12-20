import { NextRequest } from 'next/server'
import { updateTaskSchema } from '@/lib/validations/schemas'
import { getTaskById, updateTask, deleteTask, verifyTaskOwnership } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
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

    const task = await getTaskById(params.id)

    if (!task) {
      return notFoundResponse('Task not found')
    }

    const isOwner = await verifyTaskOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    return successResponse({ task })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to fetch task')
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const isOwner = await verifyTaskOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    const task = await updateTask(params.id, validatedData)

    return successResponse({ task })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to update task')
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return unauthorizedResponse()
    }

    const isOwner = await verifyTaskOwnership(params.id, userId)
    if (!isOwner) {
      return forbiddenResponse()
    }

    await deleteTask(params.id)

    return successResponse({ message: 'Task deleted successfully' })
  } catch (error) {
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to delete task')
  }
}
