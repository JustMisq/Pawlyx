'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, MessageSquare, ChevronRight, Loader2, Ticket as TicketIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  user: {
    id: string
    name: string
    email: string
  }
  messages: {
    id: string
    content: string
    createdAt: string
  }[]
  _count: {
    messages: number
  }
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

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [filter, setFilter] = useState('all')

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'normal',
  })

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets?status=${filter}&admin=true`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets)
        setIsAdmin(data.isAdmin)
      } else {
        toast.error('Erro ao carregar')
      }
    } catch {
      toast.error('Erro de rede')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      })

      if (res.ok) {
        const ticket = await res.json()
        toast.success('Ticket criado!')
        setShowNewModal(false)
        setNewTicket({ subject: '', description: '', category: 'general', priority: 'normal' })
        router.push(`/dashboard/support/${ticket.id}`)
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro')
      }
    } catch {
      toast.error('Erro de rede')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isAdmin ? <><TicketIcon className="w-6 h-6 text-teal-600" /> Gestão de tickets</> : <><MessageSquare className="w-6 h-6 text-teal-600" /> Suporte</>}
          </h1>
          <p className="mt-1 text-gray-600">
            {isAdmin
              ? 'Gerir os pedidos de suporte dos utilizadores'
              : 'Precisa de ajuda? Crie um ticket e a nossa equipa responderá.'}
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo ticket
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-100'
            }`}
          >
            {status === 'all' ? 'Todos' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Liste des tickets */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum ticket</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Ainda não criou nenhum ticket de suporte.'
              : 'Nenhum ticket com este estado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{categoryLabels[ticket.category]}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    <span>•</span>
                    <span>{ticket._count.messages} message{ticket._count.messages > 1 ? 's' : ''}</span>
                    {isAdmin && (
                      <>
                        <span>•</span>
                        <span className="text-teal-600">{ticket.user.email}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nouveau ticket */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Novo ticket de suporte</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="input-base"
                  placeholder="Resuma o seu problema em poucas palavras"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="input-base"
                  >
                    <option value="general">Geral</option>
                    <option value="billing">Faturação</option>
                    <option value="technical">Técnico</option>
                    <option value="feature_request">Sugestão</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="input-base"
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  required
                  rows={5}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="input-base"
                  placeholder="Descreva o seu problema em detalhe. Quanto mais informações fornecer, mais rapidamente poderemos ajudá-lo."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar o ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
