'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  User,
  Eye,
  Crown,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Loader2,
  Settings,
} from 'lucide-react'

interface Permission {
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

interface SalonMember {
  id: string
  firstName?: string
  lastName?: string
  role: string
  user?: {
    name: string
    email: string
  }
  inviteEmail?: string
}

const PERMISSION_DESCRIPTIONS: Record<keyof Permission, string> = {
  canManageClients: 'Criar, editar e eliminar clientes',
  canManageAnimals: 'Criar, editar e eliminar animais',
  canManageAppointments: 'Criar, editar e cancelar marcações',
  canManageServices: 'Adicionar e editar serviços',
  canManageInventory: 'Gerir stocks e inventário',
  canViewReports: 'Acesso a relatórios e estatísticas',
  canManageBilling: 'Criar e gerir faturas',
  canManageSettings: 'Acesso às definições do salão',
  canManageMembers: 'Convidar e gerir os membros da equipa',
}

export default function MemberPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string

  const [member, setMember] = useState<SalonMember | null>(null)
  const [permissions, setPermissions] = useState<Permission>({
    canManageClients: true,
    canManageAnimals: true,
    canManageAppointments: true,
    canManageServices: true,
    canManageInventory: true,
    canViewReports: false,
    canManageBilling: false,
    canManageSettings: false,
    canManageMembers: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchMemberPermissions = useCallback(async () => {
    try {
      const res = await fetch(`/api/salon/members/${memberId}`)
      if (!res.ok) throw new Error('Erro')

      const data = await res.json()
      setMember(data.member)
      setPermissions(data.permissions)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Impossível carregar os dados')
      router.push('/dashboard/staff')
    } finally {
      setLoading(false)
    }
  }, [memberId, router])

  useEffect(() => {
    fetchMemberPermissions()
  }, [fetchMemberPermissions])

  const togglePermission = (key: keyof Permission) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/salon/members/${memberId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions),
      })

      if (!res.ok) throw new Error('Erro ao guardar')

      toast.success('Permissões atualizadas!')
      router.push('/dashboard/staff')
    } catch (error) {
      toast.error('Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  const resetPermissions = () => {
    if (member?.role === 'staff') {
      setPermissions({
        canManageClients: true,
        canManageAnimals: true,
        canManageAppointments: true,
        canManageServices: true,
        canManageInventory: true,
        canViewReports: false,
        canManageBilling: false,
        canManageSettings: false,
        canManageMembers: false,
      })
    } else if (member?.role === 'admin') {
      setPermissions({
        canManageClients: true,
        canManageAnimals: true,
        canManageAppointments: true,
        canManageServices: true,
        canManageInventory: true,
        canViewReports: true,
        canManageBilling: true,
        canManageSettings: true,
        canManageMembers: false,
      })
    } else if (member?.role === 'readonly') {
      setPermissions({
        canManageClients: false,
        canManageAnimals: false,
        canManageAppointments: false,
        canManageServices: false,
        canManageInventory: false,
        canViewReports: false,
        canManageBilling: false,
        canManageSettings: false,
        canManageMembers: false,
      })
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-600">Membro não encontrado</p>
      </div>
    )
  }

  const memberName = member.user?.name || `${member.firstName} ${member.lastName}`.trim() || 'Convidado'

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-teal-500" />
          Permissões
        </h1>
        <p className="text-gray-600 mt-2">
          {memberName} • {member.role}
        </p>
      </div>

      {/* Informations */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Sobre este membro</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Nome</dt>
            <dd className="text-gray-600">{memberName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email</dt>
            <dd className="text-gray-600">
              {member.user?.email || member.inviteEmail}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Função</dt>
            <dd className="text-gray-600 flex items-center gap-1.5">
              {member.role === 'admin' && <><Settings className="w-4 h-4 text-teal-500" /> Admin</>}
              {member.role === 'staff' && <><User className="w-4 h-4 text-teal-500" /> Pessoal</>}
              {member.role === 'readonly' && <><Eye className="w-4 h-4 text-teal-500" /> Apenas leitura</>}
              {member.role === 'owner' && <><Crown className="w-4 h-4 text-teal-500" /> Proprietário</>}
            </dd>
          </div>
        </dl>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Permissões</h2>
              <p className="text-gray-600 text-sm mt-1">
                Ajuste as permissões deste membro
              </p>
            </div>
            <Button
              variant="outline"
              onClick={resetPermissions}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Repor predefinições
            </Button>
          </div>
        </div>

        <div className="space-y-1 p-6">
          {(Object.keys(permissions) as Array<keyof Permission>).map((key) => (
            <label
              key={key}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={permissions[key]}
                onChange={() => togglePermission(key)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 group-hover:text-teal-600">
                  {key.replace(/can|([A-Z])/g, (m, g) =>
                    g ? ' ' + g : ''
                  ).trim()}
                </div>
                <p className="text-sm text-gray-500">
                  {PERMISSION_DESCRIPTIONS[key]}
                </p>
              </div>
              {permissions[key] ? (
                <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-300 mt-0.5" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-500 hover:bg-teal-600 text-white px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              A guardar...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              Guardar permissões
            </>
          )}
        </Button>
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
        >
          Cancelar
        </Link>
      </div>
    </div>
  )
}
