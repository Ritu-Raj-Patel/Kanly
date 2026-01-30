import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail } from '@/lib/db/queries'
import { verifyPassword } from '@/lib/utils/auth'

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET is not set!')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Auth error: Email and password are required')
            return null
          }

          const user = await getUserByEmail(credentials.email)

          if (!user) {
            console.error('Auth error: No user found with email:', credentials.email)
            return null
          }

          const isValid = await verifyPassword(credentials.password, user.password_hash)

          if (!isValid) {
            console.error('Auth error: Invalid password for user:', credentials.email)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}
