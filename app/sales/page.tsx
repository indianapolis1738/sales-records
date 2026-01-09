"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import StatusBadge from "@/components/StatusBadge"
import { Plus, Download, ChevronDown } from "lucide-react"
import * as XLSX from "xlsx"
import Skeleton from "@/components/Skeleton"

export default function Sales() {
  const [sales, setSales] = useState<any[]>([])
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)

  const [monthlySales, setMonthlySales] = useState(0)
  const [monthlyGain, setMonthlyGain] = useState(0)
  const [monthComparison, setMonthComparison] = useState(0)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(now.getMonth())
  const [selectedYear, setSelectedYear] = useState<number | "all">(now.getFullYear())
  const [openDropdown, setOpenDropdown] = useState(false)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      const { data: salesData } = await supabase
        .from("sales")
        .select("*, date")
        .order("date", { ascending: false })

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount, date")

      const allSales = salesData || []
      const allExpenses = expensesData || []

      setSales(allSales)

      // 🔹 Extract years dynamically from sales data
      const yearsFromSales = Array.from(
        new Set(allSales.map((s) => new Date(s.date).getFullYear()))
      ).sort((a, b) => b - a)
      setAvailableYears(yearsFromSales)

      // 🔹 Filter sales by month/year
      const filteredSales =
        selectedMonth === "all" || selectedYear === "all"
          ? allSales
          : allSales.filter((sale) => {
              const d = new Date(sale.date)
              return (
                d.getMonth() === selectedMonth &&
                d.getFullYear() === selectedYear
              )
            })

      const filteredExpenses =
        selectedMonth === "all" || selectedYear === "all"
          ? allExpenses
          : allExpenses.filter((exp) => {
              const d = new Date(exp.date)
              return (
                d.getMonth() === selectedMonth &&
                d.getFullYear() === selectedYear
              )
            })

      const salesTotal = filteredSales.reduce(
        (sum, s) => sum + Number(s.sales_price || 0),
        0
      )

      const gainBeforeExpenses = filteredSales.reduce(
        (sum, s) =>
          sum + (Number(s.sales_price || 0) - Number(s.cost_price || 0)),
        0
      )

      const expenseTotal = filteredExpenses.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
      )

      setMonthlySales(salesTotal)
      setMonthlyGain(gainBeforeExpenses - expenseTotal)

      if (selectedMonth === "all" || selectedYear === "all") {
        setMonthComparison(0)
        setLoading(false)
        return
      }

      const lastMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
      const lastMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear

      const lastMonthSales = allSales.filter((sale) => {
        const d = new Date(sale.date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })

      const lastMonthTotal = lastMonthSales.reduce(
        (sum, s) => sum + Number(s.sales_price || 0),
        0
      )

      const percentageChange =
        lastMonthTotal === 0
          ? 100
          : ((salesTotal - lastMonthTotal) / lastMonthTotal) * 100

      setMonthComparison(percentageChange)
      setLoading(false)
    }

    fetchSales()
  }, [selectedMonth, selectedYear])

  const filteredSales =
    selectedMonth === "all" || selectedYear === "all"
      ? sales
      : sales.filter((sale) => {
          const d = new Date(sale.date)
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
        })

  const exportToExcel = () => {
    setExporting(true)

    const formattedData = filteredSales.map((sale) => ({
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500 dark:text-gray-400">
        <Skeleton/>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="md:flex justify-between items-center px-4">
        <h2 className="text-2xl font-bold">
          Sales —{" "}
          {selectedMonth === "all" || selectedYear === "all"
            ? "All Time"
            : `${MONTHS[selectedMonth]} ${selectedYear}`}
        </h2>

        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={exportToExcel}
            disabled={exporting || filteredSales.length === 0}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export"}
          </button>

          <a
            href="/sales/new"
            className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            <Plus size={16} />
            Add Sale
          </a>
        </div>
      </div>

      {/* Month + Year Selector */}
      <div className="relative px-4 w-fit">
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        >
          {selectedMonth === "all" || selectedYear === "all"
            ? "All Sales"
            : `${MONTHS[selectedMonth]} ${selectedYear}`}
          <ChevronDown size={16} />
        </button>

        {openDropdown && (
          <div className="absolute z-10 mt-2 w-56 max-h-80 overflow-y-auto bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-2 space-y-2">
            <button
              onClick={() => {
                setSelectedMonth("all")
                setSelectedYear("all")
                setOpenDropdown(false)
              }}
              className={`w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 ${
                selectedMonth === "all" && selectedYear === "all"
                  ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                  : ""
              }`}
            >
              All Sales
            </button>

            {availableYears.map((y) => (
              <div key={y} className="space-y-1">
                <p className="px-4 py-1 font-medium text-gray-600 dark:text-gray-400">{y}</p>
                <div className="flex flex-wrap gap-1 px-2">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m + y}
                      onClick={() => {
                        setSelectedMonth(i)
                        setSelectedYear(y)
                        setOpenDropdown(false)
                      }}
                      className={`px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        selectedMonth === i && selectedYear === y
                          ? "bg-black text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {/* Desktop */}
        <Stat label="Sales" value={monthlySales} />
        <Stat label="Net Gain" value={monthlyGain} />
        <Stat
          label="Compared to last month"
          value={monthComparison}
          percentage
          disabled={selectedMonth === "all" || selectedYear === "all"}
        />
      </div>

      {/* Mobile Stats */}
      <div className="md:hidden grid grid-cols-2 gap-2 px-4">
        <div className="rounded-xl border p-2 bg-gray-50 dark:bg-gray-900 text-xs">
          <p className="text-gray-500 dark:text-gray-400">Amount Sold</p>
          <p className="font-semibold text-sm">₦{monthlySales.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-2 bg-gray-50 dark:bg-gray-900 text-xs">
          <p className="text-gray-500 dark:text-gray-400">Profit</p>
          <p className="font-semibold text-sm">₦{monthlyGain.toLocaleString()}</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900 mx-4">
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
            {filteredSales.map((sale) => (
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
                  ₦{Number(sale.outstanding || 0).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/sales/${sale.id}`
                    }}
                    className="text-sm underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-600 dark:text-gray-400">
                  No sales for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-4 px-4">
        {filteredSales.map((sale) => (
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

        {filteredSales.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-16">
            No sales for this period.
          </div>
        )}
      </div>
    </div>
  )
}

/* 🔹 SMALL STAT COMPONENT */
function Stat({ label, value, percentage, disabled }: any) {
  return (
    <div className="rounded-xl border p-4 bg-gray-50 dark:bg-gray-900">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-xl font-semibold ${
          disabled
            ? "text-gray-400"
            : value >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {percentage ? `${value.toFixed(1)}%` : `₦${value.toLocaleString()}`}
      </p>
    </div>
  )
}
