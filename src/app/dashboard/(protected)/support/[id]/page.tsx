'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  content: string
  isStaffReply: boolean
  isInternal: boolean
  authorName: string
  createdAt: string
  attachments: string[]
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null
  user: {
    id: string
    name: string
    email: string
  }
  messages: Message[]
}

const categoryLabels: Record<string, string> = {
  general: 'Geral',
  billing: 'Faturação',
  technical: 'Técnico',
  feature_request: 'Sugestão',
  bug: 'Bug',
}

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em curso',
  waiting_customer: 'A aguardar resposta',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_customer: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTicket(data.ticket)
        setIsAdmin(data.isAdmin)
      } else {
        toast.error('Ticket não encontrado')
        router.push('/dashboard/support')
      }
    } catch {
      toast.error('Erro de rede')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/support/tickets/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          isInternal: isAdmin && isInternal,
        }),
      })

      if (res.ok) {
        setNewMessage('')
        setIsInternal(false)
        fetchTicket()
        toast.success('Mensagem enviada')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro')
      }
    } catch {
      toast.error('Erro de rede')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        fetchTicket()
        toast.success('Estado atualizado')
      } else {
        toast.error('Erro')
      }
    } catch {
      toast.error('Erro de rede')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/support')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
              {priorityLabels[ticket.priority]}
            </span>
          </div>
          <h2 className="text-xl text-gray-700 mt-1">{ticket.subject}</h2>
        </div>

        {/* Actions admin */}
        {isAdmin && (
          <div className="flex gap-2">
            <select
              value={ticket.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="input-base text-sm"
            >
              <option value="open">Aberto</option>
              <option value="in_progress">Em curso</option>
              <option value="waiting_customer">A aguardar cliente</option>
              <option value="resolved">Resolvido</option>
              <option value="closed">Fechado</option>
            </select>
          </div>
        )}
      </div>

      {/* Infos ticket */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Categoria:</span>
            <span className="ml-2 font-medium">{categoryLabels[ticket.category]}</span>
          </div>
          <div>
            <span className="text-gray-500">Criado em:</span>
            <span className="ml-2 font-medium">{formatDate(ticket.createdAt)}</span>
          </div>
          {isAdmin && (
            <div>
              <span className="text-gray-500">Utilizador:</span>
              <span className="ml-2 font-medium">{ticket.user.email}</span>
            </div>
          )}
          {ticket.resolvedAt && (
            <div>
              <span className="text-gray-500">Resolvido em:</span>
              <span className="ml-2 font-medium">{formatDate(ticket.resolvedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl p-4 ${
              message.isInternal
                ? 'bg-yellow-50 border-2 border-yellow-200'
                : message.isStaffReply
                ? 'bg-teal-50 border border-teal-100 ml-8'
                : 'bg-white border-2 border-gray-100 mr-8'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  message.isStaffReply ? 'bg-gradient-to-br from-teal-400 to-teal-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                  {message.authorName[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{message.authorName}</span>
                {message.isInternal && (
                  <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                    Nota interna
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
      </div>

      {/* Formulaire de réponse */}
      {ticket.status !== 'closed' && (
        <form onSubmit={handleSendMessage} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <textarea
            rows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva a sua mensagem..."
            className="input-base resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <div>
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  Nota interna (invisível para o utilizador)
                </label>
              )}
            </div>
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Message ticket fermé */}
      {ticket.status === 'closed' && (
        <div className="bg-gray-100 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Ticket fechado</h3>
          <p className="text-gray-500">
            Este ticket foi fechado. Se precisar de ajuda adicional, crie um novo ticket.
          </p>
        </div>
      )}
    </div>
  )
}
