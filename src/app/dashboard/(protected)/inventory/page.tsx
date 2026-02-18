'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

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
  
  // États pour le modal de vente de stock
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

  const units = ['ml', 'l', 'g', 'kg', 'pièces', 'bouteille', 'boîte', 'spray']
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  const icons = ['📦', '🧴', '🪮', '🎀', '🧼', '💄', '🩹', '🐾']

  // Charger les stocks, catégories et clients
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
        toast.error('Erreur lors du chargement')
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
      toast.error('Le nom, la quantité et le prix sont requis')
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
        toast.error(error.message || `Erreur lors de la ${editingItem ? 'modification' : 'création'}`)
        return
      }

      const newItem = await res.json()

      if (editingItem) {
        setItems(items.map(i => i.id === newItem.id ? newItem : i))
        toast.success('Article modifié!')
      } else {
        setItems([...items, newItem])
        toast.success('Article créé!')
      }

      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryFormData.name.trim()) {
      toast.error('Le nom de la catégorie est requis')
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
        toast.error(error.message || `Erreur lors de la ${editingCategory ? 'modification' : 'création'}`)
        return
      }

      const newCategory = await res.json()

      if (editingCategory) {
        setCategories(categories.map(c => c.id === newCategory.id ? newCategory : c))
        // Mettre à jour les items si la catégorie a changé
        setItems(items.map(item => 
          item.categoryId === newCategory.id ? { ...item, category: newCategory } : item
        ))
        toast.success('Catégorie modifiée!')
      } else {
        setCategories([...categories, newCategory])
        toast.success('Catégorie créée!')
      }

      resetCategoryForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/inventory?id=${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems(items.filter(i => i.id !== itemId))
        toast.success('Article supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les articles seront conservés.')) return

    try {
      const res = await fetch(`/api/inventory/categories?id=${categoryId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== categoryId))
        setItems(items.map(item => 
          item.categoryId === categoryId ? { ...item, categoryId: null, category: null } : item
        ))
        toast.success('Catégorie supprimée')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Une erreur est survenue')
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
      toast.error('Veuillez sélectionner un client et une quantité valide')
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
        toast.error(error.message || 'Erreur lors de la création de la facture')
        return
      }

      const { invoice } = await res.json()

      // Mettre à jour la quantité locale
      setItems(items.map(i =>
        i.id === saleItem.id
          ? { ...i, quantity: i.quantity - parseInt(saleData.quantity) }
          : i
      ))

      toast.success(`Facture ${invoice.invoiceNumber} créée!`)
      closeSaleModal()
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmittingSale(false)
    }
  }

  // Calculer le stock total (valeur)
  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

  // Articles en stock faible (moins de 5)
  const lowStockItems = items.filter(item => item.quantity < 5)

  // Filtrer les articles par catégorie
  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.categoryId === filterCategory)

  // Recalculer les statistiques filtrées
  const filteredTotalValue = filteredItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
  const filteredLowStockItems = filteredItems.filter(item => item.quantity < 5)

  // Articles sans catégorie
  const uncategorizedCount = items.filter(item => !item.categoryId).length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des stocks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📦 Gestion des stocks</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (showCategoryForm && !editingCategory) {
                setShowCategoryForm(false)
              } else {
                resetCategoryForm()
                setShowCategoryForm(true)
              }
            }}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {showCategoryForm ? '❌ Annuler' : '🏷️ Nouvelle catégorie'}
          </Button>
          <Button
            onClick={() => {
              if (showForm && !editingItem) {
                setShowForm(false)
              } else {
                resetForm()
                setShowForm(true)
              }
            }}
            className="bg-primary hover:bg-primary/90"
          >
            {showForm ? '❌ Annuler' : '➕ Nouveau article'}
          </Button>
        </div>
      </div>

      {/* Formulaire catégorie */}
      {showCategoryForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </h2>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Ex: Shampooings"
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
                      className={`text-2xl px-3 py-2 rounded border-2 ${
                        categoryFormData.icon === icon
                          ? 'border-purple-500 bg-purple-100'
                          : 'border-gray-300'
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
                Description
              </label>
              <textarea
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Description de la catégorie..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryFormData({ ...categoryFormData, color })}
                    className={`w-10 h-10 rounded border-2 ${
                      categoryFormData.color === color
                        ? 'border-gray-900'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50">
              {isSubmitting ? 'En cours...' : editingCategory ? 'Modifier la catégorie' : 'Créer la catégorie'}
            </Button>
          </form>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total articles</p>
          <p className="text-3xl font-bold text-primary">{filteredItems.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Valeur totale du stock</p>
          <p className="text-3xl font-bold text-primary">{filteredTotalValue.toFixed(2)}€</p>
        </div>
        <div className={`rounded-lg p-6 border ${filteredLowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${filteredLowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'} mb-1`}>
            Articles en stock faible
          </p>
          <p className={`text-3xl font-bold ${filteredLowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {filteredLowStockItems.length}
          </p>
        </div>
      </div>

      {/* Catégories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">📂 Catégories</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Tous ({items.length})
          </button>
          
          {categories.map(cat => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
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

              {/* Menu contextuel au hover */}
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleEditCategory(cat)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg text-red-600"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}

          {uncategorizedCount > 0 && (
            <button
              onClick={() => setFilterCategory('uncategorized')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                filterCategory === 'uncategorized'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Sans catégorie ({uncategorizedCount})
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Shampoing pour chien"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Aucune catégorie</option>
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
                  Prix unitaire (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="10.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unité *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Notes sur le produit..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="10"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'En cours...' : editingItem ? 'Modifier l\'article' : 'Ajouter l\'article'}
            </Button>
          </form>
        </div>
      )}

      {/* Modal de vente de stock */}
      {showSaleModal && saleItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              💰 Vendre: {saleItem.name}
            </h2>

            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={saleData.clientId}
                  onChange={(e) => setSaleData({ ...saleData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité ({saleItem.unit}) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={saleItem.quantity}
                    value={saleData.quantity}
                    onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="1"
                  />
                  <span className="text-sm text-gray-600">
                    max: {saleItem.quantity}
                  </span>
                </div>
              </div>

              {saleData.quantity && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Total HT:</span> {(saleItem.price * parseInt(saleData.quantity || '0')).toFixed(2)}€
                  </p>
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">TVA (20%):</span> {((saleItem.price * parseInt(saleData.quantity || '0') * 0.2)).toFixed(2)}€
                  </p>
                  <p className="text-sm font-semibold text-blue-900 pt-2 border-t border-blue-200">
                    <span>Total TTC:</span> {((saleItem.price * parseInt(saleData.quantity || '0')) * 1.2).toFixed(2)}€
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={saleData.notes}
                  onChange={(e) => setSaleData({ ...saleData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Notes sur la vente..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={closeSaleModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingSale || !saleData.clientId || !saleData.quantity}
                  className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                >
                  {isSubmittingSale ? 'Création...' : '✅ Créer facture'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles en stock faible */}
      {filteredLowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-900 mb-3">⚠️ Articles en stock faible</h3>
          <div className="grid gap-2">
            {filteredLowStockItems.map(item => (
              <p key={item.id} className="text-sm text-red-700">
                {item.name}: {item.quantity} {item.unit} restant(s)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Liste des articles */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              {filterCategory === 'all' 
                ? 'Aucun article en stock. Ajoutez-en un pour démarrer!'
                : 'Aucun article dans cette catégorie.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Catégorie</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prix unitaire</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valeur totale</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={item.quantity < 5 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: item.category.color || '#3b82f6' }}
                          >
                            {item.category.icon} {item.category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.price.toFixed(2)}€</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {(item.quantity * item.price).toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openSaleModal(item)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm"
                            title="Vendre du stock"
                          >
                            💰 Vendre
                          </Button>
                          <Button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                          >
                            🗑️
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
