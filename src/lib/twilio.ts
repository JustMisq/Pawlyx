/**
 * Integração Twilio para envio de SMS
 */

import twilio from 'twilio'
import { prisma } from '@/lib/prisma'

export interface TwilioConfig {
  accountSid: string
  authToken: string
  fromNumber?: string
  messagingServiceSid?: string
}

export interface TwilioSMSOptions {
  to: string
  body: string
}

interface SendSMSParams extends TwilioSMSOptions {
  salonId: string
  userId: string
  clientId: string
  appointmentId?: string
  type: string
}

/**
 * Validar configuração Twilio
 */
export function validateTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  // Com Messaging Service (recomendado)
  if (accountSid && authToken && messagingServiceSid) {
    return { accountSid, authToken, messagingServiceSid }
  }

  // Fallback para número direto (simples)
  if (accountSid && authToken && fromNumber) {
    return { accountSid, authToken, fromNumber }
  }

  console.warn('⚠️  Twilio não está configurado. SMS reminders desativados.')
  return null
}

/**
 * Enviar SMS via Twilio com logging
 */
export async function sendSMS(params: SendSMSParams): Promise<{
  success: boolean
  messageId?: string
  error?: string
  cost?: number
  isOverage?: boolean
}> {
  const config = validateTwilioConfig()
  if (!config) {
    return {
      success: false,
      error: 'Twilio não configurado',
    }
  }

  try {
    const client = twilio(config.accountSid, config.authToken)

    // Formatar número
    const phoneE164 = formatPhoneNumberE164(params.to)

    // Validar
    if (!isValidPhoneNumber(phoneE164)) {
      return {
        success: false,
        error: `Número de telefone inválido: ${params.to}`,
      }
    }

    // Verificar limite de SMS
    const subscription = await prisma.subscription.findUnique({
      where: { userId: params.userId },
    })

    if (!subscription) {
      return {
        success: false,
        error: 'Subscription não encontrada',
      }
    }

    // Calcular se é overage
    const isOverage = subscription.monthlySMSUsed >= subscription.monthlySMSLimit
    const cost = isOverage ? subscription.smsOverageCost : 0

    // Enviar SMS via Twilio (preferir Messaging Service)
    const message = await client.messages.create(
      config.messagingServiceSid
        ? {
            messagingServiceSid: config.messagingServiceSid,
            to: phoneE164,
            body: params.body,
          }
        : {
            from: config.fromNumber || '',
            to: phoneE164,
            body: params.body,
          }
    )

    // Log no DB
    const smsLog = await prisma.sMSLog.create({
      data: {
        toPhone: phoneE164,
        message: params.body,
        status: 'sent',
        messageId: message.sid,
        cost,
        type: params.type,
        appointmentId: params.appointmentId,
        clientId: params.clientId,
        salonId: params.salonId,
        userId: params.userId,
        isOverage,
        sentAt: new Date(),
      },
    })

    // Update SMS count
    if (isOverage) {
      // Incrementar counter de overage
      await prisma.subscription.update({
        where: { userId: params.userId },
        data: {
          monthlySMSUsed: { increment: 1 },
        },
      })
    } else {
      // Incrementar contador normal
      await prisma.subscription.update({
        where: { userId: params.userId },
        data: {
          monthlySMSUsed: { increment: 1 },
        },
      })
    }

    console.log('✅ SMS enviado:', {
      messageId: message.sid,
      to: phoneE164,
      status: message.status,
      cost,
      isOverage,
    })

    return {
      success: true,
      messageId: message.sid,
      cost,
      isOverage,
    }
  } catch (error) {
    console.error('❌ Erro ao enviar SMS:', error)

    // Log do erro
    await prisma.sMSLog.create({
      data: {
        toPhone: params.to,
        message: params.body,
        status: 'error',
        error: String(error),
        cost: 0,
        type: params.type,
        appointmentId: params.appointmentId,
        clientId: params.clientId,
        salonId: params.salonId,
        userId: params.userId,
        isOverage: false,
      },
    }).catch(() => {})

    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Validar formato do número de telefone E.164
 * Formato: +[país][número]
 * Exemplo: +351912345678
 */
function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remover espaços e caracteres especiais
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '')

  // Verificar se começa com + e tem apenas números
  const e164Regex = /^\+\d{1,15}$/

  if (!e164Regex.test(cleaned)) {
    console.warn(`⚠️  Número não está no formato E.164: ${phoneNumber}`)
    return false
  }

  return true
}

/**
 * Formatar número do cliente para E.164
 * Ex: "912345678" -> "+351912345678"
 * Ex: "+351912345678" -> "+351912345678"
 */
export function formatPhoneNumberE164(phoneNumber: string, countryCode = '351'): string {
  // Remover caracteres especiais
  let cleaned = phoneNumber.replace(/[\s\-()]/g, '')

  // Se já começa com +, retornar como está
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // Se começa com 00, remover
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2)
  }

  // Se começa com 0 (número local), remover
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }

  // Adicionar código de país
  return `+${countryCode}${cleaned}`
}

/**
 * Gerar mensagem de reminder para SMS
 */
export function generateReminderSMSMessage(appointment: {
  client: { firstName: string }
  animal: { name: string }
  service: { name: string }
  startTime: string
}): string {
  const date = new Date(appointment.startTime)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `Olá ${appointment.client.firstName}! 🐾 Lembrete: tem tosquia para ${appointment.animal.name} amanhã às ${hours}:${minutes}. Serviço: ${appointment.service.name}. Até breve!`
}


