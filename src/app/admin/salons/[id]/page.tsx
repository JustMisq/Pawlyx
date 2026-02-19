'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Store,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Ban,
  Edit,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react'

interface Salon {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  description?: string
  logo?: string
  status: string
  createdAt: string
  updatedAt: string
  user?: User
  members: SalonMember[]
  clients: Client[]
  _count?: {
    appointments: number
    services: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SalonMember {
  id: string
  firstName: string
  lastName: string
  role: string
  status: string
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function AdminSalonDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const salonId = params.id as string

  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: ''
  })

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchSalon()
    }
  }, [session, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSalon = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/salons/${salonId}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setSalon(data.salon)
      setNewStatus(data.salon.status)
      setEditData({
        name: data.salon.name,
        address: data.salon.address,
        city: data.salon.city,
        phone: data.salon.phone,
        email: data.salon.email,
        description: data.salon.description || ''
      })
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar o salão')
      router.push('/admin/salons')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error('Erro')
      toast.success('Estado atualizado')
      setNewStatus(status)
      fetchSalon()
    } catch (error) {
      toast.error('Impossível atualizar')
    } finally {
      setUpdating(false)
    }
  }

  const updateSalon = async () => {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!res.ok) throw new Error('Erro')
      toast.success('Salão atualizado')
      setShowEditModal(false)
      fetchSalon()
    } catch (error) {
      toast.error('Impossível atualizar')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" /> Ativo
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <XCircle className="w-3.5 h-3.5" /> Inativo
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <Ban className="w-3.5 h-3.5" /> Suspenso
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {status}
          </span>
        )
    }
  }

  const getMemberStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle className="w-3 h-3" /> Ativo
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Pendente
          </span>
        )
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <Ban className="w-3 h-3" /> Revogado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {status}
          </span>
        )
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">Acesso negado</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Store className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 text-lg">Salão não encontrado</p>
        <Link
          href="/admin/salons"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{salon.name}</h1>
              <p className="text-teal-100 mt-1">Detalhes do salão de tosquia</p>
            </div>
          </div>
          <Link
            href="/admin/salons"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-500" />
          Informações principais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Nome
            </label>
            <p className="text-gray-900 font-medium">{salon.name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Estado
            </label>
            <div className="mt-0.5">{getStatusBadge(salon.status)}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Morada
              </span>
            </label>
            <p className="text-gray-700">
              {salon.address}
              {salon.city && `, ${salon.city}`}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Telefone
              </span>
            </label>
            <p className="text-gray-700">{salon.phone || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
            </label>
            <p className="text-gray-700">{salon.email || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Descrição
            </label>
            <p className="text-gray-700">{salon.description || '-'}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-4 h-4 text-teal-500" />
            Criado em {new Date(salon.createdAt).toLocaleDateString('pt-PT')}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            Modificado em {new Date(salon.updatedAt).toLocaleDateString('pt-PT')}
          </span>
        </div>
      </div>

      {/* Gestão */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-teal-500" />
          Gestão
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          {newStatus !== 'active' && (
            <button
              onClick={() => updateStatus('active')}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Ativar
            </button>
          )}
          {newStatus !== 'inactive' && (
            <button
              onClick={() => updateStatus('inactive')}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Desativar
            </button>
          )}
          {newStatus !== 'suspended' && (
            <button
              onClick={() => updateStatus('suspended')}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              Suspender
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 mb-3">
            <Calendar className="w-6 h-6 text-teal-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{salon._count?.appointments || 0}</p>
          <p className="text-gray-500 mt-1 text-sm">Marcações</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-3">
            <Briefcase className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{salon._count?.services || 0}</p>
          <p className="text-gray-500 mt-1 text-sm">Serviços</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-3">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{salon.clients.length}</p>
          <p className="text-gray-500 mt-1 text-sm">Clientes</p>
        </div>
      </div>

      {/* Equipa / Membros */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-500" />
          Membros ({(salon.user ? 1 : 0) + salon.members.length})
        </h3>
        <div className="space-y-3">
          {salon.user && (
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="font-medium text-gray-900">{salon.user.name} (Proprietário)</p>
                <p className="text-sm text-gray-500">{salon.user.email}</p>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                Owner
              </span>
            </div>
          )}
          {salon.members.length === 0 && !salon.user && (
            <p className="text-gray-500 text-center py-4">Nenhum membro</p>
          )}
          {salon.members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                <div className="mt-1">{getMemberStatusBadge(member.status)}</div>
              </div>
              <span className="rounded-full bg-teal-50 text-teal-700 px-3 py-1 text-xs font-medium">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clientes */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-500" />
          Clientes ({salon.clients.length})
        </h3>
        {salon.clients.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum cliente</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {salon.clients.map((client) => (
              <div key={client.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                  <p className="text-sm text-gray-500 inline-flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </p>
                </div>
                <p className="text-sm text-gray-500 inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {client.phone}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-500" />
              Editar salão
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
              <input
                type="text"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="input-base"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={updateSalon}
                disabled={updating}
                className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 font-medium transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> A guardar...
                  </span>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
