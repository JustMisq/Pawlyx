'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Store, FileText, Info, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalonPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'legal'>('general')
  const [salon, setSalon] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    email: '',
    siret: '',
    tvaNumber: '',
    legalName: '',
    legalForm: '',
    invoiceTerms: '',
    invoiceNotes: '',
  })

  useEffect(() => {
    fetchSalon()
  }, [])

  const fetchSalon = async () => {
    try {
      const res = await fetch('/api/salon')
      if (res.ok) {
        const data = await res.json()
        setSalon({
          name: data.name || '', description: data.description || '', phone: data.phone || '',
          address: data.address || '', city: data.city || '', postalCode: data.postalCode || '',
          email: data.email || '', siret: data.siret || '', tvaNumber: data.tvaNumber || '',
          legalName: data.legalName || '', legalForm: data.legalForm || '',
          invoiceTerms: data.invoiceTerms || '', invoiceNotes: data.invoiceNotes || '',
        })
      }
    } catch (error) { console.error('Error fetching salon:', error) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSalon(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
      })
      if (!res.ok) { toast.error('Erro ao guardar'); return }
      toast.success('Salão atualizado com sucesso!')
    } catch (error) { toast.error('Ocorreu um erro') }
    finally { setLoading(false) }
  }

  const legalFormOptions = [
    { value: '', label: 'Selecionar...' },
    { value: 'auto-entrepreneur', label: 'Empresário em nome individual / Microempresa' },
    { value: 'eurl', label: 'EURL' }, { value: 'sarl', label: 'SARL' },
    { value: 'sasu', label: 'SASU' }, { value: 'sas', label: 'SAS' },
    { value: 'ei', label: 'Empresa Individual' }, { value: 'eirl', label: 'EIRL' },
    { value: 'association', label: 'Associação' }, { value: 'autre', label: 'Outro' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">O Meu Salão</h1>
        <p className="text-gray-500 mt-1">Gerir as informações do seu estabelecimento</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <Store className="w-4 h-4" /> Geral
        </button>
        <button onClick={() => setActiveTab('legal')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'legal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <FileText className="w-4 h-4" /> Legal
        </button>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border-2 border-gray-100 p-6">
          {activeTab === 'general' && (
            <>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do salão *</label>
                  <input type="text" name="name" value={salon.name} onChange={handleChange} required className="input-base" placeholder="O Meu Salão de Tosquia" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" value={salon.email} onChange={handleChange} className="input-base" placeholder="contact@salon.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                  <input type="tel" name="phone" value={salon.phone} onChange={handleChange} className="input-base" placeholder="912 345 678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
                  <input type="text" name="city" value={salon.city} onChange={handleChange} className="input-base" placeholder="Lisboa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Código Postal</label>
                  <input type="text" name="postalCode" value={salon.postalCode} onChange={handleChange} className="input-base" placeholder="1000-001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Morada</label>
                <input type="text" name="address" value={salon.address} onChange={handleChange} className="input-base" placeholder="Rua da Paz, 123" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea name="description" value={salon.description} onChange={handleChange} rows={4} className="input-base resize-none" placeholder="Descreva o seu salão..." />
              </div>
            </>
          )}

          {activeTab === 'legal' && (
            <>
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 mb-2 flex items-start gap-3">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-sm text-teal-800">Estas informações aparecerão nas suas faturas e documentos oficiais. Certifique-se de que estão corretas para a conformidade legal.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Denominação social</label>
                  <input type="text" name="legalName" value={salon.legalName} onChange={handleChange} className="input-base" placeholder="Ex: Lda. O Meu Salão" />
                  <p className="text-xs text-gray-400 mt-1">Nome oficial da sua empresa</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Forma jurídica</label>
                  <select name="legalForm" value={salon.legalForm} onChange={handleChange} className="input-base">
                    {legalFormOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">NIF / NIPC</label>
                  <input type="text" name="siret" value={salon.siret} onChange={handleChange} className="input-base" placeholder="123 456 789" maxLength={17} />
                  <p className="text-xs text-gray-400 mt-1">Número de identificação fiscal</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">N.º IVA intracomunitário</label>
                  <input type="text" name="tvaNumber" value={salon.tvaNumber} onChange={handleChange} className="input-base" placeholder="PT 123456789" />
                  <p className="text-xs text-gray-400 mt-1">Vazio se não sujeito a IVA</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Condições de pagamento</label>
                <textarea name="invoiceTerms" value={salon.invoiceTerms} onChange={handleChange} rows={3} className="input-base resize-none" placeholder="Ex: Pagamento na receção..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas de rodapé da fatura</label>
                <textarea name="invoiceNotes" value={salon.invoiceNotes} onChange={handleChange} rows={2} className="input-base resize-none" placeholder="Ex: Obrigado pela sua confiança!" />
              </div>
              {(salon.siret || salon.legalName) && (
                <div className="border-t border-gray-100 pt-5 mt-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pré-visualização da fatura</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-800">{salon.legalName || salon.name}</p>
                    {salon.legalForm && <p>{legalFormOptions.find(o => o.value === salon.legalForm)?.label}</p>}
                    {salon.address && <p>{salon.address}</p>}
                    {(salon.postalCode || salon.city) && <p>{salon.postalCode} {salon.city}</p>}
                    {salon.siret && <p>NIF : {salon.siret}</p>}
                    {salon.tvaNumber && <p>IVA : {salon.tvaNumber}</p>}
                    {!salon.tvaNumber && <p className="italic text-gray-400">IVA não aplicável</p>}
                  </div>
                </div>
              )}
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar</>}
          </Button>
        </form>
      </div>
    </div>
  )
}
