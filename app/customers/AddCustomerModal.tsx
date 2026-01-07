"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AddCustomerModal({ onClose, onSuccess }: any) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("Prospect")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!fullName) return alert("Customer name is required")

    setLoading(true)

    // Get the currently logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setLoading(false)
      return alert("You must be logged in to add a customer")
    }

    // Insert customer with user_id for RLS
    const { error } = await supabase.from("customers").insert({
      full_name: fullName,
      phone_number: phone,
      email,
      notes,
      status,
      user_id: user.id, // ✅ include this for RLS
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-white dark:bg-neutral-900 w-full rounded-t-2xl p-4 space-y-4 border-t border-gray-200 dark:border-neutral-700">

        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Add Customer
        </h2>

        <input
          placeholder="Full name *"
          className="w-full border rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="Phone number"
          className="w-full border rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email address"
          className="w-full border rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          placeholder="Notes (optional)"
          rows={3}
          className="w-full border rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <select
          className="w-full border rounded-md p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Prospect">Prospect</option>
          <option value="Lead">Lead</option>
          <option value="Customer">Customer</option>
        </select>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-neutral-700 rounded-md p-2 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-md p-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  )
}
