import { getServerSession } from "next-auth/next"
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logger } from "@/lib/logger"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    isAdmin?: boolean
  }
  interface Session {
    user: User & {
      id: string
      isAdmin?: boolean
    }
  }
}

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  
  session: {
    strategy: 'jwt',
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("AUTH", "Tentative login sans credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          logger.warn("AUTH", `Login attempt with unknown email`)
          return null
        }

        // ✅ SÉCURITÉ: Empêcher les utilisateurs soft-deleted de se connecter
        if (user.deletedAt) {
          logger.warn("AUTH", `Suspended user attempted login: ${user.id}`)
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          logger.warn("AUTH", `Invalid password for: ${credentials.email}`)
          return null
        }

        logger.info("AUTH", `User logged in: ${user.id}`)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin || false
      }
      return token
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authConfig)
export const { GET, POST } = handler
