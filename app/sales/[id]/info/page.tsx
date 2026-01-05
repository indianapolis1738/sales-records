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
  const [sale, setSale] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: saleData } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id)
        .single()
      setSale(saleData)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profileData)
      }
    }

    fetchData()
  }, [id])

  if (!sale || !profile) return null

  const profit = Number(sale.sales_price) - Number(sale.cost_price)

  const markAsPaid = async () => {
    await supabase
      .from("sales")
      .update({ status: "Paid", outstanding: 0 })
      .eq("id", sale.id)

    setSale({ ...sale, status: "Paid", outstanding: 0 })
  }

  const downloadPDF = async () => {
    if (!receiptRef.current) return

    const canvas = await html2canvas(receiptRef.current, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(`receipt-${sale.customer}-${sale.date}.pdf`)
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Sale Information
        </h2>

        {/* Sale Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Date" value={sale.date} />
          <InfoRow label="Customer" value={sale.customer} />
          <InfoRow label="Product" value={sale.product} />
          <InfoRow
            label="Cost Price"
            value={`₦${Number(sale.cost_price).toLocaleString()}`}
          />
          <InfoRow
            label="Sales Price"
            value={`₦${Number(sale.sales_price).toLocaleString()}`}
          />
          <InfoRow label="S/N" value={sale.serial_number} />
          <InfoRow label="IMEI" value={sale.imei} />
          <InfoRow label="Profit" value={`₦${profit.toLocaleString()}`} />
          <InfoRow label="Status" value={<StatusBadge status={sale.status} />} />
          <InfoRow
            label="Outstanding"
            value={`₦${Number(sale.outstanding).toLocaleString()}`}
          />
          <InfoRow
            label="Created At"
            value={new Date(sale.created_at).toLocaleString()}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => router.push(`/sales/${sale.id}`)}
            className="border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Edit
          </button>

          {sale.status !== "Paid" && (
            <button
              onClick={markAsPaid}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
            >
              Mark as Paid
            </button>
          )}

          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Download Receipt
          </button>

          <button
            onClick={() => router.back()}
            className="text-sm underline text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 ml-auto"
          >
            Back
          </button>
        </div>

        {/* Hidden Receipt for PDF Generation */}
        <div
          ref={receiptRef}
          className="hidden"
        >
          {/* Receipt content */}
        </div>
      </div>
    </ProtectedRoute>
  )
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  )
}
