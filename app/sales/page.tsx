"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import StatusBadge from "@/components/StatusBadge"
import { Plus, Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function Sales() {
  const [sales, setSales] = useState<any[]>([])
  const [exporting, setExporting] = useState(false)

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

  const exportToExcel = () => {
    setExporting(true)

    const formattedData = sales.map((sale) => ({
      Date: sale.date,
      Customer: sale.customer,
      Product: sale.product,
      "Cost Price": Number(sale.cost_price),
      "Sales Price": Number(sale.sales_price),
      Profit: Number(sale.sales_price) - Number(sale.cost_price),
      Status: sale.status,
      Outstanding: Number(sale.outstanding),
      "Created At": new Date(sale.created_at).toLocaleString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales")

    XLSX.writeFile(workbook, "sales-records.xlsx")

    setExporting(false)
  }

  return (
    <div className="max-w-7xl mx-auto md:px-4 sm:px-2 py-6 space-y-6 text-gray-900 dark:text-gray-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Sales Records
        </h2>

        <div className="flex gap-2">
          <button
        onClick={exportToExcel}
        disabled={exporting || sales.length === 0}
        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
        <Download size={16} />
        {exporting ? "Exporting..." : "Export"}
          </button>

          <a
        href="/sales/new"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm hover:bg-gray-700 dark:hover:bg-gray-200 transition"
          >
        <Plus size={16} />
        Add Sale
          </a>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Customer</th>
              <th className="py-3 px-4 text-left">Product</th>
              <th className="py-3 px-4 text-left">Sales</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Outstanding</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => window.location.href = `/sales/${sale.id}/info`}
              >
                <td className="py-3 px-4">{sale.date}</td>
                <td className="py-3 px-4 font-medium">{sale.customer}</td>
                <td className="py-3 px-4">{sale.product}</td>
                <td className="py-3 px-4 font-medium">
                  ₦{Number(sale.sales_price).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={sale.status} />
                </td>
                <td className="py-3 px-4">
                  ₦{Number(sale.outstanding).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/sales/${sale.id}`
                    }}
                    className="text-sm underline hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-600 dark:text-gray-400">
                  No sales yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-4 px-4">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2 hover:shadow-md transition"
            onClick={() => window.location.href = `/sales/${sale.id}/info`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{sale.customer}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{sale.product}</p>
              </div>
              <StatusBadge status={sale.status} />
            </div>

            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>{sale.date}</span>
              <span className="font-medium">
                ₦{Number(sale.sales_price).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {sales.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-16">
            No sales yet.
          </div>
        )}
      </div>
    </div>
  )
}
