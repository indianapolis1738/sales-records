"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Plus, X } from "lucide-react"

export default function AddSale() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [inventory, setInventory] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  const [productModalOpen, setProductModalOpen] = useState(false)
  const [customerModalOpen, setCustomerModalOpen] = useState(false)

  const [newProduct, setNewProduct] = useState({
    product_name: "",
    sku: "",
    imei: "",
    quantity: "",
    cost_price: "",
    sales_price: ""
  })

  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone_number: "",
    status: "Prospect"
  })

  const [savingProduct, setSavingProduct] = useState(false)

  const [form, setForm] = useState({
    date: "",
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
  })

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

  const handleProductSelect = (id: string) => {
    const item = inventory.find(i => i.id === id)
    if (!item) return
    setForm({
      ...form,
      product_id: item.id,
      product_name: item.product_name,
      cost_price: item.cost_price.toString(),
      sales_price: item.sales_price.toString(),
      imei: item.imei || ""
    })
  }

  const handleSubmit = async () => {
    if (!form.customer_id || !form.product_id) {
      alert("Select customer and product")
      return
    }

    const soldQty = Number(form.quantity)
    const item = inventory.find(i => i.id === form.product_id)

    if (soldQty > item.quantity) {
      alert("Insufficient stock")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("sales").insert({
      user_id: user.id,
      date: form.date,
      customer_id: form.customer_id,
      customer: form.customer_name,
      product: form.product_name,
      cost_price: Number(form.cost_price),
      sales_price: Number(form.sales_price),
      status: form.status,
      outstanding: Number(form.outstanding),
      serial_number: form.serial_number,
      imei: form.imei
    })

    await supabase
      .from("customers")
      .update({ status: "Customer" })
      .eq("id", form.customer_id)

    await supabase
      .from("inventory")
      .update({ quantity: item.quantity - soldQty })
      .eq("id", item.id)

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

        <h1 className="text-xl font-semibold">Add Sale</h1>

        <label className="text-sm text-gray-600">Sale Date</label>
        <Input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />


        {/* Customer */}
        <div className="relative">
          <select
            value={form.customer_id}
            onChange={e => {
              const c = customers.find(c => c.id === e.target.value)
              if (!c) return
              setForm({ ...form, customer_id: c.id, customer_name: c.full_name })
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
          value={form.product_id}
          onChange={e => handleProductSelect(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">Select Product</option>
          {inventory.map(i => (
            <option key={i.id} value={i.id}>
              {i.product_name} ({i.quantity})
            </option>
          ))}
        </select>

        <Input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />

        <Input
          type="number"
          placeholder="Sales price"
          value={form.sales_price}
          onChange={e => setForm({ ...form, sales_price: e.target.value })}
        />

        {/* PAYMENT STATUS */}
        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="Paid">Paid</option>
          <option value="Part Payment">Part Payment</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        {/* OUTSTANDING */}
        <Input
          type="number"
          placeholder="Outstanding balance"
          value={form.outstanding}
          onChange={e => setForm({ ...form, outstanding: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Saving..." : "Add Sale"}
        </button>
      </div>
      {customerModalOpen && (
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
              onChange={e =>
                setNewCustomer({ ...newCustomer, full_name: e.target.value })
              }
            />

            <Input
              placeholder="Phone number"
              value={newCustomer.phone_number}
              onChange={e =>
                setNewCustomer({ ...newCustomer, phone_number: e.target.value })
              }
            />

            <select
              value={newCustomer.status}
              onChange={e =>
                setNewCustomer({ ...newCustomer, status: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option>Prospect</option>
              <option>Lead</option>
              <option>Customer</option>
            </select>

            <button
              onClick={async () => {
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
              }}
              className="w-full bg-black text-white py-2 rounded"
            >
              Save Customer
            </button>
          </div>
        </div>
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
