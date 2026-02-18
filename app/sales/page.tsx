"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import StatusBadge from "@/components/StatusBadge"
import { Plus, Download, ChevronDown, TrendingUp, TrendingDown, DollarSign, Filter } from "lucide-react"
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
        .select("*")
        .order("date", { ascending: false })

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount, date")

      const allSales = salesData || []
      const allExpenses = expensesData || []

      setSales(allSales)

      // Extract years dynamically from sales data
      const yearsFromSales = Array.from(
        new Set(allSales.map((s) => new Date(s.date).getFullYear()))
      ).sort((a, b) => b - a)
      setAvailableYears(yearsFromSales)

      // Filter sales by month/year
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
        (sum, s) => sum + Number(s.total_amount || 0),
        0
      )

      const gainBeforeExpenses = filteredSales.reduce(
        (sum, s) => sum + (Number(s.total_profit || 0)),
        0
      )

      const expenseTotal = filteredExpenses.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
      )

      setMonthlySales(salesTotal)
      setMonthlyGain(gainBeforeExpenses)

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
        (sum, s) => sum + Number(s.total_amount || 0),
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
      Customer: sale.customer_name,
      "Total Amount": Number(sale.total_amount),
      "Total Profit": Number(sale.total_profit),
      Status: sale.status,
      Outstanding: Number(sale.outstanding),
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales")
    XLSX.writeFile(
      workbook,
      `sales-${selectedMonth === "all" ? "all" : MONTHS[selectedMonth]}-${selectedYear}.xlsx`
    )

    setExporting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-1/3 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Sales
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {selectedMonth === "all" || selectedYear === "all"
                ? "All time sales"
                : `${MONTHS[selectedMonth]} ${selectedYear}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportToExcel}
              disabled={exporting || filteredSales.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Download size={18} />
              <span className="hidden sm:inline">{exporting ? "Exporting..." : "Export"}</span>
              <span className="sm:hidden">{exporting ? "..." : "Export"}</span>
            </button>

            <a
              href="/sales/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Sale</span>
              <span className="sm:hidden">Add</span>
            </a>
          </div>
        </div>

        {/* Filter Button & Month Selector */}
        <div className="relative w-full sm:w-fit">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 w-full sm:w-auto border border-slate-300 dark:border-neutral-700 rounded-lg text-sm font-semibold bg-white dark:bg-neutral-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
          >
            <Filter size={18} />
            {selectedMonth === "all" || selectedYear === "all"
              ? "All Sales"
              : `${MONTHS[selectedMonth]} ${selectedYear}`}
            <ChevronDown size={16} className={`ml-auto sm:ml-2 transition ${openDropdown ? "rotate-180" : ""}`} />
          </button>

          {openDropdown && (
            <div className="absolute z-20 mt-2 w-full sm:w-80 max-h-96 overflow-y-auto bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl shadow-lg p-4 space-y-4">
              <button
                onClick={() => {
                  setSelectedMonth("all")
                  setSelectedYear("all")
                  setOpenDropdown(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition ${
                  selectedMonth === "all" && selectedYear === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-neutral-700"
                }`}
              >
                All Sales
              </button>

              {availableYears.map((y) => (
                <div key={y} className="space-y-3">
                  <p className="px-2 py-1 font-bold text-slate-900 dark:text-white text-sm">{y}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {MONTHS.map((m, i) => (
                      <button
                        key={m + y}
                        onClick={() => {
                          setSelectedMonth(i)
                          setSelectedYear(y)
                          setOpenDropdown(false)
                        }}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                          selectedMonth === i && selectedYear === y
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-neutral-700"
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Sales"
            value={monthlySales}
            icon={<DollarSign size={24} />}
            color="blue"
          />
          <StatCard
            label="Total Profit"
            value={monthlyGain}
            icon={<TrendingUp size={24} />}
            color="green"
          />
          <div className="hidden lg:block">
          <StatCard
            label="vs Last Month"
            value={monthComparison}
            percentage
            disabled={selectedMonth === "all" || selectedYear === "all"}
            icon={monthComparison >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            color={monthComparison >= 0 ? "green" : "red"}
          />
          </div>
        </div>

        {/* Sales Table/List */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Profit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Outstanding</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-700">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-600 dark:text-slate-400">
                      <DollarSign size={48} className="mx-auto text-slate-300 dark:text-neutral-700 mb-3" />
                      <p className="font-medium">No sales for this period</p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(sale.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {sale.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        ₦{Number(sale.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        ₦{Number(sale.total_profit).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        ₦{Number(sale.outstanding || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/sales/${sale.id}`}
                          className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="lg:hidden divide-y divide-slate-200 dark:divide-neutral-700">
            {filteredSales.length === 0 ? (
              <div className="py-12 text-center px-4">
                <DollarSign size={40} className="mx-auto text-slate-300 dark:text-neutral-700 mb-3" />
                <p className="font-medium text-slate-600 dark:text-slate-400">No sales for this period</p>
              </div>
            ) : (
              filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition cursor-pointer"
                  onClick={() => window.location.href = `/sales/${sale.id}/info`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {sale.customer_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {new Date(sale.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <StatusBadge status={sale.status} />
                  </div>

                  <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-neutral-700">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Amount</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        ₦{Number(sale.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Profit</p>
                      <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
                        ₦{Number(sale.total_profit).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Outstanding</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        ₦{Number(sale.outstanding || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/sales/${sale.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    Edit Sale →
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Floating Action Button - Mobile */}
      <a
        href="/sales/new"
        className="fixed bottom-6 right-4 lg:hidden w-14 h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg hover:shadow-xl transition active:scale-95 z-40"
      >
        <Plus size={24} />
      </a>
    </div>
  )
}

function StatCard({
  label,
  value,
  percentage,
  disabled,
  icon,
  color,
}: {
  label: string
  value: number
  percentage?: boolean
  disabled?: boolean
  icon: React.ReactNode
  color: "blue" | "green" | "red"
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
  }

  return (
    <div className={`rounded-xl border p-4 sm:p-6 space-y-3 ${colorMap[color]}`}>
      <div className="flex items-center">
        <div className="p-2 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium opacity-80">{label}</p>
        <p className={`text-md md:text-3xl font-bold mt-1 ${disabled ? "opacity-50" : ""}`}>
          {percentage
            ? `${value.toFixed(1)}%`
            : `₦${value.toLocaleString()}`
          }
        </p>
      </div>
    </div>
  )
}
