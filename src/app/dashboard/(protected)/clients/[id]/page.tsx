'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, MapPin, StickyNote, PawPrint, Plus, X, Save, Pencil, CalendarDays, FileText, Eye, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  color?: string
  dateOfBirth?: string
  notes?: string
  createdAt: string
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  createdAt: string
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  service?: { name: string }
}

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  status: string
  createdAt: string
}

const speciesLabels: Record<string, string> = { dog: 'Cão', cat: 'Gato', rabbit: 'Coelho', bird: 'Pássaro', other: 'Outro' }

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [clientNotes, setClientNotes] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    color: '',
    dateOfBirth: '',
    notes: '',
  })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clientRes, animalsRes, appointmentsRes, invoicesRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch(`/api/animals?clientId=${clientId}`),
          fetch(`/api/appointments`),
          fetch(`/api/invoices?clientId=${clientId}`),
        ])
        
        if (clientRes.ok) {
          const data = await clientRes.json()
          setClient(data)
          setClientNotes(data.notes || '')
        }
        
        if (animalsRes.ok) {
          const data = await animalsRes.json()
          setAnimals(data)
        }
        
        if (appointmentsRes.ok) {
          const allApts = await appointmentsRes.json()
          const clientApts = allApts.filter((apt: any) => 
            animals.some(a => a.id === apt.animalId)
          )
          setAppointments(clientApts.sort((a: Appointment, b: Appointment) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          ))
        }
        
        if (invoicesRes.ok) {
          const data = await invoicesRes.json()
          setInvoices(data.sort((a: Invoice, b: Invoice) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }
    
    if (clientId) fetchAll()
  }, [clientId, animals.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, ...formData }),
      })

      if (!res.ok) {
        toast.error('Erro ao adicionar o animal')
        return
      }

      const newAnimal = await res.json()
      setAnimals([newAnimal, ...animals])
      setFormData({ name: '', species: 'dog', breed: '', color: '', dateOfBirth: '', notes: '' })
      setShowAddForm(false)
      toast.success('Animal adicionado!')
    } catch (error) {
      console.error('Error adding animal:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const handleSaveClientNotes = async () => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, notes: clientNotes }),
      })

      if (res.ok) {
        toast.success('Notas guardadas!')
        setEditingNotes(false)
        if (client) setClient({ ...client, notes: clientNotes })
      } else {
        toast.error('Erro ao guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-teal-600 hover:text-teal-700 text-sm font-medium mb-4 inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar aos clientes
        </Link>
        {client && (
          <div className="flex items-center gap-4 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-teal">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{client.firstName} {client.lastName}</h1>
              <p className="text-gray-500 text-sm">Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-PT')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact info */}
      {client && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Informações</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {client.email && (
              <div className="flex items-center gap-2.5 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2.5 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2.5 text-gray-700 sm:col-span-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm">{client.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-teal-50/50 border-2 border-teal-100 rounded-2xl p-5 mb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-teal-600" />
            <h2 className="font-semibold text-gray-900">Acompanhamento e Notas</h2>
          </div>
          <Button onClick={() => setEditingNotes(!editingNotes)} variant={editingNotes ? 'outline' : 'ghost'} size="sm">
            {editingNotes ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
          </Button>
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            <textarea value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} rows={5} className="input-base" placeholder="Notas sobre o cliente, preferências, comportamento dos animais, alergias, etc." />
            <Button onClick={handleSaveClientNotes} className="w-full">
              <Save className="w-4 h-4" /> Guardar
            </Button>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-teal-100 min-h-[100px]">
            {clientNotes ? (
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{clientNotes}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">Nenhuma nota de momento</p>
            )}
          </div>
        )}
      </div>

      {/* Animals */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Animais ({animals.length})</h2>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? 'outline' : 'default'} size="sm">
            {showAddForm ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Plus className="w-3.5 h-3.5" /> Adicionar</>}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 mb-4">
            <form onSubmit={handleAddAnimal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input-base" placeholder="Ex: Rex" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Espécie *</label>
                  <select value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="input-base">
                    <option value="dog">Cão</option>
                    <option value="cat">Gato</option>
                    <option value="rabbit">Coelho</option>
                    <option value="bird">Pássaro</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Raça</label>
                  <input type="text" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="input-base" placeholder="Ex: Golden Retriever" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor</label>
                  <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="input-base" placeholder="Ex: Dourado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="input-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-base resize-none" placeholder="Alergias, comportamento, etc." rows={3} />
              </div>
              <Button type="submit" className="w-full">Adicionar o animal</Button>
            </form>
          </div>
        )}

        {animals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-gray-100">
            <PawPrint className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum animal para este cliente</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {animals.map((animal) => (
              <div key={animal.id} className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-teal-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{animal.name}</h3>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">
                        <PawPrint className="w-3 h-3" /> {speciesLabels[animal.species] || animal.species}
                      </span>
                      {animal.breed && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{animal.breed}</span>}
                      {animal.color && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{animal.color}</span>}
                      {animal.dateOfBirth && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Nascido em {new Date(animal.dateOfBirth).toLocaleDateString('pt-PT')}</span>}
                    </div>
                    {animal.notes && <p className="text-sm text-teal-700 mt-2">{animal.notes}</p>}
                  </div>
                  <Link href={`/dashboard/animals/${animal.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /> Detalhes</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-gray-900">Consultas ({appointments.length})</h2>
        </div>
        
        {appointments.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma consulta</p>
        ) : (
          <div className="space-y-2">
            {appointments.map(apt => (
              <div key={apt.id} className="p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{apt.service?.name || 'Service'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(apt.startTime).toLocaleDateString('pt-PT')} às {new Date(apt.startTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700'
                        : apt.status === 'cancelled' ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {apt.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : apt.status === 'cancelled' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {apt.status === 'completed' ? 'Concluído' : apt.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{apt.totalPrice}€</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-gray-900">Faturas ({invoices.length})</h2>
        </div>
        
        {invoices.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma fatura</p>
        ) : (
          <div className="space-y-2">
            {invoices.map(invoice => (
              <div key={invoice.id} className="p-3.5 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(invoice.createdAt).toLocaleDateString('pt-PT')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{invoice.total}€</p>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-medium inline-block mt-1 ${
                    invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700'
                      : invoice.status === 'sent' ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {invoice.status === 'paid' ? 'Paga' : invoice.status === 'sent' ? 'Enviada' : invoice.status === 'draft' ? 'Rascunho' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
