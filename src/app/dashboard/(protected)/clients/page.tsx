'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, X, Users, Mail, Phone, MapPin, StickyNote, Eye, Loader2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Erro ao carregar os clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.error === 'NO_SALON') {
          toast.error('Crie primeiro o seu salão a partir do menu "Salão"')
          setLoading(false)
          return
        }
        toast.error('Erro ao criar o cliente')
        setLoading(false)
        return
      }

      toast.success('Cliente criado com sucesso!')
      setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', notes: '' })
      setShowForm(false)
      fetchClients()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase()
    return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Adicionar um cliente</>}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-2xl border-2 border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo cliente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome próprio *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="input-base" placeholder="João" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apelido *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="input-base" placeholder="Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-base" placeholder="joao@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-base" placeholder="912 345 678" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Morada</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-base" placeholder="Rua da Paz 123, Lisboa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input-base resize-none" placeholder="Notas adicionais..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar o cliente'}
            </Button>
          </form>
        </div>
      )}

      {/* Search bar */}
      {clients.length > 0 && (
        <div className="mb-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar um cliente..."
            className="input-base pl-10"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-3" />
            <p className="text-gray-500">A carregar clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{search ? 'Nenhum resultado' : 'Nenhum cliente de momento'}</p>
            <p className="text-gray-400 text-sm mt-1">{search ? 'Tente com outros termos' : 'Adicione o seu primeiro cliente acima'}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-sm">
                            {client.firstName[0]}{client.lastName[0]}
                          </div>
                          <span className="font-medium text-gray-900">{client.firstName} {client.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{client.email || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{client.phone || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" /> Detalhes
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredClients.map(client => (
                <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-sm shrink-0">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{client.firstName} {client.lastName}</p>
                    <p className="text-sm text-gray-500 truncate">{client.email || client.phone || 'Sem contacto'}</p>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
