'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ArrowLeft,
  Filter,
  AlertOctagon,
  AlertCircle,
  ShieldAlert,
  CheckCircle,
  Clock,
  Link2,
  Loader2,
  Bug,
} from 'lucide-react'

interface ErrorLog {
  id: string
  message: string
  severity: string
  resolved: boolean
  url?: string
  createdAt: string
  userId?: string
}

export default function AdminErrorsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [resolved, setResolved] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchErrors()
    }
  }, [session, router, filter, resolved]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchErrors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filter !== 'all') params.append('severity', filter)
      if (resolved !== 'all') params.append('resolved', resolved)

      const res = await fetch(`/api/admin/errors?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setErrors(data.errors || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os erros')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400 bg-red-50'
      case 'error':
        return 'border-orange-400 bg-orange-50'
      case 'warning':
        return 'border-yellow-400 bg-yellow-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-orange-100 text-orange-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-red-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <ShieldAlert className="w-5 h-5 text-gray-500" />
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
            <Bug className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Erros do Sistema</h1>
            <p className="text-gray-500 mt-1">
              Monitorização de erros em produção ({errors.length})
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-teal-500" />
          <h2 className="font-semibold text-gray-900">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidade
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">Todas as severidades</option>
              <option value="critical">Crítico</option>
              <option value="error">Erro</option>
              <option value="warning">Aviso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={resolved}
              onChange={(e) => setResolved(e.target.value)}
              className="input-base"
            >
              <option value="all">Todos</option>
              <option value="false">Não resolvido</option>
              <option value="true">Resolvido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de erros */}
      {errors.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg font-medium">Nenhum erro detetado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {errors.map((error) => (
            <div
              key={error.id}
              className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition ${getSeverityColor(error.severity)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(error.severity)}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getSeverityBadge(error.severity)}`}
                  >
                    {error.severity.toUpperCase()}
                  </span>
                  <h3 className="font-semibold text-gray-900 max-w-2xl">{error.message}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                    error.resolved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {error.resolved ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Resolvido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pendente
                    </span>
                  )}
                </span>
              </div>

              <div className="text-sm text-gray-500 space-y-1 ml-8">
                {error.url && (
                  <p className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-gray-400" />
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{error.url}</code>
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Detetado: {new Date(error.createdAt).toLocaleString('pt-PT')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
