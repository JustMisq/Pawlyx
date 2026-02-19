'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Store,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Loader2,
  ChevronRight,
} from 'lucide-react'

interface Salon {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  status: string
  createdAt: string
  _count?: {
    users: number
    clients: number
    appointments: number
  }
}

export default function AdminSalonsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchSalons()
    }
  }, [session, router, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSalons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const res = await fetch(`/api/admin/salons?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setSalons(data.salons || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os salões')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle className="w-3 h-3" /> Ativo
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <XCircle className="w-3 h-3" /> Inativo
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <Ban className="w-3 h-3" /> Suspenso
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

  const filteredSalons = salons.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    )
  })

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
              <h1 className="text-2xl sm:text-3xl font-bold">Salões de Tosquia</h1>
              <p className="text-teal-100 mt-1">
                Gerir todos os salões ({salons.length})
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por nome, morada, email..."
                className="input-base pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">Todos os estados</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {filteredSalons.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">Nenhum salão encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Morada
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Telefone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Estatísticas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/salons/${salon.id}`}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        {salon.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {salon.address}
                        {salon.city && `, ${salon.city}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {salon.phone || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {salon.email || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(salon.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden xl:table-cell">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1" title="Utilizadores">
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                          {salon._count?.users || 0}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Clientes">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {salon._count?.clients || 0}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Marcações">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          {salon._count?.appointments || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(salon.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/salons/${salon.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-white hover:bg-teal-500 rounded-lg transition-colors"
                      >
                        Ver
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
