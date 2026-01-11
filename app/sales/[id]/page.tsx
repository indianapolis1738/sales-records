"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import StatusBadge from "@/components/StatusBadge"
import Skeleton from "@/components/Skeleton"

type InvoiceItem = {
  id: string
  product_name: string
  quantity_sold: number
  serial_number: string | null
  cost_price: number
  selling_price: number
}

export default function EditSale() {
  const { id } = useParams() // invoice_number or invoice id
  const router = useRouter()

  const [invoice, setInvoice] = useState<any>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true)

      // 1️⃣ Fetch invoice
      const { data: invoiceData, error } = await supabase
        .from("sales")
        .select("*")
        .eq("invoice_number", id)
        .single()

      if (error || !invoiceData) {
        console.log(error)
        return
      }

      setInvoice(invoiceData)

      // 2️⃣ Fetch invoice items
      const { data: itemsData } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_number", invoiceData.invoice_number)

      setItems(itemsData || [])
      setLoading(false)
    }

    fetchInvoice()
  }, [id])

  const recalculateTotals = () => {
    const totalAmount = items.reduce(
      (s, i) => s + i.quantity_sold * i.selling_price,
      0
    )

    const totalProfit = items.reduce(
      (s, i) =>
        s + i.quantity_sold * (i.selling_price - i.cost_price),
      0
    )

    return { totalAmount, totalProfit }
  }

  const handleSave = async () => {
    setSaving(true)

    const { totalAmount, totalProfit } = recalculateTotals()
    const outstanding = Number(invoice.outstanding || 0)

    const status =
      outstanding <= 0
        ? "Paid"
        : outstanding < totalAmount
        ? "Part Payment"
        : "Unpaid"

    // 3️⃣ Update invoice
    await supabase
      .from("sales")
      .update({
        customer_name: invoice.customer_name,
        date: invoice.date,
        total_amount: totalAmount,
        total_profit: totalProfit,
        outstanding,
        status
      })
      .eq("invoice_number", invoice.invoice_number)

    // 4️⃣ Update items
    for (const item of items) {
      await supabase
        .from("invoice_items")
        .update({
          product_name: item.product_name,
          quantity_sold: item.quantity_sold,
          serial_number: item.serial_number,
          cost_price: item.cost_price,
          selling_price: item.selling_price,
          total_amount: item.quantity_sold * item.selling_price,
          total_profit:
            item.quantity_sold * (item.selling_price - item.cost_price)
        })
        .eq("id", item.id)
    }

    setSaving(false)
    router.push(`/sales/${invoice.invoice_number}/info`)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Skeleton className="h-40" />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto space-y-6 px-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">
              Edit {invoice.outstanding > 0 ? "Invoice" : "Receipt"}
            </h1>
            <p className="text-sm text-gray-500">
              {invoice.invoice_number}
            </p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Invoice Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded"
            value={invoice.customer_name}
            onChange={(e) =>
              setInvoice({ ...invoice, customer_name: e.target.value })
            }
            placeholder="Customer name"
          />
          <input
            type="date"
            className="border p-3 rounded"
            value={invoice.date}
            onChange={(e) =>
              setInvoice({ ...invoice, date: e.target.value })
            }
          />
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Price</th>
                <th className="p-3">S/N</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    <input
                      className="border p-2 rounded w-full"
                      value={item.product_name}
                      onChange={(e) => {
                        const copy = [...items]
                        copy[idx].product_name = e.target.value
                        setItems(copy)
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="border p-2 rounded w-20"
                      value={item.quantity_sold}
                      onChange={(e) => {
                        const copy = [...items]
                        copy[idx].quantity_sold = Number(e.target.value)
                        setItems(copy)
                      }}
                    />
                  </td>
                  <td className="p-3">₦{item.cost_price.toLocaleString()}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="border p-2 rounded w-28"
                      value={item.selling_price}
                      onChange={(e) => {
                        const copy = [...items]
                        copy[idx].selling_price = Number(e.target.value)
                        setItems(copy)
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="border p-2 rounded w-full"
                      value={item.serial_number || ""}
                      onChange={(e) => {
                        const copy = [...items]
                        copy[idx].serial_number = e.target.value
                        setItems(copy)
                      }}
                    />
                  </td>
                  <td className="p-3 font-medium">
                    ₦{(item.quantity_sold * item.selling_price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </ProtectedRoute>
  )
}
