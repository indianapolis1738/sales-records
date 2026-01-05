"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"
import { Plus, Edit, Save } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    outstanding: 0,
    unpaidCount: 0
  })
  const [goal, setGoal] = useState<number | null>(null)
  const [goalProgress, setGoalProgress] = useState(0)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState("")
  const [goalReached, setGoalReached] = useState(false)

  const [recentSales, setRecentSales] = useState<any[]>([])
  const [profile, setProfile] = useState<{
    full_name: string; business_name?: string; phone_number?: string;
  }>({
    full_name: "",
    business_name: undefined,
    phone_number: undefined
  })
  const [loading, setLoading] = useState(true)
  const [savingGoal, setSavingGoal] = useState(false)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!profileData) {
        window.location.href = "/profile"
        return
      }

      setProfile(profileData)

      const { data: sales } = await supabase
        .from("sales")
        .select("sales_price, cost_price, outstanding, status, date")
        .eq("user_id", user.id)

      if (sales) {
        setStats({
          totalSales: sales.reduce((s, i) => s + Number(i.sales_price), 0),
          totalProfit: sales.reduce(
            (s, i) => s + (Number(i.sales_price) - Number(i.cost_price)),
            0
          ),
          outstanding: sales.reduce((s, i) => s + Number(i.outstanding), 0),
          unpaidCount: sales.filter((s) => s.status !== "Paid").length
        })
      }

      // Fetch goal for current year
      const { data: goalData } = await supabase
        .from("goals")
        .select("sales_goal")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .single()

      if (goalData) {
        setGoal(goalData.sales_goal)
        setGoalInput(goalData.sales_goal.toString())

        const totalYearlySales = sales
          ?.filter((s) => new Date(s.date).getFullYear() === currentYear)
          .reduce((sum, s) => sum + Number(s.sales_price), 0) || 0

        const progress = Math.min((totalYearlySales / goalData.sales_goal) * 100, 100)
        setGoalProgress(progress)
        if (progress >= 100) setGoalReached(true)
      }

      const { data: recent } = await supabase
        .from("sales")
        .select("id, date, customer, product, sales_price, status")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5)

      setRecentSales(recent || [])
      setLoading(false)
    }

    initializeDashboard()
  }, [])

  const handleSaveGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSavingGoal(true)
    const salesGoal = Number(goalInput)

    await supabase.from("goals").upsert([
      { user_id: user.id, year: currentYear, sales_goal: salesGoal }
    ])

    setGoal(salesGoal)

    const totalYearlySales = recentSales
      .filter((s) => new Date(s.date).getFullYear() === currentYear)
      .reduce((sum, s) => sum + Number(s.sales_price), 0)

    const progress = Math.min((totalYearlySales / salesGoal) * 100, 100)
    setGoalProgress(progress)
    if (progress >= 100) setGoalReached(true)
    else setGoalReached(false)

    setEditingGoal(false)
    setSavingGoal(false)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen text-slate-600 dark:text-slate-400">
          Loading dashboard...
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto md:px-4 sm:px-2 space-y-10">

        {/* Profile Header */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-sm">
          <div>
            <h1 className="text-24 font-semibold text-slate-900 dark:text-slate-100">
              Welcome, {profile.full_name || "User"}!
            </h1>
            {profile.business_name && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Business: {profile.business_name}
              </p>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {profile.phone_number || "No phone number added"}
            </p>
          </div>
        </div>

        {/* Sales Goal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {currentYear} Sales Goal
            </h3>
            <div className="flex items-center gap-2">
              {editingGoal ? (
                <button
                  onClick={handleSaveGoal}
                  disabled={savingGoal}
                  className="text-sm flex items-center gap-1 font-medium text-black dark:text-white hover:underline"
                >
                  <Save size={16} />
                  {savingGoal ? "Saving..." : "Save"}
                </button>
              ) : (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="text-sm flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  <Edit size={16} />
                  {goal ? "Edit" : "Set"}
                </button>
              )}
            </div>
          </div>

          {editingGoal ? (
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Enter yearly goal"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="border p-2 rounded w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all ${goalReached ? "bg-green-500" : "bg-black dark:bg-white"}`}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ₦{goal?.toLocaleString() || 0} yearly target — {goalProgress.toFixed(1)}% achieved
              </p>
              {goalReached && (
                <div className="mt-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full w-max animate-pulse">
                  🎉 Goal Achieved!
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric title="Total Sales" value={`₦${stats.totalSales.toLocaleString()}`} />
          <Metric title="Total Profit" value={`₦${stats.totalProfit.toLocaleString()}`} />
          <Metric title="Outstanding" value={`₦${stats.outstanding.toLocaleString()}`} />
          <Metric title="Unpaid Records" value={stats.unpaidCount.toString()} />
        </div>

        {/* Recent Sales */}
        <RecentSalesTable sales={recentSales} />

      </div>

      <a
        href="/sales/new"
        className="fixed bottom-6 right-6 sm:hidden w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center shadow-md"
      >
        <Plus size={20} />
      </a>
    </ProtectedRoute>
  )
}

// Components (Metrics & Recent Sales) remain similar with professional spacing & colors

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  )
}

function RecentSalesTable({ sales }: { sales: any[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Recent sales
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="/sales"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            View all
          </a>
          <a
            href="/sales/new"
            className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            <Plus size={16} />
            New
          </a>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="text-slate-600 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-medium text-left">Date</th>
              <th className="py-3 px-4 font-medium text-left">Customer</th>
              <th className="py-3 px-4 font-medium text-left">Product</th>
              <th className="py-3 px-4 font-medium text-left">Amount</th>
              <th className="py-3 px-4 font-medium text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => window.location.href = `/sales/${sale.id}/info`}
                className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{sale.date}</td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{sale.customer}</td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{sale.product}</td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                  ₦{Number(sale.sales_price).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={sale.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
        {sales.map((sale) => (
          <div
            key={sale.id}
            onClick={() => window.location.href = `/sales/${sale.id}/info`}
            className="px-4 py-4 space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{sale.customer}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{sale.product}</p>
              </div>
              <StatusBadge status={sale.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{sale.date}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ₦{Number(sale.sales_price).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      </div>
  )
}
