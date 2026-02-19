'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ScrollText,
  ArrowLeft,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Clock,
} from 'lucide-react'

interface GlobalLog {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  salon?: {
    id: string
    name: string
  }
  severity: 'info' | 'warning' | 'error'
}

export default function AdminLogsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<GlobalLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchLogs()
    }
  }, [session, router, page, filter, severity]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
      })

      if (filter !== 'all') params.append('action', filter)
      if (severity !== 'all') params.append('severity', severity)

      const res = await fetch(`/api/admin/logs?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os logs')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'error':
        return 'bg-red-100 text-red-700'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700'
      case 'info':
        return 'bg-teal-100 text-teal-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5" />
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5" />
      case 'info':
        return <Info className="w-3.5 h-3.5" />
      default:
        return <CircleDot className="w-3.5 h-3.5" />
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Acesso negado</p>
        </div>
      </div>
    )
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-6 lg:p-8">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs Globais</h1>
            <p className="text-gray-500 text-sm">Registo completo de auditoria do SaaS</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de ação
            </label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(1)
              }}
              className="input-base"
            >
              <option value="all">Todas as ações</option>
              <option value="user_created">Utilizador criado</option>
              <option value="subscription_created">Subscrição criada</option>
              <option value="payment_received">Pagamento recebido</option>
              <option value="subscription_cancelled">Subscrição cancelada</option>
              <option value="user_deleted">Utilizador eliminado</option>
              <option value="admin_action">Ação admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível
            </label>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value)
                setPage(1)
              }}
              className="input-base"
            >
              <option value="all">Todos os níveis</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Data/Hora
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Utilizador
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Detalhes
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{log.user.name}</div>
                      <div className="text-xs text-gray-400">{log.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.description}
                      {log.salon && (
                        <div className="text-xs text-gray-400 mt-1">
                          Salão: {log.salon.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getSeverityColor(
                          log.severity
                        )}`}
                      >
                        {getSeverityIcon(log.severity)}
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Seguinte
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
