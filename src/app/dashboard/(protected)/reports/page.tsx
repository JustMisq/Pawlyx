'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { BarChart3, Plus, Download, FileText, Eye, Trash2, Loader2, ChevronDown, Receipt } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  type: string
  items: string | null  // JSON string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: string
  paidAt: string | null
  createdAt: string
  client: {
    firstName: string
    lastName: string
  }
  appointment: {
    startTime: string
  } | null
}

interface InvoiceItem {
  service?: string
  product?: string
  description: string
  quantity: number
  unit?: string
  pricePerUnit: number
}

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Helper: Parser les items JSON
  const parseItems = (itemsJson: string | null): InvoiceItem[] => {
    if (!itemsJson) return []
    try {
      return JSON.parse(itemsJson)
    } catch {
      return []
    }
  }

  // Helper: Afficher les items de manière lisible
  const formatItems = (invoice: Invoice): string => {
    const items = parseItems(invoice.items)
    if (items.length === 0) return '-'
    
    return items.map(item => {
      const name = item.service || item.product || 'Produto'
      const qty = item.quantity > 1 ? ` (x${item.quantity})` : ''
      const unit = item.unit ? ` ${item.unit}` : ''
      return `${name}${qty}${unit}`
    }).join(', ')
  }

  // Charger les factures
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices')
        if (res.ok) {
          setInvoices(await res.json())
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
        toast.error('Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  // Filtrer les factures
  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus !== 'all' && invoice.status !== filterStatus) return false
    
    if (dateRange.start) {
      const invoiceDate = new Date(invoice.createdAt)
      const startDate = new Date(dateRange.start)
      if (invoiceDate < startDate) return false
    }
    
    if (dateRange.end) {
      const invoiceDate = new Date(invoice.createdAt)
      const endDate = new Date(dateRange.end)
      if (invoiceDate > endDate) return false
    }
    
    return true
  })

  // Calculer les statistiques
  const stats = {
    totalInvoices: filteredInvoices.length,
    totalHT: filteredInvoices.reduce((acc, inv) => acc + inv.subtotal, 0),
    totalTax: filteredInvoices.reduce((acc, inv) => acc + inv.taxAmount, 0),
    totalTTC: filteredInvoices.reduce((acc, inv) => acc + inv.total, 0),
    paidAmount: filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((acc, inv) => acc + inv.total, 0),
    pendingAmount: filteredInvoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((acc, inv) => acc + inv.total, 0),
  }

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoiceId,
          status: newStatus,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setInvoices(invoices.map(inv => inv.id === invoiceId ? updated : inv))
        toast.success('Fatura atualizada')
      } else {
        toast.error('Erro ao atualizar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Tem a certeza de que deseja eliminar esta fatura?')) return

    try {
      const res = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== invoiceId))
        toast.success('Fatura eliminada')
      } else {
        toast.error('Erro ao eliminar')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const exportCSV = () => {
    const csv = [
      ['Número', 'Tipo', 'Cliente', 'Produto/Serviço', 'Quantidade', 'S/IVA', 'IVA', 'C/IVA', 'Estado', 'Data'],
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.type === 'stock_sale' ? 'Stock' : 'Appointment',
        `${inv.client.firstName} ${inv.client.lastName}`,
        formatItems(inv),
        (() => {
          const items = parseItems(inv.items)
          return items.length > 0 ? items.map(i => i.quantity).reduce((a, b) => a + b, 0) : '-'
        })(),
        inv.subtotal.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.total.toFixed(2),
        inv.status,
        new Date(inv.createdAt).toLocaleDateString('pt-PT'),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorios-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportAccounting = async (format: 'csv' | 'fec') => {
    try {
      const params = new URLSearchParams({ format })
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      
      const res = await fetch(`/api/export/accounting?${params}`)
      if (!res.ok) {
        toast.error('Erro ao exportar')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-contabilidade-${format}-${new Date().toISOString().split('T')[0]}.${format === 'fec' ? 'txt' : 'csv'}`
      a.click()
      toast.success(`Exportação ${format.toUpperCase()} descarregada`)
    } catch (error) {
      toast.error('Erro ao exportar')
    }
  }

  const downloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (!res.ok) {
        toast.error('Erro ao gerar o PDF')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fatura-${invoiceNumber}.html`
      a.click()
      toast.success('Fatura descarregada')
    } catch (error) {
      toast.error('Erro ao descarregar')
    }
  }

  const openPDFPreview = (invoiceId: string) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">A carregar relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-teal-500" />
          Relatórios & Faturas
        </h1>
        <div className="flex gap-3 flex-wrap">
          <Link href="/dashboard/appointments">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar uma fatura
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={filteredInvoices.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <div className="relative group">
            <Button
              variant="outline"
              disabled={filteredInvoices.length === 0}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Exportação contabilística
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border-2 border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportAccounting('csv')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 rounded-t-2xl flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                Formato CSV (Excel)
              </button>
              <button
                onClick={() => exportAccounting('fec')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 rounded-b-2xl flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 text-gray-500" />
                Formato FEC (Contabilidade)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Total s/IVA</p>
          <p className="text-3xl font-bold text-teal-600">{stats.totalHT.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">{stats.totalInvoices} fatura(s)</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Montante Pago</p>
          <p className="text-3xl font-bold text-green-600">{stats.paidAmount.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">Estado &quot;Pago&quot;</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Pendente</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingAmount.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">A receber</p>
        </div>
      </div>

      {/* Détails TVA */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Detalhes Fiscais</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-teal-600">Total s/IVA</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHT.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-teal-600">IVA (20%)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTax.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-teal-600">Total c/IVA</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTTC.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-teal-600">Taxa média</p>
            <p className="text-2xl font-bold text-gray-900">20%</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-base"
            >
              <option value="all">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="paid">Paga</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de início
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de fim
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-base"
            />
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma fatura de momento</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              As faturas são criadas automaticamente quando agenda uma consulta com um cliente.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">Como fazer:</p>
              <ol className="text-left inline-block space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">1</span> Vá a <strong>Consultas</strong></li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">2</span> Crie uma nova consulta</li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">3</span> Selecione o cliente, o animal e o serviço</li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">4</span> Confirme - uma fatura será criada automaticamente</li>
              </ol>
            </div>
            <Link href="/dashboard/appointments" className="mt-8 inline-block">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ir para consultas
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fatura</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produto/Serviço</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Quantidade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">S/IVA</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">IVA</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">C/IVA</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => {
                  const items = parseItems(invoice.items)
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {invoice.client.firstName} {invoice.client.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatItems(invoice)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {items.length > 0 && items[0].quantity > 0 
                          ? items.map(i => i.quantity).reduce((a, b) => a + b, 0)
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {invoice.subtotal.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {invoice.taxAmount.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-teal-600">
                        {invoice.total.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 outline-none cursor-pointer ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : invoice.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          <option value="draft">Rascunho</option>
                          <option value="sent">Enviada</option>
                          <option value="paid">Paga</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPDFPreview(invoice.id)}
                            title="Ver a fatura"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPDF(invoice.id, invoice.invoiceNumber)}
                            title="Descarregar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
