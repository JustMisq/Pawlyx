'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PawPrint, Heart, StickyNote, CalendarDays, Pencil, X, Save, Loader2, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'
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
  clientId: string
  temperament?: string
  allergies?: string
  healthNotes?: string
  groomingNotes?: string
  weight?: number
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  animalId: string
  service?: { name: string }
  animal?: { id: string; name: string }
}

export default function AnimalDetailPage() {
  const params = useParams()
  const animalId = params.id as string

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingHealth, setEditingHealth] = useState(false)
  const [animalNotes, setAnimalNotes] = useState('')
  const [healthData, setHealthData] = useState({
    temperament: '', allergies: '', healthNotes: '', groomingNotes: '', weight: '',
  })

  const fetchAnimalDetails = useCallback(async () => {
    try {
      const animalRes = await fetch(`/api/animals/${animalId}`)
      if (animalRes.ok) {
        const animalData = await animalRes.json()
        setAnimal(animalData)
        setAnimalNotes(animalData.notes || '')
        setHealthData({
          temperament: animalData.temperament || '', allergies: animalData.allergies || '',
          healthNotes: animalData.healthNotes || '', groomingNotes: animalData.groomingNotes || '',
          weight: animalData.weight?.toString() || '',
        })
        if (animalData.clientId) {
          const clientRes = await fetch(`/api/clients/${animalData.clientId}`)
          if (clientRes.ok) setClient(await clientRes.json())
        }
        const appointmentsRes = await fetch('/api/appointments')
        if (appointmentsRes.ok) {
          const allAppointments = await appointmentsRes.json()
          setAppointments(
            allAppointments
              .filter((apt: Appointment) => apt.animalId === animalId)
              .sort((a: Appointment, b: Appointment) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          )
        }
      }
    } catch (error) {
      console.error('Error fetching details:', error)
      toast.error('Erro ao carregar')
    } finally { setLoading(false) }
  }, [animalId])

  useEffect(() => { fetchAnimalDetails() }, [fetchAnimalDetails])

  const handleSaveNotes = async () => {
    try {
      const res = await fetch('/api/animals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: animalId, notes: animalNotes }) })
      if (res.ok) { toast.success('Notas guardadas!'); setEditingNotes(false); if (animal) setAnimal({ ...animal, notes: animalNotes }) }
      else toast.error('Erro ao guardar')
    } catch { toast.error('Ocorreu um erro') }
  }

  const handleSaveHealth = async () => {
    try {
      const res = await fetch('/api/animals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        id: animalId, temperament: healthData.temperament || null, allergies: healthData.allergies || null,
        healthNotes: healthData.healthNotes || null, groomingNotes: healthData.groomingNotes || null,
        weight: healthData.weight ? parseFloat(healthData.weight) : null,
      }) })
      if (res.ok) {
        toast.success('Informações de saúde guardadas!'); setEditingHealth(false)
        if (animal) setAnimal({ ...animal, temperament: healthData.temperament, allergies: healthData.allergies, healthNotes: healthData.healthNotes, groomingNotes: healthData.groomingNotes, weight: healthData.weight ? parseFloat(healthData.weight) : undefined })
      } else toast.error('Erro ao guardar')
    } catch { toast.error('Ocorreu um erro') }
  }

  const getTemperamentBadge = (temperament: string) => {
    const badges: Record<string, string> = { calm: 'bg-green-100 text-green-700', nervous: 'bg-yellow-100 text-yellow-700', aggressive: 'bg-red-100 text-red-700', playful: 'bg-teal-100 text-teal-700', fearful: 'bg-purple-100 text-purple-700' }
    const labels: Record<string, string> = { calm: 'Calmo', nervous: 'Nervoso', aggressive: 'Agressivo', playful: 'Brincalhão', fearful: 'Medroso' }
    return (<span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${badges[temperament] || 'bg-gray-100 text-gray-700'}`}>{labels[temperament] || temperament}</span>)
  }

  if (loading) return (<div className="p-8 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>)

  if (!animal) return (
    <div className="p-4 sm:p-6 lg:p-8">
      <p className="text-gray-500">Animal não encontrado</p>
      <Link href="/dashboard/animals"><Button className="mt-4"><ArrowLeft className="w-4 h-4" /> Voltar aos animais</Button></Link>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/animals" className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar aos animais
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {animal.name[0]}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{animal.name}</h1>
            <p className="text-gray-500">{animal.species} {animal.breed ? `· ${animal.breed}` : ''}</p>
            {client && (
              <p className="text-sm text-gray-400 mt-0.5">
                Cliente : <Link href={`/dashboard/clients/${client.id}`} className="text-teal-600 hover:text-teal-700 font-medium">{client.firstName} {client.lastName}</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Infos de base */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PawPrint className="w-5 h-5 text-teal-500" /> Informações</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-500 w-32">Espécie</span><span className="text-gray-900">{animal.species}</span></div>
          {animal.breed && <div className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-500 w-32">Raça</span><span className="text-gray-900">{animal.breed}</span></div>}
          {animal.color && <div className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-500 w-32">Cor</span><span className="text-gray-900">{animal.color}</span></div>}
          {animal.dateOfBirth && <div className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-500 w-32">Data de nascimento</span><span className="text-gray-900">{new Date(animal.dateOfBirth).toLocaleDateString('pt-PT')}</span></div>}
          {animal.weight && <div className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-500 w-32">Peso</span><span className="text-gray-900">{animal.weight} kg</span></div>}
          <div className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-500 w-32">Registado</span><span className="text-gray-900">{new Date(animal.createdAt).toLocaleDateString('pt-PT')}</span></div>
        </div>
      </div>

      {/* Santé & Comportement */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> Saúde e Comportamento</h2>
          <Button onClick={() => setEditingHealth(!editingHealth)} variant={editingHealth ? 'outline' : 'ghost'} size="sm">
            {editingHealth ? <><X className="w-4 h-4" /> Cancelar</> : <><Pencil className="w-4 h-4" /> Editar</>}
          </Button>
        </div>

        {editingHealth ? (
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Temperamento</label>
              <select value={healthData.temperament} onChange={(e) => setHealthData({ ...healthData, temperament: e.target.value })} className="input-base">
                <option value="">Selecionar...</option>
                <option value="calm">Calmo</option><option value="playful">Brincalhão</option>
                <option value="nervous">Nervoso</option><option value="fearful">Medroso</option>
                <option value="aggressive">Agressivo</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Peso (kg)</label><input type="number" step="0.1" value={healthData.weight} onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })} className="input-base" placeholder="8.5" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Alergias</label><input type="text" value={healthData.allergies} onChange={(e) => setHealthData({ ...healthData, allergies: e.target.value })} className="input-base" placeholder="Champôs perfumados..." /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Notas de saúde</label><textarea value={healthData.healthNotes} onChange={(e) => setHealthData({ ...healthData, healthNotes: e.target.value })} rows={2} className="input-base resize-none" placeholder="Tratamentos em curso..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Preferências de tosquia</label><textarea value={healthData.groomingNotes} onChange={(e) => setHealthData({ ...healthData, groomingNotes: e.target.value })} rows={2} className="input-base resize-none" placeholder="Corte preferido, zonas sensíveis..." /></div>
            <Button onClick={handleSaveHealth} className="w-full"><Save className="w-4 h-4" /> Guardar</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-500">Temperamento :</span>{animal.temperament ? getTemperamentBadge(animal.temperament) : <span className="text-gray-400 italic text-sm">Não indicado</span>}</div>
            {animal.weight && <p className="text-sm text-gray-700"><span className="font-medium text-gray-500">Peso :</span> {animal.weight} kg</p>}
            {animal.allergies && (<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /><div><p className="text-sm font-medium text-amber-800">Alergias</p><p className="text-sm text-amber-700">{animal.allergies}</p></div></div>)}
            {animal.healthNotes && <div><p className="text-sm font-medium text-gray-500">Notas de saúde :</p><p className="text-sm text-gray-700">{animal.healthNotes}</p></div>}
            {animal.groomingNotes && <div><p className="text-sm font-medium text-gray-500">Preferências de tosquia :</p><p className="text-sm text-gray-700">{animal.groomingNotes}</p></div>}
            {!animal.temperament && !animal.allergies && !animal.healthNotes && !animal.groomingNotes && (<p className="text-gray-400 italic text-sm">Nenhuma informação de saúde indicada</p>)}
          </div>
        )}
      </div>

      {/* Suivi & Notes */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><StickyNote className="w-5 h-5 text-teal-500" /> Acompanhamento e Observações</h2>
          <Button onClick={() => setEditingNotes(!editingNotes)} variant={editingNotes ? 'outline' : 'ghost'} size="sm">
            {editingNotes ? <><X className="w-4 h-4" /> Cancelar</> : <><Pencil className="w-4 h-4" /> Editar</>}
          </Button>
        </div>
        {editingNotes ? (
          <div className="space-y-3">
            <textarea value={animalNotes} onChange={(e) => setAnimalNotes(e.target.value)} rows={5} className="input-base resize-none" placeholder="Notas de tosquia, comportamento, preferências..." />
            <Button onClick={handleSaveNotes} className="w-full"><Save className="w-4 h-4" /> Guardar</Button>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl min-h-[100px]">
            {animalNotes ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{animalNotes}</p> : <p className="text-gray-400 italic text-sm">Nenhuma nota de momento</p>}
          </div>
        )}
      </div>

      {/* Rendez-vous */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-teal-500" /> Histórico de visitas <span className="text-sm font-normal text-gray-400">({appointments.length})</span>
        </h2>
        {appointments.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Nenhuma consulta para este animal</p>
        ) : (
          <div className="space-y-2">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{apt.service?.name || 'Service'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(apt.startTime).toLocaleDateString('pt-PT')} às {new Date(apt.startTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
                    {apt.endTime && <p className="text-xs text-gray-400">Duração : {Math.round((new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / 60000)} min</p>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium ${apt.status === 'completed' ? 'bg-green-100 text-green-700' : apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {apt.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : apt.status === 'cancelled' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {apt.status === 'completed' ? 'Concluído' : apt.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                    </span>
                    <p className="text-sm font-semibold text-teal-600">{apt.totalPrice}€</p>
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
