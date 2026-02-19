"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Plus, X, Search, Edit2, Trash2, ArrowUp, ArrowDown, Package, AlertCircle } from "lucide-react"
import Skeleton from "@/components/Skeleton"

type InventoryItem = {
  id: string
  product_name: string
  sku?: string
  imei?: string
  quantity: number
  cost_price: number
  sales_price: number
  created_at: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [adjustModal, setAdjustModal] = useState<{
    open: boolean
    type: "add" | "remove"
    item: InventoryItem | null
  }>({ open: false, type: "add", item: null })
  const [searchQuery, setSearchQuery] = useState("")
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [newItem, setNewItem] = useState({
    product_name: "",
    sku: "",
    imei: "",
    quantity: "",
    cost_price: "",
    sales_price: ""
  })
  const [adjustQty, setAdjustQty] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredItems(
        items.filter(
          (i) =>
            i.product_name.toLowerCase().includes(query) ||
            (i.sku?.toLowerCase().includes(query)) ||
            (i.imei?.toLowerCase().includes(query))
        )
      )
    }
  }, [searchQuery, items])

  const fetchInventory = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    setItems(data || [])
    setFilteredItems(data || [])
    setLoading(false)
  }

  const handleSaveProduct = async () => {
    if (!newItem.product_name || !newItem.quantity || !newItem.cost_price || !newItem.sales_price) {
      alert("Please fill in all required fields")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    try {
      if (editingItem) {
        await supabase
          .from("inventory")
          .update({
            product_name: newItem.product_name,
            sku: newItem.sku,
            imei: newItem.imei,
            quantity: Number(newItem.quantity),
            cost_price: Number(newItem.cost_price),
            sales_price: Number(newItem.sales_price)
          })
          .eq("id", editingItem.id)
      } else {
        await supabase.from("inventory").insert([{
          user_id: user.id,
          product_name: newItem.product_name,
          sku: newItem.sku,
          imei: newItem.imei,
          quantity: Number(newItem.quantity),
          cost_price: Number(newItem.cost_price),
          sales_price: Number(newItem.sales_price)
        }])
      }

      setNewItem({ product_name: "", sku: "", imei: "", quantity: "", cost_price: "", sales_price: "" })
      setEditingItem(null)
      setModalOpen(false)
      fetchInventory()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!adjustModal.item) return
    const qty = Number(adjustQty)
    if (isNaN(qty) || qty <= 0) {
      alert("Enter a valid number")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let newQuantity = adjustModal.item.quantity
    if (adjustModal.type === "add") newQuantity += qty
    else newQuantity -= qty

    if (newQuantity < 0) {
      alert("Cannot reduce below 0")
      return
    }

    try {
      await supabase.from("inventory").update({ quantity: newQuantity }).eq("id", adjustModal.item.id)
      setAdjustModal({ open: false, type: "add", item: null })
      setAdjustQty("")
      fetchInventory()
    } catch (error) {
      console.error("Error adjusting stock:", error)
      alert("Failed to adjust stock")
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setNewItem({
      product_name: item.product_name,
      sku: item.sku || "",
      imei: item.imei || "",
      quantity: String(item.quantity),
      cost_price: String(item.cost_price),
      sales_price: String(item.sales_price)
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("inventory").delete().eq("id", id)
      setDeleteConfirm(null)
      fetchInventory()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    }
  }

  const totalValue = items.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = items.filter(item => item.quantity < 5)

  if (loading) return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-1/3 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-3 py-4 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                Inventory
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Manage and track your product inventory
              </p>
            </div>
            <button
              onClick={() => {
                setModalOpen(true)
                setEditingItem(null)
                setNewItem({ product_name: "", sku: "", imei: "", quantity: "", cost_price: "", sales_price: "" })
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label="Total Products"
              value={items.length.toString()}
              icon="📦"
            />
            <StatCard
              label="Total Items"
              value={totalItems.toLocaleString()}
              icon="📊"
            />
            <StatCard
              label="Inventory Value"
              value={`₦${totalValue.toLocaleString()}`}
              icon="💰"
              highlight
            />
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4 flex gap-3">
              <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-amber-900 dark:text-amber-100 text-xs sm:text-sm">
                  {lowStockItems.length} product{lowStockItems.length !== 1 ? "s" : ""} running low on stock
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1 break-words">
                  {lowStockItems.map(item => item.product_name).join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Search product, SKU, IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 sm:py-3 text-sm border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
            />
          </div>

          {/* Inventory Table */}
          {filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-8 sm:p-12 text-center">
              <Package size={40} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2 text-sm sm:text-base">No products found</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mb-4 sm:mb-6">
                {searchQuery ? "Try adjusting your search criteria" : "Start by adding your first product to inventory"}
              </p>
              <button
                onClick={() => {
                  setModalOpen(true)
                  setEditingItem(null)
                }}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50">
                      <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Product</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">SKU</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">IMEI</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Quantity</th>
                      <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Cost Price</th>
                      <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Sales Price</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {item.sku ? (
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded inline-block">
                              {item.sku}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {item.imei ? (
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded inline-block">
                              {item.imei}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <span className={`font-semibold ${item.quantity < 5 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
                              {item.quantity}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setAdjustModal({ open: true, type: "add", item })}
                                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded transition"
                                title="Add stock"
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                onClick={() => setAdjustModal({ open: true, type: "remove", item })}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition"
                                title="Remove stock"
                              >
                                <ArrowDown size={16} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium text-sm">
                          ₦{item.cost_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium text-sm">
                          ₦{item.sales_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition"
                              title="Edit product"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition"
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-3 sm:p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                          {item.product_name}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.sku && (
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-mono truncate">
                              {item.sku}
                            </span>
                          )}
                          {item.imei && (
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-mono truncate">
                              {item.imei}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg sm:text-xl font-bold ${item.quantity < 5 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
                          {item.quantity}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">stock</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 sm:pt-3 border-t border-slate-200 dark:border-neutral-800">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">Cost</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          ₦{item.cost_price.toLocaleString()}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">Sales</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          ₦{item.sales_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 sm:pt-3 border-t border-slate-200 dark:border-neutral-800">
                      <button
                        onClick={() => setAdjustModal({ open: true, type: "add", item })}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-semibold text-xs hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                      >
                        <ArrowUp size={14} />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                      <button
                        onClick={() => setAdjustModal({ open: true, type: "remove", item })}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                      >
                        <ArrowDown size={14} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center justify-center px-2 sm:px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="flex items-center justify-center px-2 sm:px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 w-full max-w-md max-h-[90vh] flex flex-col animate-in zoom-in-95">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-neutral-800 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {editingItem ? "Edit Product" : "Add Product"}
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false)
                    setEditingItem(null)
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Product Name *
                  </label>
                  <input
                    placeholder="Product name"
                    value={newItem.product_name}
                    onChange={e => setNewItem({ ...newItem, product_name: e.target.value })}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    SKU
                  </label>
                  <input
                    placeholder="SKU (optional)"
                    value={newItem.sku}
                    onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    IMEI
                  </label>
                  <input
                    placeholder="IMEI (optional)"
                    value={newItem.imei}
                    onChange={e => setNewItem({ ...newItem, imei: e.target.value })}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Quantity *
                  </label>
                  <input
                    placeholder="0"
                    type="number"
                    min="0"
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Cost Price *
                    </label>
                    <input
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.cost_price}
                      onChange={e => setNewItem({ ...newItem, cost_price: e.target.value })}
                      className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Sales Price *
                    </label>
                    <input
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.sales_price}
                      onChange={e => setNewItem({ ...newItem, sales_price: e.target.value })}
                      className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 sm:p-6 border-t border-slate-200 dark:border-neutral-800 flex-shrink-0 bg-white dark:bg-neutral-900">
                <button
                  onClick={() => {
                    setModalOpen(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {adjustModal.open && adjustModal.item && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 w-full max-w-sm max-h-[90vh] flex flex-col animate-in zoom-in-95">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-neutral-800 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {adjustModal.type === "add" ? "Add Stock" : "Remove Stock"}
                </h2>
                <button
                  onClick={() => setAdjustModal({ open: false, type: "add", item: null })}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-neutral-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
                    {adjustModal.item.product_name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Current: <span className="font-semibold">{adjustModal.item.quantity}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Quantity to {adjustModal.type === "add" ? "Add" : "Remove"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={adjustQty}
                    onChange={e => setAdjustQty(e.target.value)}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 p-4 sm:p-6 border-t border-slate-200 dark:border-neutral-800 flex-shrink-0 bg-white dark:bg-neutral-900">
                <button
                  onClick={() => setAdjustModal({ open: false, type: "add", item: null })}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustStock}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-white rounded-lg font-semibold text-sm transition ${
                    adjustModal.type === "add"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {adjustModal.type === "add" ? "Add" : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 w-full max-w-sm max-h-[90vh] flex flex-col animate-in zoom-in-95">
              <div className="flex items-start gap-3 p-4 sm:p-6 flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Delete Product
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    This action cannot be undone. Are you sure you want to permanently delete this product?
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 sm:p-6 border-t border-slate-200 dark:border-neutral-800 flex-shrink-0 bg-white dark:bg-neutral-900">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}

// Helper Component
function StatCard({
  label,
  value,
  icon,
  highlight
}: {
  label: string
  value: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-3 sm:p-6 border transition ${
      highlight
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800"
    }`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-2 ${
        highlight
          ? "text-blue-700 dark:text-blue-400"
          : "text-slate-600 dark:text-slate-400"
      }`}>
        <span className="text-base sm:text-lg">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden text-xs">{label.split(' ')[0]}</span>
      </p>
      <p className={`text-xl sm:text-3xl font-bold ${
        highlight
          ? "text-blue-900 dark:text-blue-100"
          : "text-slate-900 dark:text-white"
      }`}>
        {value}
      </p>
    </div>
  )
}
