/**
 * Fonctions utilitaires pour envoyer des webhooks
 * À ne pas exporter depuis les routes API
 */

import { prisma } from './prisma'

export interface WebhookConfig {
  id: string
  name: string
  type: 'slack' | 'discord' | 'email'
  url: string
  severityLevel: 'error' | 'warning' | 'critical'
  enabled: boolean
  retries: number
}

/** Webhooks définis par variables d'environnement : toujours actifs, non modifiables depuis l'admin. */
export function envWebhooks(): WebhookConfig[] {
  const webhooks: WebhookConfig[] = []

  if (process.env.SLACK_CRITICAL_WEBHOOK) {
    webhooks.push({
      id: 'env-slack-critical',
      name: 'Slack (variável de ambiente)',
      type: 'slack',
      url: process.env.SLACK_CRITICAL_WEBHOOK,
      severityLevel: 'critical',
      enabled: true,
      retries: 3,
    })
  }

  if (process.env.DISCORD_CRITICAL_WEBHOOK) {
    webhooks.push({
      id: 'env-discord-critical',
      name: 'Discord (variável de ambiente)',
      type: 'discord',
      url: process.env.DISCORD_CRITICAL_WEBHOOK,
      severityLevel: 'critical',
      enabled: true,
      retries: 3,
    })
  }

  if (process.env.ALERT_EMAIL_ADDRESS) {
    webhooks.push({
      id: 'env-email-critical',
      name: 'Email (variável de ambiente)',
      type: 'email',
      url: process.env.ALERT_EMAIL_ADDRESS,
      severityLevel: 'critical',
      enabled: true,
      retries: 1,
    })
  }

  return webhooks
}

export interface WebhookData {
  type: 'error' | 'warning' | 'critical' | 'test'
  message: string
  errorId?: string
  severity?: string
  timestamp: string
  additionalInfo?: Record<string, any>
}

/**
 * Envoyer une notification webhook
 */
export async function sendWebhookNotification(
  webhook: WebhookConfig,
  data: WebhookData,
  retryCount = 0
): Promise<{ success: boolean; error?: string }> {
  try {
    if (webhook.type === 'slack') {
      return await sendSlackNotification(webhook.url, data)
    } else if (webhook.type === 'discord') {
      return await sendDiscordNotification(webhook.url, data)
    } else if (webhook.type === 'email') {
      return await sendEmailNotification(webhook.url, data)
    }

    return { success: false, error: 'Type webhook non supporté' }
  } catch (error) {
    console.error(`Erreur envoi webhook ${webhook.type}:`, error)

    // Retry logic
    if (retryCount < webhook.retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return sendWebhookNotification(webhook, data, retryCount + 1)
    }

    return { success: false, error: String(error) }
  }
}

/**
 * Envoyer notification Slack
 */
async function sendSlackNotification(webhookUrl: string, data: WebhookData): Promise<{ success: boolean }> {
  const color = data.type === 'critical' ? 'danger' : data.type === 'error' ? 'warning' : 'good'

  const payload = {
    attachments: [
      {
        color,
        title: `🚨 ${data.type.toUpperCase()}: ${data.message}`,
        text: data.additionalInfo?.stack || data.message,
        fields: [
          {
            title: 'Timestamp',
            value: new Date(data.timestamp).toLocaleString('fr-FR'),
            short: true,
          },
          ...(data.errorId ? [{ title: 'Error ID', value: data.errorId, short: true }] : []),
          ...(data.additionalInfo?.url ? [{ title: 'URL', value: data.additionalInfo.url, short: false }] : []),
        ],
        footer: 'Pawlyx Admin Alerts',
      },
    ],
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return { success: res.ok }
}

/**
 * Envoyer notification Discord
 */
async function sendDiscordNotification(webhookUrl: string, data: WebhookData): Promise<{ success: boolean }> {
  const color =
    data.type === 'critical'
      ? 16711680 // Red
      : data.type === 'error'
        ? 16776960 // Yellow
        : 65280 // Green

  const embed = {
    title: `🚨 ${data.type.toUpperCase()}: ${data.message}`,
    description: data.additionalInfo?.stack || data.message,
    color,
    fields: [
      {
        name: 'Timestamp',
        value: new Date(data.timestamp).toLocaleString('fr-FR'),
        inline: true,
      },
      ...(data.errorId ? [{ name: 'Error ID', value: data.errorId, inline: true }] : []),
      ...(data.additionalInfo?.url ? [{ name: 'URL', value: data.additionalInfo.url, inline: false }] : []),
    ],
    footer: { text: 'Pawlyx Admin Alerts' },
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  })

  return { success: res.ok }
}

/**
 * Envoyer notification Email
 */
async function sendEmailNotification(email: string, data: WebhookData): Promise<{ success: boolean }> {
  try {
    // À intégrer avec votre service email (SendGrid, Resend, etc.)
    // Ceci est un placeholder
    console.log(`[EMAIL] Envoyer alerte à ${email}:`, data.message)

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

const SEVERITY_RANK: Record<string, number> = { warning: 1, error: 2, critical: 3 }

/**
 * Déclenche une alerte sur les webhooks dont le seuil est atteint.
 * Un webhook réglé sur « critical » ignore les simples erreurs.
 */
export async function triggerAlert(errorData: {
  message: string
  severity: string
  errorId?: string
  stack?: string
  url?: string
}) {
  const stored = await prisma.webhook
    .findMany({ where: { enabled: true } })
    .catch(() => [])

  const eventRank = SEVERITY_RANK[errorData.severity] ?? SEVERITY_RANK.error
  const targets = [...(stored as unknown as WebhookConfig[]), ...envWebhooks()].filter(
    webhook => eventRank >= (SEVERITY_RANK[webhook.severityLevel] ?? SEVERITY_RANK.critical)
  )
  if (targets.length === 0) return

  await Promise.all(
    targets.map(async webhook => {
      const result = await sendWebhookNotification(webhook, {
        type: errorData.severity === 'critical' ? 'critical' : 'error',
        message: errorData.message,
        errorId: errorData.errorId,
        severity: errorData.severity,
        timestamp: new Date().toISOString(),
        additionalInfo: {
          stack: errorData.stack,
          url: errorData.url,
        },
      })

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
    })
  )
}
