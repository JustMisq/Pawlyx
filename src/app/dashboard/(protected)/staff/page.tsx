'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import {
  Users,
  Crown,
  Settings,
  User,
  Eye,
  X,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react'

interface SalonMember {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role: string
  status: string
  invitedAt: string
  acceptedAt?: string
  user?: {
    email: string
    name: string
  }
  inviteEmail?: string
}

export default function StaffPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<SalonMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/salon/members')
      if (!res.ok) throw new Error('Erro ao obter os membros')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os membros')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) {
      toast.error('Email obrigatório')
      return
    }

    setInviting(true)
    try {
      const res = await fetch('/api/salon/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Erro ao enviar o convite')
      }

      toast.success('Convite enviado com sucesso!')
      setInviteEmail('')
      setShowInviteForm(false)
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar o convite')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este membro?')) return

    try {
      const res = await fetch(`/api/salon/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao eliminar')

      toast.success('Membro eliminado')
      fetchMembers()
    } catch (error) {
      toast.error('Erro ao eliminar')
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Proprietário',
      admin: 'Admin',
      staff: 'Pessoal',
      readonly: 'Apenas leitura',
    }
    return labels[role] || role
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 inline-block mr-1 text-amber-500" />
      case 'admin':
        return <Settings className="w-4 h-4 inline-block mr-1 text-blue-500" />
      case 'staff':
        return <User className="w-4 h-4 inline-block mr-1 text-gray-500" />
      case 'readonly':
        return <Eye className="w-4 h-4 inline-block mr-1 text-gray-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-teal-500" />
            Gestão da Equipa
          </h1>
          <p className="text-gray-600 mt-2">Gerir os membros da sua equipa e as suas permissões</p>
        </div>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          variant={showInviteForm ? 'outline' : 'default'}
        >
          {showInviteForm ? (
            <><X className="w-4 h-4 mr-2" /> Cancelar</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" /> Convidar um membro</>
          )}
        </Button>
      </div>

      {/* Formulaire d'invitation */}
      {showInviteForm && (
        <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Convidar um novo membro</h3>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="membre@example.com"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input-base"
              >
                <option value="staff">Pessoal</option>
                <option value="admin">Admin</option>
                <option value="readonly">Apenas leitura</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 text-sm text-gray-700">
              <p className="font-semibold mb-2">Permissões por função</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-500" /> <strong>Pessoal</strong> : Clientes, Animais, Marcações, Serviços, Stocks</li>
                <li className="flex items-center gap-1.5"><Settings className="w-4 h-4 text-blue-500" /> <strong>Admin</strong> : Pessoal + Faturas, Relatórios, Definições</li>
                <li className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-gray-400" /> <strong>Apenas leitura</strong> : Consulta apenas, sem modificação</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={inviting}
              className="w-full"
            >
              {inviting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A enviar...</>
              ) : (
                'Enviar o convite'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Liste des membres */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Membros ({members.length})
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum membro de momento</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Convidado em
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {member.user ? (
                          member.user.name
                        ) : (
                          <span className="text-gray-500 italic">
                            {member.firstName && member.lastName
                              ? `${member.firstName} ${member.lastName}`
                              : 'Pendente...'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.user?.email || member.inviteEmail}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center">
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                          {member.status === 'pending' && <><Clock className="w-3 h-3" /> Pendente</>}
                          {member.status === 'active' && <><CheckCircle2 className="w-3 h-3" /> Ativo</>}
                          {member.status === 'revoked' && <><XCircle className="w-3 h-3" /> Revogado</>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(member.invitedAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        {member.role !== 'owner' && (
                          <>
                            <Link
                              href={`/dashboard/staff/${member.id}`}
                              className="text-teal-600 hover:text-teal-700 hover:underline"
                            >
                              Permissões
                            </Link>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:underline ml-2"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {members.map((member) => (
                <div key={member.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {member.user
                        ? member.user.name
                        : member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : 'Pendente...'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                      {member.status === 'pending' && <><Clock className="w-3 h-3" /> Pendente</>}
                      {member.status === 'active' && <><CheckCircle2 className="w-3 h-3" /> Ativo</>}
                      {member.status === 'revoked' && <><XCircle className="w-3 h-3" /> Revogado</>}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{member.user?.email || member.inviteEmail}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center text-gray-700">
                      {getRoleIcon(member.role)}
                      {getRoleLabel(member.role)}
                    </span>
                    <span className="text-gray-500">
                      {new Date(member.invitedAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  {member.role !== 'owner' && (
                    <div className="flex gap-3 pt-1">
                      <Link
                        href={`/dashboard/staff/${member.id}`}
                        className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        Permissões
                      </Link>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lien vers les logs */}
      <div className="flex gap-4">
        <Link
          href="/dashboard/staff/logs"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-teal-200 hover:text-teal-600 transition-all"
        >
          <FileText className="w-4 h-4" />
          Ver os logs de atividade
        </Link>
      </div>
    </div>
  )
}
