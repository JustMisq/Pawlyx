import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { logger, getErrorMessage } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      logger.debug('API/SUBSCRIPTION', 'No user session')
      return NextResponse.json(
        { hasActiveSubscription: false },
        { status: 200 }
      )
    }

    // Tolérant à l'absence de la colonne : si la migration n'est pas encore passée,
    // on considère le salon comme actif plutôt que de bloquer tous les utilisateurs.
    const salon = await prisma.salon
      .findUnique({
        where: { userId: session.user.id },
        select: { status: true },
      })
      .catch(() => null)

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        plan: true,
        billingInterval: true,
        price: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        monthlySMSLimit: true,
        monthlySMSUsed: true,
      },
    })

    const hasActiveSubscription = 
      subscription !== null && 
      (subscription.status === 'active' || subscription.status === 'cancel_at_period_end') &&
      subscription.currentPeriodEnd > new Date()

    return NextResponse.json({
      hasActiveSubscription,
      subscription: hasActiveSubscription ? subscription : null,
      salonStatus: salon?.status ?? null,
    })
  } catch (error) {
    const { message, errorId } = getErrorMessage(error)
    logger.error('API/SUBSCRIPTION', `Check failed: ${errorId}`, error)
    return NextResponse.json(
      { hasActiveSubscription: false, message, errorId },
      { status: 200 }
    )
  }
}

