import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Stats globales
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Requêtes en parallèle pour la performance
    const [
      totalUsers,
      totalSalons,
      activeSubscriptions,
      revenueAgg,
      monthlyActiveAgg,
      cancelledThisMonth,
      activeLastMonth,
      totalTickets,
      openTickets,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.salon.count(),
      prisma.subscription.count({
        where: { status: 'active', user: { deletedAt: null } },
      }),
      prisma.subscription.aggregate({
        _sum: { price: true },
        where: { user: { deletedAt: null } },
      }),
      // MRR: active subscriptions dans la période en cours
      prisma.subscription.findMany({
        where: {
          status: 'active',
          user: { deletedAt: null },
          currentPeriodStart: { lte: monthEnd },
          currentPeriodEnd: { gte: monthStart },
        },
        select: { price: true, plan: true },
      }),
      prisma.subscription.count({
        where: {
          status: 'cancelled',
          updatedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.subscription.count({
        where: {
          currentPeriodStart: { lte: lastMonthEnd },
          currentPeriodEnd: { gte: lastMonthStart },
        },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({
        where: { status: { in: ['open', 'in_progress'] } },
      }),
    ])

    const totalRevenue = revenueAgg._sum.price ?? 0

    const monthlyRevenue = monthlyActiveAgg.reduce((acc, s) => {
      return acc + (s.plan === 'yearly' ? s.price / 12 : s.price)
    }, 0)

    const churnRate = activeLastMonth > 0
      ? (cancelledThisMonth / activeLastMonth) * 100
      : 0

    return NextResponse.json({
      totalUsers,
      totalSalons,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
      avgChurn: churnRate,
      totalTickets,
      openTickets,
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
