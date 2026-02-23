/**
 * Funções auxiliares para gerenciar reminders
 */

import { prisma } from '@/lib/prisma'

export interface CreateReminderOptions {
  appointmentId: string
  channel: 'email' | 'sms'
  hoursBeforeAppointment?: number
}

/**
 * Criar um reminder para um appointment
 */
export async function createAppointmentReminder(options: CreateReminderOptions) {
  const { appointmentId, channel, hoursBeforeAppointment = 24 } = options

  try {
    // Obter o appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`)
    }

    // Calcular a hora agendada
    const appointmentTime = new Date(appointment.startTime)
    const reminderTime = new Date(appointmentTime.getTime() - hoursBeforeAppointment * 60 * 60 * 1000)

    // Verificar se já existe um reminder para este appointment e canal
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        appointmentId,
        channel,
        type: 'appointment_24h',
      },
    })

    if (existingReminder) {
      console.log(`Reminder already exists for appointment ${appointmentId}`)
      return existingReminder
    }

    // Criar o reminder
    const reminder = await prisma.reminder.create({
      data: {
        type: 'appointment_24h',
        channel,
        appointmentId,
        scheduledFor: reminderTime,
        status: 'pending',
      },
    })

    console.log(`✅ Reminder criado: ${reminder.id} via ${channel} para ${reminderTime.toISOString()}`)
    return reminder
  } catch (error) {
    console.error('Erro ao criar reminder:', error)
    throw error
  }
}

/**
 * Criar reminders para um novo appointment (email + SMS se habilitado)
 */
export async function createAppointmentReminders(appointmentId: string, preferredChannels: ('email' | 'sms')[] = ['email']) {
  const results = {
    created: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const channel of preferredChannels) {
    try {
      await createAppointmentReminder({
        appointmentId,
        channel,
        hoursBeforeAppointment: 24,
      })
      results.created++
    } catch (error) {
      results.failed++
      results.errors.push(`${channel}: ${String(error)}`)
    }
  }

  return results
}

/**
 * Cancelar reminders de um appointment
 */
export async function cancelAppointmentReminders(appointmentId: string) {
  const result = await prisma.reminder.updateMany({
    where: {
      appointmentId,
      status: { not: 'sent' },
    },
    data: {
      status: 'cancelled',
    },
  })

  console.log(`✅ ${result.count} reminders cancelados para appointment ${appointmentId}`)
  return result
}

/**
 * Obter preferência de reminder do cliente
 */
export async function getClientReminderPreferences(clientId: string) {
  // Por enquanto, retornar padrão (email)
  // Puede ser estendido para armazenar preferências do cliente no DB
  return ['email', 'sms'] // Ambos os canais por padrão
}
