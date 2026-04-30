"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"

export default function StaffList() {

  const [staff, setStaff] = useState<any[]>([])

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setStaff(data || [])
  }

  return (
    <ProtectedRoute>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Employees</h1>

          <Link
            href="/staff/add"
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Add Staff
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">

          <table className="w-full text-sm">

            <thead className="border-b border-gray-200 dark:border-neutral-800">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>

              {staff.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 dark:border-neutral-800"
                >

                  <td className="p-3">{s.full_name}</td>
                  <td className="p-3">{s.role}</td>
                  <td className="p-3">{s.phone}</td>
                  <td className="p-3">{s.status}</td>

                  <td className="p-3">

                    <Link
                      href={`/staff/${s.id}`}
                      className="text-blue-600"
                    >
                      View
                    </Link>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </ProtectedRoute>
  )
}