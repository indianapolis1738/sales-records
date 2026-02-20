"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Plus, X, Trash2, ChevronDown, User, Package, Calendar, AlertCircle } from "lucide-react"

export default function AddSale() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [inventory, setInventory] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  const [customerModalOpen, setCustomerModalOpen] = useState(false)

  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone_number: "",
    status: "Prospect"
  })

  // 🔹 MULTI SALE ROWS
  const [salesRows, setSalesRows] = useState([
    {
      date: new Date().toISOString().split("T")[0],
      customer_id: "",
      customer_name: "",
      product_id: "",
      product_name: "",
      quantity: "1",
      cost_price: "",
      sales_price: "",
      status: "Unpaid",
      outstanding: "",
      serial_number: "",
      imei: ""
    }
  ])

  useEffect(() => {
    fetchInventory()
    fetchCustomers()
  }, [])

  const fetchInventory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user.id)
    setInventory(data || [])
  }

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
    setCustomers(data || [])
  }

  const handleProductSelect = (rowIndex: number, id: string) => {
    const item = inventory.find(i => i.id === id)
    if (!item) return
    const newRows = [...salesRows]
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      product_id: item.id,
      product_name: item.product_name,
      cost_price: item.cost_price.toString(),
      sales_price: item.sales_price.toString(),
      imei: item.imei || ""
    }
    setSalesRows(newRows)
  }

  const handleChange = (rowIndex: number, field: string, value: string) => {
    const newRows = [...salesRows]
    newRows[rowIndex][field as keyof typeof newRows[number]] = value
    setSalesRows(newRows)
  }

  const addRow = () => {
    const firstRowCustomer = salesRows[0]
    
    setSalesRows([
      ...salesRows,
      {
        date: firstRowCustomer.date,
        customer_id: firstRowCustomer.customer_id,
        customer_name: firstRowCustomer.customer_name,
        product_id: "",
        product_name: "",
        quantity: "1",
        cost_price: "",
        sales_price: "",
        status: "Unpaid",
        outstanding: "",
        serial_number: "",
        imei: ""
      }
    ])
  }

  const removeRow = (index: number) => {
    const newRows = [...salesRows]
    newRows.splice(index, 1)
    setSalesRows(newRows)
  }

  const generateInvoiceNumber = () => {
    return `INV-${Date.now()}`
  }

  const calculateProfit = (costPrice: string, salesPrice: string, quantity: string) => {
    const cost = Number(costPrice) || 0
    const sales = Number(salesPrice) || 0
    const qty = Number(quantity) || 0
    return (sales - cost) * qty
  }

  const handleSubmit = async () => {
    setLoading(true)

    // basic validation
    for (const row of salesRows) {
      if (!row.customer_id || !row.product_id) {
        alert("Select customer and product for each row")
        setLoading(false)
        return
      }

      const item = inventory.find(i => i.id === row.product_id)
      if (!item || Number(row.quantity) > item.quantity) {
        alert(`Insufficient stock for ${row.product_name}`)
        setLoading(false)
        return
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const invoiceNumber = generateInvoiceNumber()
    const customerName = salesRows[0].customer_name
    const status = salesRows[0].status

    // 1️⃣ CREATE INVOICE (sales table)
    const { data: invoice, error: invoiceError } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        date: salesRows[0].date || new Date().toISOString().split("T")[0],
        customer_name: customerName,
        invoice_number: invoiceNumber,
        status,
        outstanding: Number(salesRows[0].outstanding || 0)
      })
      .select()
      .single()

    if (invoiceError) {
      alert("Failed to create invoice")
      setLoading(false)
      return
    }

    // 2️⃣ INSERT INVOICE ITEMS
    const invoiceItems = salesRows.map(row => ({
      sale_id: invoice.id,
      user_id: user.id,
      product: row.product_name,
      quantity: Number(row.quantity),
      cost_price: Number(row.cost_price),
      sales_price: Number(row.sales_price),
      serial_number: row.serial_number,
    }))

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems)

    if (itemsError) {
      alert("Failed to add invoice items")
      setLoading(false)
      return
    }

    // 3️⃣ UPDATE INVENTORY
    for (const row of salesRows) {
      const item = inventory.find(i => i.id === row.product_id)
      await supabase
        .from("inventory")
        .update({ quantity: item.quantity - Number(row.quantity) })
        .eq("id", item.id)
    }

    // 4️⃣ UPDATE CUSTOMER STATUS
    await supabase
      .from("customers")
      .update({ status: "Customer" })
      .eq("id", salesRows[0].customer_id)

    // 5️⃣ UPDATE INVOICE TOTALS
    await supabase.rpc("update_invoice_totals", {
      sale_uuid: invoice.id
    })

    setLoading(false)
    router.push("/")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Add Sale
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Add one or multiple items to a single invoice
            </p>
          </div>

          {/* Invoice Header Section */}
          {salesRows.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 mb-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={salesRows[0].date}
                    onChange={e => handleChange(0, "date", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                    <User size={14} className="inline mr-1" />
                    Customer
                  </label>
                  <div className="relative">
                    <select
                      value={salesRows[0].customer_id}
                      onChange={e => {
                        const c = customers.find(c => c.id === e.target.value)
                        if (!c) return
                        handleChange(0, "customer_id", c.id)
                        handleChange(0, "customer_name", c.full_name)
                      }}
                      className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition appearance-none"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} • {c.status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 dark:text-slate-600 pointer-events-none" />
                  </div>
                </div>

                {/* Add Customer Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => setCustomerModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                  >
                    <Plus size={16} /> New Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="space-y-4 mb-8">
            {salesRows.map((row, index) => (
              <div key={index} className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:border-slate-300 dark:hover:border-neutral-700 transition overflow-hidden">
                
                {/* Item Header */}
                <div className="bg-slate-50 dark:bg-neutral-800/50 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Item {index + 1}
                  </h3>
                  {salesRows.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      <Package size={14} className="inline mr-1" />
                      Product
                    </label>
                    <div className="relative">
                      <select
                        value={row.product_id}
                        onChange={e => handleProductSelect(index, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition appearance-none"
                      >
                        <option value="">Select Product</option>
                        {inventory.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.product_name} • {i.quantity} in stock
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 dark:text-slate-600 pointer-events-none" />
                    </div>
                  </div>

                  {/* Quantity and Prices Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={row.quantity}
                        onChange={e => handleChange(index, "quantity", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Cost Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={row.cost_price}
                        onChange={e => handleChange(index, "cost_price", e.target.value)}
                        disabled
                        className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 py-2.5 text-sm bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition opacity-75"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Sales Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={row.sales_price}
                        onChange={e => handleChange(index, "sales_price", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Profit
                      </label>
                      <div className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 py-2.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold flex items-center">
                        ₦{calculateProfit(row.cost_price, row.sales_price, row.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Status and Outstanding */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          value={row.status}
                          onChange={e => handleChange(index, "status", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition appearance-none"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Part Payment">Part Payment</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 dark:text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Outstanding
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={row.outstanding}
                        onChange={e => handleChange(index, "outstanding", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                      />
                    </div>
                  </div>

                  {/* Serial Number / Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Serial Number / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={row.serial_number}
                      onChange={e => handleChange(index, "serial_number", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={addRow}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
            >
              <Plus size={18} /> Add Another Item
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !salesRows[0].customer_id}
              className="flex-1 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : "Submit Sales"}
            </button>
          </div>
        </div>
      </div>

      {customerModalOpen && (
        <CustomerModal
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          setCustomerModalOpen={setCustomerModalOpen}
          fetchCustomers={fetchCustomers}
        />
      )}
    </ProtectedRoute>
  )
}

function CustomerModal({ newCustomer, setNewCustomer, setCustomerModalOpen, fetchCustomers }: any) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!newCustomer.full_name.trim()) {
      alert("Please enter customer name")
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    await supabase.from("customers").insert({
      user_id: user.id,
      full_name: newCustomer.full_name,
      phone_number: newCustomer.phone_number,
      status: newCustomer.status,
    })

    setNewCustomer({ full_name: "", phone_number: "", status: "Prospect" })
    setCustomerModalOpen(false)
    fetchCustomers()
    setSaving(false)
  }

  const pickFromContacts = async () => {
    if (!("contacts" in navigator) || !("ContactsManager" in window)) {
      alert("Contacts access is not supported on this device")
      return
    }

    try {
      // @ts-ignore
      const contacts = await navigator.contacts.select(["name", "tel"], { multiple: false })
      if (!contacts.length) return
      const contact = contacts[0]
      setNewCustomer({
        ...newCustomer,
        full_name: contact.name?.[0] || "",
        phone_number: contact.tel?.[0] || "",
      })
    } catch (err) {
      console.error("Contact pick cancelled or failed", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setCustomerModalOpen(false)
    }
    if (e.key === "Enter" && !saving && newCustomer.full_name.trim()) {
      handleSave()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Add Customer
          </h2>
          <button
            onClick={() => setCustomerModalOpen(false)}
            className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Contact Import Button */}
        <button
          onClick={pickFromContacts}
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
        >
          📇 Import from Contacts
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-neutral-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-neutral-900 text-slate-500 dark:text-slate-400">or enter manually</span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={newCustomer.full_name}
              onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={saving}
              className="w-full text-sm sm:text-base rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={newCustomer.phone_number}
              onChange={e => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={saving}
              className="w-full text-sm sm:text-base rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Customer Status
            </label>
            <div className="relative">
              <select
                value={newCustomer.status}
                onChange={e => setNewCustomer({ ...newCustomer, status: e.target.value })}
                onKeyDown={handleKeyDown}
                disabled={saving}
                className="w-full text-sm sm:text-base rounded-lg border border-slate-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="Prospect">Prospect</option>
                <option value="Lead">Lead</option>
                <option value="Customer">Customer</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 sm:top-3.5 text-slate-400 dark:text-slate-600 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-neutral-800">
          <button
            onClick={() => setCustomerModalOpen(false)}
            disabled={saving}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-sm sm:text-base rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !newCustomer.full_name.trim()}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-sm sm:text-base rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "Save Customer"}
          </button>
        </div>

      </div>
    </div>
  )
}
