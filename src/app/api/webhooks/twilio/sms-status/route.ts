import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Webhook Twilio pour les mises à jour de statut SMS
 * POST /api/webhooks/twilio/sms-status
 *
 * Twilio envoie des mises à jour quand:
 * - SMS est envoyé (sent)
 * - SMS est livré (delivered)
 * - SMS a échoué (failed, undelivered, bounced)
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le body
    const body = await request.text()
    const params = new URLSearchParams(body)

    // Valider la signature Twilio pour la sécurité
    const isValid = validateTwilioWebhookSignature(request, body)
    if (!isValid) {
      logger.warn('WEBHOOKS/TWILIO', 'Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Récupérer les données
    const messageId = params.get('MessageSid')
    const status = params.get('MessageStatus') // sent, delivered, failed, undelivered, bounced
    const errorCode = params.get('ErrorCode')
    const errorMessage = params.get('ErrorMessage')

    if (!messageId) {
      logger.warn('WEBHOOKS/TWILIO', 'Missing MessageSid')
      return NextResponse.json({ error: 'Missing MessageSid' }, { status: 400 })
    }

    // Mettre à jour le log SMS dans la DB
    const smsLog = await prisma.sMSLog.findFirst({
      where: { messageId },
    })

    if (!smsLog) {
      logger.warn('WEBHOOKS/TWILIO', `SMS log not found for ${messageId}`)
      // C'est OK, peut être que c'est pas un SMS qu'on a envoyé
      return NextResponse.json({ ok: true })
    }

    // Update status
    await prisma.sMSLog.update({
      where: { id: smsLog.id },
      data: {
        status: mapTwilioStatus(status),
        error:
          status === 'failed' || status === 'undelivered' || status === 'bounced'
            ? `${errorCode}: ${errorMessage}`
            : null,
        sentAt: status === 'sent' ? new Date() : smsLog.sentAt,
      },
    })

    // Log pour debugging
    logger.info('WEBHOOKS/TWILIO', `SMS ${messageId} status: ${status}`, {
      clientId: smsLog.clientId,
      salonId: smsLog.salonId,
    })

    // Si c'est un failure critical, logger plus d'info
    if (status === 'failed' || status === 'undelivered') {
      logger.error('WEBHOOKS/TWILIO', `SMS failed: ${errorCode}`, {
        messageId,
        toPhone: smsLog.toPhone,
        errorMessage,
        clientId: smsLog.clientId,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('WEBHOOKS/TWILIO', 'Webhook error', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Mapper les statuts Twilio aux nôtres
 */
function mapTwilioStatus(
  twilioStatus: string | null
): 'pending' | 'sent' | 'delivered' | 'failed' {
  switch (twilioStatus) {
    case 'sent':
      return 'sent'
    case 'delivered':
      return 'delivered'
    case 'failed':
    case 'undelivered':
    case 'bounced':
      return 'failed'
    default:
      return 'pending'
  }
}

/**
 * Valider la signature du webhook Twilio
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
function validateTwilioWebhookSignature(
  request: NextRequest,
  body: string
): boolean {
  // En développement, tu peux skip cette vérif
  if (process.env.NODE_ENV === 'development') {
    const skipValidation = process.env.SKIP_TWILIO_SIGNATURE_VALIDATION === 'true'
    if (skipValidation) {
      return true
    }
  }

  try {
    const crypto = require('crypto')
    const twilio = require('twilio')

    const signature = request.headers.get('x-twilio-signature')
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!signature || !authToken) {
      console.warn('⚠️ Cannot validate signature: missing header or token')
      return false
    }

    // Réconstruire l'URL originale
    const url = `${process.env.TWILIO_WEBHOOK_URL || 'http://localhost:3000'}/api/webhooks/twilio/sms-status`

    // Valider
    const isValid = twilio.validateRequest(authToken, signature, url, body)
    return isValid
  } catch (error) {
    console.error('Error validating signature:', error)
    // En dev, on est permissif
    return process.env.NODE_ENV === 'development'
  }
}
