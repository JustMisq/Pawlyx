'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Users,
  Search,
  ArrowLeft,
  Crown,
  ShieldCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isAdmin: boolean
  salon?: {
    id: string
    name: string
  }
  _count?: {
    auditLogs: number
  }
  subscription?: {
    status: string
    plan: string
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/dashboard')
    } else if (session) {
      fetchUsers()
    }
  }, [session, router, page, searchEmail]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (searchEmail) {
        params.append('search', searchEmail)
      }

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os utilizadores')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdmin }),
      })

      if (!res.ok) throw new Error('Erro')

      toast.success(isAdmin ? 'Admin removido' : 'Admin concedido')
      fetchUsers()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const suspendUser = async (userId: string) => {
    if (!confirm('Tem a certeza?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Erro')

      toast.success('Utilizador suspenso')
      fetchUsers()
    } catch {
      toast.error('Erro ao suspender')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-600">Acesso negado</p>
      </div>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilizadores</h1>
            <p className="text-gray-500 text-sm">
              Todas as contas Pawlyx ({users.length})
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Pesquisa */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            placeholder="Pesquisar por email..."
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value)
              setPage(1)
            }}
            className="input-base pl-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum utilizador encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Salão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subscrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.salon ? (
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          {user.salon.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.subscription ? (
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            user.subscription.status
                          )}`}
                        >
                          {user.subscription.plan}
                        </span>
                      ) : (
                        <span className="text-gray-400">Nenhuma</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 px-3 py-1 text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Utilizador</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleAdmin(user.id, user.isAdmin)}
                          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 transition-colors text-xs font-medium"
                          title={user.isAdmin ? 'Remover admin' : 'Tornar admin'}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {user.isAdmin ? 'Remover admin' : 'Tornar admin'}
                        </button>
                        <button
                          onClick={() => suspendUser(user.id)}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-xs font-medium"
                          title="Suspender"
                        >
                          <UserX className="w-4 h-4" />
                          Suspender
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-teal-600 bg-white border-2 border-gray-100 rounded-xl hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-teal-600 bg-white border-2 border-gray-100 rounded-xl hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Seguinte
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
