"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CustomerProfilePage() {
    const { id } = useParams()
    const router = useRouter()

    const [customer, setCustomer] = useState<any>(null)
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)


    useEffect(() => {
        fetchCustomer()
        fetchSales()
    }, [])

    const fetchCustomer = async () => {
        const { data } = await supabase
            .from("customers")
            .select("*")
            .eq("id", id)
            .single()

        setCustomer(data)
    }

    const fetchSales = async () => {
        const { data } = await supabase
            .from("sales")
            .select("*")
            .eq("customer_id", id)
            .order("created_at", { ascending: false })

        setSales(data || [])
        setLoading(false)

        /* 🔄 AUTO-UPGRADE PROSPECT → CUSTOMER */
        if (data?.length && customer?.status === "Prospect") {
            await supabase
                .from("customers")
                .update({ status: "Customer" })
                .eq("id", id)
        }
    }

    if (loading || !customer) {
        return <div className="p-4 text-slate-500">Loading...</div>
    }

    /* ✅ SAFE CUSTOMER MAPPING */
    const mappedCustomer = {
        full_name: customer.full_name || "Unnamed Customer",
        phone_number: customer.phone_number || "-",
        email: customer.email ?? "-",
        notes: customer.notes ?? "-",
        status: customer.status || "Prospect",
    }

    const totalSales = sales.reduce(
        (sum, s) => sum + Number(s.sales_price || 0),
        0
    )

    const outstanding = sales.reduce(
        (sum, s) => sum + Number(s.outstanding || 0),
        0
    )

    /* 📈 CUSTOMER LIFETIME VALUE */
    const lifetimeValue = totalSales

    /* 📞 PHONE NORMALIZATION (NG) */
    const whatsappNumber =
        mappedCustomer.phone_number !== "-"
            ? mappedCustomer.phone_number.replace(/^0/, "234")
            : null

    return (
        <div className="p-4 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-slate-500 mt-1"
                >
                    ←
                </button>

                <div className="flex-1">
                    <h1 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                        {mappedCustomer.full_name}
                    </h1>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {mappedCustomer.status}
                        </span>

                        {/* ✏️ EDIT CUSTOMER */}
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="text-xs text-blue-600"
                        >
                            Edit
                        </button>

                    </div>
                </div>
            </div>

            {/* 📞 ACTIONS */}
            {mappedCustomer.phone_number !== "-" && (
                <div className="flex gap-3">
                    <a
                        href={`tel:${mappedCustomer.phone_number}`}
                        className="flex-1 text-center py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
                    >
                        📞 Call
                    </a>

                    {whatsappNumber && (
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            className="flex-1 text-center py-3 rounded-xl bg-green-500 text-white text-sm"
                        >
                            💬 WhatsApp
                        </a>
                    )}
                </div>
            )}

            {/* Customer Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3 border dark:border-slate-800">
                <InfoRow label="Phone" value={mappedCustomer.phone_number} />
                <InfoRow label="Email" value={mappedCustomer.email} />
                <InfoRow label="Notes" value={mappedCustomer.notes} />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                    label="Total Sales"
                    value={`₦${totalSales.toLocaleString()}`}
                />
                <SummaryCard
                    label="Outstanding"
                    value={`₦${outstanding.toLocaleString()}`}
                />
                <SummaryCard
                    label="Transactions"
                    value={sales.length}
                />
                <SummaryCard
                    label="Customer Value"
                    value={`₦${lifetimeValue.toLocaleString()}`}
                />
            </div>

            {/* Sales History */}
            <div className="space-y-3">
                <h2 className="font-semibold text-slate-700 dark:text-slate-300">
                    Sales History
                </h2>

                {sales.length === 0 && (
                    <p className="text-sm text-slate-500">No sales yet.</p>
                )}

                {sales.map((sale) => (
                    <div
                        key={sale.id}
                        className="bg-white dark:bg-slate-900 rounded-xl p-3 border dark:border-slate-800 space-y-1"
                    >
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">
                                {new Date(sale.created_at).toLocaleDateString()}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                ₦{Number(sale.sales_price).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">
                                Outstanding: ₦{Number(sale.outstanding || 0).toLocaleString()}
                            </span>

                            <span
                                className={`px-2 py-0.5 rounded-full
                  ${sale.status === "Paid" && "bg-green-100 text-green-700"}
                  ${sale.status === "Unpaid" && "bg-yellow-100 text-yellow-700"}
                  ${sale.status === "Part Payment" && "bg-orange-100 text-orange-700"}
                `}
                            >
                                {sale.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {showEditModal && (
                <EditCustomerModal
                    customer={customer}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={fetchCustomer}
                />
            )}

        </div>
    )
}

/* ---------------- Reusable UI ---------------- */

function InfoRow({ label, value }: any) {
    return (
        <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-900 dark:text-white font-medium text-right">
                {value}
            </span>
        </div>
    )
}

function SummaryCard({ label, value }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border dark:border-slate-800">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    )
}

function EditCustomerModal({ customer, onClose, onUpdated }: any) {
    const [fullName, setFullName] = useState(customer.full_name || "")
    const [phone, setPhone] = useState(customer.phone_number || "")
    const [email, setEmail] = useState(customer.email || "")
    const [notes, setNotes] = useState(customer.notes || "")
    const [status, setStatus] = useState(customer.status || "Prospect")
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)

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

        setSaving(false)
        onUpdated()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
            <div className="bg-white dark:bg-slate-900 w-full rounded-t-2xl p-4 space-y-4">
                <h2 className="font-semibold text-lg">Edit Customer</h2>

                <input
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                <input
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <textarea
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option>Prospect</option>
                    <option>Lead</option>
                    <option>Customer</option>
                </select>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 border rounded-md p-2 text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-black text-white rounded-md p-2 text-sm"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}
