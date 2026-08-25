import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { logInfo, logError } from '@/src/lib/logger'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'CLIENT' | 'SIEGE' | 'AGENCE'
      clientId: string | null
      baseId: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'CLIENT' | 'SIEGE' | 'AGENCE'
    clientId: string | null
    baseId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'CLIENT' | 'SIEGE' | 'AGENCE'
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
      async authorize(credentials, req) {
        const userAgent = req?.headers?.['user-agent'] ?? 'inconnu'
        // Azure App Service est derriere un reverse proxy : l'IP reelle du
        // client arrive dans x-forwarded-for (premiere valeur de la liste).
        const forwardedFor = req?.headers?.['x-forwarded-for']
        const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
          ?.split(',')[0]
          ?.trim() ?? 'inconnu'
        const emailAttempt = credentials?.email?.toLowerCase() ?? null

        const logAttempt = (outcome: string) =>
          logInfo('login_attempt', { outcome, email: emailAttempt, ip, userAgent })

        try {
          if (!credentials?.email || !credentials?.password) {
            logAttempt('missing_credentials')
            return null
          }

          const user = await prisma.user_usr.findUnique({
            where: { usr_email: credentials.email.toLowerCase() }
          })

          if (!user) {
            logAttempt('user_not_found')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.usr_password
          )

          if (!isPasswordValid) {
            logAttempt('wrong_password')
            return null
          }

          logAttempt('success')

          return {
            id: user.usr_id,
            email: user.usr_email,
            name: user.usr_name,
            role: user.usr_role,
            clientId: user.usr_clientId,
            baseId: user.usr_baseId
          }
        } catch (error) {
          logError('Login authorize() threw', error, { email: emailAttempt, ip, userAgent })
          throw error
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