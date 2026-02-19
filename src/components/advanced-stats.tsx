'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  BarChart3,
  Euro,
  Calendar,
  ShoppingCart,
  Clock,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Users,
  CreditCard,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Loader2,
} from 'lucide-react'

interface Stats {
  period: string
  overview: {
    totalClients: number
    totalAnimals: number
    appointmentsThisPeriod: number
    completedAppointments: number
    revenue: number
    unpaidAmount: number
  }
  metrics: {
    averageBasket: number
    noShowRate: number
    cancellationRate: number
    conversionRate: number
    noShowCount: number
  }
  trends: {
    revenueGrowth: number
    appointmentGrowth: number
    previousRevenue: number
    previousAppointments: number
  }
  topServices: Array<{
    id: string
    name: string
    count: number
    revenue: number
  }>
  activeClientsCount: number
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: number
  trendLabel?: string
  color?: 'teal' | 'green' | 'orange' | 'red' | 'blue'
}

function StatsCard({ title, value, subtitle, icon, trend, trendLabel, color = 'teal' }: StatsCardProps) {
  const colorClasses = {
    teal: 'border-l-teal-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
  }

  return (
    <div className={`bg-white rounded-2xl p-5 border-2 border-gray-100 border-l-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-teal-600">{icon}</span>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className={`text-sm font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-500">{trendLabel || 'vs período anterior'}</span>
        </div>
      )}
    </div>
  )
}

function MetricBadge({ label, value, color }: { label: string; value: string; color: 'green' | 'orange' | 'red' | 'teal' }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    teal: 'bg-teal-100 text-teal-800',
  }

  return (
    <div className={`px-3 py-2 rounded-lg ${colors[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

export default function AdvancedStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stats?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const periodLabels = {
    month: 'Este mês',
    quarter: 'Este trimestre',
    year: 'Este ano',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-yellow-800">
        Crie o seu salão para ver as estatísticas
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" /> Painel de controlo
        </h2>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Receita"
          value={`${stats.overview.revenue.toFixed(2)}€`}
          subtitle={periodLabels[period]}
          icon={<Euro className="w-6 h-6" />}
          trend={stats.trends.revenueGrowth}
          color="green"
        />
        <StatsCard
          title="Marcações"
          value={stats.overview.appointmentsThisPeriod}
          subtitle={`${stats.overview.completedAppointments} concluídas`}
          icon={<Calendar className="w-6 h-6" />}
          trend={stats.trends.appointmentGrowth}
          color="blue"
        />
        <StatsCard
          title="Ticket médio"
          value={`${stats.metrics.averageBasket.toFixed(2)}€`}
          subtitle="Por fatura paga"
          icon={<ShoppingCart className="w-6 h-6" />}
          color="teal"
        />
        <StatsCard
          title="Por cobrar"
          value={`${stats.overview.unpaidAmount.toFixed(2)}€`}
          subtitle="A aguardar pagamento"
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Métriques business */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" /> Indicadores-chave
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricBadge
            label="Taxa de não comparência"
            value={`${stats.metrics.noShowRate}%`}
            color={stats.metrics.noShowRate > 10 ? 'red' : stats.metrics.noShowRate > 5 ? 'orange' : 'green'}
          />
          <MetricBadge
            label="Taxa de cancelamento"
            value={`${stats.metrics.cancellationRate}%`}
            color={stats.metrics.cancellationRate > 15 ? 'red' : stats.metrics.cancellationRate > 8 ? 'orange' : 'green'}
          />
          <MetricBadge
            label="Conversão de pagamento"
            value={`${stats.metrics.conversionRate}%`}
            color={stats.metrics.conversionRate > 90 ? 'green' : stats.metrics.conversionRate > 70 ? 'orange' : 'red'}
          />
          <MetricBadge
            label="Clientes ativos"
            value={`${stats.activeClientsCount}`}
            color="teal"
          />
        </div>
        
        {/* Alerte no-show si élevé */}
        {stats.metrics.noShowCount > 0 && stats.metrics.noShowRate > 5 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {stats.metrics.noShowCount} não comparência(s) {periodLabels[period].toLowerCase()}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Considere ativar lembretes automáticos por email 24h antes das marcações
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top services */}
      {stats.topServices.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-teal-600" /> Serviços mais populares
          </h3>
          <div className="space-y-3">
            {stats.topServices.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{service.count} marcações</span>
                  <span className="font-semibold text-green-600">{service.revenue.toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue d'ensemble */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100">
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> Ficheiro de clientes
          </h4>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalClients}</p>
              <p className="text-sm text-gray-500">clientes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalAnimals}</p>
              <p className="text-sm text-gray-500">animais</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100">
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-600" /> Comparativo com período anterior
          </h4>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-lg text-gray-500 line-through">{stats.trends.previousRevenue.toFixed(2)}€</p>
              <p className="text-sm text-gray-400">{stats.trends.previousAppointments} marcações</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-green-600">{stats.overview.revenue.toFixed(2)}€</p>
              <p className="text-sm text-gray-500">{stats.overview.appointmentsThisPeriod} marcações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
