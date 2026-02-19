'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Bell,
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Globe,
  Loader2,
  Link2,
  Zap,
} from 'lucide-react'

interface Webhook {
  id: string
  type: 'slack' | 'discord' | 'email'
  url: string
  severityLevel: string
  enabled: boolean
}

export default function AdminWebhooksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [testMessage, setTestMessage] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchWebhooks()
    }
  }, [session, router])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/webhooks')
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os webhooks')
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      setSendingTest(true)
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMessage: testMessage || 'Teste de notificação webhook desde Pawlyx',
        }),
      })

      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      toast.success(`Teste enviado: ${data.message}`)
      setTestMessage('')
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar o teste')
    } finally {
      setSendingTest(false)
    }
  }

  const getWebhookIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return <Globe className="w-6 h-6 text-teal-500" />
      case 'discord':
        return <Zap className="w-6 h-6 text-indigo-500" />
      case 'email':
        return <Bell className="w-6 h-6 text-amber-500" />
      default:
        return <Link2 className="w-6 h-6 text-gray-500" />
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Acesso negado</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhooks &amp; Alertas</h1>
            <p className="text-gray-500 text-sm mt-0.5">Configuração e monitorização de notificações</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
              <p className="text-xs text-gray-500">Total de webhooks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {webhooks.filter((w) => w.enabled).length}
              </p>
              <p className="text-xs text-gray-500">Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {webhooks.filter((w) => !w.enabled).length}
              </p>
              <p className="text-xs text-gray-500">Inativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuração */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Configuração</h3>
        </div>
        <div className="text-sm text-gray-600 space-y-2.5">
          <p>
            <strong className="text-gray-800">Slack:</strong> Adicionar a variável{' '}
            <code className="bg-gray-50 px-2 py-1 rounded-lg text-xs font-mono text-teal-700 border border-gray-200">SLACK_CRITICAL_WEBHOOK</code>
          </p>
          <p>
            <strong className="text-gray-800">Discord:</strong> Adicionar a variável{' '}
            <code className="bg-gray-50 px-2 py-1 rounded-lg text-xs font-mono text-teal-700 border border-gray-200">DISCORD_CRITICAL_WEBHOOK</code>
          </p>
          <p>
            <strong className="text-gray-800">Email:</strong> Adicionar a variável{' '}
            <code className="bg-gray-50 px-2 py-1 rounded-lg text-xs font-mono text-teal-700 border border-gray-200">ALERT_EMAIL_ADDRESS</code>
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Reiniciar o servidor após adicionar as variáveis de ambiente.
          </p>
        </div>
      </div>

      {/* Webhooks configurados */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Nenhum webhook configurado</p>
          <p className="text-sm text-gray-400 mt-2">
            Configure as variáveis de ambiente para ativar as alertas
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Webhooks configurados</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="px-6 py-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getWebhookIcon(webhook.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 capitalize">{webhook.type}</h4>
                    <p className="text-sm text-gray-500 break-all mt-0.5">{webhook.url}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Severidade: <span className="font-medium text-gray-600">{webhook.severityLevel}</span>
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 ${
                    webhook.enabled
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {webhook.enabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testar webhooks */}
      {webhooks.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Testar webhooks</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem de teste
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Escreva uma mensagem de teste personalizada (opcional)"
                className="input-base w-full min-h-[80px] resize-y"
                rows={3}
              />
            </div>
            <button
              onClick={sendTestNotification}
              disabled={sendingTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Enviar notificação de teste
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Guia de utilização */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Guia de utilização</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-500" />
              <p className="font-medium text-gray-900 text-sm">Slack</p>
            </div>
            <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1.5">
              <li>Criar um webhook incoming no workspace.slack.com</li>
              <li>Copiar o URL do webhook</li>
              <li>Adicionar o URL à variável <code className="bg-gray-50 px-1 rounded text-teal-700">SLACK_CRITICAL_WEBHOOK</code></li>
              <li>Os erros críticos serão publicados automaticamente no canal</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <p className="font-medium text-gray-900 text-sm">Discord</p>
            </div>
            <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1.5">
              <li>Criar um webhook nas definições de um canal Discord</li>
              <li>Copiar o URL do webhook</li>
              <li>Adicionar o URL à variável <code className="bg-gray-50 px-1 rounded text-teal-700">DISCORD_CRITICAL_WEBHOOK</code></li>
              <li>Os erros críticos serão publicados como embed no Discord</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <p className="font-medium text-gray-900 text-sm">Email</p>
            </div>
            <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1.5">
              <li>Configurar o fornecedor de email (Resend, SendGrid, etc.)</li>
              <li>Adicionar o endereço email admin a <code className="bg-gray-50 px-1 rounded text-teal-700">ALERT_EMAIL_ADDRESS</code></li>
              <li>Os erros críticos serão enviados por email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
