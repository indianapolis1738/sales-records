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
    if (!user) {
      setLoading(false)
      return
    }

    const { error } = await supabase.from("sales").insert([
      { ...form, user_id: user.id }
    ])

    setLoading(false)
    if (!error) router.push("/")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 sm:p-10 space-y-8">

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Add New Sale
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Record a new transaction with full details
            </p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <Input
              placeholder="Customer name"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
            />

            <Input
              placeholder="Product"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Cost price"
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Sales price"
              value={form.sales_price}
              onChange={(e) => setForm({ ...form, sales_price: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Outstanding amount"
              value={form.outstanding}
              onChange={(e) => setForm({ ...form, outstanding: e.target.value })}
            />

            {/* Device info */}
            <Input
              placeholder="Device serial number (S/N)"
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
            />

            <Input
              placeholder="Device IMEI"
              value={form.imei}
              onChange={(e) => setForm({ ...form, imei: e.target.value })}
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
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
      </div>
    </ProtectedRoute>
  )
}

/* Reusable Input (Notion-style) */
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
