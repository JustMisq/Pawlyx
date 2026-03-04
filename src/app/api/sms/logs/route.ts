import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { logger, getErrorMessage, logApiCall } from '@/lib/logger'

/**
 * GET /api/sms/logs
 * Récupérer les logs SMS avec les statuts de livraison
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    // Récupérer les logs SMS de ce salon
    const smsLogs = await prisma.sMSLog.findMany({
      where: { salonId: salon.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Compter par status
    const stats = {
      total: smsLogs.length,
      pending: smsLogs.filter((s) => s.status === 'pending').length,
      sent: smsLogs.filter((s) => s.status === 'sent').length,
      delivered: smsLogs.filter((s) => s.status === 'delivered').length,
      failed: smsLogs.filter((s) => s.status === 'failed').length,
    }

    const duration = Date.now() - startTime
    logApiCall('GET', '/api/sms/logs', 200, duration, session.user.id)

    return NextResponse.json({ logs: smsLogs, stats })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('GET', '/api/sms/logs', 500, duration)

    const { message, errorId } = getErrorMessage(error)
    logger.error('API/SMS/LOGS', `GET failed: ${errorId}`, error)

    return NextResponse.json(
      { message, errorId },
      { status: 500 }
    )
  }
}
