import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/sms/reminders-config
 * Récupérer la config des reminders SMS pour le salon de l'utilisateur
 */
export async function GET(request: NextRequest) {
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

    const reminders = await prisma.sMSReminder.findMany({
      where: { salonId: salon.id },
    })

    return NextResponse.json({
      success: true,
      reminders,
      defaultMessage: 'Olá {client_name}! 🐾 Lembrete: tem tosquia para {animal_name} amanhã às {time}. Serviço: {service_name}. Até breve!',
    })
  } catch (error) {
    console.error('Erro ao buscar config:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sms/reminders-config
 * Criar ou atualizar a config de um reminder
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { type, enabled, triggerHours, message } = body

    if (!type || message === undefined) {
      return NextResponse.json(
        { message: 'type e message são obrigatórios' },
        { status: 400 }
      )
    }

    // Tentar atualizar, senão criar
    const reminder = await prisma.sMSReminder.upsert({
      where: {
        salonId_type: {
          salonId: salon.id,
          type,
        },
      },
      update: {
        enabled,
        triggerHours: triggerHours || 24,
        message,
        updatedAt: new Date(),
      },
      create: {
        salonId: salon.id,
        type,
        enabled: enabled !== false,
        triggerHours: triggerHours || 24,
        message,
      },
    })

    return NextResponse.json({
      success: true,
      reminder,
      message: 'Configuração atualizada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
