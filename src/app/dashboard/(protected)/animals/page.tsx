'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, X, PawPrint, Eye, Trash2, Loader2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  color?: string
  clientId: string
  client?: {
    firstName: string
    lastName: string
  }
}

const speciesLabels: Record<string, string> = { dog: 'Cão', cat: 'Gato', rabbit: 'Coelho', bird: 'Pássaro', other: 'Outro' }
const speciesIcons: Record<string, string> = { dog: '🐕', cat: '🐱', rabbit: '🐰', bird: '🐦', other: '🐾' }

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    color: '',
    dateOfBirth: '',
    notes: '',
    clientId: '',
  })
  const [clients, setClients] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])

  useEffect(() => {
    fetchAnimals()
    fetchClients()
  }, [])

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals')
      if (res.ok) { setAnimals(await res.json()) }
    } catch (error) {
      console.error('Error fetching animals:', error)
      toast.error('Erro ao carregar os animais')
    } finally { setLoading(false) }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) { setClients(await res.json()) }
    } catch (error) { console.error('Error fetching clients:', error) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientId) { toast.error('Por favor selecione um cliente'); return }

    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const newAnimal = await res.json()
        setAnimals([newAnimal, ...animals])
        setFormData({ name: '', species: 'dog', breed: '', color: '', dateOfBirth: '', notes: '', clientId: '' })
        setShowForm(false)
        toast.success('Animal adicionado!')
      } else { toast.error('Erro ao adicionar') }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este animal?')) return

    try {
      const res = await fetch('/api/animals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setAnimals(animals.filter((a) => a.id !== id))
        toast.success('Animal eliminado!')
      } else { toast.error('Erro ao eliminar') }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const filtered = animals.filter(a => {
    const q = search.toLowerCase()
    return a.name.toLowerCase().includes(q) ||
      (a.breed && a.breed.toLowerCase().includes(q)) ||
      (a.client && `${a.client.firstName} ${a.client.lastName}`.toLowerCase().includes(q))
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Animais</h1>
          <p className="text-gray-500 mt-1">{animals.length} {animals.length !== 1 ? 'animais' : 'animal'} registado{animals.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Adicionar um animal</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo animal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente *</label>
              <select name="clientId" value={formData.clientId} onChange={handleChange} required className="input-base">
                <option value="">Selecionar um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-base" placeholder="Ex: Rex" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Espécie *</label>
                <select name="species" value={formData.species} onChange={handleChange} className="input-base">
                  <option value="dog">Cão</option>
                  <option value="cat">Gato</option>
                  <option value="rabbit">Coelho</option>
                  <option value="bird">Pássaro</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Raça</label>
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="input-base" placeholder="Ex: Golden Retriever" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="input-base" placeholder="Ex: Dourado" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-base" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-base resize-none" placeholder="Alergias, comportamento, preferências..." rows={3} />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Adicionar o animal</Button>
          </form>
        </div>
      )}

      {animals.length > 0 && (
        <div className="mb-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar um animal..." className="input-base pl-10" />
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-3" />
            <p className="text-gray-500">A carregar animais...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <PawPrint className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{search ? 'Nenhum resultado' : 'Nenhum animal de momento'}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Animal</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Espécie</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Raça</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((animal) => (
                    <tr key={animal.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-lg">
                            {speciesIcons[animal.species] || '🐾'}
                          </div>
                          <span className="font-medium text-gray-900">{animal.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">{speciesLabels[animal.species] || animal.species}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{animal.breed || '—'}</td>
                      <td className="px-6 py-4">
                        {animal.client ? (
                          <Link href={`/dashboard/clients/${animal.clientId}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors">
                            {animal.client.firstName} {animal.client.lastName}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <Link href={`/dashboard/animals/${animal.id}`}>
                            <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(animal.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filtered.map((animal) => (
                <div key={animal.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-lg shrink-0">
                      {speciesIcons[animal.species] || '🐾'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{animal.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-lg">{speciesLabels[animal.species]}</span>
                        {animal.breed && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{animal.breed}</span>}
                      </div>
                      {animal.client && (
                        <Link href={`/dashboard/clients/${animal.clientId}`} className="text-teal-600 text-xs mt-1 inline-block">{animal.client.firstName} {animal.client.lastName}</Link>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link href={`/dashboard/animals/${animal.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(animal.id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
