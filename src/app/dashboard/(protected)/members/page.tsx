'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, X, Users, Pencil, Loader2, Key, Crown, User, Eye, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Member {
  id: string
  role: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  status: string
  inviteEmail: string | null
  createdAt: string
  isOwner: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  canManageClients: boolean
  canManageAnimals: boolean
  canManageAppointments: boolean
  canManageServices: boolean
  canManageInventory: boolean
  canViewReports: boolean
  canManageBilling: boolean
  canManageSettings: boolean
  canManageMembers: boolean
}

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  staff: 'Funcionário',
  readonly: 'Apenas leitura',
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  staff: 'bg-green-100 text-green-800',
  readonly: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  revoked: 'Revogado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  revoked: 'bg-red-100 text-red-800',
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Formulaire d'invitation
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff',
    firstName: '',
    lastName: '',
    phone: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/salon/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      } else {
        toast.error('Erro ao carregar')
      }
    } catch {
      toast.error('Erro de rede')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/salon/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })

      if (res.ok) {
        toast.success('Convite enviado!')
        setShowInviteModal(false)
        setInviteForm({ email: '', role: 'staff', firstName: '', lastName: '', phone: '' })
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro')
      }
    } catch {
      toast.error('Erro de rede')
    }
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    try {
      const res = await fetch('/api/salon/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedMember),
      })

      if (res.ok) {
        toast.success('Membro atualizado')
        setShowEditModal(false)
        setSelectedMember(null)
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro')
      }
    } catch {
      toast.error('Erro de rede')
    }
  }

  const handleRevoke = async (memberId: string) => {
    if (!confirm('Revogar o acesso deste membro?')) return

    try {
      const res = await fetch(`/api/salon/members?id=${memberId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Acesso revogado')
        fetchMembers()
      } else {
        toast.error('Erro')
      }
    } catch {
      toast.error('Erro de rede')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipa do salão</h1>
          <p className="mt-1 text-gray-600">
            Gerir os acessos e as permissões da sua equipa
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Convidar um membro</span>
        </Button>
      </div>

      {/* Liste des membres - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                      {(member.firstName?.[0] || member.user?.name?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.user?.name || 'Convite pendente'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user?.email || member.inviteEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                    {statusLabels[member.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!member.isOwner && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member)
                          setShowEditModal(true)
                        }}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleRevoke(member.id)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Revogar
                      </button>
                    </div>
                  )}
                  {member.isOwner && (
                    <span className="text-gray-400">Proprietário</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Liste des membres - Mobile */}
      <div className="md:hidden space-y-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                {(member.firstName?.[0] || member.user?.name?.[0] || '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.user?.name || 'Convite pendente'}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {member.user?.email || member.inviteEmail}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                    {statusLabels[member.status]}
                  </span>
                </div>
                {member.phone && (
                  <div className="text-sm text-gray-500 mt-1">{member.phone}</div>
                )}
              </div>
            </div>
            {!member.isOwner && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedMember(member)
                    setShowEditModal(true)
                  }}
                  className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleRevoke(member.id)}
                  className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Revogar
                </button>
              </div>
            )}
            {member.isOwner && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-400">Proprietário</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Légende des rôles */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Niveaux d'accès</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 flex items-center gap-2">
              <Key className="w-4 h-4" /> Propriétaire
            </h4>
            <p className="text-sm text-purple-600 mt-1">Accès total, gestion de l'abonnement et des membres</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <Crown className="w-4 h-4" /> Administrateur
            </h4>
            <p className="text-sm text-blue-600 mt-1">Gestion complète sauf abonnement et membres</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 flex items-center gap-2">
              <User className="w-4 h-4" /> Funcionário
            </h4>
            <p className="text-sm text-green-600 mt-1">Gestão de clientes, animais e consultas</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Apenas leitura
            </h4>
            <p className="text-sm text-gray-600 mt-1">Consulta apenas, sem modificação</p>
          </div>
        </div>
      </div>

      {/* Modal Invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Convidar um membro</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="input-base w-full"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="input-base w-full"
                >
                  <option value="admin">Administrador</option>
                  <option value="staff">Funcionário</option>
                  <option value="readonly">Apenas leitura</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apelido
                  </label>
                  <input
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="input-base w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="input-base w-full"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar o convite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Editar o membro</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedMember(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                </label>
                <select
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                  className="input-base w-full"
                >
                  <option value="admin">Administrador</option>
                  <option value="staff">Funcionário</option>
                  <option value="readonly">Apenas leitura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome próprio
                  </label>
                  <input
                    type="text"
                    value={selectedMember.firstName || ''}
                    onChange={(e) => setSelectedMember({ ...selectedMember, firstName: e.target.value })}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apelido
                  </label>
                  <input
                    type="text"
                    value={selectedMember.lastName || ''}
                    onChange={(e) => setSelectedMember({ ...selectedMember, lastName: e.target.value })}
                    className="input-base w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={selectedMember.phone || ''}
                  onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                  className="input-base w-full"
                />
              </div>

              {/* Permissões personalizadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissões personalizadas
                </label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {[
                    { key: 'canManageClients', label: 'Gerir clientes' },
                    { key: 'canManageAnimals', label: 'Gerir animais' },
                    { key: 'canManageAppointments', label: 'Gerir marcações' },
                    { key: 'canManageServices', label: 'Gerir serviços' },
                    { key: 'canManageInventory', label: 'Gerir inventário' },
                    { key: 'canViewReports', label: 'Ver relatórios' },
                    { key: 'canManageBilling', label: 'Gerir faturação' },
                    { key: 'canManageSettings', label: 'Gerir definições' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMember[key as keyof Member] as boolean}
                        onChange={(e) => setSelectedMember({ ...selectedMember, [key]: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMember(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
