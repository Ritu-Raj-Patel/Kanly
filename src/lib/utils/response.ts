import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    },
    { status: 400 }
  )
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverErrorResponse(message: string = 'Internal server error') {
  console.error(message)
  return NextResponse.json({ error: message }, { status: 500 })
}
