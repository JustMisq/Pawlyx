import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { sendSMS } from '@/lib/twilio'

/**
 * POST /api/sms/send
 * Enviar SMS a um cliente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phoneNumber, message, clientId, appointmentId, type = 'custom' } = body

    // Validações
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { message: 'phoneNumber e message são obrigatórios' },
        { status: 400 }
      )
    }

    if (!clientId) {
      return NextResponse.json(
        { message: 'clientId é obrigatório' },
        { status: 400 }
      )
    }

    // Récupérer le salon de l'utilisateur
    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le client appartient bien au salon
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client || client.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Acès négado' },
        { status: 403 }
      )
    }

    // Verificar subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription) {
      return NextResponse.json(
        { message: 'Subscription não encontrada' },
        { status: 400 }
      )
    }

    // Check limite mensal
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const shouldReset =
      subscription.smsLastResetDate < monthStart

    if (shouldReset) {
      // Reset do contador mensal
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          monthlySMSUsed: 0,
          smsLastResetDate: now,
        },
      })
      subscription.monthlySMSUsed = 0
    }

    // Se já passou do limite, avisar (mas deixar enviar com custo extra)
    if (subscription.monthlySMSUsed >= subscription.monthlySMSLimit) {
      console.log(`⚠️  Overage SMS: usuário ${session.user.id} excedeu limite`)
    }

    // Enviar SMS
    const result = await sendSMS({
      to: phoneNumber,
      body: message,
      clientId,
      salonId: salon.id,
      userId: session.user.id,
      appointmentId,
      type,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao enviar SMS',
          error: result.error,
        },
        { status: 400 }
      )
    }

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      cost: result.cost,
      isOverage: result.isOverage,
      message: result.isOverage
        ? `SMS enviado com custo de €${(result.cost || 0).toFixed(2)} (overage)`
        : 'SMS enviado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao enviar SMS:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao enviar SMS',
        error: String(error),
      },
      { status: 500 }
    )
  }
}
