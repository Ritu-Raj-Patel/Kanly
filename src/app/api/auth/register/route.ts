import { NextRequest } from 'next/server'
import { registerSchema } from '@/lib/validations/schemas'
import { createUser, getUserByEmail } from '@/lib/db/queries'
import { hashPassword } from '@/lib/utils/auth'
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/utils/response'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return errorResponse('User with this email already exists', 409)
    }

    const passwordHash = await hashPassword(validatedData.password)

    const user = await createUser(validatedData.email, passwordHash, validatedData.name)

    const { password_hash, ...userWithoutPassword } = user

    return successResponse(
      { user: userWithoutPassword, message: 'User created successfully' },
      201
    )
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error instanceof Error ? error.message : 'Registration failed')
  }
}
