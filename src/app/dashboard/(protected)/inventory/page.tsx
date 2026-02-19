'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import {
  Package, Plus, X, Loader2, Pencil, Trash2, Search,
  AlertTriangle, ShoppingCart, Tags, FolderOpen, CheckCircle2, DollarSign
} from 'lucide-react'

interface InventoryCategory {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  items: InventoryItem[]
}

interface InventoryItem {
  id: string
  name: string
  description: string | null
  quantity: number
  unit: string
  price: number
  lastRestocked: string
  categoryId: string | null
  category?: InventoryCategory | null
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  
  // Estados para o modal de venda de stock
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleItem, setSaleItem] = useState<InventoryItem | null>(null)
  const [saleData, setSaleData] = useState({
    clientId: '',
    quantity: '',
    notes: '',
  })
  const [isSubmittingSale, setIsSubmittingSale] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'ml',
    price: '',
    categoryId: '',
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📦',
  })

  const units = ['ml', 'l', 'g', 'kg', 'peças', 'garrafa', 'caixa', 'spray']
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  const icons = ['📦', '🧴', '🪮', '🎀', '🧼', '💄', '🩹', '🐾']

  // Carregar os stocks, categorias e clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, categoriesRes, clientsRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/inventory/categories'),
          fetch('/api/clients'),
        ])
        
        if (itemsRes.ok) {
          setItems(await itemsRes.json())
        }
        
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json())
        }
        
        if (clientsRes.ok) {
          setClients(await clientsRes.json())
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      unit: 'ml',
      price: '',
      categoryId: '',
    })
    setEditingItem(null)
    setShowForm(false)
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      icon: '📦',
    })
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      categoryId: item.categoryId || '',
    })
    setShowForm(true)
  }

  const handleEditCategory = (category: InventoryCategory) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
      icon: category.icon || '📦',
    })
    setShowCategoryForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.quantity || !formData.price) {
      toast.error('O nome, a quantidade e o preço são obrigatórios')
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingItem ? '/api/inventory' : '/api/inventory'
      const method = editingItem ? 'PUT' : 'POST'
      const body = {
        ...(editingItem && { id: editingItem.id }),
        name: formData.name,
        description: formData.description || null,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || `Erro ao ${editingItem ? 'editar' : 'criar'}`)
        return
      }

      const newItem = await res.json()

      if (editingItem) {
        setItems(items.map(i => i.id === newItem.id ? newItem : i))
        toast.success('Artigo editado!')
      } else {
        setItems([...items, newItem])
        toast.success('Artigo criado!')
      }

      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryFormData.name.trim()) {
      toast.error('O nome da categoria é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingCategory ? '/api/inventory/categories' : '/api/inventory/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = {
        ...(editingCategory && { id: editingCategory.id }),
        name: categoryFormData.name,
        description: categoryFormData.description || null,
        color: categoryFormData.color,
        icon: categoryFormData.icon,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || `Erro ao ${editingCategory ? 'editar' : 'criar'}`)
        return
      }

      const newCategory = await res.json()

      if (editingCategory) {
        setCategories(categories.map(c => c.id === newCategory.id ? newCategory : c))
        // Atualizar os itens se a categoria mudou
        setItems(items.map(item => 
          item.categoryId === newCategory.id ? { ...item, category: newCategory } : item
        ))
        toast.success('Categoria editada!')
      } else {
        setCategories([...categories, newCategory])
        toast.success('Categoria criada!')
      }

      resetCategoryForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este artigo?')) return

    try {
      const res = await fetch(`/api/inventory?id=${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems(items.filter(i => i.id !== itemId))
        toast.success('Artigo eliminado')
      } else {
        toast.error('Erro ao eliminar')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta categoria? Os artigos serão mantidos.')) return

    try {
      const res = await fetch(`/api/inventory/categories?id=${categoryId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== categoryId))
        setItems(items.map(item => 
          item.categoryId === categoryId ? { ...item, categoryId: null, category: null } : item
        ))
        toast.success('Categoria eliminada')
      } else {
        toast.error('Erro ao eliminar')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Ocorreu um erro')
    }
  }

  const openSaleModal = (item: InventoryItem) => {
    setSaleItem(item)
    setSaleData({ clientId: '', quantity: '', notes: '' })
    setShowSaleModal(true)
  }

  const closeSaleModal = () => {
    setShowSaleModal(false)
    setSaleItem(null)
    setSaleData({ clientId: '', quantity: '', notes: '' })
  }

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!saleData.clientId || !saleData.quantity || parseInt(saleData.quantity) <= 0) {
      toast.error('Selecione um cliente e uma quantidade válida')
      return
    }

    if (!saleItem) return

    setIsSubmittingSale(true)

    try {
      const res = await fetch('/api/stock-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: saleData.clientId,
          inventoryItemId: saleItem.id,
          quantity: parseInt(saleData.quantity),
          notes: saleData.notes || null,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        toast.error(error.message || 'Erro ao criar a fatura')
        return
      }

      const { invoice } = await res.json()

      // Atualizar a quantidade local
      setItems(items.map(i =>
        i.id === saleItem.id
          ? { ...i, quantity: i.quantity - parseInt(saleData.quantity) }
          : i
      ))

      toast.success(`Fatura ${invoice.invoiceNumber} criada!`)
      closeSaleModal()
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setIsSubmittingSale(false)
    }
  }

  // Calcular o stock total (valor)
  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

  // Artigos com stock baixo (menos de 5)
  const lowStockItems = items.filter(item => item.quantity < 5)

  // Filtrar os artigos por categoria
  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.categoryId === filterCategory)

  // Recalcular as estatísticas filtradas
  const filteredTotalValue = filteredItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
  const filteredLowStockItems = filteredItems.filter(item => item.quantity < 5)

  // Artigos sem categoria
  const uncategorizedCount = items.filter(item => !item.categoryId).length

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">A carregar stocks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-teal-500" />
          Gestão de stocks
        </h1>
        <div className="flex gap-2">
          <Button
            variant={showCategoryForm ? 'outline' : 'default'}
            onClick={() => {
              if (showCategoryForm && !editingCategory) {
                setShowCategoryForm(false)
              } else {
                resetCategoryForm()
                setShowCategoryForm(true)
              }
            }}
          >
            {showCategoryForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Tags className="w-4 h-4" /> Nova categoria</>}
          </Button>
          <Button
            variant={showForm ? 'outline' : 'default'}
            onClick={() => {
              if (showForm && !editingItem) {
                setShowForm(false)
              } else {
                resetForm()
                setShowForm(true)
              }
            }}
          >
            {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Novo artigo</>}
          </Button>
        </div>
      </div>

      {/* Formulário categoria */}
      {showCategoryForm && (
        <div className="bg-teal-50/50 rounded-2xl border-2 border-teal-100 p-4 sm:p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tags className="w-5 h-5 text-teal-600" />
            {editingCategory ? 'Editar categoria' : 'Adicionar uma categoria'}
          </h2>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="input-base"
                  placeholder="Ex: Champôs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, icon })}
                      className={`text-2xl px-3 py-2 rounded-lg border-2 ${
                        categoryFormData.icon === icon
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="input-base resize-none"
                placeholder="Descrição da categoria..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryFormData({ ...categoryFormData, color })}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      categoryFormData.color === color
                        ? 'border-gray-900 ring-2 ring-offset-2 ring-teal-500'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> A processar...</> : editingCategory ? 'Editar categoria' : 'Criar categoria'}
            </Button>
          </form>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1.5"><Package className="w-4 h-4" /> Total de artigos</p>
          <p className="text-3xl font-bold text-teal-600">{filteredItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Valor total do stock</p>
          <p className="text-3xl font-bold text-teal-600">{filteredTotalValue.toFixed(2)}€</p>
        </div>
        <div className={`rounded-2xl p-6 border-2 ${filteredLowStockItems.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${filteredLowStockItems.length > 0 ? 'text-amber-600' : 'text-green-600'} mb-1 flex items-center gap-1.5`}>
            <AlertTriangle className="w-4 h-4" /> Artigos com stock baixo
          </p>
          <p className={`text-3xl font-bold ${filteredLowStockItems.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {filteredLowStockItems.length}
          </p>
        </div>
      </div>

      {/* Categorias */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-teal-500" /> Categorias
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Todos ({items.length})
          </button>
          
          {categories.map(cat => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterCategory === cat.id
                    ? 'text-white'
                    : 'text-white hover:opacity-80'
                }`}
                style={{
                  backgroundColor: filterCategory === cat.id ? cat.color || '#3b82f6' : (cat.color || '#3b82f6') + '80',
                }}
              >
                {cat.icon} {cat.name} ({cat.items?.length || 0})
              </button>

              {/* Menu contextual ao hover */}
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-lg border-2 border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                <button
                  onClick={() => handleEditCategory(cat)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}

          {uncategorizedCount > 0 && (
            <button
              onClick={() => setFilterCategory('uncategorized')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCategory === 'uncategorized'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Sem categoria ({uncategorizedCount})
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            {editingItem ? 'Editar artigo' : 'Adicionar um artigo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base"
                  placeholder="Ex: Champô para cão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input-base"
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço unitário (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-base"
                  placeholder="10.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input-base"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-base resize-none"
                placeholder="Notas sobre o produto..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input-base"
                placeholder="10"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> A processar...</> : editingItem ? 'Editar artigo' : 'Adicionar artigo'}
            </Button>
          </form>
        </div>
      )}

      {/* Modal de venda de stock */}
      {showSaleModal && saleItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-600" /> Vender: {saleItem.name}
            </h2>

            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={saleData.clientId}
                  onChange={(e) => setSaleData({ ...saleData, clientId: e.target.value })}
                  className="input-base"
                >
                  <option value="">Selecionar um cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade ({saleItem.unit}) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={saleItem.quantity}
                    value={saleData.quantity}
                    onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
                    className="input-base flex-1"
                    placeholder="1"
                  />
                  <span className="text-sm text-gray-600">
                    max: {saleItem.quantity}
                  </span>
                </div>
              </div>

              {saleData.quantity && (
                <div className="bg-teal-50 border-2 border-teal-100 rounded-2xl p-3">
                  <p className="text-sm text-teal-900">
                    <span className="font-semibold">Total s/ IVA:</span> {(saleItem.price * parseInt(saleData.quantity || '0')).toFixed(2)}€
                  </p>
                  <p className="text-sm text-teal-900">
                    <span className="font-semibold">IVA (23%):</span> {((saleItem.price * parseInt(saleData.quantity || '0') * 0.23)).toFixed(2)}€
                  </p>
                  <p className="text-sm font-semibold text-teal-900 pt-2 border-t border-teal-200">
                    <span>Total c/ IVA:</span> {((saleItem.price * parseInt(saleData.quantity || '0')) * 1.23).toFixed(2)}€
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={saleData.notes}
                  onChange={(e) => setSaleData({ ...saleData, notes: e.target.value })}
                  className="input-base resize-none"
                  placeholder="Notas sobre a venda..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeSaleModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingSale || !saleData.clientId || !saleData.quantity}
                >
                  {isSubmittingSale ? <><Loader2 className="w-4 h-4 animate-spin" /> A criar...</> : <><CheckCircle2 className="w-4 h-4" /> Criar fatura</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Artigos com stock baixo */}
      {filteredLowStockItems.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-8">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Artigos com stock baixo
          </h3>
          <div className="grid gap-2">
            {filteredLowStockItems.map(item => (
              <p key={item.id} className="text-sm text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {item.name}: {item.quantity} {item.unit} restante(s)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Lista de artigos */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filterCategory === 'all' 
                ? 'Nenhum artigo em stock. Adicione um para começar!'
                : 'Nenhum artigo nesta categoria.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Preço unitário</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.quantity < 5 ? 'bg-amber-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-teal-50 text-teal-700">
                            {item.category.icon} {item.category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${item.quantity < 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-teal-600 font-semibold">{item.price.toFixed(2)}€</td>
                      <td className="px-6 py-4 text-teal-600 font-semibold">
                        {(item.quantity * item.price).toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSaleModal(item)}
                            title="Vender stock"
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
