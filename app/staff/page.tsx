"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Users, Plus } from "lucide-react"

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false })

    setStaff(data || [])
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users size={22}/> Staff
        </h1>

        <Link
          href="/staff/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18}/>
          Add Staff
        </Link>
      </div>

      <div className="grid gap-4">

        {loading && <p>Loading...</p>}

        {staff.map((person) => (
          <Link
            key={person.id}
            href={`/staff/${person.id}`}
            className="border rounded-xl p-4 flex justify-between hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div>
              <p className="font-semibold">{person.full_name}</p>
              <p className="text-sm opacity-70">{person.role}</p>
            </div>

            <p className="text-sm opacity-60">
              {person.status}
            </p>
          </Link>
        ))}

      </div>
    </div>
  )
}