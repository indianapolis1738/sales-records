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
    status: "Paid",
    outstanding: ""
  })

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async () => {
    if (!form.date || !form.customer || !form.product || !form.sales_price) {
      alert("Please fill all required fields")
      return
    }

    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Not authenticated")
      setLoading(false)
      return
    }

    const outstanding =
      form.status === "Paid"
        ? 0
        : form.status === "Unpaid"
        ? Number(form.sales_price)
        : Number(form.outstanding || 0)

    const { error } = await supabase.from("sales").insert({
      user_id: user.id,
      date: form.date,
      customer: form.customer,
      product: form.product,
      cost_price: Number(form.cost_price || 0),
      sales_price: Number(form.sales_price),
      status: form.status,
      outstanding
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push("/sales")
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-6 text-slate-900">
          Add New Sale
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <input
            type="date"
            className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />

          <input
            placeholder="Customer"
            className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={form.customer}
            onChange={(e) => handleChange("customer", e.target.value)}
          />

          <input
            placeholder="Product"
            className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={form.product}
            onChange={(e) => handleChange("product", e.target.value)}
          />

          <input
            type="number"
            placeholder="Cost Price"
            className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={form.cost_price}
            onChange={(e) => handleChange("cost_price", e.target.value)}
          />

          <input
            type="number"
            placeholder="Sales Price"
            className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={form.sales_price}
            onChange={(e) => handleChange("sales_price", e.target.value)}
          />

          <select
            className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="Paid">Paid</option>
            <option value="Part Payment">Part Payment</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          {form.status === "Part Payment" && (
            <input
              type="number"
              placeholder="Outstanding"
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:col-span-2"
              value={form.outstanding}
              onChange={(e) => handleChange("outstanding", e.target.value)}
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto border border-slate-300 rounded-md px-4 py-2 text-sm text-slate-900 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-slate-900 text-white rounded-md px-4 py-2 text-sm disabled:opacity-50 hover:bg-black transition"
          >
            {loading ? "Saving..." : "Save Sale"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
