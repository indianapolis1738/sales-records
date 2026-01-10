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
    setSalesRows([
      ...salesRows,
      {
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
        date: new Date().toISOString().split("T")[0],
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
      sales_price: Number(row.sales_price)
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
  

  const pickFromContacts = async () => {
    if (!("contacts" in navigator) || !("ContactsManager" in window)) {
      alert("Contacts access is not supported on this device")
      return
    }

    try {
      // @ts-ignore
      const contacts = await navigator.contacts.select(
        ["name", "tel"],
        { multiple: false }
      )

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
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 p-6 rounded-2xl space-y-6">

        <h1 className="text-xl font-semibold">Add Sale(s)</h1>

        {salesRows.map((row, index) => (
          <div key={index} className="border rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-neutral-800">
            {/* Customer */}
            <div className="relative">
              <select
                value={row.customer_id}
                onChange={e => {
                  const c = customers.find(c => c.id === e.target.value)
                  if (!c) return
                  handleChange(index, "customer_id", c.id)
                  handleChange(index, "customer_name", c.full_name)
                }}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.status})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setCustomerModalOpen(true)}
                className="absolute top-1 right-1 bg-black text-white text-xs px-2 py-1 rounded"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {/* Product */}
            <select
              value={row.product_id}
              onChange={e => handleProductSelect(index, e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select Product</option>
              {inventory.map(i => (
                <option key={i.id} value={i.id}>
                  {i.product_name} ({i.quantity})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Quantity"
                value={row.quantity}
                onChange={e => handleChange(index, "quantity", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Sales Price"
                value={row.sales_price}
                onChange={e => handleChange(index, "sales_price", e.target.value)}
              />
              <button onClick={() => removeRow(index)} className="text-red-500">
                <Trash size={20} />
              </button>
            </div>

            <select
              value={row.status}
              onChange={e => handleChange(index, "status", e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Paid">Paid</option>
              <option value="Part Payment">Part Payment</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <Input
              type="number"
              placeholder="Outstanding balance"
              value={row.outstanding}
              onChange={e => handleChange(index, "outstanding", e.target.value)}
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={addRow} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center gap-1 text-gray-900 dark:text-gray-100">
            <Plus size={16} /> Add Row
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            {loading ? "Saving..." : "Submit Sales"}
          </button>
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
