"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { ArrowLeft, Download } from "lucide-react"
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
        .select("cost_price, sales_price")
        .eq("user_id", user.id)
        .gte("date", start)

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)

      setExpenses(expensesData || [])

      const totalSales = sales?.reduce((acc, s) => acc + Number(s.sales_price), 0) || 0
      const totalCost = sales?.reduce((acc, s) => acc + Number(s.cost_price), 0) || 0
      const totalExpenses = expensesData?.reduce((acc, e) => acc + Number(e.amount), 0) || 0
      const assessableProfit = totalSales - totalCost - totalExpenses

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
    setSavingExpense(true)

    await supabase.from("expenses").insert([{
      user_id: user.id,
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
    link.download = "tax_report.csv"
    link.click()
  }

  if (loading) return (
    <ProtectedRoute>
      <Skeleton className="h-6 w-1/3 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      <div className="mt-10">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-700">

        {/* Back & Export */}
        <div className="flex justify-between items-center">
          <button onClick={() => history.back()} className="flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1 bg-black dark:bg-gray-200 dark:text-black text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-300 transition text-sm">
            <Download size={16} /> Export Report
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tax Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-300 dark:border-neutral-700 mb-4">
          <TabButton active={tab === "tax"} onClick={() => setTab("tax")}>Tax Calculation</TabButton>
          <TabButton active={tab === "expenses"} onClick={() => setTab("expenses")}>Expenses</TabButton>
        </div>

        {tab === "tax" && (
          <>
            <div className="flex gap-2 text-sm mb-4">
              {["month", "quarter", "year"].map(p => (
                <PeriodButton key={p} active={period === p} onClick={() => setPeriod(p as any)}>
                  {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
                </PeriodButton>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <StatCard title="Total Sales" value={`₦${stats.totalSales.toLocaleString()}`} />
              <StatCard title="Total Cost" value={`₦${stats.totalCost.toLocaleString()}`} />
              <StatCard title="Total Expenses" value={`₦${stats.totalExpenses.toLocaleString()}`} />
              <StatCard title="Assessable Profit" value={`₦${stats.netProfit.toLocaleString()}`} />
              <StatCard title="CIT (Company Income Tax)" value={`₦${stats.cit.toLocaleString()}`} />
              <StatCard title="Development Levy (4%)" value={`₦${stats.developmentLevy.toLocaleString()}`} />
              <StatCard title="Total Tax Owed" value={`₦${stats.taxOwed.toLocaleString()}`} />
            </div>
          </>
        )}

        {tab === "expenses" && (
          <div className="space-y-6">
            {/* Add Expense */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
              <Input placeholder="Category" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} />
              <Input placeholder="Amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
              <button onClick={handleAddExpense} disabled={savingExpense} className="sm:col-span-3 bg-black dark:bg-gray-200 dark:text-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-300 transition">
                {savingExpense ? "Saving..." : "Add Expense"}
              </button>
            </div>

            {/* Expenses List */}
            <div className="hidden sm:block overflow-x-auto border border-gray-300 dark:border-neutral-700 rounded-xl">
              <table className="w-full text-sm table-fixed border-collapse">
                <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-left">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id} className="border-t border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                      <td className="py-2 px-3">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3">{exp.description}</td>
                      <td className="py-2 px-3">{exp.category || "-"}</td>
                      <td className="py-2 px-3 text-right">₦{Number(exp.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile-friendly Expenses */}
            <div className="sm:hidden space-y-4">
              {expenses.map(exp => (
                <div key={exp.id} className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{exp.description}</span>
                    <span className="text-gray-900 dark:text-gray-100">₦{Number(exp.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{exp.category || "-"}</span>
                    <span>{new Date(exp.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

// ---------------- Components ---------------- //

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl flex flex-col transition">
      <span className="text-gray-500 dark:text-gray-400 text-sm">{title}</span>
      <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{value}</span>
    </div>
  )
}

function TabButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      className={`
        px-3 py-1 rounded-t-lg font-medium text-sm transition
        ${active
          ? "bg-white dark:bg-neutral-900 border border-b-0 border-gray-300 dark:border-neutral-700 text-black dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`
      }
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function PeriodButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      className={`px-3 py-1 rounded-lg border text-sm transition 
        ${active
          ? "bg-black text-white border-black hover:bg-gray-800"
          : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"}`
      }
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="border border-gray-300 dark:border-neutral-700 p-2 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-900 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 transition"
    />
  )
}
