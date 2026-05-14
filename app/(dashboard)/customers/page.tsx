"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AddCustomerModal from "./AddCustomerModal"
import Skeleton from "@/components/Skeleton"
import { Plus, ChevronRight, Phone, User, Search, Filter, X } from "lucide-react"

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
    const [showFilterMobile, setShowFilterMobile] = useState(false)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                                Customers
                            </h1>
                            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">
                                Manage and track all your customer relationships
                            </p>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full sm:w-fit inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Add Customer</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                        />
                    </div>
                </div>

                {/* Status Filters */}
                <div className="mb-6">
                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowFilterMobile(!showFilterMobile)}
                        className="sm:hidden w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={16} />
                            <span>
                                {statusFilter === "All" ? "All Customers" : statusFilter}
                            </span>
                        </div>
                        {showFilterMobile && <X size={16} />}
                    </button>

                    {/* Mobile Filter Dropdown */}
                    {showFilterMobile && (
                        <div className="sm:hidden mt-3 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg overflow-hidden shadow-lg">
                            {["All", "Prospect", "Lead", "Customer"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status)
                                        setShowFilterMobile(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 border-b border-slate-200 dark:border-neutral-800 last:border-b-0 text-sm font-medium transition ${statusFilter === status
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                        }`}
                                >
                                    {status === "All" ? "All Customers" : status}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Desktop Filter Buttons */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                        {["All", "Prospect", "Lead", "Customer"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${statusFilter === status
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                    : "bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                    }`}
                            >
                                {status === "All" ? "All Customers" : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customer Count */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {filteredCustomers.length} {filteredCustomers.length === 1 ? "customer" : "customers"}
                    </p>
                </div>

                {/* List */}
                <div className="space-y-3 sm:space-y-4">
                    {loading ? (
                        // Loading Skeletons
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20 sm:h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        // Empty State
                        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center">
                            <User size={40} className="mx-auto text-slate-400 dark:text-slate-600 mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium mb-2">No customers found</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mb-6">
                                {searchQuery ? "Try adjusting your search criteria" : "Start by adding your first customer"}
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                            >
                                <Plus size={16} />
                                Add Customer
                            </button>
                        </div>
                    ) : (
                        // Customer List
                        filteredCustomers.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => router.push(`/customers/${c.id}`)}
                                className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-slate-300 dark:hover:border-neutral-700 hover:shadow-md dark:hover:shadow-lg transition active:scale-[0.98] group text-left"
                            >
                                {/* Left Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-100 dark:bg-neutral-800 rounded-full p-2.5 sm:p-3 flex-shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 transition">
                                            <User size={18} className="text-slate-600 dark:text-slate-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                                                {c.full_name}
                                            </p>
                                            {c.phone_number && (
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1.5">
                                                    <Phone size={12} className="flex-shrink-0" />
                                                    <span className="truncate">{c.phone_number}</span>
                                                </p>
                                            )}
                                            {c.created_at && (
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                    {new Date(c.created_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric"
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Content */}
                                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2 sm:ml-4">
                                    <span className={`text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 flex-shrink-0 whitespace-nowrap ${getStatusColor(c.status)}`}>
                                        <span>{getStatusIcon(c.status)}</span>
                                        <span className="hidden sm:inline">{c.status}</span>
                                    </span>
                                    <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition flex-shrink-0" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button - Mobile */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-4 sm:hidden w-14 h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg hover:shadow-xl transition active:scale-95 z-40"
            >
                <Plus size={24} />
            </button>

            {showModal && (
                <AddCustomerModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchCustomers}
                />
            )}
        </div>
    )
}
