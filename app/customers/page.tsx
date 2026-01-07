"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AddCustomerModal from "./AddCustomerModal"

type Customer = {
    id: string
    full_name: string
    phone_number: string | null
    status: "Prospect" | "Lead" | "Customer"
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [statusFilter, setStatusFilter] = useState<string>("All")
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()

    const fetchCustomers = async () => {
        let query = supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false })

        if (statusFilter !== "All") {
            query = query.eq("status", statusFilter)
        }

        const { data } = await query
        setCustomers(data || [])
    }

    useEffect(() => {
        fetchCustomers()
    }, [statusFilter])

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center justify-center">
                <button
                    onClick={() => router.back()}
                    className="text-2xl text-slate-500 mt-1"
                >
                    ←
                </button>

                <h1 className="text-lg font-semibold">Customers</h1>

                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 rounded-md bg-black text-white text-sm"
                >
                    Add Customer
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto">
                {["All", "Prospect", "Lead", "Customer"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-full text-sm border
              ${statusFilter === s
                                ? "bg-black text-white"
                                : "bg-white text-gray-600"}
            `}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {customers.map((c) => (
                    <div
                        key={c.id}
                        onClick={() => router.push(`/customers/${c.id}`)}
                        className="p-4 bg-gray-400 dark:bg-white rounded-lg border
                       flex justify-between items-center
                       active:scale-[0.98] transition cursor-pointer"
                    >
                        <div>
                            <p className="font-medium text-white dark:text-gray-900">
                                {c.full_name}
                            </p>
                            {c.phone_number && (
                                <p className="text-sm text-white/80 dark:text-gray-700">
                                    {c.phone_number}
                                </p>
                            )}
                        </div>

                        <span
                            className={`text-xs px-2 py-1 rounded-full
                ${c.status === "Customer" && "bg-green-100 text-green-700"}
                ${c.status === "Lead" && "bg-yellow-100 text-yellow-700"}
                ${c.status === "Prospect" && "bg-gray-100 text-gray-600"}
              `}
                        >
                            {c.status}
                        </span>
                    </div>
                ))}
            </div>

            {showModal && (
                <AddCustomerModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchCustomers}
                />
            )}
        </div>
    )
}
