"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Plus, X, Search, Edit2, Trash2, ArrowUp, ArrowDown } from "lucide-react"

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

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
    setSaving(false)
    fetchInventory()
  }

  const handleAdjustStock = async () => {
    if (!adjustModal.item) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const qty = Number(adjustQty)
    if (isNaN(qty) || qty <= 0) return alert("Enter a valid number")

    let newQuantity = adjustModal.item.quantity
    if (adjustModal.type === "add") newQuantity += qty
    else newQuantity -= qty

    if (newQuantity < 0) return alert("Cannot reduce below 0")

    await supabase.from("inventory").update({ quantity: newQuantity }).eq("id", adjustModal.item.id)

    setAdjustModal({ open: false, type: "add", item: null })
    setAdjustQty("")
    fetchInventory()
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
    if (!confirm("Are you sure you want to delete this product?")) return
    await supabase.from("inventory").delete().eq("id", id)
    fetchInventory()
  }

  if (loading) return (
    <ProtectedRoute>
      <div className="flex items-center justify-center h-screen text-slate-600 dark:text-slate-400">
        Loading inventory...
      </div>
    </ProtectedRoute>
  )

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Header */}
        <div className="md:flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Inventory
            </h1>
          </div>
          <button
            onClick={() => { setModalOpen(true); setEditingItem(null) }}
            className="inline-flex items-center gap-2 bg-black text-white px-3 py-2 rounded hover:bg-gray-900 transition text-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by product, SKU, or IMEI"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Inventory Table */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-600 dark:text-slate-400">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
            <table className="hidden md:table w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-2 px-3 text-left">Product</th>
                  <th className="py-2 px-3 text-left">SKU</th>
                  <th className="py-2 px-3 text-left">IMEI</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Cost</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">{item.product_name}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.sku || "-"}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.imei || "-"}</td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100 flex items-center justify-end gap-2">
                      {item.quantity}
                      <button onClick={() => setAdjustModal({ open: true, type: "add", item })} className="text-green-600 hover:text-green-800"><ArrowUp size={16} /></button>
                      <button onClick={() => setAdjustModal({ open: true, type: "remove", item })} className="text-red-600 hover:text-red-800"><ArrowDown size={16} /></button>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100">₦{item.cost_price.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100">₦{item.sales_price.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center flex justify-center gap-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
              {filteredItems.map(item => (
                <div key={item.id} className="p-4 space-y-1 bg-white dark:bg-slate-800 rounded-lg mb-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.product_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.quantity}</span>
                      <button onClick={() => setAdjustModal({ open: true, type: "add", item })} className="text-green-600"><ArrowUp size={16} /></button>
                      <button onClick={() => setAdjustModal({ open: true, type: "remove", item })} className="text-red-600"><ArrowDown size={16} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">SKU: {item.sku || "-"}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">IMEI: {item.imei || "-"}</p>
                  <div className="flex justify-between text-sm text-slate-900 dark:text-slate-100">
                    <span>Cost: ₦{item.cost_price.toLocaleString()}</span>
                    <span>Price: ₦{item.sales_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => { setModalOpen(false); setEditingItem(null) }}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{editingItem ? "Edit Product" : "Add Product"}</h2>
              <div className="space-y-3">
                <input placeholder="Product Name" value={newItem.product_name} onChange={e => setNewItem({ ...newItem, product_name: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black" />
                <input placeholder="SKU" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black" />
                <input placeholder="IMEI" value={newItem.imei} onChange={e => setNewItem({ ...newItem, imei: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black" />
                <input placeholder="Quantity" type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black" />
                <input placeholder="Cost Price" type="number" value={newItem.cost_price} onChange={e => setNewItem({ ...newItem, cost_price: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black" />
                <input placeholder="Sales Price" type="number" value={newItem.sales_price} onChange={e => setNewItem({ ...newItem, sales_price: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black" />

                <button onClick={handleSaveProduct} disabled={saving} className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition mt-2">
                  {saving ? "Saving..." : editingItem ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {adjustModal.open && adjustModal.item && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <button
                onClick={() => setAdjustModal({ open: false, type: "add", item: null })}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {adjustModal.type === "add" ? "Add Stock" : "Remove Stock"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {adjustModal.item.product_name} - Current Qty: {adjustModal.item.quantity}
              </p>
              <input type="number" placeholder="Enter quantity" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black mb-4" />
              <button onClick={handleAdjustStock} className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition">
                {adjustModal.type === "add" ? "Add Stock" : "Remove Stock"}
              </button>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}
