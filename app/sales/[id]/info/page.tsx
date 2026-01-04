"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"

export default function SaleInfo() {
  const { id } = useParams()
  const router = useRouter()
  const [sale, setSale] = useState<any>(null)

  useEffect(() => {
    const fetchSale = async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id)
        .single()

      if (!error) setSale(data)
    }

    fetchSale()
  }, [id])

  if (!sale) return null

  const profit = Number(sale.sales_price) - Number(sale.cost_price)

  const markAsPaid = async () => {
    await supabase
      .from("sales")
      .update({ status: "Paid", outstanding: 0 })
      .eq("id", sale.id)

    setSale({ ...sale, status: "Paid", outstanding: 0 })
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-2 rounded-2xl shadow-sm space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-50">
          Sale Information
        </h2>

        {/* Sale Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Date" value={sale.date} />
          <InfoRow label="Customer" value={sale.customer} />
          <InfoRow label="Product" value={sale.product} />
          <InfoRow
            label="Cost Price"
            value={`₦${Number(sale.cost_price).toLocaleString()}`}
          />
          <InfoRow
            label="Sales Price"
            value={`₦${Number(sale.sales_price).toLocaleString()}`}
          />
          <InfoRow label="Profit" value={`₦${profit.toLocaleString()}`} />
          <InfoRow label="Status" value={<StatusBadge status={sale.status} />} />
          <InfoRow
            label="Outstanding"
            value={`₦${Number(sale.outstanding).toLocaleString()}`}
          />
          <InfoRow
            label="Created At"
            value={new Date(sale.created_at).toLocaleString()}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => router.push(`/sales/${sale.id}/edit`)}
            className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-900 hover:bg-slate-50 transition"
          >
            Edit
          </button>

          {sale.status !== "Paid" && (
            <button
              onClick={markAsPaid}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
            >
              Mark as Paid
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="text-sm underline text-slate-600 hover:text-slate-900 ml-auto"
          >
            Back
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function InfoRow({
  label,
  value
}: {
  label: string
  value: any
}) {
  return (
    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
