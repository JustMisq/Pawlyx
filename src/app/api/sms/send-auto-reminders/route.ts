import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSMS } from '@/lib/twilio'
import { logger } from '@/lib/logger'

/**
 * POST /api/sms/send-auto-reminders
 * Envoie automatiquement les SMS de rappel pour les RDV de demain
 * Peut être appelé par un CRON externe (EasyCron, Vercel Cron, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier si le header d'authentification est fourni
    const authHeader = request.headers.get('authorization')
    const secretKey = process.env.CRON_SECRET_KEY

    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    // Trouver tous les RDV de demain
    const tomorrowAppointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lte: tomorrowEnd,
        },
        status: 'scheduled',
      },
      include: {
        client: true,
        animal: true,
        services: { include: { service: true } },
        salon: true,
      },
    })

    console.log(`📱 Trouvé ${tomorrowAppointments.length} RDV pour demain`)

    let sentCount = 0
    let failedCount = 0

    // Pour chaque RDV, récupérer la config du salon et envoyer le SMS
    for (const appointment of tomorrowAppointments) {
      try {
        // Récupérer la config de reminder pour ce salon
        const reminderConfig = await prisma.sMSReminder.findUnique({
          where: {
            salonId_type: {
              salonId: appointment.salonId,
              type: 'appointment_reminder',
            },
          },
        })

        // Si pas configuré ou désactivé, skip
        if (!reminderConfig || !reminderConfig.enabled) {
          continue
        }

        // Vérifier que le client a un numéro de téléphone
        if (!appointment.client.phone) {
          console.log(`⚠️  Client ${appointment.client.id} n'a pas de téléphone`)
          failedCount++
          continue
        }

        // Obtenir l'ID utilisateur du salon
        const user = await prisma.user.findFirst({
          where: { salon: { id: appointment.salonId } },
        })

        if (!user) {
          console.log(`⚠️  Pas de user trouvé pour salon ${appointment.salonId}`)
          failedCount++
          continue
        }

        // Formater le message (remplacer les placeholders)
        const appointmentTime = new Date(appointment.startTime)
        const hours = String(appointmentTime.getHours()).padStart(2, '0')
        const minutes = String(appointmentTime.getMinutes()).padStart(2, '0')

        // Get service name(s)
        let serviceName = 'Serviço'
        if (appointment.services && appointment.services.length > 0) {
          serviceName = appointment.services.map(s => s.service.name).join(', ')
        }

        const message = reminderConfig.message
          .replace('{client_name}', appointment.client.firstName)
          .replace('{animal_name}', appointment.animal.name)
          .replace('{service_name}', serviceName)
          .replace('{time}', `${hours}:${minutes}`)
          .replace('{date}', appointmentTime.toLocaleDateString('pt-PT'))

        // Envoyer le SMS
        const result = await sendSMS({
          to: appointment.client.phone,
          body: message,
          clientId: appointment.client.id,
          salonId: appointment.salonId,
          userId: user.id,
          appointmentId: appointment.id,
          type: 'appointment_reminder',
        })

        if (result.success) {
          sentCount++
          console.log(`✅ SMS envoyé à ${appointment.client.firstName}`)
        } else {
          failedCount++
          console.error(`❌ Erreur SMS: ${result.error}`)
        }
      } catch (error) {
        failedCount++
        console.error(`Erreur traitement RDV ${appointment.id}:`, error)
      }
    }

    // Log le résumé
    logger.info('REMINDERS', `Auto-reminders: ${sentCount} envoyés, ${failedCount} échoués`)

    return NextResponse.json({
      success: true,
      message: `Reminders envoyés: ${sentCount} réussis, ${failedCount} échoués`,
      sentCount,
      failedCount,
      totalAppointments: tomorrowAppointments.length,
    })
  } catch (error) {
    console.error('Erreur auto-reminders:', error)
    logger.error('REMINDERS', 'Erreur auto-reminders', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de l\'envoi des reminders',
        error: String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sms/send-auto-reminders
 * Liste les RDV programmés pour demain (info seulement)
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lte: tomorrowEnd,
        },
        status: 'scheduled',
      },
      select: {
        id: true,
        startTime: true,
        client: { select: { firstName: true, lastName: true, phone: true } },
        animal: { select: { name: true } },
        services: { select: { service: { select: { name: true } } } },
        salon: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
