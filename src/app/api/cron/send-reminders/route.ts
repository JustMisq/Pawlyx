import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSMS } from '@/lib/twilio'
import { logger } from '@/lib/logger'

/**
 * ⏰ VERCEL CRON - Envoie les SMS de rappel automatiquement
 * Configué pour s'exécuter tous les jours à 19h (ajustable dans vercel.json)
 * 
 * GET /api/cron/send-reminders
 */
export async function GET(request: Request) {
  try {
    // ✅ SÉCURITÉ: Vérifier que c'est bien Vercel qui appelle (Authorization header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('CRON/SEND-REMINDERS', 'Unauthorized access attempt')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    logger.info('CRON/SEND-REMINDERS', '⏰ Démarrage de l\'envoi des reminders')

    // Obtenir la date d'aujourd'hui et demain
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    logger.info('CRON/SEND-REMINDERS', `Cherchant les RDV entre ${tomorrow.toISOString()} et ${tomorrowEnd.toISOString()}`)

    // Trouver tous les RDV de demain avec statut "confirmed"
    const tomorrowAppointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lte: tomorrowEnd,
        },
        status: 'confirmed',
        deletedAt: null,
      },
      include: {
        client: true,
        animal: true,
        services: { include: { service: true } },
        salon: true,
      },
    })

    logger.info('CRON/SEND-REMINDERS', `📅 Trouvé ${tomorrowAppointments.length} RDV confirmés pour demain`)

    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Pour chaque RDV de demain
    for (const appointment of tomorrowAppointments) {
      try {
        // Récupérer la configuration des reminders pour ce salon
        const reminderConfig = await prisma.sMSReminder.findUnique({
          where: {
            salonId_type: {
              salonId: appointment.salonId,
              type: 'appointment_reminder',
            },
          },
        })

        // Si pas de config ou désactivé, skip
        if (!reminderConfig || !reminderConfig.enabled) {
          logger.debug('CRON/SEND-REMINDERS', `SMS reminders désactivés pour le salon ${appointment.salonId}`)
          continue
        }

        // Vérifier si le client a un téléphone
        if (!appointment.client?.phone) {
          const clientName = appointment.client ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() : 'Unknown'
          logger.warn('CRON/SEND-REMINDERS', `Pas de téléphone pour le client ${appointment.client?.id}`)
          failedCount++
          errors.push(`Client ${clientName} n'a pas de téléphone`)
          continue
        }

        // Formater le message avec les variables
        const appointmentTime = new Date(appointment.startTime)
        const hours = String(appointmentTime.getHours()).padStart(2, '0')
        const minutes = String(appointmentTime.getMinutes()).padStart(2, '0')
        const time = `${hours}:${minutes}`

        const dateOptions: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
        const date = appointmentTime.toLocaleDateString('pt-BR', dateOptions)

        // Remplacer les variables dans le message
        let message = reminderConfig.message
        const clientName = `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim()
        message = message.replace('{client_name}', clientName)
        message = message.replace('{animal_name}', appointment.animal?.name || 'Animal')
        // Handle multi-service format
        let serviceName = 'Serviço'
        if (appointment.services && appointment.services.length > 0) {
          serviceName = appointment.services.map(s => s.service.name).join(', ')
        }
        message = message.replace('{service_name}', serviceName)
        message = message.replace('{time}', time)
        message = message.replace('{date}', date)

        logger.debug('CRON/SEND-REMINDERS', `📱 Envoi SMS à ${appointment.client.phone} pour ${appointment.id}`)

        // Envoyer le SMS
        const result = await sendSMS({
          to: appointment.client.phone,
          body: message,
          salonId: appointment.salonId,
          userId: appointment.salon?.userId || '',
          clientId: appointment.clientId,
          appointmentId: appointment.id,
          type: 'appointment_reminder',
        })

        if (result.success) {
          sentCount++
          logger.info('CRON/SEND-REMINDERS', `✅ SMS envoyé pour ${clientName}`)
        } else {
          failedCount++
          logger.error('CRON/SEND-REMINDERS', `❌ Echec SMS: ${result.error}`)
          errors.push(`SMS échoué pour ${clientName}: ${result.error}`)
        }
      } catch (error) {
        failedCount++
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
        logger.error('CRON/SEND-REMINDERS', `Erreur pour RDV ${appointment.id}: ${errorMsg}`)
        errors.push(`RDV ${appointment.id}: ${errorMsg}`)
      }
    }

    const duration = Date.now() - startTime
    logger.info('CRON/SEND-REMINDERS', `✨ Terminé en ${duration}ms - ${sentCount} envoyés, ${failedCount} échoués`)

    return NextResponse.json({
      success: true,
      message: 'Cron completed',
      stats: {
        total: tomorrowAppointments.length,
        sent: sentCount,
        failed: failedCount,
        duration: `${duration}ms`,
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
    logger.error('CRON/SEND-REMINDERS', `Erreur critique: ${errorMsg}`)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
