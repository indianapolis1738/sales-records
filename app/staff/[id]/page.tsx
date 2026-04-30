"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function StaffProfilePage(){

  const { id } = useParams()

  const [staff,setStaff] = useState<any>(null)
  const [salary,setSalary] = useState<any[]>([])

  useEffect(()=>{
    fetchData()
  },[])

  async function fetchData(){

    const { data:staffData } = await supabase
      .from("staff")
      .select("*")
      .eq("id",id)
      .single()

    const { data:salaryData } = await supabase
      .from("staff_salary")
      .select("*")
      .eq("staff_id",id)
      .order("year",{ascending:false})

    setStaff(staffData)
    setSalary(salaryData || [])
  }

  if(!staff) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 space-y-8">

      <div>
        <h1 className="text-2xl font-bold">{staff.full_name}</h1>
        <p className="opacity-70">{staff.role}</p>
        <p className="mt-2 font-semibold">
          Salary: ₦{staff.salary?.toLocaleString()}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Salary Records</h2>

        <div className="space-y-4">

          {salary.map((s)=>(
            <div
              key={s.id}
              className="border rounded-xl p-4 space-y-2"
            >

              <div className="flex justify-between">
                <p>{s.month} {s.year}</p>

                <span
                  className={`text-sm px-2 py-1 rounded ${
                    s.payment_status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.payment_status ? "Paid" : "Unpaid"}
                </span>
              </div>

              {s.performance_note && (
                <p className="text-sm opacity-70">
                  Performance: {s.performance_note}
                </p>
              )}

            </div>
          ))}

        </div>
      </div>

    </div>
  )
}