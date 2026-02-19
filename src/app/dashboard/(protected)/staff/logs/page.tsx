'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  XCircle,
  Ban,
  CreditCard,
  Download,
  ArrowLeft,
  Loader2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValue?: string
  newValue?: string
  user: {
    name: string
    email: string
  }
  createdAt: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (filter !== 'all') params.append('action', filter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/salon/logs?${params}`)
      if (!res.ok) throw new Error('Erro ao obter os logs')

      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os logs')
    } finally {
      setLoading(false)
    }
  }, [page, filter, startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600'
      case 'update':
        return 'text-blue-600'
      case 'delete':
        return 'text-red-600'
      case 'cancel':
        return 'text-orange-600'
      case 'payment':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, React.ReactNode> = {
      create: <span className="inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Criada</span>,
      update: <span className="inline-flex items-center gap-1"><Pencil className="w-4 h-4" /> Editada</span>,
      delete: <span className="inline-flex items-center gap-1"><Trash2 className="w-4 h-4" /> Eliminada</span>,
      cancel: <span className="inline-flex items-center gap-1"><XCircle className="w-4 h-4" /> Cancelada</span>,
      no_show: <span className="inline-flex items-center gap-1"><Ban className="w-4 h-4" /> No-show</span>,
      payment: <span className="inline-flex items-center gap-1"><CreditCard className="w-4 h-4" /> Pagamento</span>,
    }
    return labels[action] || action
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client: 'Cliente',
      animal: 'Animal',
      appointment: 'Marcação',
      invoice: 'Fatura',
      service: 'Serviço',
    }
    return labels[type] || type
  }

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        export: 'csv',
      })

      if (filter !== 'all') params.append('action', filter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      window.location.href = `/api/salon/logs?${params}`
      toast.success('Exportação em curso...')
    } catch (error) {
      toast.error('Erro ao exportar')
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-teal-500" />
            Logs de Atividade
          </h1>
          <p className="text-gray-600 mt-2">Histórico de todas as ações efetuadas no salão</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportLogs}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <option value="create">Criações</option>
              <option value="update">Edições</option>
              <option value="delete">Eliminações</option>
              <option value="cancel">Cancelamentos</option>
              <option value="payment">Pagamentos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              className="input-base"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilter('all')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Repor
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Nenhum log disponível</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Utilizador
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{log.user.name}</div>
                      <div className="text-xs text-gray-500">{log.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getEntityTypeLabel(log.entityType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.newValue && (
                        <details className="cursor-pointer">
                          <summary className="text-teal-600 hover:text-teal-700">
                            Ver alterações
                          </summary>
                          {log.oldValue && (
                            <div className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-200">
                              <strong>Antes:</strong>
                              <pre className="mt-1 overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.oldValue), null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div className="mt-2 text-xs bg-green-50 p-2 rounded border border-green-200">
                              <strong>Depois:</strong>
                              <pre className="mt-1 overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.newValue), null, 2)}
                              </pre>
                            </div>
                          )}
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 transition"
          >
            Seguinte
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
