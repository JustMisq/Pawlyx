'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Activity,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Upload,
  Download,
  FileText,
  Loader2,
  Hash,
} from 'lucide-react'

interface ActivityItem {
  id: string
  action: string
  resource: string
  userId: string
  resourceId?: string
  salonId?: string
  createdAt: string
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Criar',
  update: 'Modificar',
  delete: 'Eliminar',
  login: 'Login',
  logout: 'Logout',
  export: 'Exportar',
  import: 'Importar',
}

const RESOURCE_LABELS: Record<string, string> = {
  User: 'Utilizador',
  Client: 'Cliente',
  Animal: 'Animal',
  Appointment: 'Consulta',
  Invoice: 'Fatura',
  Service: 'Serviço',
  Subscription: 'Subscrição',
}

export default function AdminActivityPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [resource, setResource] = useState('all')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchActivities()
    }
  }, [session, router, filter, resource]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filter !== 'all') params.append('action', filter)
      if (resource !== 'all') params.append('resource', resource)

      const res = await fetch(`/api/admin/activity?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar as atividades')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    const iconClass = 'w-5 h-5 text-teal-600'
    switch (action) {
      case 'create':
        return <Plus className={iconClass} />
      case 'update':
        return <Edit className={iconClass} />
      case 'delete':
        return <Trash2 className={iconClass} />
      case 'login':
        return <LogIn className={iconClass} />
      case 'logout':
        return <LogOut className={iconClass} />
      case 'export':
        return <Upload className={iconClass} />
      case 'import':
        return <Download className={iconClass} />
      default:
        return <FileText className={iconClass} />
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <p className="text-gray-600 text-lg">Acesso negado</p>
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
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atividade do Utilizador</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Registo de ações ({activities.length})
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-100 rounded-xl hover:border-teal-200 transition-all text-sm font-medium text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ação
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-base w-full"
          >
            <option value="all">Todas as ações</option>
            <option value="create">Criar</option>
            <option value="update">Modificar</option>
            <option value="delete">Eliminar</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Exportar</option>
            <option value="import">Importar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recurso
          </label>
          <select
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="input-base w-full"
          >
            <option value="all">Todos os recursos</option>
            <option value="User">Utilizador</option>
            <option value="Client">Cliente</option>
            <option value="Animal">Animal</option>
            <option value="Appointment">Consulta</option>
            <option value="Invoice">Fatura</option>
            <option value="Service">Serviço</option>
            <option value="Subscription">Subscrição</option>
          </select>
        </div>
      </div>

      {/* Atividades */}
      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-gray-500 text-lg">Nenhuma atividade detetada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-2xl border-2 border-gray-100 p-4 hover:border-teal-200 transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  <span>{ACTION_LABELS[activity.action] || activity.action}</span>{' '}
                  <span className="text-gray-500">
                    {RESOURCE_LABELS[activity.resource] || activity.resource}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(activity.createdAt).toLocaleString('pt-PT')}
                </p>
              </div>
              {activity.resourceId && (
                <div className="flex items-center gap-1 text-xs bg-gray-50 px-2.5 py-1 rounded-lg text-gray-500 flex-shrink-0">
                  <Hash className="w-3 h-3" />
                  {activity.resourceId.slice(0, 8)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
