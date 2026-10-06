import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { envWebhooks } from '@/lib/webhooks'

export const runtime = 'nodejs'

const webhookTypes = ['slack', 'discord', 'email'] as const
const severityLevels = ['critical', 'error', 'warning'] as const

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(webhookTypes),
  url: z.string().min(3).max(500),
  severityLevel: z.enum(severityLevels).default('critical'),
  enabled: z.boolean().default(true),
})

const updateSchema = createSchema.partial().extend({ id: z.string().min(1) })

/** Une URL Slack/Discord doit être https ; un webhook email contient une adresse. */
function validateTarget(type: string, url: string): string | null {
  if (type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url) ? null : 'Indique um endereço de email válido'
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return 'O URL do webhook tem de usar https'
    return null
  } catch {
    return 'URL inválido'
  }
}

async function requireAdmin() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id || !session.user.isAdmin) return null
  return session
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const stored = await prisma.webhook.findMany({ orderBy: { createdAt: 'desc' } })

    return NextResponse.json({
      webhooks: stored.map(webhook => ({ ...webhook, readOnly: false })),
      // Les webhooks définis par variables d'environnement restent actifs mais non modifiables ici
      envWebhooks: envWebhooks().map(webhook => ({ ...webhook, readOnly: true })),
    })
  } catch (error) {
    console.error('Erro GET /api/admin/webhooks:', error)
    return NextResponse.json({ error: 'Erro de servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const targetError = validateTarget(parsed.data.type, parsed.data.url)
    if (targetError) {
      return NextResponse.json({ error: targetError }, { status: 400 })
    }

    const webhook = await prisma.webhook.create({ data: parsed.data })
    return NextResponse.json({ webhook }, { status: 201 })
  } catch (error) {
    console.error('Erro POST /api/admin/webhooks:', error)
    return NextResponse.json({ error: 'Erro de servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const parsed = updateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { id, ...data } = parsed.data

    if (data.url !== undefined || data.type !== undefined) {
      const existing = await prisma.webhook.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Webhook não encontrado' }, { status: 404 })
      }
      const targetError = validateTarget(data.type ?? existing.type, data.url ?? existing.url)
      if (targetError) {
        return NextResponse.json({ error: targetError }, { status: 400 })
      }
    }

    const webhook = await prisma.webhook.update({ where: { id }, data })
    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Erro PUT /api/admin/webhooks:', error)
    return NextResponse.json({ error: 'Erro de servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
    }

    await prisma.webhook.delete({ where: { id } })
    return NextResponse.json({ message: 'Webhook eliminado' })
  } catch (error) {
    console.error('Erro DELETE /api/admin/webhooks:', error)
    return NextResponse.json({ error: 'Erro de servidor' }, { status: 500 })
  }
}
