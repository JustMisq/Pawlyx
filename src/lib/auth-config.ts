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
  // ✅ SÉCURITÉ: Secret requis pour JWT
  secret: process.env.NEXTAUTH_SECRET,
  
  // ✅ CONFIGURATION URLs - Critique pour session persistence
  // Utiliser NEXTAUTH_URL si disponible, sinon construire depuis VERCEL_URL
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  
  // ✅ CONFIGURATION Pages de redirection
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  
  // ✅ SÉCURITÉ: JWT strategy pour les APIs
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60,   // Refresh token après 1 jour d'inactivité
  },

  // ✅ CONFIGURATION COOKIES - Critical pour la persistance
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
      },
    },
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
      // ✅ SÉCURITÉ: Re-valider isAdmin et deletedAt depuis la DB périodiquement
      // Vérifier toutes les 5 minutes pour éviter le stale JWT
      const now = Math.floor(Date.now() / 1000)
      if (!token.lastDbCheck || now - (token.lastDbCheck as number) > 300) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isAdmin: true, deletedAt: true },
          })
          if (!dbUser || dbUser.deletedAt) {
            // Utilisateur supprimé/suspendu: invalider le token
            return { ...token, id: null, isAdmin: false, invalidated: true }
          }
          token.isAdmin = dbUser.isAdmin
          token.lastDbCheck = now
        } catch {
          // Si la DB est inaccessible, garder les valeurs existantes
        }
      }
      return token
    },
    session({ session, token }: any) {
      if (token.invalidated) {
        return { ...session, user: null }
      }
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  // ✅ DEBUG en development uniquement
  debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authConfig)
export const { GET, POST } = handler
