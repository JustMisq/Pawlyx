import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { validateTwilioConfig, sendSMS, formatPhoneNumberE164 } from '@/lib/twilio'

/**
 * POST /api/reminders/test-sms
 * Testar envio de SMS via Twilio
 * Requer autenticação e telefone no corpo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phoneNumber, message } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'phoneNumber is required' },
        { status: 400 }
      )
    }

    // Validar configuração Twilio
    const config = validateTwilioConfig()
    if (!config) {
      return NextResponse.json(
        {
          message: 'Twilio not configured',
          details: 'Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER',
        },
        { status: 400 }
      )
    }

    // Formatar número para E.164
    const phoneE164 = formatPhoneNumberE164(phoneNumber)

    // Mensagem padrão se não fornecida
    const testMessage = message || `🧪 Teste: SMS de Twilio funcionando! ${new Date().toLocaleTimeString()}`

    // Enviar SMS
    const result = await sendSMS({
      to: phoneE164,
      body: testMessage,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'SMS failed',
          error: result.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      messageId: result.messageId,
      to: phoneE164,
      body: testMessage,
    })
  } catch (error) {
    console.error('Test SMS error:', error)
    return NextResponse.json(
      { message: 'Error testing SMS', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/reminders/test-sms
 * Verificar se Twilio está configurado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const config = validateTwilioConfig()

    if (!config) {
      return NextResponse.json({
        configured: false,
        message: 'Twilio not configured',
        required_env_vars: [
          'TWILIO_ACCOUNT_SID',
          'TWILIO_AUTH_TOKEN',
          'TWILIO_PHONE_NUMBER',
        ],
        next_step: 'Add these variables to .env.local (see docs/setup/TWILIO_SETUP.md)',
      })
    }

    return NextResponse.json({
      configured: true,
      accountSid: config.accountSid.slice(0, 2) + '****' + config.accountSid.slice(-2),
      phoneNumber: config.fromNumber,
      message: 'Twilio is properly configured!',
      usage: {
        description: 'To test SMS, send POST with phoneNumber',
        example: {
          method: 'POST',
          url: '/api/reminders/test-sms',
          body: {
            phoneNumber: '912345678',
            message: 'Optional custom message',
          },
        },
      },
    })
  } catch (error) {
    console.error('Check Twilio error:', error)
    return NextResponse.json(
      { message: 'Error checking Twilio', error: String(error) },
      { status: 500 }
    )
  }
}
