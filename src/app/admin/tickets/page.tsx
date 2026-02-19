'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  TicketCheck,
  ArrowLeft,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageSquare,
  User,
  Calendar,
  Tag,
  Loader2,
} from 'lucide-react'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  salon?: {
    name: string
  }
  _count?: {
    messages: number
  }
}

export default function AdminTicketsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [priority, setPriority] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchTickets()
    }
  }, [session, router, filter, priority]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filter !== 'all') params.append('status', filter)
      if (priority !== 'all') params.append('priority', priority)

      const res = await fetch(`/api/admin/tickets?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os tickets')
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Erro')

      toast.success('Ticket atualizado')
      fetchTickets()
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <TicketCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets de Suporte</h1>
            <p className="text-sm text-gray-500">
              Todos os tickets ({tickets.length})
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">Todos os estados</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em curso</option>
              <option value="resolved">Resolvido</option>
              <option value="closed">Fechado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-base"
            >
              <option value="all">Todas as prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum ticket encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assunto
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Utilizador
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Msgs
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="text-teal-600 hover:text-teal-700 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        {ticket.subject}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{ticket.user.name}</p>
                          <p className="text-xs text-gray-400">{ticket.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 ${getStatusBadgeColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ticket._count?.messages || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {ticket.status !== 'closed' && (
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              updateTicketStatus(ticket.id, e.target.value)
                            }
                            className="input-base !py-1.5 !text-xs !rounded-lg max-w-[130px]"
                          >
                            <option value="open">Aberto</option>
                            <option value="in_progress">Em curso</option>
                            <option value="resolved">Resolvido</option>
                            <option value="closed">Fechado</option>
                          </select>
                        )}
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          Ver
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
