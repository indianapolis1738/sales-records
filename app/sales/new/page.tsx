"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Plus, X } from "lucide-react"

export default function AddSale() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    sku: "",
    imei: "",
    quantity: "",
    cost_price: "",
    sales_price: ""
  })
  const [savingProduct, setSavingProduct] = useState(false)

  const [form, setForm] = useState({
    date: "",
    customer: "",
    product_id: "",
    product_name: "",
    quantity: "1",
    cost_price: "",
    sales_price: "",
    status: "Unpaid",
    outstanding: "",
    serial_number: "",
    imei: ""
  })

  // Fetch inventory
  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    setInventory(data || [])
  }

  const handleProductSelect = (id: string) => {
    if (!id) return
    const item = inventory.find(i => i.id === id)
    if (!item) return
    setForm({
      ...form,
      product_id: item.id,
      product_name: item.product_name,
      cost_price: item.cost_price.toString(),
      sales_price: item.sales_price.toString(),
      serial_number: item.imei || "",
      imei: item.imei || ""
    })
  }

  const handleAddProduct = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSavingProduct(true)

    await supabase.from("inventory").insert([{
      user_id: user.id,
      product_name: newProduct.product_name,
      sku: newProduct.sku,
      imei: newProduct.imei,
      quantity: Number(newProduct.quantity),
      cost_price: Number(newProduct.cost_price),
      sales_price: Number(newProduct.sales_price)
    }])

    setNewProduct({ product_name: "", sku: "", imei: "", quantity: "", cost_price: "", sales_price: "" })
    setModalOpen(false)
    setSavingProduct(false)
    fetchInventory()
  }

  const handleSubmit = async () => {
    if (!form.product_id) {
      alert("Please select a product.")
      return
    }

    const soldQty = Number(form.quantity)
    const selectedItem = inventory.find(i => i.id === form.product_id)
    if (soldQty > selectedItem.quantity) {
      alert(`Cannot sell more than ${selectedItem.quantity} in stock.`)
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Insert sale
    await supabase.from("sales").insert([{
      user_id: user.id,
      date: form.date,
      customer: form.customer,
      product: form.product_name,
      cost_price: Number(form.cost_price),
      sales_price: Number(form.sales_price),
      status: form.status,
      outstanding: Number(form.outstanding),
      serial_number: form.serial_number,
      imei: form.imei
    }])

    // Update inventory
    await supabase.from("inventory").update({
      quantity: selectedItem.quantity - soldQty
    }).eq("id", selectedItem.id)

    setLoading(false)
    router.push("/")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 sm:p-10 space-y-8">

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Add New Sale
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Record a new transaction from your inventory
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <Input
              placeholder="Customer name"
              value={form.customer}
              onChange={e => setForm({ ...form, customer: e.target.value })}
            />

            {/* Product select + add button */}
            <div className="relative col-span-1 sm:col-span-2">
              <select
                value={form.product_id}
                onChange={e => handleProductSelect(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-neutral-600 transition"
              >
                <option value="">Select Product</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id} className={item.quantity <= 5 ? "text-red-500" : ""}>
                    {item.product_name} ({item.quantity} in stock)
                  </option>
                ))}
              </select>
              <button
                onClick={() => setModalOpen(true)}
                className="absolute top-0 right-0 mt-1 mr-1 inline-flex items-center gap-1 px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-900 transition"
              >
                <Plus size={12}/> Add Product
              </button>
            </div>

            <Input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              min={1}
            />
            <Input
              type="number"
              placeholder="Cost price"
              value={form.cost_price}
              onChange={e => setForm({ ...form, cost_price: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Sales price"
              value={form.sales_price}
              onChange={e => setForm({ ...form, sales_price: e.target.value })}
            />
            <Input
              placeholder="Outstanding amount"
              type="number"
              value={form.outstanding}
              onChange={e => setForm({ ...form, outstanding: e.target.value })}
            />
            <Input
              placeholder="Device serial number (S/N)"
              value={form.serial_number}
              onChange={e => setForm({ ...form, serial_number: e.target.value })}
            />
            <Input
              placeholder="Device IMEI"
              value={form.imei}
              onChange={e => setForm({ ...form, imei: e.target.value })}
            />

            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-neutral-600 transition"
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Sale"}
            </button>
          </div>
        </div>

        {/* Add Product Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add Product</h2>
              <div className="space-y-3">
                <Input placeholder="Product Name" value={newProduct.product_name} onChange={e => setNewProduct({ ...newProduct, product_name: e.target.value })} />
                <Input placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                <Input placeholder="IMEI" value={newProduct.imei} onChange={e => setNewProduct({ ...newProduct, imei: e.target.value })} />
                <Input type="number" placeholder="Quantity" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} />
                <Input type="number" placeholder="Cost Price" value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: e.target.value })} />
                <Input type="number" placeholder="Sales Price" value={newProduct.sales_price} onChange={e => setNewProduct({ ...newProduct, sales_price: e.target.value })} />
                <button
                  onClick={handleAddProduct}
                  disabled={savingProduct}
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition mt-2"
                >
                  {savingProduct ? "Saving..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

/* Reusable Input */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="
        w-full rounded-lg border border-gray-300 dark:border-neutral-700
        bg-white dark:bg-neutral-900
        px-3 py-2 text-sm
        text-gray-900 dark:text-gray-100
        placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-neutral-600
        transition
      "
    />
  )
}
