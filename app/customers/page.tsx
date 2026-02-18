"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AddCustomerModal from "./AddCustomerModal"
import { Plus, ChevronRight, Phone, User, Search } from "lucide-react"

type Customer = {
    id: string
    full_name: string
    phone_number: string | null
    status: "Prospect" | "Lead" | "Customer"
    created_at?: string
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [statusFilter, setStatusFilter] = useState<string>("All")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchCustomers = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let query = supabase
            .from("customers")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (statusFilter !== "All") {
            query = query.eq("status", statusFilter)
        }

        const { data } = await query
        setCustomers(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchCustomers()
    }, [statusFilter])

    useEffect(() => {
        const filtered = customers.filter(c =>
            c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone_number?.includes(searchQuery)
        )
        setFilteredCustomers(filtered)
    }, [searchQuery, customers])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Customer":
                return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            case "Lead":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
            case "Prospect":
                return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            default:
                return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Customer":
                return "✓"
            case "Lead":
                return "→"
            case "Prospect":
                return "◯"
            default:
                return "•"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
            <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition mb-4"
                    >
                        ← Back
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Customers
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                Manage and track all your customer relationships
                            </p>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
                        >
                            <Plus size={20} />
                            Add Customer
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-6 mb-6 shadow-sm">
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-3 text-slate-400 dark:text-slate-600" />
                            <input
                                type="text"
                                placeholder="Search by name or phone number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                            />
                        </div>
                    </div>

                    {/* Status Filters */}
                    <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                            Filter by Status
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["All", "Prospect", "Lead", "Customer"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                        : "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700"
                                        }`}
                                >
                                    {status === "All" ? "All Customers" : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Customer Count */}
                <div className="mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {filteredCustomers.length} {filteredCustomers.length === 1 ? "customer" : "customers"}
                    </p>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-500 dark:text-slate-400">Loading customers...</div>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
                            <User size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No customers found</p>
                            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                                {searchQuery ? "Try adjusting your search criteria" : "Start by adding your first customer"}
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                            >
                                <Plus size={18} />
                                Add Customer
                            </button>
                        </div>
                    ) : (
                        filteredCustomers.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => router.push(`/customers/${c.id}`)}
                                className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 flex items-center justify-between hover:border-slate-300 dark:hover:border-neutral-700 hover:shadow-md dark:hover:shadow-lg transition cursor-pointer active:scale-[0.98] group"
                            >
                                {/* Left Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-100 dark:bg-neutral-800 rounded-full p-3 flex-shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 transition">
                                            <User size={20} className="text-slate-600 dark:text-slate-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                {c.full_name}
                                            </p>
                                            {c.phone_number && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                    <Phone size={14} className="flex-shrink-0" />
                                                    <span className="truncate">{c.phone_number}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Content */}
                                <div className="flex items-center gap-3 flex-shrink-0 ml-3 sm:ml-4">
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${getStatusColor(c.status)}`}>
                                        <span>{getStatusIcon(c.status)}</span>
                                        {c.status}
                                    </span>
                                    <ChevronRight size={20} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
