import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { getErrorMessage, logApiCall } from '@/lib/logger'
import { checkRouteRateLimit } from '@/lib/rate-limit'

// ✅ SÉCURITÉ: Validation stricte avec Zod
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nom doit contenir au moins 2 caractères')
    .max(100, 'Nom ne doit pas dépasser 100 caractères')
    .trim(),
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe est trop long')
    // Au moins une majuscule, une minuscule, un chiffre
    .refine(
      (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd),
      'Mot de passe doit contenir une majuscule, une minuscule et un chiffre'
    ),
})

type RegisterInput = z.infer<typeof registerSchema>

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    // ✅ SÉCURITÉ: Rate limiting sur IP (3 inscriptions par heure)
    const rateLimitResponse = await checkRouteRateLimit(request, 'register')
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()

    // ✅ SÉCURITÉ: Validation avec Zod
    const validatedData = registerSchema.parse(body)

    // ✅ SÉCURITÉ: Vérifier si email existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      logger.warn('AUTH', 'Registration attempt with an existing email')

      // ✅ SÉCURITÉ: même corps ET même statut que le succès, sinon le code HTTP
      // suffit à savoir si l'email est déjà inscrit
      return NextResponse.json(
        { message: 'Conta pronta. Inicie sessão para continuar.' },
        { status: 201 }
      )
    }

    // ✅ SÉCURITÉ: Hasher le mot de passe avec 10 rounds
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // ✅ SÉCURITÉ: Créer l'utilisateur avec une subscription trial
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // Trial de 14 jours

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        // Créer automatiquement un salon vide
        salon: {
          create: {
            name: `Salon de ${validatedData.name}`,
          }
        },
        // Créer une subscription trial gratuite
        subscription: {
          create: {
            plan: "trial",
            price: 0,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEndDate,
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    // ✅ AUDIT: Logger l'action
    logger.audit('AUTH', 'USER_REGISTERED', user.id, { email: user.email })

    const duration = Date.now() - startTime
    logApiCall('POST', '/api/auth/register', 201, duration, user.id)

    return NextResponse.json(
      { message: 'Conta pronta. Inicie sessão para continuar.' },
      { status: 201 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/auth/register', 400, duration)

    // ✅ SÉCURITÉ: Ne pas exposer détails de l'erreur
    if (error instanceof z.ZodError) {
      logger.warn('AUTH', 'Validation error on register', (error as any).issues)
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: (error as any).issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('AUTH', `Registration failed: ${errorId}`, error)

    return NextResponse.json(
      { 
        message: message || 'Erreur lors de l\'inscription',
        errorId 
      },
      { status: 500 }
    )
  }
}
