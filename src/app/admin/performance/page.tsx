'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Zap, ArrowLeft, Timer, Gauge, Activity, TrendingDown, Loader2, CircleDot } from 'lucide-react'

interface PerformanceSummary {
  [key: string]: {
    average: number
    max: number
    min: number
    count: number
    endpoint?: string
  }
}

export default function AdminPerformancePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState<PerformanceSummary>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchPerformance()
    }
  }, [session, router])

  const fetchPerformance = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/performance')
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setSummary(data.summary || {})
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar as métricas')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceStatus = (avgMs: number) => {
    if (avgMs < 100) return { label: 'Excelente', color: 'bg-green-50 text-green-700 border border-green-200' }
    if (avgMs < 300) return { label: 'Bom', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' }
    if (avgMs < 1000) return { label: 'A melhorar', color: 'bg-orange-50 text-orange-700 border border-orange-200' }
    return { label: 'Crítico', color: 'bg-red-50 text-red-700 border border-red-200' }
  }

  const getBarColor = (avgMs: number) => {
    if (avgMs < 100) return 'bg-green-500'
    if (avgMs < 300) return 'bg-yellow-500'
    if (avgMs < 1000) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-600 font-medium">Acesso negado</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const sortedMetrics = Object.entries(summary).sort(([, a], [, b]) => b.average - a.average)

  const avgOverall = Object.values(summary).length > 0
    ? Math.round(Object.values(summary).reduce((acc, val) => acc + val.average, 0) / Object.values(summary).length)
    : 0

  const maxMetric = Object.entries(summary).reduce((max, [, data]) =>
    data.average > max.average ? data : max, { average: 0, max: 0, min: 0, count: 0 })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Zap className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Performance e Métricas</h1>
            <p className="text-gray-500 mt-1">Monitorização dos tempos de resposta e bottlenecks</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Timer className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tempo Médio Global</p>
              <p className="text-3xl font-bold text-gray-900">{avgOverall}<span className="text-lg text-gray-400 ml-1">ms</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Todos os pedidos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Métrica Mais Lenta</p>
              <p className="text-3xl font-bold text-red-600">{Math.round(maxMetric.average)}<span className="text-lg text-gray-400 ml-1">ms</span></p>
              <p className="text-xs text-gray-400 mt-0.5">A melhorar com prioridade</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Métricas Rastreadas</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(summary).length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Endpoints cobertos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics table */}
      {sortedMetrics.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Nenhuma métrica disponível</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-100">
            <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Endpoint</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tempo Médio</div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mín / Máx</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chamadas</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Estado</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-50">
            {sortedMetrics.map(([metric, data]) => {
              const status = getPerformanceStatus(data.average)

              return (
                <div key={metric} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <CircleDot className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 capitalize truncate">{metric.replace(/_/g, ' ')}</p>
                        {data.endpoint && <p className="text-xs text-gray-400 truncate">{data.endpoint}</p>}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-lg font-bold text-gray-900">{data.average}<span className="text-sm text-gray-400 ml-0.5">ms</span></p>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <span className="text-sm text-green-600 font-medium">{data.min}ms</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-sm text-red-500 font-medium">{data.max}ms</span>
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm font-semibold text-gray-700">{data.count}</p>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <CircleDot className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{metric.replace(/_/g, ' ')}</p>
                          {data.endpoint && <p className="text-xs text-gray-400">{data.endpoint}</p>}
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Média</p>
                        <p className="text-sm font-bold text-gray-900">{data.average}ms</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Mín</p>
                        <p className="text-sm font-bold text-green-600">{data.min}ms</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Máx</p>
                        <p className="text-sm font-bold text-red-500">{data.max}ms</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Chamadas</p>
                        <p className="text-sm font-bold text-gray-900">{data.count}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(data.average)}`}
                        style={{ width: `${Math.min((data.average / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Desktop progress bar */}
                  <div className="hidden md:block mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(data.average)}`}
                        style={{ width: `${Math.min((data.average / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
