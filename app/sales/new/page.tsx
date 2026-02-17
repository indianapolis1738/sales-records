"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Plus, X, Trash } from "lucide-react"

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
      date: '',
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
    // Get customer info from the first row
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
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 sm:p-6 ">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Add Sale(s)
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add one or multiple items to a single invoice
            </p>
          </div>

          {/* Invoice Header Section */}
          {salesRows.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={salesRows[0].date}
                    onChange={e => handleChange(0, "date", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
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
                      className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition appearance-none"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} ({c.status})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-3 text-gray-600 dark:text-gray-400">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Add Customer Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => setCustomerModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                  >
                    <Plus size={16} /> Add Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="space-y-4 mb-6">
            {salesRows.map((row, index) => (
              <div key={index} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition">
                
                {/* Item Number */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Item {index + 1}
                  </h3>
                  {salesRows.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove item"
                    >
                      <Trash size={18} />
                    </button>
                  )}
                </div>

                {/* Product Selection */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Product
                  </label>
                  <div className="relative">
                    <select
                      value={row.product_id}
                      onChange={e => handleProductSelect(index, e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition appearance-none"
                    >
                      <option value="">Select Product</option>
                      {inventory.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.product_name} ({i.quantity} in stock)
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-3 text-gray-600 dark:text-gray-400">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={row.quantity}
                      onChange={e => handleChange(index, "quantity", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Sales Price
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={row.sales_price}
                      onChange={e => handleChange(index, "sales_price", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* Payment Status and Outstanding */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Status
                    </label>
                    <select
                      value={row.status}
                      onChange={e => handleChange(index, "status", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition appearance-none"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Part Payment">Part Payment</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Outstanding
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={row.outstanding}
                      onChange={e => handleChange(index, "outstanding", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* Notes / Serial Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Serial Number / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={row.serial_number}
                    onChange={e => handleChange(index, "serial_number", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addRow}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-neutral-700 transition"
            >
              <Plus size={18} /> Add Another Item
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-neutral-900"
    />
  )
}

function CustomerModal({ newCustomer, setNewCustomer, setCustomerModalOpen, fetchCustomers }: any) {
  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("customers").insert({
      user_id: user.id,
      full_name: newCustomer.full_name,
      phone_number: newCustomer.phone_number,
      status: newCustomer.status,
    })

    setNewCustomer({ full_name: "", phone_number: "", status: "Prospect" })
    setCustomerModalOpen(false)
    fetchCustomers()
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

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
      <div className="bg-white dark:bg-neutral-900 w-full rounded-t-2xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Add Customer</h2>
          <button onClick={() => setCustomerModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <button
          onClick={pickFromContacts}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-sm"
        >
          📇 Import from Contacts
        </button>

        <Input
          placeholder="Full name"
          value={newCustomer.full_name}
          onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
        />
        <Input
          placeholder="Phone number"
          value={newCustomer.phone_number}
          onChange={e => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
        />
        <select
          value={newCustomer.status}
          onChange={e => setNewCustomer({ ...newCustomer, status: e.target.value })}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option>Prospect</option>
          <option>Lead</option>
          <option>Customer</option>
        </select>

        <button
          onClick={handleSave}
          className="w-full bg-black text-white py-2 rounded"
        >
          Save Customer
        </button>
      </div>
    </div>
  )
}
