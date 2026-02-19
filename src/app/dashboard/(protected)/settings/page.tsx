'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { DeleteModal } from '@/components/delete-modal'
import {
  User,
  Store,
  FileText,
  Pencil,
  X,
  Save,
  AlertTriangle,
  Trash2,
  Download,
  Shield,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  email: string
  name: string
}

interface Salon {
  id: string
  name: string
  description?: string
  phone?: string
  address?: string
  email?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<UserData | null>(null)
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(false)
  const [editingSalon, setEditingSalon] = useState(false)
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deletingData, setDeletingData] = useState(false)

  // Carregar os dados do utilizador e salão
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, salonRes] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/salon'),
        ])

        if (userRes.ok) {
          setUser(await userRes.json())
        }
        if (salonRes.ok) {
          setSalon(await salonRes.json())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setEditingUser(false)
        toast.success('Perfil atualizado')
      } else {
        toast.error('Erro ao atualizar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const handleUpdateSalon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          email: formData.get('email'),
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSalon(updated)
        setEditingSalon(false)
        toast.success('Salão atualizado')
      } else {
        toast.error('Erro ao atualizar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/export-data')
      if (res.ok) {
        const data = await res.json()
        const element = document.createElement('a')
        element.setAttribute(
          'href',
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
        )
        element.setAttribute('download', `pawlyx-data-${new Date().toISOString().split('T')[0]}.json`)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        toast.success('Dados exportados')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao exportar')
    }
  }

  const handleDeleteAllData = async (password?: string) => {
    setDeletingData(true)
    try {
      const res = await fetch('/api/delete-all-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        toast.success('Todos os dados foram eliminados')
        setShowDeleteDataModal(false)
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erro ao eliminar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setDeletingData(false)
    }
  }

  const handleDeleteAccount = async (password?: string) => {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        toast.success('Conta eliminada. A terminar sessão...')
        await signOut({ redirect: true, callbackUrl: '/' })
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erro ao eliminar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setDeletingAccount(false)
      setShowDeleteAccountModal(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Definições</h1>

      {/* Perfil do utilizador */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" />
            Perfil
          </h2>
          <Button
            onClick={() => setEditingUser(!editingUser)}
            variant={editingUser ? 'ghost' : 'outline'}
          >
            {editingUser ? (
              <>
                <X className="w-4 h-4" />
                Cancelar
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                Editar
              </>
            )}
          </Button>
        </div>

        {editingUser ? (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                name="name"
                defaultValue={user?.name || ''}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email || ''}
                className="input-base"
              />
            </div>
            <Button type="submit" className="w-full">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Nome :</span> {user?.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email :</span> {user?.email}
            </p>
          </div>
        )}
      </div>

      {/* Definições do salão */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-teal-500" />
            Salão
          </h2>
          <Button
            onClick={() => setEditingSalon(!editingSalon)}
            variant={editingSalon ? 'ghost' : 'outline'}
          >
            {editingSalon ? (
              <>
                <X className="w-4 h-4" />
                Cancelar
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                Editar
              </>
            )}
          </Button>
        </div>

        {editingSalon ? (
          <form onSubmit={handleUpdateSalon} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do salão</label>
              <input
                type="text"
                name="name"
                defaultValue={salon?.name || ''}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                name="description"
                defaultValue={salon?.description || ''}
                rows={3}
                className="input-base resize-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={salon?.phone || ''}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={salon?.email || ''}
                  className="input-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
              <input
                type="text"
                name="address"
                defaultValue={salon?.address || ''}
                className="input-base"
              />
            </div>
            <Button type="submit" className="w-full">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Nome :</span> {salon?.name}
            </p>
            {salon?.description && (
              <p className="text-gray-600">
                <span className="font-medium">Descrição :</span> {salon.description}
              </p>
            )}
            {salon?.phone && (
              <p className="text-gray-600">
                <span className="font-medium">Telefone :</span> {salon.phone}
              </p>
            )}
            {salon?.email && (
              <p className="text-gray-600">
                <span className="font-medium">Email :</span> {salon.email}
              </p>
            )}
            {salon?.address && (
              <p className="text-gray-600">
                <span className="font-medium">Morada :</span> {salon.address}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dados e privacidade */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-500" />
          Dados & Privacidade (RGPD)
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Em conformidade com o RGPD, pode transferir ou eliminar os seus dados pessoais.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleExportData}>
              <Download className="w-4 h-4" />
              Transferir os meus dados (JSON)
            </Button>
          </div>
        </div>
      </div>

      {/* Zona de perigo */}
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Zona de Perigo
        </h2>
        <div className="space-y-4">
          
          {/* Eliminar todos os dados */}
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100">
            <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Eliminar todos os dados comerciais
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Irá eliminar todos os clientes, animais, consultas, faturas, serviços e stocks.<br/>
              <span className="font-medium text-teal-600">O seu salão e a sua conta permanecem ativos.</span>
            </p>
            <Button
              onClick={() => setShowDeleteDataModal(true)}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar dados
            </Button>
          </div>

          {/* Eliminar a conta */}
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100">
            <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Eliminar a conta definitivamente
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Irá eliminar a sua conta E todos os dados associados. Esta ação é IRREVERSÍVEL.
            </p>
            <Button
              onClick={() => setShowDeleteAccountModal(true)}
              variant="destructive"
            >
              <AlertTriangle className="w-4 h-4" />
              ELIMINAR A CONTA
            </Button>
          </div>
        </div>
      </div>

      {/* Informações legais */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">
          Versão da conta : {session?.user?.id?.slice(0, 8)}
        </p>
        <p className="text-xs text-gray-500 space-x-2">
          <a href="/legal/privacy" className="text-teal-500 hover:underline">Política de Privacidade</a>
          <span>•</span>
          <a href="/legal/terms" className="text-teal-500 hover:underline">Termos e Condições</a>
          <span>•</span>
          <a href="/legal/gdpr" className="text-teal-500 hover:underline">RGPD</a>
        </p>
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={showDeleteDataModal}
        title="Eliminar todos os dados comerciais"
        message={"Isto irá eliminar:\n• Todos os clientes\n• Todos os animais\n• Todas as consultas\n• Todas as faturas\n• Todos os serviços\n• Todo o inventário\n\n✓ O seu salão e a sua conta permanecem ativos\n✓ Poderá continuar a utilizar o Pawlyx"}
        confirmText="Confirmar"
        warningText="Esta ação é IRREVERSÍVEL"
        requirePassword={true}
        onConfirm={handleDeleteAllData}
        onCancel={() => setShowDeleteDataModal(false)}
        isLoading={deletingData}
        isDangerous={false}
      />

      <DeleteModal
        isOpen={showDeleteAccountModal}
        title="Eliminar a conta definitivamente"
        message="Isto irá eliminar:\n• A sua conta de utilizador\n• O seu salão\n• Todos os clientes\n• Todas as consultas\n• Todas as faturas\n• Todos os serviços\n• Todo o inventário\n• A sua subscrição\n\nEsta ação é definitiva e irreversível."
        confirmText="ELIMINAR DEFINITIVAMENTE"
        warningText="Isto irá ELIMINAR COMPLETAMENTE a sua conta"
        requirePassword={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccountModal(false)}
        isLoading={deletingAccount}
        isDangerous={true}
      />
    </div>
  )
}
