"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"
import { Plus, Edit, Save, TrendingUp, DollarSign, AlertCircle, CheckCircle, Calendar, ChevronRight } from "lucide-react"
import Skeleton from "@/components/Skeleton"

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
        .select("total_amount, total_profit, outstanding, status, date")
        .eq("user_id", user.id)

      if (sales) {
        setStats({
          totalSales: sales.reduce((s, i) => s + Number(i.total_amount), 0),
          totalProfit: sales.reduce(
            (s, i) => s + (Number(i.total_profit)),
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
          .reduce((sum, s) => sum + Number(s.total_amount), 0) || 0

        const progress = Math.min((totalYearlySales / goalData.sales_goal) * 100, 100)
        setGoalProgress(progress)
        if (progress >= 100) setGoalReached(true)
      }

      const { data: recent } = await supabase
        .from("sales")
        .select("id, date, customer_name, total_amount, status")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5)

      setRecentSales(recent || [])
      setLoading(false)
    }

    initializeDashboard()
  }, [])

  const handleSaveGoal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    setSavingGoal(true)

    const salesGoal = Number(goalInput)
    if (isNaN(salesGoal) || salesGoal <= 0) {
      alert("Please enter a valid goal")
      setSavingGoal(false)
      return
    }

    const { error } = await supabase
      .from("goals")
      .upsert(
        [{ user_id: user.id, year: currentYear, sales_goal: salesGoal }],
        { onConflict: "user_id,year" }
      )

    if (error) {
      console.error("Failed to save goal:", error)
      alert("Failed to save goal, try again")
      setSavingGoal(false)
      return
    }

    setGoal(salesGoal)

    const totalYearlySales = recentSales
      .filter((s) => new Date(s.date).getFullYear() === currentYear)
      .reduce((sum, s) => sum + Number(s.total_amount), 0)

    const progress = Math.min((totalYearlySales / salesGoal) * 100, 100)
    setGoalProgress(progress)
    setGoalReached(progress >= 100)
    setEditingGoal(false)
    setSavingGoal(false)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-10 w-2/3 rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
        {/* Main Content */}
        <div className="px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

            {/* Profile Header */}
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {profile.full_name && <span className="font-semibold">{profile.full_name}</span>}
                {profile.full_name && profile.business_name && <span> • </span>}
                {profile.business_name && <span>{profile.business_name}</span>}
              </p>
            </div>

            {/* Sales Goal Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0 mt-0.5">
                    <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {currentYear} Sales Goal
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">
                      {goal ? `₦${goal.toLocaleString()}` : "No goal set"}
                    </p>
                  </div>
                </div>

                {editingGoal ? (
                  <button
                    onClick={handleSaveGoal}
                    disabled={savingGoal}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition flex-shrink-0"
                  >
                    <Save size={16} />
                    <span className="hidden sm:inline">{savingGoal ? "Saving..." : "Save"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-700 transition flex-shrink-0"
                  >
                    <Edit size={16} />
                    <span className="hidden sm:inline">{goal ? "Edit" : "Set"}</span>
                  </button>
                )}
              </div>

              {editingGoal ? (
                <input
                  type="number"
                  placeholder="Enter yearly goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                  autoFocus
                />
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {goalProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 sm:h-3 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          goalReached ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-blue-600"
                        }`}
                        style={{ width: `${goalProgress}%` }}
                      />
                    </div>
                  </div>

                  {goalReached && (
                    <div className="flex items-start gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">
                        🎉 Goal reached!
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <MetricCard
                icon={<DollarSign size={18} />}
                title="Total Sales"
                value={`₦${(stats.totalSales / 1000000).toFixed(3)}M`}
                fullValue={`₦${stats.totalSales.toLocaleString()}`}
                color="blue"
              />
              <MetricCard
                icon={<TrendingUp size={18} />}
                title="Total Profit"
                value={`₦${(stats.totalProfit / 1000000).toFixed()}M`}
                fullValue={`₦${stats.totalProfit.toLocaleString()}`}
                color="green"
              />
              <MetricCard
                icon={<AlertCircle size={18} />}
                title="Outstanding"
                value={`₦${(stats.outstanding / 1000000).toFixed(3)}M`}
                fullValue={`₦${stats.outstanding.toLocaleString()}`}
                color="amber"
              />
              <MetricCard
                icon={<Calendar size={18} />}
                title="Unpaid"
                value={stats.unpaidCount.toString()}
                fullValue={`${stats.unpaidCount} records`}
                color="red"
              />
            </div>

            {/* Recent Sales */}
            <RecentSalesTable sales={recentSales} />

          </div>
        </div>

        {/* Floating Action Button - Mobile */}
        <a
          href="/sales/new"
          className="fixed bottom-6 right-4 sm:hidden w-14 h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg hover:shadow-xl transition active:scale-95 z-40"
        >
          <Plus size={24} />
        </a>

        {/* Bottom Safe Area Spacer */}
        <div className="h-6 sm:hidden" />
      </div>
    </ProtectedRoute>
  )
}

function MetricCard({
  icon,
  title,
  value,
  fullValue,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string
  fullValue: string
  color: "blue" | "green" | "amber" | "red"
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
  }

  return (
    <div className={`rounded-xl border p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 shadow-sm ${colorMap[color]}`} title={fullValue}>
      <div className="flex items-center">
        <div className="p-1.5 sm:p-2 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium opacity-80">{title}</p>
        <p className="text-lg sm:text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  )
}

function RecentSalesTable({ sales }: { sales: any[] }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-neutral-800">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
          Recent Sales
        </h2>
        <a
          href="/sales"
          className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition"
        >
          View all
        </a>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12 px-4 sm:px-6">
          <DollarSign size={40} className="mx-auto text-slate-300 dark:text-neutral-700 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">No sales yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Start by adding your first sale</p>
          <a
            href="/sales/new"
            className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            <Plus size={16} />
            Add Sale
          </a>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-neutral-800">
          {sales.map((sale) => (
            <a
              key={sale.id}
              href={`/sales/${sale.id}/info`}
              className="block px-4 py-4 sm:px-6 sm:py-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition active:bg-slate-100 dark:active:bg-neutral-800"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {sale.customer_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                    {new Date(sale.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  ₦{Number(sale.total_amount).toLocaleString()}
                </p>
                <StatusBadge status={sale.status} />
              </div>
            </a>
          ))}
        </div>
      )}

      {sales.length > 0 && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-center sm:hidden">
          <a
            href="/sales/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            <Plus size={16} />
            Add New Sale
          </a>
        </div>
      )}
    </div>
  )
}
