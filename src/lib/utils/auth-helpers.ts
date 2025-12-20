import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return null
  }

  return session.user.id
}

export async function requireAuth() {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return userId
}
