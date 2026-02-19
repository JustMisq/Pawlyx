'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  MessageCircle,
  ArrowLeft,
  Filter,
  ThumbsUp,
  HelpCircle,
  Lightbulb,
  Bug,
  Eye,
  MessageSquare,
  Clock,
  Loader2,
  User,
  AlertTriangle,
  CheckCircle2,
  Archive,
  PlayCircle,
} from 'lucide-react'

interface Interaction {
  id: string
  type: string
  subject?: string
  description: string
  userId: string
  status: string
  priority: string
  requiresReply: boolean
  replied: boolean
  createdAt: string
}

export default function AdminInteractionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [requiresReply, setRequiresReply] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchInteractions()
    }
  }, [session, router, typeFilter, statusFilter, requiresReply]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInteractions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (requiresReply !== 'all') params.append('requiresReply', requiresReply)

      const res = await fetch(`/api/admin/interactions?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setInteractions(data.interactions || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar as interações')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'support_ticket':
        return <MessageSquare className="w-5 h-5 text-teal-600" />
      case 'feature_request':
        return <Lightbulb className="w-5 h-5 text-amber-500" />
      case 'bug_report':
        return <Bug className="w-5 h-5 text-red-500" />
      case 'feedback':
        return <ThumbsUp className="w-5 h-5 text-blue-500" />
      case 'question':
        return <HelpCircle className="w-5 h-5 text-purple-500" />
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'support_ticket':
        return 'Ticket Suporte'
      case 'feature_request':
        return 'Pedido de Funcionalidade'
      case 'bug_report':
        return 'Relatório de Bug'
      case 'feedback':
        return 'Feedback'
      case 'question':
        return 'Questão'
      default:
        return type
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'normal':
        return 'bg-blue-100 text-blue-700'
      case 'low':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente'
      case 'high':
        return 'Alta'
      case 'normal':
        return 'Normal'
      case 'low':
        return 'Baixa'
      default:
        return priority
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-teal-100 text-teal-700">
            <Clock className="w-3 h-3" />
            Aberto
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700">
            <PlayCircle className="w-3 h-3" />
            Em curso
          </span>
        )
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Resolvido
          </span>
        )
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600">
            <Archive className="w-3 h-3" />
            Arquivado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        )
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Acesso negado</p>
          <p className="text-gray-400 text-sm mt-2">Não tem permissões para aceder a esta página.</p>
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
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interações</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Feedback e pedidos dos utilizadores ({interactions.length})
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-teal-500" />
          <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-base w-full"
            >
              <option value="all">Todos os tipos</option>
              <option value="support_ticket">Ticket Suporte</option>
              <option value="feature_request">Pedido de Funcionalidade</option>
              <option value="bug_report">Relatório de Bug</option>
              <option value="feedback">Feedback</option>
              <option value="question">Questão</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base w-full"
            >
              <option value="all">Todos</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em curso</option>
              <option value="resolved">Resolvido</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Necessita Resposta
            </label>
            <select
              value={requiresReply}
              onChange={(e) => setRequiresReply(e.target.value)}
              className="input-base w-full"
            >
              <option value="all">Todos</option>
              <option value="true">Necessita resposta</option>
              <option value="false">Respondido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Interações */}
      {interactions.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Nenhuma interação</p>
          <p className="text-gray-400 text-sm mt-1">Não foram encontradas interações com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-all ${
                interaction.requiresReply && !interaction.replied
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTypeIcon(interaction.type)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {interaction.subject || getTypeLabel(interaction.type)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-2xl">
                      {interaction.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getPriorityColor(
                      interaction.priority
                    )}`}
                  >
                    {getPriorityLabel(interaction.priority)}
                  </span>
                  {getStatusBadge(interaction.status)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-50">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(interaction.createdAt).toLocaleString('pt-PT')}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {interaction.userId}
                </span>
                {interaction.requiresReply && !interaction.replied && (
                  <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Necessita resposta
                  </span>
                )}
                {interaction.replied && (
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Respondido
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
