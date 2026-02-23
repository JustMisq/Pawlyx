import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { sendSMS } from '@/lib/twilio'

/**
 * POST /api/sms/test-auto-reminders
 * Test manual l'envoi des reminders pour un salon spécifique
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

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    // Trouver les RDV de demain pour ce salon
    const tomorrowAppointments = await prisma.appointment.findMany({
      where: {
        salonId: salon.id,
        startTime: {
          gte: tomorrow,
          lte: tomorrowEnd,
        },
        status: 'scheduled',
      },
      include: {
        client: true,
        animal: true,
        service: true,
      },
    })

    console.log(`📱 Test: Trouvé ${tomorrowAppointments.length} RDV pour demain`)

    let sentCount = 0
    let failedCount = 0
    const results = []

    // Pour chaque RDV
    for (const appointment of tomorrowAppointments) {
      try {
        // Récupérer la config de reminder
        const reminderConfig = await prisma.sMSReminder.findUnique({
          where: {
            salonId_type: {
              salonId: salon.id,
              type: 'appointment_reminder',
            },
          },
        })

        if (!reminderConfig || !reminderConfig.enabled) {
          results.push({
            clientName: appointment.client.firstName,
            status: 'skipped',
            reason: 'Reminder not configured',
          })
          continue
        }

        if (!appointment.client.phone) {
          results.push({
            clientName: appointment.client.firstName,
            status: 'failed',
            reason: 'No phone number',
          })
          failedCount++
          continue
        }

        // Formater le message
        const appointmentTime = new Date(appointment.startTime)
        const hours = String(appointmentTime.getHours()).padStart(2, '0')
        const minutes = String(appointmentTime.getMinutes()).padStart(2, '0')

        const message = reminderConfig.message
          .replace('{client_name}', appointment.client.firstName)
          .replace('{animal_name}', appointment.animal.name)
          .replace('{service_name}', appointment.service.name)
          .replace('{time}', `${hours}:${minutes}`)
          .replace('{date}', appointmentTime.toLocaleDateString('pt-PT'))

        // Envoyer le SMS (mode test = pas de comptage)
        const result = await sendSMS({
          to: appointment.client.phone,
          body: message,
          clientId: appointment.client.id,
          salonId: salon.id,
          userId: session.user.id,
          appointmentId: appointment.id,
          type: 'appointment_reminder_test',
        })

        if (result.success) {
          sentCount++
          results.push({
            clientName: appointment.client.firstName,
            phone: appointment.client.phone,
            status: 'sent',
            messagePreview: message.substring(0, 50) + '...',
          })
        } else {
          failedCount++
          results.push({
            clientName: appointment.client.firstName,
            status: 'failed',
            error: result.error,
          })
        }
      } catch (error) {
        failedCount++
        results.push({
          clientName: appointment.client.firstName,
          status: 'error',
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Test: ${sentCount} SMS envoyés, ${failedCount} échoués`,
      sentCount,
      failedCount,
      totalAppointments: tomorrowAppointments.length,
      results,
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
