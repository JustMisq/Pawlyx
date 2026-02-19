'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserRound,
  PawPrint,
  Scissors,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

// Configuração do localizer com a locale portuguesa
const locales = {
  'pt': pt,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

// Mensagens em português para o calendário
const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Seguinte',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Nenhuma consulta neste período',
  showMore: (total: number) => `+ ${total} mais`,
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  start?: Date
  end?: Date
  clientId: string
  animalId: string
  serviceId: string
  client: { firstName: string; lastName: string }
  animal: { name: string }
  service: { name: string; price: number; duration: number }
  notes?: string
  internalNotes?: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  isLateCancel?: boolean
  cancellationReason?: string
  totalPrice?: number
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

// Tipo para os eventos do calendário
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: Appointment
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientId: '',
    animalId: '',
    serviceId: '',
    startTime: '',
    notes: '',
  })

  // Carregar os dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, clientRes, serviceRes] = await Promise.all([
          fetch(`/api/appointments?from=${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()}&to=${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()}`),
          fetch('/api/clients'),
          fetch('/api/services'),
        ])

        if (apptRes.ok) {
          const data = await apptRes.json()
          if (Array.isArray(data)) {
            setAppointments(
              data.map((apt: any) => ({
                ...apt,
                start: new Date(apt.startTime),
                end: new Date(apt.endTime),
              }))
            )
          }
        }

        if (clientRes.ok) {
          setClients(await clientRes.json())
        }

        if (serviceRes.ok) {
          setServices(await serviceRes.json())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Obter os animais do cliente selecionado
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!formData.clientId) {
        setAnimals([])
        setFormData((prev) => ({ ...prev, animalId: '' }))
        return
      }

      try {
        const res = await fetch(`/api/animals?clientId=${formData.clientId}`)
        if (res.ok) {
          setAnimals(await res.json())
        }
      } catch (error) {
        console.error('Error fetching animals:', error)
      }
    }

    fetchAnimals()
  }, [formData.clientId])

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedDate(slotInfo.start)
    const hours = String(slotInfo.start.getHours()).padStart(2, '0')
    const minutes = String(slotInfo.start.getMinutes()).padStart(2, '0')
    setFormData((prev) => ({
      ...prev,
      startTime: `${hours}:${minutes}`,
    }))
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientId || !formData.animalId || !formData.serviceId || !formData.startTime) {
      toast.error('Todos os campos são obrigatórios')
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const [hours, minutes] = formData.startTime.split(':')
      const startDateTime = new Date(selectedDate!)
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0)

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          animalId: formData.animalId,
          serviceId: formData.serviceId,
          startTime: startDateTime.toISOString(),
          notes: formData.notes,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || 'Erro ao criar a consulta')
        return
      }

      const newAppointment = await res.json()
      setAppointments([
        ...appointments,
        {
          ...newAppointment,
          start: new Date(newAppointment.startTime),
          end: new Date(newAppointment.endTime),
        },
      ])

      setFormData({
        clientId: '',
        animalId: '',
        serviceId: '',
        startTime: '',
        notes: '',
      })
      setShowForm(false)
      toast.success('Consulta criada!')
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar uma consulta
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta consulta?')) return

    try {
      const res = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAppointments(appointments.filter(apt => apt.id !== appointmentId))
        setSelectedAppointment(null)
        toast.success('Consulta eliminada')
      } else {
        toast.error('Erro ao eliminar')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Ocorreu um erro')
    }
  }

  // Alterar o estado de uma consulta
  const handleStatusChange = async (appointmentId: string, newStatus: string, reason?: string) => {
    try {
      const body: any = { status: newStatus }
      if (reason) body.cancellationReason = reason

      const res = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = await res.json()
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...updated, start: new Date(updated.startTime), end: new Date(updated.endTime) }
            : apt
        ))
        setSelectedAppointment(null)
        
        const statusLabels: Record<string, string> = {
          confirmed: 'confirmada',
          in_progress: 'iniciada',
          completed: 'concluída',
          cancelled: 'cancelada',
          no_show: 'marcada como não compareceu',
        }
        toast.success(`Consulta ${statusLabels[newStatus] || 'atualizada'}`)
      } else {
        const error = await res.json()
        toast.error(error.message || 'Erro ao atualizar')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Ocorreu um erro')
    }
  }

  // Obter a cor do estado
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-gray-100 text-gray-600 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      no_show: 'bg-orange-100 text-orange-700 border-orange-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  // Obter o rótulo do estado com ícone
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <CalendarDays className="w-3.5 h-3.5" />
      case 'confirmed': return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'in_progress': return <RefreshCw className="w-3.5 h-3.5" />
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'cancelled': return <XCircle className="w-3.5 h-3.5" />
      case 'no_show': return <AlertTriangle className="w-3.5 h-3.5" />
      default: return <CalendarDays className="w-3.5 h-3.5" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em curso',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não compareceu',
    }
    return labels[status] || status
  }

  // Obter a cor do calendário por estado
  const getCalendarEventColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#3b82f6', // blue
      confirmed: '#22c55e', // green
      in_progress: '#eab308', // yellow
      completed: '#6b7280', // gray
      cancelled: '#ef4444', // red
      no_show: '#f97316', // orange
    }
    return colors[status] || '#3b82f6'
  }

  // Gestão do clique num evento
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedAppointment(event)
  }, [])

  // Eventos formatados para o calendário (com useMemo para otimização)
  const calendarEvents = useMemo(() => {
    return appointments
      .filter(apt => apt.startTime && apt.endTime && apt.client && apt.animal)
      .map(apt => ({
        ...apt,
        start: new Date(apt.startTime),
        end: new Date(apt.endTime),
        title: `${apt.client.firstName} ${apt.client.lastName} - ${apt.animal.name}`,
      }))
  }, [appointments])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">A carregar consultas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-teal-500" />
          Consultas
        </h1>
        <Button
          onClick={() => {
            setSelectedDate(new Date())
            setShowForm(!showForm)
          }}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? (
            <><X className="w-4 h-4 mr-2" /> Cancelar</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" /> Nova consulta</>
          )}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-500" />
            Criar uma consulta
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="input-base"
                >
                  <option value="">Selecionar um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal *
                </label>
                <select
                  value={formData.animalId}
                  onChange={(e) =>
                    setFormData({ ...formData, animalId: e.target.value })
                  }
                  disabled={!formData.clientId}
                  className="input-base disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.clientId
                      ? 'Selecionar um animal'
                      : 'Escolher um cliente primeiro'}
                  </option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} ({animal.species})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  className="input-base"
                >
                  <option value="">Selecionar um serviço</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price}€ ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="input-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input-base resize-none"
                placeholder="Notas adicionais..."
                rows={2}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> A criar...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Criar consulta</>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Modal de detalhes da consulta */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal-500" />
                  Detalhes da consulta
                </h2>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status || 'scheduled')}`}>
                  {getStatusIcon(selectedAppointment.status || 'scheduled')}
                  {getStatusLabel(selectedAppointment.status || 'scheduled')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5" /> Cliente
                </span>
                <p className="font-medium">{selectedAppointment.client.firstName} {selectedAppointment.client.lastName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5" /> Animal
                </span>
                <p className="font-medium">{selectedAppointment.animal.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" /> Service
                </span>
                <p className="font-medium">{selectedAppointment.service.name} - <span className="text-teal-600 font-semibold">{selectedAppointment.totalPrice || selectedAppointment.service.price}€</span></p>
              </div>
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Data e hora
                </span>
                <p className="font-medium">
                  {new Date(selectedAppointment.startTime).toLocaleString('pt-PT', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notas</span>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.isLateCancel && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3">
                  <p className="text-sm text-orange-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Cancelamento tardio (menos de 24h antes da consulta)
                  </p>
                </div>
              )}
              {selectedAppointment.cancellationReason && (
                <div>
                  <span className="text-sm text-gray-500">Motivo do cancelamento</span>
                  <p className="text-sm text-red-600">{selectedAppointment.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Ações conforme o estado */}
            <div className="mt-6 space-y-3">
              {(selectedAppointment.status === 'scheduled' || !selectedAppointment.status) && (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar
                  </Button>
                  <Button 
                    onClick={() => {
                      const reason = prompt('Motivo do cancelamento (opcional):')
                      handleStatusChange(selectedAppointment.id, 'cancelled', reason || undefined)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleStatusChange(selectedAppointment.id, 'in_progress')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Iniciar
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange(selectedAppointment.id, 'no_show')}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" /> Não compareceu
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'in_progress' && (
                <Button 
                  onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Concluir e faturar
                </Button>
              )}

              {['completed', 'cancelled', 'no_show'].includes(selectedAppointment.status || '') && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Esta consulta está concluída e já não pode ser alterada.
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button 
                onClick={() => setSelectedAppointment(null)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
              {!['completed', 'cancelled', 'no_show'].includes(selectedAppointment.status || '') && (
                <Button 
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  variant="ghost"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          messages={messages}
          culture="pt"
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          view={currentView}
          onView={(view) => setCurrentView(view as typeof currentView)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          eventPropGetter={(event: any) => ({
            style: {
              backgroundColor: getCalendarEventColor(event.status || 'scheduled'),
              borderRadius: '4px',
              opacity: event.status === 'cancelled' || event.status === 'no_show' ? 0.6 : 0.9,
              color: 'white',
              border: 'none',
              display: 'block',
              cursor: 'pointer',
              textDecoration: event.status === 'cancelled' ? 'line-through' : 'none',
            },
          })}
          dayPropGetter={(date: Date) => {
            const today = new Date()
            if (date.toDateString() === today.toDateString()) {
              return {
                style: {
                  backgroundColor: '#f0f9ff',
                },
              }
            }
            return {}
          }}
        />
      </div>

      {/* Mostrar as consultas do dia */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-500" />
          Próximas consultas
        </h2>
        {appointments.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma consulta de momento</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments
              .filter(apt => apt.status !== 'cancelled' && apt.status !== 'no_show')
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime()
              )
              .slice(0, 5)
              .map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {apt.client.firstName} {apt.client.lastName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status || 'scheduled')}`}>
                          {getStatusIcon(apt.status || 'scheduled')}
                          {getStatusLabel(apt.status || 'scheduled')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <PawPrint className="w-3.5 h-3.5" /> {apt.animal.name} - {apt.service.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(apt.startTime).toLocaleString('pt-PT', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-teal-600">
                        {apt.totalPrice || apt.service.price}€
                      </span>
                      {apt.isLateCancel && (
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 justify-end">
                          <AlertTriangle className="w-3 h-3" /> Cancelamento tardio
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
