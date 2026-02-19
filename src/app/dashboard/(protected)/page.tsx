'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SalonCheckBanner from '@/components/salon-check-banner'
import AdvancedStats from '@/components/advanced-stats'
import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import {
  Plus,
  CalendarDays,
  Users,
  Scissors,
  BarChart3,
  Clock,
  PawPrint,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [generatingDemo, setGeneratingDemo] = useState(false)

  useEffect(() => {
    fetchTodayAppointments()
  }, [])

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      
      const res = await fetch(`/api/appointments?from=${start.toISOString()}&to=${end.toISOString()}`)
      if (res.ok) {
        const data = await res.json()
        setTodayAppointments(data.filter((apt: any) => 
          apt.status !== 'cancelled' && apt.status !== 'no_show'
        ))
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDemo = async () => {
    setGeneratingDemo(true)
    try {
      const res = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      })
      
      if (res.ok) {
        const data = await res.json()
        toast.success(`Dados de demonstração gerados: ${data.clients} clientes, ${data.appointments} consultas`)
        setShowDemoModal(false)
        window.location.reload()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erro ao gerar dados')
      }
    } catch (error) {
      toast.error('Ocorreu um erro')
    } finally {
      setGeneratingDemo(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-sky-100 text-sky-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      in_progress: 'bg-amber-100 text-amber-700',
      completed: 'bg-gray-100 text-gray-600',
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em curso',
      completed: 'Concluído',
    }
    return labels[status] || status
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <SalonCheckBanner />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Olá, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {new Date().toLocaleDateString('pt-PT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/appointments">
            <Button>
              <Plus className="w-4 h-4" />
              Nova consulta
            </Button>
          </Link>
          <button
            onClick={() => setShowDemoModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Modo demo</span>
          </button>
        </div>
      </div>

      {/* Consultas de hoje */}
      {!loading && todayAppointments.length > 0 && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-teal-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Hoje
                </h2>
                <p className="text-sm text-gray-500">
                  {todayAppointments.length} consultas
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Ver tudo →
            </Link>
          </div>
          <div className="grid gap-3">
            {todayAppointments.slice(0, 4).map((apt) => (
              <div 
                key={apt.id} 
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center bg-gray-50 rounded-xl px-3 py-2 min-w-[60px]">
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(apt.startTime).toLocaleTimeString('pt-PT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {apt.client?.firstName} {apt.client?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <PawPrint className="w-3 h-3" />
                      {apt.animal?.name} • {apt.service?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                  <span className="font-semibold text-teal-600 text-sm">
                    {apt.totalPrice?.toFixed(2) || apt.service?.price?.toFixed(2)}€
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas avançadas */}
      <AdvancedStats />

      {/* Ações rápidas */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            href: '/dashboard/clients',
            icon: Users,
            title: 'Clientes',
            description: 'Gerir fichas de clientes',
            color: 'bg-blue-100 text-blue-600',
          },
          {
            href: '/dashboard/services',
            icon: Scissors,
            title: 'Serviços',
            description: 'Configurar serviços',
            color: 'bg-purple-100 text-purple-600',
          },
          {
            href: '/dashboard/reports',
            icon: BarChart3,
            title: 'Relatórios',
            description: 'Acompanhamento de pagamentos',
            color: 'bg-emerald-100 text-emerald-600',
          },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-soft transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal demo */}
      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        title="Modo Demo"
        description="Gerar dados fictícios para explorar as funcionalidades"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Esta ação vai criar clientes, animais, consultas e faturas fictícios.
              Os seus dados existentes serão mantidos.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDemoModal(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateDemo}
            disabled={generatingDemo}
            className="flex-1"
          >
            {generatingDemo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                A gerar...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar dados
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
