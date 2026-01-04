"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function EditSale() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    const fetchSale = async () => {
      const { data } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id)
        .single()

      setForm(data)
    }

    fetchSale()
  }, [id])

  if (!form) return null

  const handleUpdate = async () => {
    const outstanding =
      form.status === "Paid"
        ? 0
        : form.status === "Unpaid"
        ? Number(form.sales_price)
        : Number(form.outstanding)

    await supabase
      .from("sales")
      .update({
        ...form,
        outstanding
      })
      .eq("id", id)

    router.push("/sales")
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-slate-900">Edit Sale</h2>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["date","customer","product","cost_price","sales_price","serial_number","imei"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1 capitalize">{field.replace("_", " ")}</label>
              <input
                value={form[field] || ""}
                className="border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-black focus:outline-none"
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
              />
            </div>
          ))}

          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-600 mb-1">Status</label>
            <select
              value={form.status}
              className="border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-black focus:outline-none"
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option>Paid</option>
              <option>Part Payment</option>
              <option>Unpaid</option>
            </select>
          </div>

          {/* Outstanding input for Part Payment */}
          {form.status === "Part Payment" && (
            <div className="flex flex-col sm:col-span-2">
              <label className="text-sm text-slate-600 mb-1">Outstanding</label>
              <input
                value={form.outstanding}
                className="border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-black focus:outline-none"
                onChange={(e) =>
                  setForm({ ...form, outstanding: e.target.value })
                }
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition"
          >
            Update Sale
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
