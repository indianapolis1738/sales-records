"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function NewStaffPage() {
  const router = useRouter()

  const [name,setName] = useState("")
  const [position,setPosition] = useState("")
  const [salary,setSalary] = useState("")

  async function createStaff() {

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("staff").insert({
      user_id: user?.id,
      name,
      position,
      salary: Number(salary)
    })

    router.push("/staff")
  }

  return (
    <div className="p-6 max-w-xl space-y-6">

      <h1 className="text-2xl font-bold">Add Staff</h1>

      <input
        placeholder="Staff name"
        className="w-full border rounded-lg p-3"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        placeholder="Position"
        className="w-full border rounded-lg p-3"
        value={position}
        onChange={(e)=>setPosition(e.target.value)}
      />

      <input
        placeholder="Salary"
        className="w-full border rounded-lg p-3"
        value={salary}
        onChange={(e)=>setSalary(e.target.value)}
      />

      <button
        onClick={createStaff}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Save Staff
      </button>

    </div>
  )
}