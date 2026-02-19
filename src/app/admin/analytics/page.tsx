'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  BarChart3,
  ArrowLeft,
  Banknote,
  TrendingUp,
  Users,
  Sparkles,
  CreditCard,
  TrendingDown,
  Heart,
  Target,
  Timer,
  Loader2,
  Info,
  PieChart,
} from 'lucide-react'

interface Analytics {
  totalRevenue: number
  mrr: number
  arr: number
  avgMrr: number
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  churnRate: number
  ltv: number
  cac: number
  paybackPeriod: number
  activeSubscriptions: number
  monthlyGrowth: number
  growthTrend: Array<{
    month: string
    users: number
    revenue: number
  }>
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchAnalytics()
    }
  }, [session, router])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os analytics')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <p className="text-gray-600">Acesso negado</p>
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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Métricas detalhadas da plataforma</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-100 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Total"
          value={`${analytics?.totalRevenue?.toFixed(2) || 0}€`}
          icon={<Banknote className="w-6 h-6 text-teal-600" />}
          iconBg="bg-teal-50"
        />
        <MetricCard
          title="MRR"
          value={`${analytics?.mrr?.toFixed(2) || 0}€`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
          subtitle="Monthly Recurring Revenue"
        />
        <MetricCard
          title="ARR"
          value={`${analytics?.arr?.toFixed(2) || 0}€`}
          icon={<PieChart className="w-6 h-6 text-violet-600" />}
          iconBg="bg-violet-50"
          subtitle="Annual Recurring Revenue"
        />
        <MetricCard
          title="Crescimento (Mensal)"
          value={`${analytics?.monthlyGrowth?.toFixed(1) || 0}%`}
          icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Utilizadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Utilizadores Ativos"
          value={`${analytics?.activeUsers || 0}`}
          icon={<Users className="w-6 h-6 text-teal-600" />}
          iconBg="bg-teal-50"
          subtitle={`de ${analytics?.totalUsers || 0} total`}
        />
        <MetricCard
          title="Novos (Este mês)"
          value={`${analytics?.newUsersThisMonth || 0}`}
          icon={<Sparkles className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <MetricCard
          title="Subscrições Ativas"
          value={`${analytics?.activeSubscriptions || 0}`}
          icon={<CreditCard className="w-6 h-6 text-violet-600" />}
          iconBg="bg-violet-50"
        />
      </div>

      {/* Métricas-chave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DetailCard
          label="Taxa de Churn"
          value={`${analytics?.churnRate?.toFixed(2) || 0}%`}
          detail="Taxa de cancelamento mensal"
          icon={<TrendingDown className="w-5 h-5" />}
          warning={analytics?.churnRate ? analytics.churnRate > 5 : false}
        />
        <DetailCard
          label="LTV"
          value={`${analytics?.ltv?.toFixed(0) || 0}€`}
          detail="Valor vitalício por cliente"
          icon={<Heart className="w-5 h-5" />}
        />
        <DetailCard
          label="CAC"
          value={`${analytics?.cac?.toFixed(0) || 0}€`}
          detail="Custo de Aquisição de Cliente"
          icon={<Target className="w-5 h-5" />}
        />
        <DetailCard
          label="Período de Retorno"
          value={`${analytics?.paybackPeriod?.toFixed(1) || 0} meses`}
          detail="Período de rentabilidade"
          icon={<Timer className="w-5 h-5" />}
        />
      </div>

      {/* Tendência */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Tendência (últimos 6 meses)</h3>
        </div>

        {analytics?.growthTrend && analytics.growthTrend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-l-xl">Mês</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Utilizadores</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 rounded-r-xl">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics.growthTrend.map((item) => (
                  <tr key={item.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                    <td className="text-right py-3 px-4 text-gray-600">{item.users}</td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">{item.revenue.toFixed(0)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Dados não disponíveis</p>
        )}
      </div>

      {/* Definições */}
      <div className="bg-teal-50/50 rounded-2xl border-2 border-teal-100 p-6 text-sm text-teal-800">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-teal-600" />
          <p className="font-semibold">Definições</p>
        </div>
        <ul className="space-y-1.5 text-xs text-teal-700">
          <li><strong>MRR:</strong> Receita mensal recorrente</li>
          <li><strong>ARR:</strong> Receita anual recorrente (MRR × 12)</li>
          <li><strong>LTV:</strong> Valor total trazido por um cliente</li>
          <li><strong>CAC:</strong> Custo para adquirir um cliente</li>
          <li><strong>Churn:</strong> % de utilizadores que não renovaram por mês</li>
        </ul>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  iconBg,
  subtitle,
}: {
  title: string
  value: string | number
  icon: ReactNode
  iconBg: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-teal-200 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function DetailCard({
  label,
  value,
  detail,
  icon,
  warning,
}: {
  label: string
  value: string
  detail: string
  icon: ReactNode
  warning?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-6 transition-all ${
        warning
          ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
          : 'bg-white border-gray-100 hover:border-teal-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={warning ? 'text-amber-600' : 'text-gray-400'}>{icon}</span>
        <p className={`text-sm font-medium ${warning ? 'text-amber-700' : 'text-gray-500'}`}>
          {label}
        </p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs mt-2 ${warning ? 'text-amber-600' : 'text-gray-400'}`}>
        {detail}
      </p>
    </div>
  )
}
