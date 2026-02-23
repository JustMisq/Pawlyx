'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, MessageSquare, AlertCircle, Settings } from 'lucide-react'
import Link from 'next/link'

interface SMSStats {
  monthlySMSLimit: number
  monthlySMSUsed: number
  remainingSMS: number
  totalSentThisMonth: number
  overageSentThisMonth: number
  overageCostThisMonth: number
  smsOverageCost: number
}

interface Client {
  id: string
  firstName: string
  lastName: string
  phone: string | null
}

export default function SMSPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<SMSStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [formData, setFormData] = useState({
    clientId: '',
    phoneNumber: '',
    message: '',
    type: 'custom',
  })

  // Charger les données
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [statsRes, clientsRes] = await Promise.all([
        fetch('/api/sms/stats'),
        fetch('/api/clients'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData.clients || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleClientChange(clientId: string) {
    setFormData({ ...formData, clientId })

    // Auto-fill phone number
    const client = clients.find((c) => c.id === clientId)
    if (client?.phone) {
      setFormData((prev) => ({ ...prev, phoneNumber: client.phone || '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.clientId || !formData.phoneNumber || !formData.message) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          phoneNumber: formData.phoneNumber,
          message: formData.message,
          type: formData.type,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message)
        setFormData({ clientId: '', phoneNumber: '', message: '', type: 'custom' })
        await fetchData() // Refresh stats
      } else {
        toast.error(data.error || 'Erro ao enviar SMS')
      }
    } catch (error) {
      toast.error('Erro ao enviar SMS')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const usagePercent = stats
    ? Math.min(100, (stats.monthlySMSUsed / stats.monthlySMSLimit) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">SMS & Mensagens</h1>
          </div>
          <p className="text-gray-600">Envie lembretes e mensagens para seus clientes</p>

          {/* Quick Links */}
          <div className="mt-4 flex gap-2">
            <Link
              href="/dashboard/messages/automation"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
            >
              <Settings className="w-4 h-4" />
              Configurar Automações
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm mb-1">SMS Inclusos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.remainingSMS} / {stats.monthlySMSLimit}
              </p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (stats.monthlySMSUsed / stats.monthlySMSLimit) * 100)}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">{stats.monthlySMSUsed} utilizados</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm mb-1">SMS Extra (este mês)</p>
              <p className="text-3xl font-bold text-orange-600">{stats.overageSentThisMonth}</p>
              <p className="text-gray-500 text-xs mt-3">
                €{(stats.overageCostThisMonth).toFixed(2)} custo
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm mb-1">Total (todo tempo)</p>
              <p className="text-3xl font-bold text-blue-600">{stats.monthlySMSUsed}</p>
              <p className="text-gray-500 text-xs mt-3">Mensagems enviadas</p>
            </div>
          </div>
        )}

        {/* Info quota */}
        {stats && (
          <div className={`mb-6 rounded-xl p-4 flex gap-3 ${
            stats.remainingSMS === 0
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              stats.remainingSMS === 0 ? 'text-orange-600' : 'text-blue-600'
            }`} />
            <div>
              {stats.remainingSMS === 0 ? (
                <>
                  <p className="font-semibold text-orange-900">Limite atingido</p>
                  <p className="text-sm text-orange-800">
                    Atingiu o limite mensal de {stats.monthlySMSLimit} SMS. Cada SMS adicional será faturado a <strong>0,008€</strong> (0,8 cêntimos).
                  </p>
                  {stats.overageSentThisMonth > 0 && (
                    <p className="text-sm text-orange-700 mt-1">
                      Este mês: {stats.overageSentThisMonth} SMS extra = <strong>{stats.overageCostThisMonth.toFixed(2)}€</strong>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold text-blue-900">Quota de SMS</p>
                  <p className="text-sm text-blue-800">
                    Tem <strong>{stats.remainingSMS}</strong> SMS restantes este mês (de {stats.monthlySMSLimit}). 
                    Após atingir o limite, cada SMS adicional será faturado a <strong>0,008€</strong> (0,8 cêntimos).
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Enviar Mensagem</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecionar cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Telefone *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+351 912 345 678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-gray-500 text-xs mt-1">Formato: +[país][número]</p>
            </div>

            {/* Message Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mensagem
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="custom">Mensagem Personalizada</option>
                <option value="reminder">Lembrete de Agendamento</option>
                <option value="promo">Promoção</option>
                <option value="survey">Pesquisa</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Digite sua mensagem aqui..."
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <div className="flex justify-between mt-2">
                <p className="text-gray-500 text-xs">
                  {formData.message.length} / 160 caracteres
                </p>
                <p className="text-gray-500 text-xs">
                  {Math.ceil(formData.message.length / 160)} SMS
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending || !formData.clientId || !formData.phoneNumber || !formData.message}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {sending ? 'Enviando...' : 'Enviar SMS'}
            </button>
          </form>
        </div>

        {/* Templates */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Modelos Rápidos</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'Lembrete de Consulta',
                message: 'Olá! 🐾 Lembrete: tem tosquia para [animal] amanhã às [hora]. Até breve!',
              },
              {
                name: 'Promoção',
                message: 'Oferta especial! 🎉 Tosquia completa + banho com desconto de 15%. Use código: PAWLY15',
              },
              {
                name: 'Confirmação de Agendamento',
                message: 'Agendamento confirmado! 📅 Dia [data] às [hora] em nosso salon. Até logo!',
              },
              {
                name: 'Feedback',
                message: 'Como foi a visita? 😊 Compartilhe sua experiência! Seu feedback é importante.',
              },
            ].map((template, idx) => (
              <button
                key={idx}
                onClick={() => setFormData({ ...formData, message: template.message })}
                className="p-4 text-left border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm mb-2">{template.name}</p>
                <p className="text-gray-600 text-xs line-clamp-2">{template.message}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
