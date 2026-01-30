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
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check for existing user
    let existingUser
    try {
      existingUser = await getUserByEmail(validatedData.email)
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError)
      return serverErrorResponse('Database connection error. Please try again.')
    }

    if (existingUser) {
      return errorResponse('User with this email already exists', 409)
    }

    // Hash password
    let passwordHash
    try {
      passwordHash = await hashPassword(validatedData.password)
    } catch (hashError) {
      console.error('Password hashing error:', hashError)
      return serverErrorResponse('Error processing password')
    }

    // Create user
    let user
    try {
      user = await createUser(validatedData.email, passwordHash, validatedData.name)
    } catch (createError) {
      console.error('Database error creating user:', createError)
      return serverErrorResponse('Failed to create user. Please try again.')
    }

    const { password_hash: _passwordHash, ...userWithoutPassword } = user

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
