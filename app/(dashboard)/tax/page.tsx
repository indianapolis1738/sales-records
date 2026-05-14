"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { ArrowLeft, Download, TrendingUp, DollarSign, AlertCircle, Receipt } from "lucide-react"
import Skeleton from "@/components/Skeleton"

type Expense = {
  id: string
  date: string
  description: string
  category?: string
  amount: number
}

export default function TaxDashboard() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"tax" | "expenses">("tax")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({ description: "", category: "", amount: "" })
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    totalCost: 0,
    totalExpenses: 0,
    netProfit: 0,
    taxRate: 0,
    taxOwed: 0,
    cit: 0,
    developmentLevy: 0
  })
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month")
  const [savingExpense, setSavingExpense] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let startDate = new Date()
      if (period === "month") startDate.setDate(1)
      if (period === "quarter") startDate.setMonth(Math.floor(startDate.getMonth() / 3) * 3, 1)
      if (period === "year") startDate.setMonth(0, 1)
      const start = startDate.toISOString()

      const { data: sales } = await supabase
        .from("sales")
        .select("total_profit, total_amount")
        .eq("user_id", user.id)
        .gte("date", start)

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)

      setExpenses(expensesData || [])

      const totalSales = sales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0
      const totalCost = sales?.reduce((acc, s) => acc + Number(s.total_amount - s.total_profit), 0) || 0
      const totalProfit = sales?.reduce((acc, s) => acc + Number(s.total_profit), 0) || 0
      const totalExpenses = expensesData?.reduce((acc, e) => acc + Number(e.amount), 0) || 0
      const assessableProfit = totalProfit - totalExpenses

      // Small Company Check
      const smallCompany = totalSales <= 50_000_000 && totalCost + totalExpenses <= 250_000_000

      // CIT
      const citRate = smallCompany ? 0 : 0.30
      const cit = assessableProfit > 0 ? assessableProfit * citRate : 0

      // Development Levy
      const developmentLevy = assessableProfit > 0 ? assessableProfit * 0.04 : 0

      // Total Tax
      let totalTax = cit + developmentLevy

      // Minimum Effective Tax
      const minimumTax = assessableProfit * 0.15
      if (!smallCompany && totalSales >= 20_000_000_000 && totalTax < minimumTax + developmentLevy) {
        totalTax = minimumTax + developmentLevy
      }

      setStats({
        totalSales,
        totalCost,
        totalExpenses,
        netProfit: assessableProfit,
        taxRate: citRate,
        taxOwed: totalTax,
        cit,
        developmentLevy
      })
      setLoading(false)
    }

    fetchData()
  }, [period, savingExpense])

  const handleAddExpense = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    if (!newExpense.description.trim() || !newExpense.amount) {
      alert("Please fill in all fields")
      return
    }

    setSavingExpense(true)

    await supabase.from("expenses").insert([{
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      description: newExpense.description,
      category: newExpense.category,
      amount: Number(newExpense.amount)
    }])

    setNewExpense({ description: "", category: "", amount: "" })
    setSavingExpense(false)
  }

  const handleExport = () => {
    let csv = "Type,Date,Description,Category,Amount\n"
    expenses.forEach(e => {
      csv += `Expense,${e.date},${e.description},${e.category || "-"},${e.amount}\n`
    })
    csv += `Stat,,Total Sales,,${stats.totalSales}\n`
    csv += `Stat,,Total Cost,,${stats.totalCost}\n`
    csv += `Stat,,Total Expenses,,${stats.totalExpenses}\n`
    csv += `Stat,,Assessable Profit,,${stats.netProfit}\n`
    csv += `Stat,,CIT (Company Income Tax),,${stats.cit}\n`
    csv += `Stat,,Development Levy,,${stats.developmentLevy}\n`
    csv += `Stat,,Total Tax Owed,,${stats.taxOwed}\n`

    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `tax_report_${period}.csv`
    link.click()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-10 w-1/3 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-10 w-1/4 rounded-lg" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Tax Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Track your tax obligations and expenses
              </p>
            </div>

            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-neutral-700">
            <TabButton
              active={tab === "tax"}
              onClick={() => setTab("tax")}
              icon={<TrendingUp size={16} />}
            >
              Tax Calculation
            </TabButton>
            <TabButton
              active={tab === "expenses"}
              onClick={() => setTab("expenses")}
              icon={<Receipt size={16} />}
            >
              Expenses
            </TabButton>
          </div>

          {tab === "tax" && (
            <div className="space-y-6">
              {/* Period Selector */}
              <div className="flex flex-wrap gap-2">
                {(["month", "quarter", "year"] as const).map(p => (
                  <PeriodButton
                    key={p}
                    active={period === p}
                    onClick={() => setPeriod(p)}
                  >
                    {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
                  </PeriodButton>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Total Sales"
                  value={`₦${stats.totalSales.toLocaleString()}`}
                  icon={<DollarSign size={20} />}
                  color="blue"
                />
                <StatCard
                  title="Total Cost"
                  value={`₦${stats.totalCost.toLocaleString()}`}
                  icon={<DollarSign size={20} />}
                  color="amber"
                />
                <StatCard
                  title="Total Expenses"
                  value={`₦${stats.totalExpenses.toLocaleString()}`}
                  icon={<Receipt size={20} />}
                  color="orange"
                />
                <StatCard
                  title="Assessable Profit"
                  value={`₦${stats.netProfit.toLocaleString()}`}
                  icon={<TrendingUp size={20} />}
                  color="green"
                  highlight
                />
                <StatCard
                  title="CIT (30%)"
                  value={`₦${stats.cit.toLocaleString()}`}
                  icon={<AlertCircle size={20} />}
                  color="red"
                />
                <StatCard
                  title="Development Levy (4%)"
                  value={`₦${stats.developmentLevy.toLocaleString()}`}
                  icon={<AlertCircle size={20} />}
                  color="red"
                />
                <div className="sm:col-span-2 lg:col-span-3">
                  <StatCard
                    title="Total Tax Owed"
                    value={`₦${stats.taxOwed.toLocaleString()}`}
                    icon={<AlertCircle size={20} />}
                    color="red"
                    highlight
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Tax Calculation Info
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This dashboard calculates tax based on Nigerian tax regulations. CIT rate is 30% for non-small companies, plus 4% development levy. Always consult with a tax professional for accurate tax planning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "expenses" && (
            <div className="space-y-6">
              {/* Add Expense Form */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Expense</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Description
                    </label>
                    <input
                      placeholder="e.g. Office supplies"
                      value={newExpense.description}
                      onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Category
                    </label>
                    <input
                      placeholder="e.g. Operations"
                      value={newExpense.category}
                      onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Amount (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>

                  <button
                    onClick={handleAddExpense}
                    disabled={savingExpense || !newExpense.description.trim() || !newExpense.amount}
                    className="col-span-1 sm:col-span-1 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition h-fit"
                  >
                    {savingExpense ? "Saving..." : "Add Expense"}
                  </button>
                </div>
              </div>

              {/* Expenses List */}
              {expenses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
                  <Receipt size={48} className="mx-auto text-slate-300 dark:text-neutral-700 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No expenses yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add your first expense above</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Description</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Category</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-neutral-700">
                        {expenses.map(exp => (
                          <tr
                            key={exp.id}
                            className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition"
                          >
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {new Date(exp.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                              {exp.description}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {exp.category || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right">
                              ₦{Number(exp.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {expenses.map(exp => (
                      <div
                        key={exp.id}
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-4 hover:border-slate-300 dark:hover:border-neutral-700 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                              {exp.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {new Date(exp.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm ml-3 flex-shrink-0">
                            ₦{Number(exp.amount).toLocaleString()}
                          </p>
                        </div>
                        {exp.category && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Category: {exp.category}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">Total Expenses</p>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-300">
                          ₦{expenses.reduce((acc, e) => acc + Number(e.amount), 0).toLocaleString()}
                        </p>
                      </div>
                      <Receipt size={32} className="text-orange-500 dark:text-orange-400" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}

// Components

function StatCard({
  title,
  value,
  icon,
  color,
  highlight
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: "blue" | "amber" | "orange" | "green" | "red"
  highlight?: boolean
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
  }

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 space-y-3 ${colorMap[color]} ${highlight ? "ring-2 ring-offset-2 dark:ring-offset-0" : ""}`}>
      <div className="flex items-center">
        <div className="p-2 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium opacity-80">{title}</p>
        <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  )
}

function TabButton({
  active,
  children,
  icon,
  onClick
}: {
  active: boolean
  children: React.ReactNode
  icon?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
        active
          ? "text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function PeriodButton({
  active,
  children,
  onClick
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
        active
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
          : "bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  )
}
