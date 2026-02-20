"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ChevronLeft, Phone, MessageCircle, Mail, Edit2, Calendar, DollarSign, TrendingUp, Package } from "lucide-react"

type Sale = {
    id: string
    user_id: string
    customer_id: string
    customer_name: string
    invoice_number: string
    date: string
    total_amount: number
    total_profit: number
    outstanding: number
    status: "Paid" | "Unpaid" | "Part Payment"
    items?: Array<{
        product: string
        quantity: number
        sales_price: number
    }>
}

export default function CustomerProfilePage() {
    const { id } = useParams()
    const router = useRouter()

    const [customer, setCustomer] = useState<any>(null)
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        if (id) {
            fetchCustomer()
        }
    }, [id])

    const fetchCustomer = async () => {
        try {
            const { data } = await supabase
                .from("customers")
                .select("*")
                .eq("id", id)
                .single()

            setCustomer(data)
            
            // Fetch sales using customer_name after getting customer data
            if (data?.full_name) {
                fetchSalesWithItems(data.full_name)
            }
        } catch (error) {
            console.error("Error fetching customer:", error)
            setLoading(false)
        }
    }

    const fetchSalesWithItems = async (customerName: string) => {
        try {
            // Fetch sales for this customer using customer_name
            const { data: salesData, error } = await supabase
                .from("sales")
                .select("*")
                .eq("customer_name", customerName)
                .order("date", { ascending: false })

            if (error) {
                console.error("Error fetching sales:", error)
                setLoading(false)
                return
            }

            if (!salesData || salesData.length === 0) {
                setLoading(false)
                return
            }

            // Fetch invoice items for each sale
            const salesWithItems = await Promise.all(
                salesData.map(async (sale) => {
                    const { data: itemsData } = await supabase
                        .from("invoice_items")
                        .select("product, quantity, sales_price")
                        .eq("sale_id", sale.id)

                    return {
                        ...sale,
                        items: itemsData || [],
                    } as Sale
                })
            )

            setSales(salesWithItems)
            setLoading(false)

            // Update customer status if they have sales
            if (salesData.length > 0 && customer?.status === "Prospect") {
                await supabase
                    .from("customers")
                    .update({ status: "Customer" })
                    .eq("id", id)
            }
        } catch (error) {
            console.error("Error fetching sales:", error)
            setLoading(false)
        }
    }

    if (loading || !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
                <div className="animate-pulse text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        )
    }

    const mappedCustomer = {
        full_name: customer.full_name || "Unnamed Customer",
        phone_number: customer.phone_number || "-",
        email: customer.email ?? "-",
        notes: customer.notes ?? "-",
        status: customer.status || "Prospect",
    }

    const totalSales = sales.reduce(
        (sum, s) => sum + Number(s.total_amount || 0),
        0
    )

    const outstanding = sales.reduce(
        (sum, s) => sum + Number(s.outstanding || 0),
        0
    )

    const totalProfit = sales.reduce(
        (sum, s) => sum + Number(s.total_profit || 0),
        0
    )

    const totalItems = sales.reduce(
        (sum, s) => sum + (s.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0),
        0
    )

    const whatsappNumber =
        mappedCustomer.phone_number !== "-"
            ? mappedCustomer.phone_number.replace(/^0/, "234")
            : null

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Customer":
                return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            case "Lead":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
            case "Prospect":
                return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24 sm:pb-8">
            <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition mb-4 text-sm sm:text-base"
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 break-words">
                                {mappedCustomer.full_name}
                            </h1>
                            <span className={`inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(mappedCustomer.status)}`}>
                                {mappedCustomer.status}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowEditModal(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition text-sm sm:text-base"
                        >
                            <Edit2 size={18} />
                            Edit
                        </button>
                    </div>
                </div>

                {/* Contact Actions */}
                {mappedCustomer.phone_number !== "-" && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <a
                            href={`tel:${mappedCustomer.phone_number}`}
                            className="flex flex-col sm:flex-row items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg sm:rounded-xl hover:border-slate-300 dark:hover:border-neutral-700 hover:shadow-md transition"
                        >
                            <Phone size={18} className="text-slate-600 dark:text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Call</span>
                        </a>

                        {whatsappNumber && (
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col sm:flex-row items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg sm:rounded-xl font-semibold transition shadow-sm text-sm sm:text-base"
                            >
                                <MessageCircle size={18} />
                                <span>WhatsApp</span>
                            </a>
                        )}
                    </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                    <MetricCard
                        icon={<DollarSign size={20} className="sm:w-6 sm:h-6" />}
                        label="Total Sales"
                        value={`₦${totalSales.toLocaleString()}`}
                        color="blue"
                    />
                    <MetricCard
                        icon={<TrendingUp size={20} className="sm:w-6 sm:h-6" />}
                        label="Total Profit"
                        value={`₦${totalProfit.toLocaleString()}`}
                        color="green"
                    />
                    <MetricCard
                        icon={<DollarSign size={20} className="sm:w-6 sm:h-6" />}
                        label="Outstanding"
                        value={`₦${outstanding.toLocaleString()}`}
                        color="amber"
                    />
                    <MetricCard
                        icon={<Calendar size={20} className="sm:w-6 sm:h-6" />}
                        label="Transactions"
                        value={sales.length.toString()}
                        color="purple"
                    />
                </div>

                {/* Customer Information */}
                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6">Customer Information</h2>

                    <div className="space-y-4">
                        {mappedCustomer.phone_number !== "-" && (
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-neutral-800">
                                <Phone size={18} className="text-slate-400 dark:text-slate-600 flex-shrink-0 sm:w-5 sm:h-5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Phone</p>
                                    <p className="text-slate-900 dark:text-white font-medium truncate text-sm sm:text-base">{mappedCustomer.phone_number}</p>
                                </div>
                            </div>
                        )}

                        {mappedCustomer.email !== "-" && (
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-neutral-800">
                                <Mail size={18} className="text-slate-400 dark:text-slate-600 flex-shrink-0 sm:w-5 sm:h-5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Email</p>
                                    <p className="text-slate-900 dark:text-white font-medium truncate text-sm sm:text-base">{mappedCustomer.email}</p>
                                </div>
                            </div>
                        )}

                        {mappedCustomer.notes !== "-" && (
                            <div className="pt-2">
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">Notes</p>
                                <p className="text-slate-900 dark:text-white text-sm leading-relaxed break-words">{mappedCustomer.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sales History */}
                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Sales History</h2>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{sales.length} transaction{sales.length !== 1 ? "s" : ""}</span>
                    </div>

                    {sales.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <DollarSign size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">No sales yet</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1">Start by adding a sale for this customer</p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {sales.map((sale) => (
                                <SaleRow key={sale.id} sale={sale} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && (
                <EditCustomerModal
                    customer={customer}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={() => {
                        fetchCustomer()
                    }}
                />
            )}
        </div>
    )
}

/* Metric Card Component */
function MetricCard({ icon, label, value, color }: any) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
        green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
        amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
    }

    return (
        <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                {icon}
            </div>
            <p className="text-xs sm:text-sm font-medium opacity-80">{label}</p>
            <p className="text-lg sm:text-2xl font-bold mt-1 break-words">{value}</p>
        </div>
    )
}

/* Sale Row Component */
function SaleRow({ sale }: any) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            case "Unpaid":
                return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            case "Part Payment":
                return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        }
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg sm:rounded-xl hover:border-slate-300 dark:hover:border-neutral-600 hover:shadow-sm transition space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white break-all">
                        Invoice: <span className="font-mono">{sale.invoice_number}</span>
                    </p>
                    <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full border w-fit ${getStatusBadge(sale.status)}`}>
                        {sale.status}
                    </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    {new Date(sale.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </p>
                
                {/* Items List */}
                {sale.items && sale.items.length > 0 && (
                    <div className="mt-2 sm:mt-3 space-y-1">
                        {sale.items.map((item: any, idx: number) => (
                            <p key={idx} className="text-xs text-slate-500 dark:text-slate-400 break-words">
                                • {item.product} <span className="text-slate-400 dark:text-slate-500">×{item.quantity}</span>
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between sm:flex-col sm:items-end sm:text-right space-x-2 sm:space-x-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-neutral-700 flex-shrink-0">
                <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total</p>
                    <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-base break-words">
                        ₦{Number(sale.total_amount).toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 hidden sm:block">Status</p>
                    <p className={`font-semibold text-xs sm:text-sm ${
                        sale.status === "Paid" 
                            ? "text-green-600 dark:text-green-400" 
                            : sale.status === "Unpaid"
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400"
                    }`}>
                        {sale.status}
                    </p>
                </div>
            </div>
        </div>
    )
}

/* Edit Customer Modal */
function EditCustomerModal({ customer, onClose, onUpdated }: any) {
    const [fullName, setFullName] = useState(customer.full_name || "")
    const [phone, setPhone] = useState(customer.phone_number || "")
    const [email, setEmail] = useState(customer.email || "")
    const [notes, setNotes] = useState(customer.notes || "")
    const [status, setStatus] = useState(customer.status || "Prospect")
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)

        try {
            await supabase
                .from("customers")
                .update({
                    full_name: fullName,
                    phone_number: phone,
                    email,
                    notes,
                    status,
                })
                .eq("id", customer.id)

            onUpdated()
            onClose()
        } catch (error) {
            console.error("Error saving customer:", error)
            alert("Error saving changes")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Edit Customer</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Update customer information</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition text-sm"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition text-sm"
                            placeholder="Phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Status
                        </label>
                        <select
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option>Prospect</option>
                            <option>Lead</option>
                            <option>Customer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Notes
                        </label>
                        <textarea
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition resize-none text-sm"
                            placeholder="Add notes about this customer"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-neutral-800">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition text-sm sm:text-base"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}
