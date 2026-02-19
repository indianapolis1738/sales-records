"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ArrowLeft, Download, Edit2, Trash2, CheckCircle, AlertCircle, Plus, X } from "lucide-react"

export default function SaleInfo() {
  const { id } = useParams()
  const router = useRouter()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [editDate, setEditDate] = useState("")
  const [editItems, setEditItems] = useState<any[]>([])

  const [invoice, setInvoice] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Fetch invoice
      const { data: invoiceData } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id)
        .single()

      if (invoiceData) setInvoice(invoiceData)

      // Fetch invoice items
      const { data: itemsData } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("sale_id", id)

      setItems(itemsData || [])

      // Fetch user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileData) setProfile(profileData)
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  useEffect(() => {
    if (invoice && showEditModal) {
      setEditDate(invoice.date)
      setEditItems(items.map(item => ({ ...item })))
    }
  }, [showEditModal])

  if (loading || !invoice || !profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-300 dark:bg-neutral-700 rounded-lg w-24"></div>
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 space-y-4">
                <div className="h-8 bg-slate-300 dark:bg-neutral-700 rounded w-1/3"></div>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-300 dark:bg-neutral-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const markAsPaid = async () => {
    await supabase
      .from("sales")
      .update({
        status: "Paid",
        outstanding: 0
      })
      .eq("id", invoice.id)

    setInvoice({ ...invoice, status: "Paid", outstanding: 0 })
  }

  const updateInvoice = async () => {
    try {
      setIsUpdating(true)

      const newTotal = editItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.sales_price),
        0
      )

      const { error: invoiceError } = await supabase
        .from("sales")
        .update({
          date: editDate,
          total_amount: newTotal
        })
        .eq("id", invoice.id)

      if (invoiceError) throw invoiceError

      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("sale_id", invoice.id)

      if (deleteError) throw deleteError

      const formattedItems = editItems.map(item => ({
        sale_id: invoice.id,
        product: item.product,
        quantity: item.quantity,
        sales_price: item.sales_price,
        serial_number: item.serial_number,
        cost_price: item.cost_price
      }))

      const { error: insertError } = await supabase
        .from("invoice_items")
        .insert(formattedItems)

      if (insertError) throw insertError

      router.refresh()
      setShowEditModal(false)
    } catch (error: any) {
      console.error("Update error:", error.message)
      alert(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteInvoice = async () => {
    if (!invoice) return

    try {
      setIsDeleting(true)

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("sale_id", invoice.id)

      if (itemsError) throw itemsError

      const { error: invoiceError } = await supabase
        .from("sales")
        .delete()
        .eq("id", invoice.id)

      if (invoiceError) throw invoiceError

      router.push("/sales")
    } catch (error: any) {
      console.error("Delete error:", error.message)
      alert(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const isReceipt = invoice.outstanding === 0

  const downloadPDF = async () => {
    if (!receiptRef.current) return

    const canvas = await html2canvas(receiptRef.current, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(
      `${isReceipt ? "receipt" : "invoice"}-${invoice.invoice_number}.pdf`
    )
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...editItems]
    updated[index][field] = value
    setEditItems(updated)
  }

  const addNewItem = () => {
    setEditItems([
      ...editItems,
      {
        id: crypto.randomUUID(),
        product: "",
        quantity: 1,
        sales_price: 0,
        cost_price: 0,
        serial_number: ""
      }
    ])
  }

  const removeItem = (index: number) => {
    const updated = [...editItems]
    updated.splice(index, 1)
    setEditItems(updated)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-sm transition"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isReceipt ? "Receipt" : "Invoice"}
            </h1>
            <div className="w-16"></div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">

            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 px-6 sm:px-8 py-6 sm:py-8 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                    {isReceipt ? "Receipt" : "Invoice"} Number
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {invoice.invoice_number}
                  </p>
                </div>
                <StatusBadge status={invoice.status} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-8">

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard
                  label="Customer"
                  value={invoice.customer_name}
                  icon="👤"
                />
                <InfoCard
                  label="Invoice Date"
                  value={new Date(invoice.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                  icon="📅"
                />
                <InfoCard
                  label="Items"
                  value={items.length.toString()}
                  icon="📦"
                />
                <InfoCard
                  label="Total Amount"
                  value={`₦${Number(invoice.total_amount).toLocaleString()}`}
                  highlight
                  icon="💰"
                />
                <InfoCard
                  label="Total Profit"
                  value={`₦${Number(invoice.total_profit).toLocaleString()}`}
                  highlight
                  icon="📈"
                />
                {!isReceipt && (
                  <InfoCard
                    label="Outstanding"
                    value={`₦${Number(invoice.outstanding).toLocaleString()}`}
                    icon="⏳"
                  />
                )}
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Items Sold
                </h3>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">No items</p>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden sm:block bg-slate-50 dark:bg-neutral-800/50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800">
                              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Product</th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Serial Number</th>
                              <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Qty</th>
                              <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Price</th>
                              <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-neutral-700">
                            {items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-neutral-700/50 transition">
                                <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                  {item.product}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                  {item.serial_number ? (
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded inline-block">
                                      {item.serial_number}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 dark:text-slate-500 italic">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                                  ₦{Number(item.sales_price).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                  ₦{(item.quantity * Number(item.sales_price)).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="sm:hidden space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">{item.product}</p>
                                {item.serial_number && (
                                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                                    S/N: {item.serial_number}
                                  </p>
                                )}
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-white ml-2 flex-shrink-0">
                                ₦{(item.quantity * Number(item.sales_price)).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {item.quantity} × ₦{Number(item.sales_price).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Total Amount</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">₦{Number(invoice.total_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Total Profit</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">₦{Number(invoice.total_profit).toLocaleString()}</span>
                  </div>
                  {!isReceipt && (
                    <div className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2 flex justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">Outstanding</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">₦{Number(invoice.outstanding).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>Created: {new Date(invoice.created_at).toLocaleString()}</p>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-6 sm:py-8 bg-slate-50 dark:bg-neutral-800/50 border-t border-slate-200 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row gap-3">
                {invoice.status !== "Paid" && (
                  <button
                    onClick={markAsPaid}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition active:scale-95"
                  >
                    <CheckCircle size={18} />
                    <span className="hidden sm:inline">Mark as Paid</span>
                    <span className="sm:hidden">Paid</span>
                  </button>
                )}

                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition active:scale-95"
                >
                  <Edit2 size={18} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition active:scale-95"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition active:scale-95 ml-auto sm:ml-0"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Hidden PDF Invoice */}
        <div
          ref={receiptRef}
          style={{
            position: "absolute",
            left: "-9999px",
            width: 650,
            padding: 40,
            backgroundColor: "#ffffff",
            fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
            color: "#1e293b",
            fontSize: 13,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 40, borderBottom: "3px solid #0f172a", paddingBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 5px 0", color: "#0f172a" }}>
                  {profile.business_name}
                </h1>
                <p style={{ margin: "0", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                  Sales {isReceipt ? "Receipt" : "Invoice"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  {isReceipt ? "RECEIPT" : "INVOICE"}
                </p>
                <p style={{ margin: "0", fontSize: "18px", fontWeight: "700", color: "#1e40af" }}>
                  {invoice.invoice_number}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 40 }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                  Business Address
                </p>
                <p style={{ margin: "0", fontSize: "13px", color: "#334155", fontWeight: "500" }}>
                  {profile.business_address}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                  Contact
                </p>
                <p style={{ margin: "0", fontSize: "13px", color: "#334155", fontWeight: "500" }}>
                  {profile.phone_number}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, gap: 20 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                Bill To
              </p>
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                {invoice.customer_name}
              </p>
              <div style={{ 
                backgroundColor: "#f1f5f9", 
                padding: "12px", 
                borderRadius: "6px",
                marginTop: 8,
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ margin: "0", fontSize: "12px", color: "#475569" }}>
                  Customer Order
                </p>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                    Invoice Date
                  </p>
                  <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    {new Date(invoice.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>

                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                    Status
                  </p>
                  <div style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    backgroundColor: invoice.status === "Paid" ? "#dcfce7" : "#fef3c7",
                    color: invoice.status === "Paid" ? "#166534" : "#b45309",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {invoice.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table in PDF */}
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 30,
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <thead>
              <tr style={{
                backgroundColor: "#0f172a",
                color: "#ffffff"
              }}>
                <th style={{
                  padding: "14px 16px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderRight: "1px solid #1e293b",
                  width: "40%"
                }}>
                  Description
                </th>
                <th style={{
                  padding: "14px 16px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderRight: "1px solid #1e293b",
                  width: "25%"
                }}>
                  Serial Number
                </th>
                <th style={{
                  padding: "14px 16px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderRight: "1px solid #1e293b",
                  width: "12%"
                }}>
                  Qty
                </th>
                <th style={{
                  padding: "14px 16px",
                  textAlign: "right",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "23%"
                }}>
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} style={{
                  borderBottom: index !== items.length - 1 ? "1px solid #e2e8f0" : "none",
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc"
                }}>
                  <td style={{
                    padding: "14px 16px",
                    color: "#0f172a",
                    fontWeight: "600",
                    borderRight: "1px solid #e2e8f0"
                  }}>
                    <div>
                      <p style={{ margin: "0" }}>{item.product}</p>
                    </div>
                  </td>
                  <td style={{
                    padding: "14px 16px",
                    color: "#475569",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    borderRight: "1px solid #e2e8f0",
                    fontWeight: "500"
                  }}>
                    {item.serial_number ? (
                      <div style={{
                        backgroundColor: "#e2e8f0",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "inline-block"
                      }}>
                        {item.serial_number}
                      </div>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>—</span>
                    )}
                  </td>
                  <td style={{
                    padding: "14px 16px",
                    textAlign: "center",
                    color: "#475569",
                    borderRight: "1px solid #e2e8f0"
                  }}>
                    {item.quantity}
                  </td>
                  <td style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    color: "#0f172a",
                    fontWeight: "700"
                  }}>
                    ₦{(item.quantity * Number(item.sales_price)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
            <div style={{ width: "320px" }}>
              {/* Subtotal */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "10px",
                borderBottom: "1px solid #e2e8f0",
                marginBottom: 10
              }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Subtotal</span>
                <span style={{ color: "#0f172a", fontWeight: "600", fontSize: "12px" }}>
                  ₦{Number(invoice.total_amount).toLocaleString()}
                </span>
              </div>

              {/* Total Profit */}
              {/* <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "10px",
                borderBottom: "1px solid #e2e8f0",
                marginBottom: 10
              }}>
                <span style={{ color: "#64748b", fontSize: "12px" }}>Profit</span>
                <span style={{ color: "#0f172a", fontWeight: "600", fontSize: "12px" }}>
                  ₦{Number(invoice.total_profit).toLocaleString()}
                </span>
              </div> */}

              {/* Outstanding (if not receipt) */}
              {!isReceipt && (
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #e2e8f0",
                  marginBottom: 10
                }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>Outstanding</span>
                  <span style={{ color: "#dc2626", fontWeight: "700", fontSize: "12px" }}>
                    ₦{Number(invoice.outstanding).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Total Amount - Highlighted */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#1e40af",
                color: "#ffffff",
                padding: "16px",
                borderRadius: "8px",
                marginTop: 15
              }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>
                  {isReceipt ? "Total Paid" : "Total Due"}
                </span>
                <span style={{ fontSize: "18px", fontWeight: "700" }}>
                  ₦{Number(invoice.total_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "2px solid #e2e8f0",
            paddingTop: 24,
            textAlign: "center",
            color: "#64748b",
            fontSize: "11px"
          }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#0f172a" }}>
              Thank you for your business!
            </p>
            <p style={{ margin: "0 0 4px 0" }}>
              This {isReceipt ? "receipt" : "invoice"} was generated on {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
            <p style={{ margin: "0", color: "#94a3b8" }}>
              For inquiries or support, please contact us at {profile.phone_number}
            </p>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center sm:justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-neutral-800 w-full sm:max-w-md space-y-4 p-6 animate-in slide-in-from-bottom-5 sm:zoom-in-95">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Delete Invoice
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    This action cannot be undone. Are you sure you want to permanently delete this invoice?
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteInvoice}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center sm:justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-neutral-800 w-full sm:max-w-2xl space-y-6 p-6 my-8 sm:my-0 animate-in slide-in-from-bottom-5 sm:zoom-in-95">

              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                  Edit Invoice
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                />
              </div>

              {/* Items */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Items
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {editItems.map((item, index) => (
                    <div key={item.id} className="bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Product</label>
                          <input
                            placeholder="Product name"
                            value={item.product}
                            onChange={(e) =>
                              handleItemChange(index, "product", e.target.value)
                            }
                            className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", Number(e.target.value))
                            }
                            className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Price</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={item.sales_price}
                            onChange={(e) =>
                              handleItemChange(index, "sales_price", Number(e.target.value))
                            }
                            className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Serial (Optional)</label>
                          <input
                            placeholder="Serial number"
                            value={item.serial_number || ""}
                            onChange={(e) =>
                              handleItemChange(index, "serial_number", e.target.value)
                            }
                            className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                        Remove Item
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addNewItem}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateInvoice}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 active:scale-95"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

// Components

function InfoCard({
  label,
  value,
  highlight,
  icon
}: {
  label: string
  value: any
  highlight?: boolean
  icon?: string
}) {
  return (
    <div className={`rounded-lg p-4 border transition ${highlight
      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      : "bg-slate-50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700"
      }`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${highlight
        ? "text-blue-700 dark:text-blue-400"
        : "text-slate-600 dark:text-slate-400"
        }`}>
        <span>{icon}</span>
        {label}
      </p>
      <p className={`text-lg sm:text-xl font-bold ${highlight
        ? "text-blue-900 dark:text-blue-100"
        : "text-slate-900 dark:text-white"
        }`}>
        {value}
      </p>
    </div>
  )
}
