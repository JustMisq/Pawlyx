'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, Scissors, Pencil, Trash2, Clock, Loader2, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  minPrice: number | null
  maxPrice: number | null
  duration: number
  minDuration: number | null
  maxDuration: number | null
  isFlexible: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', minPrice: '', maxPrice: '',
    duration: '', minDuration: '', maxDuration: '', isFlexible: false,
  })

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services')
        if (res.ok) { setServices(await res.json()) }
      } catch (error) {
        console.error('Error fetching services:', error)
        toast.error('Erro ao carregar')
      } finally { setLoading(false) }
    }
    fetchServices()
  }, [])

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', minPrice: '', maxPrice: '', duration: '', minDuration: '', maxDuration: '', isFlexible: false })
    setEditingService(null)
    setShowForm(false)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name, description: service.description || '',
      price: service.price.toString(), minPrice: service.minPrice?.toString() || '',
      maxPrice: service.maxPrice?.toString() || '', duration: service.duration.toString(),
      minDuration: service.minDuration?.toString() || '', maxDuration: service.maxDuration?.toString() || '',
      isFlexible: service.isFlexible,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.duration) { toast.error('O nome, o preço e a duração são obrigatórios'); return }
    if (formData.isFlexible && !formData.minPrice && !formData.maxPrice) { toast.error('Para um serviço flexível, indique pelo menos um preço mín. ou máx.'); return }
    setIsSubmitting(true)
    try {
      const method = editingService ? 'PUT' : 'POST'
      const body = {
        ...(editingService && { id: editingService.id }),
        name: formData.name, description: formData.description || null,
        price: parseFloat(formData.price), minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null, duration: parseInt(formData.duration),
        minDuration: formData.minDuration ? parseInt(formData.minDuration) : null,
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null, isFlexible: formData.isFlexible,
      }
      const res = await fetch('/api/services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const error = await res.json().catch(() => ({})); toast.error(error.message || 'Erro'); return }
      const newService = await res.json()
      if (editingService) { setServices(services.map(s => s.id === newService.id ? newService : s)); toast.success('Serviço editado!') }
      else { setServices([...services, newService]); toast.success('Serviço criado!') }
      resetForm()
    } catch (error) { console.error('Error:', error); toast.error('Ocorreu um erro') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este serviço?')) return
    try {
      const res = await fetch(`/api/services?id=${serviceId}`, { method: 'DELETE' })
      if (res.ok) { setServices(services.filter(s => s.id !== serviceId)); toast.success('Serviço eliminado') }
      else { toast.error('Erro ao eliminar') }
    } catch (error) { console.error('Error:', error); toast.error('Ocorreu um erro') }
  }

  const formatPrice = (service: Service): string => {
    if (service.isFlexible) {
      if (service.minPrice && service.maxPrice) return `${service.minPrice}€ – ${service.maxPrice}€`
      else if (service.minPrice) return `A partir de ${service.minPrice}€`
      else if (service.maxPrice) return `Até ${service.maxPrice}€`
    }
    return `${service.price}€`
  }

  const formatDuration = (service: Service): string => {
    if (service.isFlexible) {
      if (service.minDuration && service.maxDuration) return `${service.minDuration} – ${service.maxDuration} min`
      else if (service.minDuration) return `A partir de ${service.minDuration} min`
      else if (service.maxDuration) return `Até ${service.maxDuration} min`
    }
    return `${service.duration} min`
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 mt-1">{services.length} serviço{services.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { if (showForm && !editingService) { setShowForm(false) } else { resetForm(); setShowForm(true) } }} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Novo serviço</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingService ? 'Editar serviço' : 'Novo serviço'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-base" placeholder="Ex: Tosquia completa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço base (€) *</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-base" placeholder="15.00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-base resize-none" placeholder="Descrição do serviço..." rows={2} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração (minutos) *</label>
                <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="input-base" placeholder="60" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2.5 cursor-pointer h-[42px]">
                  <input type="checkbox" checked={formData.isFlexible} onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm font-medium text-gray-700">Serviço flexível</span>
                </label>
              </div>
            </div>
            {formData.isFlexible && (
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-teal-800 mb-3">Preço flexível</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço mín. (€)</label>
                      <input type="number" step="0.01" value={formData.minPrice} onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })} className="input-base" placeholder="15.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço máx. (€)</label>
                      <input type="number" step="0.01" value={formData.maxPrice} onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })} className="input-base" placeholder="30.00" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-teal-800 mb-3">Duração flexível</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração mín. (minutos)</label>
                      <input type="number" value={formData.minDuration} onChange={(e) => setFormData({ ...formData, minDuration: e.target.value })} className="input-base" placeholder="30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração máx. (minutos)</label>
                      <input type="number" value={formData.maxDuration} onChange={(e) => setFormData({ ...formData, maxDuration: e.target.value })} className="input-base" placeholder="120" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingService ? 'Editar serviço' : 'Criar serviço'}
            </Button>
          </form>
        </div>
      )}

      <div className="grid gap-3">
        {services.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-gray-100">
            <Scissors className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum serviço de momento</p>
            <p className="text-gray-400 text-sm mt-1">Crie um para começar</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {service.isFlexible && (
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg">Flexible</span>
                    )}
                  </div>
                  {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" /> {formatDuration(service)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="text-xl font-bold text-teal-600">{formatPrice(service)}</p>
                  <div className="flex gap-1">
                    <Button onClick={() => handleEdit(service)} variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                    <Button onClick={() => handleDelete(service.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
