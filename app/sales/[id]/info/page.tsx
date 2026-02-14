"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

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

  const receiptRef = useRef<HTMLDivElement>(null)



  useEffect(() => {
    const fetchData = async () => {
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
    }

    fetchData()
  }, [id])

  useEffect(() => {
    if (invoice && showEditModal) {
      setEditDate(invoice.date)
      setEditItems(items.map(item => ({ ...item })))
    }
  }, [showEditModal])

  if (!invoice || !profile) return null

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

      // Calculate new total
      const newTotal = editItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.sales_price),
        0
      )

      // 1️⃣ Update invoice date & total
      const { error: invoiceError } = await supabase
        .from("sales")
        .update({
          date: editDate,
          total_amount: newTotal
        })
        .eq("id", invoice.id)

      if (invoiceError) throw invoiceError

      // 2️⃣ Delete old items
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("sale_id", invoice.id)

      if (deleteError) throw deleteError

      // 3️⃣ Insert updated items
      const formattedItems = editItems.map(item => ({
        sale_id: invoice.id,
        product: item.product,
        quantity: item.quantity,
        sales_price: item.sales_price,
        serial_number: item.serial_number
      }))

      const { error: insertError } = await supabase
        .from("invoice_items")
        .insert(formattedItems)

      if (insertError) throw insertError

      // Refresh
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

      // 1️⃣ Delete invoice items first (important if no ON DELETE CASCADE)
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("sale_id", invoice.id)

      if (itemsError) throw itemsError

      // 2️⃣ Delete invoice
      const { error: invoiceError } = await supabase
        .from("sales")
        .delete()
        .eq("id", invoice.id)

      if (invoiceError) throw invoiceError

      // 3️⃣ Redirect
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
      <div className="max-w-3xl mx-auto md:p-6 sm:p-2 rounded-2xl shadow-sm space-y-6">

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-2 rounded-2xl shadow-sm space-y-6">
          <button
            onClick={() => router.back()}
            className="text-sm underline ml-auto"
          >
            Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {isReceipt ? "Receipt" : "Invoice"} Information
          </h2>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoRow label="Invoice No" value={invoice.invoice_number} />
            <InfoRow label="Date" value={invoice.date} />
            <InfoRow label="Customer" value={invoice.customer_name} />
            <InfoRow label="Items" value={items.length} />
            <InfoRow
              label="Total Amount"
              value={`₦${Number(invoice.total_amount).toLocaleString()}`}
            />
            <InfoRow
              label="Total Profit"
              value={`₦${Number(invoice.total_profit).toLocaleString()}`}
            />
            <InfoRow
              label="Status"
              value={<StatusBadge status={invoice.status} />}
            />
            <InfoRow
              label="Outstanding"
              value={`₦${Number(invoice.outstanding).toLocaleString()}`}
            />
            <InfoRow
              label="Created At"
              value={new Date(invoice.created_at).toLocaleString()}
            />
          </div>

          {/* List of Items Sold */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Items Sold
            </h3>
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.product}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity} pcs @ ₦
                      {Number(item.sales_price).toLocaleString()} each
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ₦
                    {(
                      item.quantity * Number(item.sales_price)
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="border px-4 py-2 rounded-lg text-sm"
            >
              Edit
            </button>

            {invoice.status !== "Paid" && (
              <button
                onClick={markAsPaid}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Mark as Paid
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Delete
            </button>

            <button
              onClick={downloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Download Invoice
            </button>
          </div>
        </div>

        {/* Hidden PDF Invoice */}
        <div
          ref={receiptRef}
          style={{
            position: "absolute",
            left: "-9999px",
            width: 650,
            padding: 30,
            backgroundColor: "#fff",
            fontFamily: "Helvetica, Arial, sans-serif",
            color: "#111",
            fontSize: 12,
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src="/logo.jpg" style={{ height: 60, marginBottom: 10 }} />
            <h1 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: 5 }}>
              {profile.business_name}
            </h1>
            <p style={{ margin: "2px 0" }}>{profile.business_address}</p>
            <p style={{ margin: "2px 0" }}>{profile.phone_number}</p>
            <hr style={{ margin: "15px 0", borderColor: "#ddd" }} />
          </div>

          <table style={{ width: "100%", marginBottom: 15, fontSize: "12px" }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold" }}>Customer</td>
                <td style={{ textAlign: "right" }}>{invoice.customer_name}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Invoice No</td>
                <td style={{ textAlign: "right" }}>{invoice.invoice_number}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Status</td>
                <td style={{ textAlign: "right" }}>{invoice.status}</td>
              </tr>
            </tbody>
          </table>

          {/* Items */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", backgroundColor: "#f9f9f9" }}>
                <th align="left" style={{ padding: "8px", fontWeight: "bold" }}>Item</th>
                <th align="center" style={{ padding: "8px", fontWeight: "bold" }}>S/N</th>
                <th align="center" style={{ padding: "8px", fontWeight: "bold" }}>Qty</th>
                <th align="right" style={{ padding: "8px", fontWeight: "bold" }}>Price</th>
              </tr>
            </thead>

            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{item.product}</td>
                  <td align="center" style={{ padding: "8px" }}>{item.serial_number || "-"}</td>
                  <td align="center" style={{ padding: "8px" }}>{item.quantity}</td>
                  <td align="right" style={{ padding: "8px" }}>
                    ₦{Number(item.sales_price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={{ width: "100%", marginTop: 15, fontSize: "12px" }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold" }}>Total Price</td>
                <td align="right">
                  ₦{Number(invoice.total_amount).toLocaleString()}
                </td>
              </tr>
              {!isReceipt && (
                <tr>
                  <td style={{ fontWeight: "bold" }}>Outstanding</td>
                  <td align="right">
                    ₦{Number(invoice.outstanding).toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <hr style={{ margin: "15px 0", borderColor: "#ddd" }} />
          <p style={{ textAlign: "center", fontSize: "12px", marginTop: 10 }}>
            Thank you for your business
          </p>
        </div>

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Invoice
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              This action cannot be undone. Are you sure you want to permanently delete this invoice?
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="border px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={deleteInvoice}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-3xl space-y-6">

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Invoice
            </h3>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-500">Invoice Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>

            {/* Items */}
            <div className="space-y-4">
              {editItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-5 gap-3 items-end border p-3 rounded-lg">

                  <input
                    placeholder="Product"
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(index, "product", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />

                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={item.sales_price}
                    onChange={(e) =>
                      handleItemChange(index, "sales_price", Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />

                  <input
                    placeholder="Serial"
                    value={item.serial_number || ""}
                    onChange={(e) =>
                      handleItemChange(index, "serial_number", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />

                  <button
                    onClick={() => removeItem(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addNewItem}
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm"
            >
              + Add Item
            </button>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
                className="border px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={updateInvoice}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
