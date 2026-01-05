import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'CLIENT'
      clientId: string | null
      baseId: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'CLIENT'
    clientId: string | null
    baseId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'CLIENT'
    clientId: string | null
    baseId: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
          baseId: user.baseId
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clientId = user.clientId
        token.baseId = user.baseId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.clientId = token.clientId
        session.user.baseId = token.baseId
      }
      return session
    }
  },
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.AUTH_SECRET
}

export async function auth() {
  const { getServerSession } = await import('next-auth')
  return getServerSession(authOptions)
}
