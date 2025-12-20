import { NextRequest } from 'next/server'
import { createTaskSchema } from '@/lib/validations/schemas'
import { createTask } from '@/lib/db/queries'
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
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
    const validatedData = createTaskSchema.parse(body)

    const task = await createTask(validatedData)

    return successResponse({ task }, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Failed to create task')
  }
}
