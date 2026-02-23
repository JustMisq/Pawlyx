'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
  Save,
  Bell,
  Clock,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface ReminderConfig {
  id: string
  type: string
  enabled: boolean
  triggerHours: number
  message: string
}

const REMINDER_TYPES = [
  {
    id: 'appointment_reminder',
    name: 'Lembrete de Marcação',
    description: 'SMS enviado na véspera da marcação',
    icon: Bell,
    color: 'blue',
    defaultMessage:
      'Olá {client_name}! Lembrete: tem marcação para {animal_name} amanhã às {time}. Serviço: {service_name}. Até amanhã!',
    defaultTriggerHours: 24,
  },
  {
    id: 'appointment_morning',
    name: 'Confirmação no Dia',
    description: 'SMS enviado na manhã do dia da marcação',
    icon: Clock,
    color: 'green',
    defaultMessage:
      'Bom dia {client_name}! Confirmamos a tosquia de {animal_name} hoje às {time}. Até já!',
    defaultTriggerHours: 3,
  },
  {
    id: 'appointment_followup',
    name: 'Agradecimento Pós-Visita',
    description: 'SMS enviado após a visita do cliente',
    icon: MessageCircle,
    color: 'purple',
    defaultMessage:
      'Olá {client_name}! Obrigado por trazer {animal_name}. Esperamos que tenha ficado satisfeito/a. Até à próxima!',
    defaultTriggerHours: 2,
  },
]

const PLACEHOLDERS = [
  { key: '{client_name}', description: 'Nome do cliente' },
  { key: '{animal_name}', description: 'Nome do animal' },
  { key: '{service_name}', description: 'Nome do serviço' },
  { key: '{time}', description: 'Hora da marcação (HH:MM)' },
  { key: '{date}', description: 'Data da marcação' },
]

const TRIGGER_OPTIONS: { [key: string]: { label: string; value: number }[] } = {
  appointment_reminder: [
    { label: '48 horas antes', value: 48 },
    { label: '24 horas antes (recomendado)', value: 24 },
    { label: '12 horas antes', value: 12 },
  ],
  appointment_morning: [
    { label: '4 horas antes', value: 4 },
    { label: '3 horas antes (recomendado)', value: 3 },
    { label: '2 horas antes', value: 2 },
  ],
  appointment_followup: [
    { label: '1 hora depois', value: 1 },
    { label: '2 horas depois (recomendado)', value: 2 },
    { label: '4 horas depois', value: 4 },
  ],
}

