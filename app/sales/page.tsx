"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import StatusBadge from "@/components/StatusBadge"
import { Plus } from "lucide-react"

export default function Sales() {
  const [sales, setSales] = useState<any[]>([])

  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false })

      setSales(data || [])
    }

    fetchSales()
  }, [])

  return (
    <div className="max-w-7xl mx-auto md:px-4 sm:px-1 py-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-50">
          Sales Records
        </h2>
        <a
          href="/sales/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-slate-900 transition"
        >
          <Plus size={16} />
          Add Sale
        </a>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm table-fixed">
          <thead className="text-slate-600">
            <tr>
              <th className="py-3 px-4 font-medium text-left">Date</th>
              <th className="py-3 px-4 font-medium text-left">Customer</th>
              <th className="py-3 px-4 font-medium text-left">Product</th>
              <th className="py-3 px-4 font-medium text-left">Sales</th>
              <th className="py-3 px-4 font-medium text-left">Status</th>
              <th className="py-3 px-4 font-medium text-left">Outstanding</th>
              <th className="py-3 px-4 font-medium text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="border-t border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                onClick={() => window.location.href = `/sales/${sale.id}`}
              >
                <td className="py-3 px-4 text-slate-700">{sale.date}</td>
                <td className="py-3 px-4 font-medium text-slate-900">{sale.customer}</td>
                <td className="py-3 px-4 text-slate-700">{sale.product}</td>
                <td className="py-3 px-4 font-medium text-slate-900">₦{Number(sale.sales_price).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={sale.status} />
                </td>
                <td className="py-3 px-4 text-slate-900">₦{Number(sale.outstanding).toLocaleString()}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/sales/${sale.id}`
                    }}
                    className="text-sm underline text-slate-700 hover:text-slate-900 transition"
                  >
                    Edit
                  </button>

                  {sale.status !== "Paid" && (
                    <button
                      className="text-sm text-green-600 underline"
                      onClick={async (e) => {
                        e.stopPropagation()
                        await supabase
                          .from("sales")
                          .update({
                            status: "Paid",
                            outstanding: 0
                          })
                          .eq("id", sale.id)
                        location.reload()
                      }}
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-600">
                  No sales yet. <a href="/sales/new" className="underline">Add your first sale</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-4">
        {sales.length === 0 && (
          <div className="py-16 text-center text-slate-600">
            No sales yet. <a href="/sales/new" className="underline">Add your first sale</a>
          </div>
        )}

        {sales.map((sale) => (
          <div
            key={sale.id}
            onClick={() => window.location.href = `/sales/${sale.id}`}
            className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 cursor-pointer hover:bg-slate-50 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-900">{sale.customer}</p>
                <p className="text-sm text-slate-600">{sale.product}</p>
              </div>
              <StatusBadge status={sale.status} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{sale.date}</span>
              <span className="font-medium text-slate-900">₦{Number(sale.sales_price).toLocaleString()}</span>
            </div>

            {sale.status !== "Paid" && (
              <div className="flex justify-end gap-2">
                <button
                  className="text-sm text-green-600 underline"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await supabase
                      .from("sales")
                      .update({ status: "Paid", outstanding: 0 })
                      .eq("id", sale.id)
                    location.reload()
                  }}
                >
                  Mark as Paid
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
