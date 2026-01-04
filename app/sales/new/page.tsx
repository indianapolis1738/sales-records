"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function AddSale() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: "",
    customer: "",
    product: "",
    cost_price: "",
    sales_price: "",
    status: "Unpaid",
    outstanding: "",
    serial_number: "",
    imei: ""
  })

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("sales").insert([
      { ...form, user_id: user.id }
    ])

    setLoading(false)
    if (!error) router.push("/")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Sale</h1>
          <p className="text-sm text-gray-500">Fill in the sale details</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />
            <input
              placeholder="Customer"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />
            <input
              placeholder="Product"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />
            <input
              placeholder="Cost Price"
              type="number"
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />
            <input
              placeholder="Sales Price"
              type="number"
              value={form.sales_price}
              onChange={(e) => setForm({ ...form, sales_price: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />
            <input
              placeholder="Outstanding Amount"
              type="number"
              value={form.outstanding}
              onChange={(e) => setForm({ ...form, outstanding: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />

            {/* New fields */}
            <input
              placeholder="Device Serial Number (S/N)"
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />
            <input
              placeholder="Device IMEI"
              value={form.imei}
              onChange={(e) => setForm({ ...form, imei: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Sale"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
