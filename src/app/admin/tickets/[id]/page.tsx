'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  TicketCheck,
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  User,
  Calendar,
  Tag,
  Loader2,
  ChevronLeft,
} from 'lucide-react'

interface TicketMessage {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  description: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  salon?: {
    id: string
    name: string
  }
  messages: TicketMessage[]
}

export default function TicketDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageContent, setMessageContent] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchTicket()
    }
  }, [session, router, ticketId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/tickets/${ticketId}`)
      if (!res.ok) throw new Error('Ticket não encontrado')

      const data = await res.json()
      setTicket(data.ticket)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar o ticket')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!messageContent.trim()) return

    try {
      setSendingMessage(true)
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      })

      if (!res.ok) throw new Error('Erro')

      toast.success('Mensagem enviada')
      setMessageContent('')
      fetchTicket()
    } catch (error) {
      toast.error('Erro ao enviar a mensagem')
    } finally {
      setSendingMessage(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Erro')

      if (newStatus === 'closed') {
        toast.success('Ticket fechado')
      } else if (newStatus === 'open') {
        toast.success('Ticket reaberto')
      } else {
        toast.success('Ticket atualizado')
      }
      fetchTicket()
    } catch (error) {
      toast.error('Erro ao atualizar')
    }
  }

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'urgent': return 'Urgente'
      case 'high': return 'Alta'
      case 'normal': return 'Normal'
      case 'low': return 'Baixa'
      default: return p
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'low': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'closed': return <XCircle className="w-4 h-4 text-gray-400" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto'
      case 'in_progress': return 'Em curso'
      case 'resolved': return 'Resolvido'
      case 'closed': return 'Fechado'
      default: return status
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Acesso negado</p>
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

  if (!ticket) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-4">Ticket não encontrado</p>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos tickets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <TicketCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <p className="text-sm text-gray-500">{ticket.subject}</p>
          </div>
        </div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Detalhes do ticket */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-teal-500" />
          Detalhes do ticket
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prioridade</p>
            <span className={`rounded-full px-3 py-1 text-xs font-medium inline-block ${getPriorityColor(ticket.priority)}`}>
              {getPriorityLabel(ticket.priority)}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Estado</p>
            <span className={`rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 ${getStatusBadgeColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              {getStatusLabel(ticket.status)}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Categoria</p>
            <p className="text-sm font-semibold text-gray-900">{ticket.category}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Mensagens</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              {ticket.messages.length}
            </span>
          </div>
        </div>
      </div>

      {/* Informações do utilizador */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-500" />
          Informações do utilizador
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nome</p>
            <p className="text-sm font-semibold text-gray-900">{ticket.user.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm font-semibold text-gray-900">{ticket.user.email}</p>
          </div>
          {ticket.salon && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Salão</p>
              <p className="text-sm font-semibold text-gray-900">{ticket.salon.name}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Criado em</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Calendar className="w-4 h-4 text-teal-500" />
              {new Date(ticket.createdAt).toLocaleString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-teal-500" />
          Descrição
        </h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
        </div>
      </div>

      {/* Histórico de mensagens */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-500" />
          Histórico de mensagens ({ticket.messages.length})
        </h2>

        <div className="space-y-4 mb-6">
          {ticket.messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Nenhuma mensagem por enquanto</p>
            </div>
          ) : (
            ticket.messages.map((message) => (
              <div key={message.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{message.user.name}</p>
                      <p className="text-xs text-gray-400">{message.user.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(message.createdAt).toLocaleString('pt-PT', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed ml-9">{message.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Formulário de resposta */}
        {ticket.status !== 'closed' && (
          <div className="border-t-2 border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responder
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Escreva a sua resposta..."
              className="input-base resize-none"
              rows={4}
            />
            <button
              onClick={sendMessage}
              disabled={sendingMessage || !messageContent.trim()}
              className="mt-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {sendingMessage ? (
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
            </button>
          </div>
        )}
      </div>

      {/* Alterar estado */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-500" />
          Alterar estado
        </h2>
        <div className="flex flex-wrap gap-2">
          {ticket.status === 'closed' ? (
            <button
              onClick={() => updateStatus('open')}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Reabrir
            </button>
          ) : (
            <>
              {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                    ticket.status === status
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getStatusIcon(status)}
                  {status === 'open' && 'Aberto'}
                  {status === 'in_progress' && 'Em curso'}
                  {status === 'resolved' && 'Resolvido'}
                  {status === 'closed' && 'Fechar o ticket'}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
