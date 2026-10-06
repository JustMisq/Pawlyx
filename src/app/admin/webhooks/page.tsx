'use client'

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
  Lock,
  Pencil,
  X,
} from 'lucide-react'

type WebhookType = 'slack' | 'discord' | 'email'

interface Webhook {
  id: string
  name: string
  type: WebhookType
  url: string
  severityLevel: string
  enabled: boolean
  lastStatus?: string | null
  lastTriggeredAt?: string | null
  readOnly?: boolean
}

const emptyForm = {
  name: '',
  type: 'slack' as WebhookType,
  url: '',
  severityLevel: 'critical',
  enabled: true,
}

const typeHints: Record<WebhookType, string> = {
  slack: 'https://hooks.slack.com/services/...',
  discord: 'https://discord.com/api/webhooks/...',
  email: 'alertas@exemplo.pt',
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [envHooks, setEnvHooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [testMessage, setTestMessage] = useState('')
  const [sendingTest, setSendingTest] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/webhooks')
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setWebhooks(data.webhooks || [])
      setEnvHooks(data.envWebhooks || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os webhooks')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (webhook: Webhook) => {
    setEditingId(webhook.id)
    setForm({
      name: webhook.name,
      type: webhook.type,
      url: webhook.url,
      severityLevel: webhook.severityLevel,
      enabled: webhook.enabled,
    })
    setShowForm(true)
  }

  const saveWebhook = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('O nome e o URL são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao guardar')
        return
      }

      toast.success(editingId ? 'Webhook atualizado' : 'Webhook adicionado')
      resetForm()
      fetchWebhooks()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async (webhook: Webhook) => {
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: webhook.id, enabled: !webhook.enabled }),
      })
      if (!res.ok) throw new Error('Erro')

      setWebhooks(prev => prev.map(w => (w.id === webhook.id ? { ...w, enabled: !w.enabled } : w)))
    } catch (error) {
      toast.error('Impossível alterar o estado')
    }
  }

  const deleteWebhook = async (webhook: Webhook) => {
    if (!confirm(`Eliminar o webhook "${webhook.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/webhooks?id=${webhook.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro')

      toast.success('Webhook eliminado')
      setWebhooks(prev => prev.filter(w => w.id !== webhook.id))
    } catch (error) {
      toast.error('Impossível eliminar')
    }
  }

  const sendTest = async (id?: string) => {
    setSendingTest(id || 'all')
    try {
      const res = await fetch('/api/admin/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, testMessage: testMessage || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao enviar o teste')
        return
      }

      const failed = (data.results || []).filter((r: { success: boolean }) => !r.success)
      if (failed.length === 0) {
        toast.success(`Teste enviado a ${data.results.length} webhook(s)`)
      } else {
        toast.error(`${failed.length} webhook(s) falharam. Verifique os URLs.`)
      }
      fetchWebhooks()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar o teste')
    } finally {
      setSendingTest(null)
    }
  }

  const getWebhookIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return <Globe className="w-5 h-5 text-teal-500" />
      case 'discord':
        return <Zap className="w-5 h-5 text-indigo-500" />
      case 'email':
        return <Bell className="w-5 h-5 text-amber-500" />
      default:
        return <Link2 className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const allHooks = [...webhooks, ...envHooks]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhooks &amp; Alertas</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Receba os erros críticos no Slack, no Discord ou por email
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Adicionar webhook</>}
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar webhook' : 'Novo webhook'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-base"
                placeholder="Alertas #incidentes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as WebhookType })}
                className="input-base"
              >
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {form.type === 'email' ? 'Endereço de email *' : 'URL do webhook *'}
              </label>
              <input
                type="text"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                className="input-base font-mono text-xs sm:text-sm"
                placeholder={typeHints[form.type]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Severidade mínima</label>
              <select
                value={form.severityLevel}
                onChange={e => setForm({ ...form, severityLevel: e.target.value })}
                className="input-base"
              >
                <option value="critical">Apenas críticos</option>
                <option value="error">Erros e críticos</option>
                <option value="warning">Tudo (avisos incluídos)</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer h-[42px]">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={e => setForm({ ...form, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={saveWebhook}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : 'Guardar'}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Link2 className="w-5 h-5 text-teal-600" />} tone="teal" value={allHooks.length} label="Total de webhooks" />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} tone="green" value={allHooks.filter(w => w.enabled).length} label="Ativos" />
        <StatCard icon={<XCircle className="w-5 h-5 text-red-500" />} tone="red" value={allHooks.filter(w => !w.enabled).length} label="Inativos" />
      </div>

      {allHooks.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Nenhum webhook configurado</p>
          <p className="text-sm text-gray-400 mt-2">
            Adicione um webhook para ser avisado quando ocorrer um erro crítico
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Webhooks configurados</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {allHooks.map(webhook => (
              <div key={webhook.id} className="px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getWebhookIcon(webhook.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{webhook.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium uppercase">
                        {webhook.type}
                      </span>
                      {webhook.readOnly && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                          <Lock className="w-3 h-3" /> variável de ambiente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 break-all mt-1 font-mono">{webhook.url}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Severidade: <span className="font-medium text-gray-600">{webhook.severityLevel}</span>
                      {webhook.lastTriggeredAt && (
                        <>
                          {' · último envio: '}
                          <span className={webhook.lastStatus === 'success' ? 'text-green-600' : 'text-red-600'}>
                            {webhook.lastStatus === 'success' ? 'sucesso' : 'falhou'}
                          </span>
                          {` (${new Date(webhook.lastTriggeredAt).toLocaleString('pt-PT')})`}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => sendTest(webhook.readOnly ? undefined : webhook.id)}
                    disabled={sendingTest !== null}
                    title="Enviar um teste"
                    className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-40"
                  >
                    {sendingTest === webhook.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  </button>
                  {!webhook.readOnly && (
                    <>
                      <button
                        onClick={() => toggleEnabled(webhook)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          webhook.enabled
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {webhook.enabled ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => startEdit(webhook)}
                        title="Editar"
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook)}
                        title="Eliminar"
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {webhook.readOnly && (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Ativo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allHooks.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Testar todos os webhooks ativos</h3>
          </div>
          <div className="space-y-4">
            <textarea
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              placeholder="Mensagem de teste personalizada (opcional)"
              className="input-base resize-y min-h-[80px]"
              rows={3}
            />
            <button
              onClick={() => sendTest()}
              disabled={sendingTest !== null}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            >
              {sendingTest === 'all' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>
              ) : (
                <><Play className="w-4 h-4" /> Enviar notificação de teste</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Onde obter o URL</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-500" />
              <p className="font-medium text-gray-900 text-sm">Slack</p>
            </div>
            <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1">
              <li>Criar uma app com &laquo;Incoming Webhooks&raquo; em api.slack.com/apps</li>
              <li>Escolher o canal e copiar o URL</li>
              <li>Colar aqui com o tipo &laquo;Slack&raquo;</li>
            </ol>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <p className="font-medium text-gray-900 text-sm">Discord</p>
            </div>
            <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1">
              <li>Definições do canal &rarr; Integrações &rarr; Webhooks</li>
              <li>Criar um webhook e copiar o URL</li>
              <li>Colar aqui com o tipo &laquo;Discord&raquo;</li>
            </ol>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <p className="font-medium text-gray-900 text-sm">Email</p>
            </div>
            <p className="text-xs text-gray-500">
              Indique o endereço que deve receber as alertas. O envio de email ainda não está ligado a um
              fornecedor — as alertas são registadas no servidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  tone,
  value,
  label,
}: {
  icon: React.ReactNode
  tone: 'teal' | 'green' | 'red'
  value: number
  label: string
}) {
  const bg = tone === 'teal' ? 'bg-teal-50' : tone === 'green' ? 'bg-green-50' : 'bg-red-50'
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}
