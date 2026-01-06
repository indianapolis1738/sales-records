"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CustomerProfilePage() {
  const { id } = useParams()
  const router = useRouter()

  const [customer, setCustomer] = useState<any>(null)
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomer()
    fetchSales()
  }, [])

  const fetchCustomer = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single()

    setCustomer(data)
  }

  const fetchSales = async () => {
    const { data } = await supabase
      .from("sales")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })

    setSales(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="p-4 text-slate-500">Loading...</div>
  }

  const totalSales = sales.reduce(
    (sum, s) => sum + Number(s.sales_price || 0),
    0
  )
  const totalPaid = sales.reduce(
    (sum, s) => sum + (Number(s.sales_price || 0) - Number(s.outstanding || 0)),
    0
  )
  const outstanding = sales.reduce(
    (sum, s) => sum + Number(s.outstanding || 0),
    0
  )

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500"
        >
          ← Back
        </button>
        <div>
          <h1 className="font-semibold text-lg text-slate-900 dark:text-white">
            {customer.full_name}
          </h1>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {customer.status}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3 border dark:border-slate-800">
        <InfoRow label="Phone" value={customer.phone_number || "-"} />
        <InfoRow label="Email" value={customer.email || "-"} />
        <InfoRow label="Notes" value={customer.notes || "-"} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryCard label="Total Sales" value={`₦${totalSales.toLocaleString()}`} />
        <SummaryCard label="Paid" value={`₦${totalPaid.toLocaleString()}`} />
        <SummaryCard label="Outstanding" value={`₦${outstanding.toLocaleString()}`} />
      </div>

      {/* Sales */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-300">
          Sales History
        </h2>

        {sales.length === 0 && (
          <p className="text-sm text-slate-500">No sales yet.</p>
        )}

        {sales.map((sale) => {
          const paidAmount =
            Number(sale.sales_price || 0) - Number(sale.outstanding || 0)

          return (
            <div
              key={sale.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-3 border dark:border-slate-800 space-y-2"
            >
              {/* Date & Amount */}
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  {new Date(sale.created_at).toLocaleDateString()}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₦{Number(sale.sales_price).toLocaleString()}
                </span>
              </div>

              {/* Product */}
              <p className="text-xs text-slate-500">
                {sale.product} × {sale.quantity_sold}
              </p>

              {/* Payment Status */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Paid: ₦{paidAmount.toLocaleString()}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full
                    ${
                      sale.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : sale.status === "Part Payment"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {sale.status}
                </span>
              </div>

              {/* Outstanding */}
              {sale.outstanding > 0 && (
                <p className="text-xs text-red-500">
                  Outstanding: ₦{Number(sale.outstanding).toLocaleString()}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* Reusable Components */

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-900 dark:text-white text-sm font-medium">
        {value}
      </span>
    </div>
  )
}

function SummaryCard({ label, value }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border dark:border-slate-800">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
