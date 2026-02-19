'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Activity,
  Hash,
  Calendar,
  FileText,
  Users,
  User,
  PawPrint,
  Scissors,
  Package,
  Settings,
  Timer,
  Layers,
} from 'lucide-react'

interface UsageSummary {
  [key: string]: {
    count: number
    totalDuration: number
    totalItems: number
  }
}

export default function AdminUsagePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState<UsageSummary>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchUsage()
    }
  }, [session, router])

  const fetchUsage = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/usage')
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setSummary(data.summary || {})
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os dados')
    } finally {
      setLoading(false)
    }
  }

  const getFeatureIcon = (feature: string) => {
    const iconClass = 'w-5 h-5 text-teal-600'
    switch (feature) {
      case 'appointments':
        return <Calendar className={iconClass} />
      case 'invoicing':
        return <FileText className={iconClass} />
      case 'staff_management':
        return <Users className={iconClass} />
      case 'clients':
        return <User className={iconClass} />
      case 'animals':
        return <PawPrint className={iconClass} />
      case 'services':
        return <Scissors className={iconClass} />
      case 'inventory':
        return <Package className={iconClass} />
      case 'reports':
        return <BarChart3 className={iconClass} />
      case 'settings':
        return <Settings className={iconClass} />
      default:
        return <Activity className={iconClass} />
    }
  }

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      appointments: 'Consultas',
      invoicing: 'Faturação',
      staff_management: 'Gestão de Equipa',
      clients: 'Clientes',
      animals: 'Animais',
      services: 'Serviços',
      inventory: 'Inventário',
      reports: 'Relatórios',
      settings: 'Definições',
    }
    return labels[feature] || feature.replace(/_/g, ' ')
  }

  const getTrend = (count: number, total: number) => {
    const pct = (count / total) * 100
    if (pct > 25) return { icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, label: 'Alto' }
    if (pct > 10) return { icon: <Minus className="w-4 h-4 text-amber-500" />, label: 'Médio' }
    return { icon: <TrendingDown className="w-4 h-4 text-red-400" />, label: 'Baixo' }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Hash className="w-6 h-6 text-red-500" />
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

  const sortedFeatures = Object.entries(summary).sort(([, a], [, b]) => b.count - a.count)

  const totalUsage = Object.values(summary).reduce((acc, val) => acc + val.count, 0)
  const avgDuration = totalUsage > 0
    ? Math.round(Object.values(summary).reduce((acc, val) => acc + val.totalDuration, 0) / totalUsage)
    : 0

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Estatísticas de Utilização</h1>
            <p className="text-gray-500 mt-1">Uso por funcionalidade</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-xl border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Cartões de estatísticas globais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Hash className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total de Utilizações</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">{totalUsage.toLocaleString('pt-PT')}</p>
          <p className="text-xs text-gray-400 mt-1">Ações registadas</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Timer className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Duração Média</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgDuration}ms</p>
          <p className="text-xs text-gray-400 mt-1">Tempo médio por ação</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Layers className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Funcionalidades Ativas</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">{Object.keys(summary).length}</p>
          <p className="text-xs text-gray-400 mt-1">Funcionalidades utilizadas</p>
        </div>
      </div>

      {/* Ranking de funcionalidades */}
      {sortedFeatures.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Sem dados de utilização disponíveis</p>
          <p className="text-gray-400 text-sm mt-1">Os dados aparecerão quando houver atividade.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Ranking por Funcionalidade</h2>
          {sortedFeatures.map(([feature, data], index) => {
            const percentage = (data.count / totalUsage) * 100
            const avgItemsPerUse = data.totalItems > 0 ? Math.round(data.totalItems / data.count) : 0
            const trend = getTrend(data.count, totalUsage)

            return (
              <div key={feature} className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-teal-200 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getFeatureLabel(feature)}</h3>
                      <p className="text-sm text-gray-500">
                        {data.count.toLocaleString('pt-PT')} {data.count === 1 ? 'utilização' : 'utilizações'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {trend.icon}
                    <div>
                      <p className="text-2xl font-bold text-teal-600">{percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">do uso total</p>
                    </div>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Detalhes */}
                <div className="text-xs text-gray-400 flex flex-wrap gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    {Math.round(data.totalDuration / data.count)}ms / ação
                  </span>
                  {avgItemsPerUse > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {avgItemsPerUse} itens / ação
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    Total: {(data.totalDuration / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
