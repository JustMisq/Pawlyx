import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { envWebhooks, sendWebhookNotification, type WebhookConfig } from '@/lib/webhooks'

export const runtime = 'nodejs'

// POST /api/admin/webhooks/test - Envoyer une notification de test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { id, testMessage } = body as { id?: string; testMessage?: string }

    let targets: WebhookConfig[]
    if (id) {
      const stored = await prisma.webhook.findUnique({ where: { id } })
      if (!stored) {
        return NextResponse.json({ error: 'Webhook não encontrado' }, { status: 404 })
      }
      targets = [stored as unknown as WebhookConfig]
    } else {
      const stored = await prisma.webhook.findMany({ where: { enabled: true } })
      targets = [...(stored as unknown as WebhookConfig[]), ...envWebhooks()]
    }

    if (targets.length === 0) {
      return NextResponse.json({ error: 'Nenhum webhook configurado' }, { status: 400 })
    }

    const results = await Promise.all(
      targets.map(async webhook => {
        const result = await sendWebhookNotification(webhook, {
          type: 'test',
          message: testMessage || 'Teste de notificação a partir do painel Pawlyx',
          timestamp: new Date().toISOString(),
        })

        // Les webhooks venant des variables d'environnement n'existent pas en base
        if (!webhook.id.startsWith('env-')) {
          await prisma.webhook
            .update({
              where: { id: webhook.id },
              data: {
                lastStatus: result.success ? 'success' : result.error || 'failed',
                lastTriggeredAt: new Date(),
              },
            })
            .catch(() => undefined)
        }

        return { id: webhook.id, name: webhook.name, ...result }
      })
    )

    return NextResponse.json({
      success: results.every(result => result.success),
      results,
    })
  } catch (error) {
    console.error('Erro POST /api/admin/webhooks/test:', error)
    return NextResponse.json({ error: 'Erro de servidor' }, { status: 500 })
  }
}
