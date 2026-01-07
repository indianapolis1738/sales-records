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
      // Fetch sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id)
        .single()
      if (!saleError) setSale(saleData)

      // Fetch current user profile
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
      <div className="max-w-3xl mx-auto md:p-6 sm:p-2 rounded-2xl shadow-sm space-y-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-2  rounded-2xl shadow-sm space-y-6">
          {/* Header */}
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sale Information</h2>

          {/* Sale Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
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
              className="border border-slate-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
            >
              Edit
            </button>

            {sale.status !== "Paid" && (
              <button
                onClick={markAsPaid}
                className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-600 transition"
              >
                Mark as Paid
              </button>
            )}

            <button
              onClick={downloadPDF}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Download Receipt
            </button>

            <button
              onClick={() => router.back()}
              className="text-sm underline text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white ml-auto"
            >
              Back
            </button>
          </div>
        </div>


        {/* Hidden Receipt for PDF Generation */}
        <div
          ref={receiptRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: 650,
            padding: 30,
            backgroundColor: "#fff",
            fontFamily: "Helvetica, Arial, sans-serif",
            color: "#111",
            lineHeight: 1.5,
            fontSize: 12,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            {/* <img
              src="/logo.png"
              alt="Company Logo"
              style={{ height: 60, marginBottom: 10 }}
            /> */}
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
              {profile.business_name}
            </h1>
            <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
              {profile.business_address}
            </p>
            <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
              {profile.phone_number}
            </p>
            <hr style={{ margin: "15px 0", borderColor: "#ddd" }} />
          </div>

          {/* Sale Details */}
          <div style={{ marginBottom: 15 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
              Receipt
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 10,
              }}
            >
              <tbody>
                {[
                  ["Customer", sale.customer],
                  ["Date", sale.date],
                  ["Status", sale.status],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "6px 0",
                        fontWeight: 600,
                        color: "#555",
                        width: "50%",
                      }}
                    >
                      {label}
                    </td>
                    <td style={{ padding: "6px 0", textAlign: "right" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Product Details */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 10,
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Product</th>
                <th style={{ textAlign: "center", padding: "8px 0" }}>S/N</th>
                {/* <th style={{ textAlign: "center", padding: "8px 0" }}>IMEI</th> */}
                <th style={{ textAlign: "right", padding: "8px 0" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px 0" }}>{sale.product}</td>
                <td style={{ textAlign: "center" }}>{sale.serial_number}</td>
                {/* <td style={{ textAlign: "center" }}>{sale.imei}</td> */}
                <td style={{ textAlign: "right" }}>
                  ₦{Number(sale.sales_price).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ width: "100%", marginTop: 10, fontSize: 12 }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Outstanding</td>
                <td style={{ textAlign: "right" }}>
                  ₦{Number(sale.outstanding).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Total Paid</td>
                <td style={{ textAlign: "right" }}>
                  ₦{Number(sale.sales_price - sale.outstanding).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <hr style={{ margin: "15px 0", borderColor: "#ddd" }} />

          {/* Footer */}
          <p style={{ fontSize: 12, color: "#555", textAlign: "center", marginTop: 10 }}>
            Thank you for your business!
          </p>
        </div>

      </div>
    </ProtectedRoute>
  )
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>

  )
}
