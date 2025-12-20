import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getUserById, getUserByEmail } from '@/lib/db/queries'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
      return new Response(null, { status: 404 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: 'Not authenticated', session: null })
    }

    const sessionUserId = session.user?.id
    const sessionEmail = session.user?.email

    // Check if user exists by ID
    const userById = sessionUserId ? await getUserById(sessionUserId) : null

    // Check if user exists by email
    const userByEmail = sessionEmail ? await getUserByEmail(sessionEmail) : null

    // List all users in database (for debugging)
    const allUsers = await db`SELECT id, email, name FROM users LIMIT 10`

    return Response.json({
      session: {
        userId: sessionUserId,
        email: sessionEmail,
        name: session.user?.name,
      },
      userFoundById: userById ? { id: userById.id, email: userById.email, name: userById.name } : null,
      userFoundByEmail: userByEmail ? { id: userByEmail.id, email: userByEmail.email, name: userByEmail.name } : null,
      allUsersInDb: allUsers,
      diagnosis: !userById && userByEmail
        ? 'SESSION_ID_MISMATCH: User exists but session has wrong ID. Sign out and sign in again.'
        : !userById && !userByEmail
        ? 'USER_NOT_FOUND: User does not exist in database. Need to register.'
        : 'OK: User exists and session ID matches.'
    })
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
