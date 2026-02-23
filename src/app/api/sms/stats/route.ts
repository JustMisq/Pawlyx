import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/sms/stats
 * Récupérer les stats SMS pour l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription) {
      return NextResponse.json(
        { message: 'Subscription non trouvée' },
        { status: 400 }
      )
    }

    // Récupérer les SMS envoyés ce mois
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [
      totalSMSThisMonth,
      overageSMSThisMonth,
      totalSMSAllTime,
      costThisMonth,
    ] = await Promise.all([
      prisma.sMSLog.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: 'sent',
        },
      }),
      prisma.sMSLog.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          isOverage: true,
          status: 'sent',
        },
      }),
      prisma.sMSLog.count({
        where: {
          userId: session.user.id,
          status: 'sent',
        },
      }),
      prisma.sMSLog.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: 'sent',
        },
        _sum: { cost: true },
      }),
    ])

    const includedsms = subscription.monthlySMSLimit
    const used = subscription.monthlySMSUsed
    const remaining = Math.max(0, includedsms - used)
    const overageCost = costThisMonth._sum.cost || 0

    return NextResponse.json({
      success: true,
      monthlySMSLimit: includedsms,
      monthlySMSUsed: used,
      remainingSMS: remaining,
      totalSentThisMonth: totalSMSThisMonth,
      overageSentThisMonth: overageSMSThisMonth,
      overageCostThisMonth: overageCost,
      smsOverageCost: subscription.smsOverageCost,
      totalSMSAllTime: totalSMSAllTime,
      plan: subscription.plan,
    })
  } catch (error) {
    console.error('Erro ao buscar stats SMS:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao buscar stats',
        error: String(error),
      },
      { status: 500 }
    )
  }
}
