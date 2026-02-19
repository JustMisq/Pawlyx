'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Users,
  Store,
  CreditCard,
  TicketCheck,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Activity,
  MessageCircle,
  BarChart3,
  Zap,
  Bell,
  PieChart,
  ArrowLeft,
  Loader2,
  type LucideIcon,
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalSalons: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  avgChurn: number
  totalTickets: number
  openTickets: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchStats()
    }
  }, [session, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Erro')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-600">Acesso negado. Administrador necessário.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-gray-500 text-sm">A carregar dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Pawlyx</h1>
        </div>
        <p className="text-teal-100">Gestão da plataforma SaaS</p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilizadores"
          value={stats?.totalUsers || 0}
          icon={Users}
        />
        <StatCard
          title="Salões Ativos"
          value={stats?.totalSalons || 0}
          icon={Store}
        />
        <StatCard
          title="Subscrições"
          value={stats?.activeSubscriptions || 0}
          icon={CreditCard}
        />
        <StatCard
          title="Tickets Abertos"
          value={stats?.openTickets || 0}
          icon={TicketCheck}
        />
      </div>

      {/* Receitas e Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Receitas</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">MRR (Receita Mensal Recorrente)</p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats?.monthlyRevenue?.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalRevenue?.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Métricas</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Taxa de Churn (mensal)</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats?.avgChurn?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Taxa de conversão</p>
              <p className="text-xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminLink
          href="/admin/users"
          title="Utilizadores"
          description="Gerir todas as contas"
          icon={Users}
        />
        <AdminLink
          href="/admin/salons"
          title="Salões"
          description={`${stats?.totalSalons || 0} salão(ões)`}
          icon={Store}
        />
        <AdminLink
          href="/admin/tickets"
          title="Suporte"
          description={`${stats?.openTickets || 0} ticket(s) aberto(s)`}
          icon={TicketCheck}
        />
        <AdminLink
          href="/admin/errors"
          title="Erros"
          description="Monitorização de bugs e erros"
          icon={AlertTriangle}
        />
        <AdminLink
          href="/admin/activity"
          title="Atividade"
          description="Registo de ações"
          icon={Activity}
        />
        <AdminLink
          href="/admin/interactions"
          title="Interações"
          description="Feedback e pedidos"
          icon={MessageCircle}
        />
        <AdminLink
          href="/admin/usage"
          title="Utilização"
          description="Estatísticas de funcionalidades"
          icon={BarChart3}
        />
        <AdminLink
          href="/admin/performance"
          title="Performance"
          description="Métricas do sistema"
          icon={Zap}
        />
        <AdminLink
          href="/admin/webhooks"
          title="Webhooks"
          description="Alertas e notificações"
          icon={Bell}
        />
        <AdminLink
          href="/admin/analytics"
          title="Analytics"
          description="Estatísticas detalhadas"
          icon={PieChart}
        />
      </div>

      {/* Sinais de alerta */}
      {stats && (stats.openTickets > 5 || stats.avgChurn > 5 || stats.monthlyRevenue === 0) && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-900">Sinais de alerta</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-800">
            {stats.openTickets > 5 && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {stats.openTickets} tickets à espera de resposta
              </li>
            )}
            {stats.avgChurn > 5 && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Taxa de churn elevada ({stats.avgChurn.toFixed(1)}%)
              </li>
            )}
            {stats.monthlyRevenue === 0 && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Nenhuma receita registada este mês
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number
  icon: LucideIcon
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal-500" />
        </div>
      </div>
    </div>
  )
}

function AdminLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-teal-200 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
          <Icon className="w-5 h-5 text-teal-500" />
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}
