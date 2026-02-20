"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { X } from "lucide-react"

export default function AddCustomerModal({ onClose, onSuccess }: any) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("Prospect")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError("Customer name is required")
      return
    }

    setError("")
    setLoading(true)

    // Get the currently logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setLoading(false)
      setError("You must be logged in to add a customer")
      return
    }

    // Insert customer with user_id for RLS
    const { error: insertError } = await supabase.from("customers").insert({
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      status,
      user_id: user.id,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    onSuccess()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-neutral-800">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg sm:text-xl text-slate-900 dark:text-white">
            Add Customer
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} className="sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Enter full name"
              type="text"
              disabled={loading}
              onKeyDown={handleKeyDown}
              className="w-full text-sm sm:text-base border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 sm:p-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              placeholder="Enter phone number"
              type="tel"
              disabled={loading}
              onKeyDown={handleKeyDown}
              className="w-full text-sm sm:text-base border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 sm:p-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              disabled={loading}
              onKeyDown={handleKeyDown}
              className="w-full text-sm sm:text-base border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 sm:p-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Customer Status */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Customer Status
            </label>
            <select
              disabled={loading}
              className="w-full text-sm sm:text-base border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 sm:p-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Prospect">Prospect</option>
              <option value="Lead">Lead</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes <span className="text-slate-500 dark:text-slate-400">(Optional)</span>
            </label>
            <textarea
              placeholder="Add any notes about this customer"
              rows={3}
              disabled={loading}
              onKeyDown={handleKeyDown}
              className="w-full text-sm sm:text-base border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 sm:p-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 sm:p-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm sm:text-base"
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>

      </div>
    </div>
  )
}
