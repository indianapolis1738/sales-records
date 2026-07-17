"use client"

import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

type Order = {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
  profiles?: {
    business_name: string
  } | null
}

interface Props {
  orders: Order[]
  loading?: boolean
}

export default function RecentOrders({
  orders,
  loading = false,
}: Props) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-200 dark:bg-neutral-700 rounded" />

          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-slate-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden">

      {/* Header */}

      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Orders
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Latest orders across all stores
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/orders")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      {/* Desktop */}

      <div className="hidden lg:block overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50 dark:bg-neutral-800">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Invoice
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Store
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                Amount
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-500">
                Status
              </th>

              <th className="px-6 py-4"></th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order.id}
                className="border-t border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
              >

                <td className="px-6 py-4 font-semibold">
                  {order.invoice_number}
                </td>

                <td className="px-6 py-4">
                  {order.customer_name}
                </td>

                <td className="px-6 py-4">
                  {order.profiles?.business_name || "-"}
                </td>

                <td className="px-6 py-4 text-right font-semibold">
                  ₦{Number(order.total_amount).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-center">

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "Paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {order.status}
                  </span>

                </td>

                <td className="px-6 py-4 text-right">

                  <button
                    onClick={() =>
                      router.push(`/admin/orders/${order.id}`)
                    }
                    className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-neutral-700"
                  >
                    <Eye size={18} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Mobile */}

      <div className="lg:hidden divide-y divide-slate-200 dark:divide-neutral-800">

        {orders.map((order) => (

          <div
            key={order.id}
            className="p-5"
          >
            <div className="flex justify-between">

              <div>

                <p className="font-bold">
                  {order.invoice_number}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {order.customer_name}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {order.profiles?.business_name}
                </p>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  ₦{Number(order.total_amount).toLocaleString()}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${
                    order.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>

              </div>

            </div>
          </div>

        ))}

      </div>

    </div>
  )
}