export default function RemindersConfigPage() {
  const { data: session } = useSession()
  const [reminders, setReminders] = useState<ReminderConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [savingType, setSavingType] = useState<string | null>(null)
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [savedTypes, setSavedTypes] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState<{
    [key: string]: {
      enabled: boolean
      triggerHours: number
      message: string
    }
  }>({})

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/sms/reminders-config')
      if (res.ok) {
        const data = await res.json()
        setReminders(data.reminders)

        const form: typeof formData = {}
        REMINDER_TYPES.forEach((type) => {
          const existing = data.reminders.find(
            (r: ReminderConfig) => r.type === type.id
          )
          form[type.id] = existing
            ? {
                enabled: existing.enabled,
                triggerHours: existing.triggerHours,
                message: existing.message,
              }
            : {
                enabled: false,
                triggerHours: type.defaultTriggerHours,
                message: type.defaultMessage,
              }
        })
        setFormData(form)
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      toast.error('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  async function handleSave(type: string) {
    if (!formData[type]) return

    setSavingType(type)
    try {
      const res = await fetch('/api/sms/reminders-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ...formData[type],
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Configuração guardada com sucesso!')
        setSavedTypes((prev) => new Set(prev).add(type))
        setTimeout(() => {
          setSavedTypes((prev) => {
            const next = new Set(prev)
            next.delete(type)
            return next
          })
        }, 2000)
        fetchConfig()
      } else {
        toast.error(data.error || 'Erro ao guardar')
      }
    } catch (error) {
      toast.error('Erro ao guardar configuração')
      console.error(error)
    } finally {
      setSavingType(null)
    }
  }

  function handleToggle(typeId: string) {
    const config = getFormForType(typeId)
    const newEnabled = !config.enabled

    setFormData({
      ...formData,
      [typeId]: {
        ...config,
        enabled: newEnabled,
      },
    })

    // Auto-save the toggle
    const saveData = {
      type: typeId,
      enabled: newEnabled,
      triggerHours: config.triggerHours,
      message: config.message,
    }

    fetch('/api/sms/reminders-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(
            newEnabled ? 'Lembrete ativado' : 'Lembrete desativado'
          )
        }
      })
      .catch(() => toast.error('Erro ao atualizar'))
  }

  const getFormForType = (type: string) => {
    const typeConfig = REMINDER_TYPES.find((t) => t.id === type)
    return (
      formData[type] || {
        enabled: false,
        triggerHours: typeConfig?.defaultTriggerHours || 24,
        message: typeConfig?.defaultMessage || '',
      }
    )
  }

  const getColorClasses = (color: string, enabled: boolean) => {
    if (!enabled) return 'border-gray-200 bg-gray-50'
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-white'
      case 'green':
        return 'border-green-200 bg-white'
      case 'purple':
        return 'border-purple-200 bg-white'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getIconBgClasses = (color: string, enabled: boolean) => {
    if (!enabled) return 'bg-gray-100 text-gray-400'
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600'
      case 'green':
        return 'bg-green-100 text-green-600'
      case 'purple':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">A carregar configuração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar a Mensagens
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Mensagens Automáticas
          </h1>
          <p className="text-gray-500">
            Configure os SMS enviados automaticamente aos seus clientes antes e depois das marcações.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p>
              Ative os lembretes que pretende utilizar. Os SMS são enviados automaticamente
              com base no horário das marcações dos seus clientes. Pode personalizar cada mensagem
              com as variáveis disponíveis.
            </p>
          </div>
        </div>

        {/* Reminder Cards */}
        <div className="space-y-4">
          {REMINDER_TYPES.map((type) => {
            const config = getFormForType(type.id)
            const Icon = type.icon
            const isExpanded = expandedType === type.id
            const isSaving = savingType === type.id
            const justSaved = savedTypes.has(type.id)

            return (
              <div
                key={type.id}
                className={`rounded-xl border-2 transition-all duration-200 ${getColorClasses(type.color, config.enabled)}`}
              >
                {/* Card Header - Always visible */}
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgClasses(type.color, config.enabled)}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h2
                        className={`font-semibold ${config.enabled ? 'text-gray-900' : 'text-gray-500'}`}
                      >
                        {type.name}
                      </h2>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(type.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        config.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      role="switch"
                      aria-checked={config.enabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                          config.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Expand Button */}
                    {config.enabled && (
                      <button
                        onClick={() =>
                          setExpandedType(isExpanded ? null : type.id)
                        }
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Config */}
                {config.enabled && isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Message Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mensagem
                      </label>
                      <textarea
                        value={config.message}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            [type.id]: {
                              ...config,
                              message: e.target.value,
                            },
                          })
                        }}
                        maxLength={160}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        rows={3}
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-gray-400 text-xs">
                          {config.message.length} / 160 caracteres
                        </p>
                        <p className="text-gray-400 text-xs">
                          {Math.ceil(config.message.length / 160) || 1} SMS
                        </p>
                      </div>
                    </div>

                    {/* Placeholders */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Variáveis disponíveis (clique para inserir):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {PLACEHOLDERS.map((placeholder) => (
                          <button
                            key={placeholder.key}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                [type.id]: {
                                  ...config,
                                  message:
                                    config.message + ' ' + placeholder.key,
                                },
                              })
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-700 hover:bg-gray-200 hover:border-gray-300 transition-colors"
                            title={placeholder.description}
                          >
                            <span className="font-mono">{placeholder.key}</span>
                            <span className="text-gray-400">
                              {placeholder.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trigger timing */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Quando enviar
                      </label>
                      <select
                        value={config.triggerHours}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            [type.id]: {
                              ...config,
                              triggerHours: parseInt(e.target.value),
                            },
                          })
                        }}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {(TRIGGER_OPTIONS[type.id] || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSave(type.id)}
                      disabled={isSaving}
                      className={`w-full font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${
                        justSaved
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      } disabled:opacity-50`}
                    >
                      {justSaved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Guardado!
                        </>
                      ) : isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          A guardar...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Guardar alterações
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Preview / Summary */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Resumo</h3>
          <div className="space-y-2">
            {REMINDER_TYPES.map((type) => {
              const config = getFormForType(type.id)
              return (
                <div
                  key={type.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-700">{type.name}</span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      config.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {config.enabled ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
