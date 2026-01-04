"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"
import { Plus } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    outstanding: 0,
    unpaidCount: 0
  })

  const [recentSales, setRecentSales] = useState<any[]>([])
const [profile, setProfile] = useState<{
    full_name: string; business_name?: string; phone_number?: string;
}>({
    full_name: "",
    business_name: undefined,
    phone_number: undefined
})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeDashboard = async () => {
      // 1️⃣ Get logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 2️⃣ Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!profileData) {
        // Redirect new user to profile completion page
        window.location.href = "/profile"
        return
      }

      setProfile(profileData)

      // 3️⃣ Fetch sales stats
      const { data: sales } = await supabase
        .from("sales")
        .select("sales_price, cost_price, outstanding, status")
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

      // 4️⃣ Fetch recent sales
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen text-slate-600">
          Loading dashboard...
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto md:px-4 sm:px-0 space-y-10">

        {/* Profile Header */}
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-sm">
          <div>
          <h1 className="text-2xl font-semibold text-slate-900">
  Welcome, {profile.full_name || "User"}!
</h1>
{profile.business_name && (
  <p className="text-sm text-slate-600 mt-1">
    Business: {profile.business_name}
  </p>
)}

            <p className="text-sm text-slate-600">
              {profile.phone_number || "No phone number added"}
            </p>
          </div>
          <a
            href="/profile"
            className="mt-2 sm:mt-0 text-sm text-slate-700 hover:text-slate-900 underline"
          >
            Edit Profile
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric title="Total Sales" value={`₦${stats.totalSales.toLocaleString()}`} />
          <Metric title="Total Profit" value={`₦${stats.totalProfit.toLocaleString()}`} />
          <Metric title="Outstanding" value={`₦${stats.outstanding.toLocaleString()}`} />
          <Metric title="Unpaid Records" value={stats.unpaidCount.toString()} />
        </div>

        {/* Recent Sales */}
        <div className="rounded-xl border border-slate-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent sales
            </h2>

            <div className="flex items-center gap-4 text-sm">
              <a
                href="/sales"
                className="text-slate-600 hover:text-slate-900 transition"
              >
                View all
              </a>

              <a
                href="/sales/new"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition"
              >
                <Plus size={16} />
                New
              </a>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-medium text-left">Date</th>
                  <th className="py-3 px-4 font-medium text-left">Customer</th>
                  <th className="py-3 px-4 font-medium text-left">Product</th>
                  <th className="py-3 px-4 font-medium text-left">Amount</th>
                  <th className="py-3 px-4 font-medium text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => window.location.href = `/sales/${sale.id}/info`}
                    className="border-t border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-700">{sale.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{sale.customer}</td>
                    <td className="py-3 px-4 text-slate-700">{sale.product}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      ₦{Number(sale.sales_price).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentSales.length === 0 && <EmptyState />}
          </div>

          {/* Mobile List */}
          <div className="md:hidden divide-y divide-slate-200">
            {recentSales.length === 0 && <EmptyState />}

            {recentSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => window.location.href = `/sales/${sale.id}/info`}
                className="px-4 py-4 space-y-2 cursor-pointer hover:bg-slate-50 rounded-md transition"
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
                  <span className="font-medium text-slate-900">
                    ₦{Number(sale.sales_price).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile + Button */}
      <a
        href="/sales/new"
        className="fixed bottom-6 right-6 sm:hidden w-12 h-12 rounded-full border border-slate-300 bg-white text-slate-900 flex items-center justify-center shadow-sm"
      >
        <Plus size={20} />
      </a>
    </ProtectedRoute>
  )
}

/* ------------------ Components ------------------ */

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-sm text-slate-600 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-slate-600 mb-3">
        No sales yet
      </p>
      <a
        href="/sales/new"
        className="inline-flex items-center gap-2 text-sm text-slate-900 hover:underline"
      >
        <Plus size={16} />
        Add your first sale
      </a>
    </div>
  )
}
