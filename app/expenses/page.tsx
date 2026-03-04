"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
    Receipt,
    Download,
    Trash2,
    Edit,
    Search
} from "lucide-react"
import Skeleton from "@/components/Skeleton"

type Expense = {
    id: string
    date: string
    description: string
    category?: string
    amount: number
}

const ITEMS_PER_PAGE = 6

export default function ExpensesPage() {
    const [loading, setLoading] = useState(true)
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

    const [newExpense, setNewExpense] = useState({
        description: "",
        category: "",
        amount: ""
    })

    const [savingExpense, setSavingExpense] = useState(false)

    useEffect(() => {
        fetchExpenses()
    }, [])

    const fetchExpenses = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("expenses")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })

        setExpenses(data || [])
        setLoading(false)
    }

    /* ------------------ ADD EXPENSE ------------------ */
    const handleAddExpense = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (!newExpense.description.trim() || !newExpense.amount) return

        setSavingExpense(true)

        await supabase.from("expenses").insert([
            {
                user_id: user.id,
                date: new Date().toISOString().split("T")[0],
                description: newExpense.description,
                category: newExpense.category,
                amount: Number(newExpense.amount)
            }
        ])

        setNewExpense({ description: "", category: "", amount: "" })
        setSavingExpense(false)
        fetchExpenses()
    }

    /* ------------------ DELETE ------------------ */
    const handleDelete = async (id: string) => {
        await supabase.from("expenses").delete().eq("id", id)
        fetchExpenses()
    }

    /* ------------------ UPDATE ------------------ */
    const handleUpdate = async () => {
        if (!editingExpense) return

        await supabase
            .from("expenses")
            .update({
                description: editingExpense.description,
                category: editingExpense.category,
                amount: editingExpense.amount
            })
            .eq("id", editingExpense.id)

        setEditingExpense(null)
        fetchExpenses()
    }

    /* ------------------ FILTERING ------------------ */
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const matchesSearch =
                exp.description.toLowerCase().includes(search.toLowerCase()) ||
                (exp.category || "").toLowerCase().includes(search.toLowerCase())

            const matchesStart = startDate ? exp.date >= startDate : true
            const matchesEnd = endDate ? exp.date <= endDate : true

            return matchesSearch && matchesStart && matchesEnd
        })
    }, [expenses, search, startDate, endDate])

    /* ------------------ PAGINATION ------------------ */
    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const totalAmount = filteredExpenses.reduce(
        (acc, e) => acc + Number(e.amount),
        0
    )

    const handleExport = () => {
        let csv = "Date,Description,Category,Amount\n"
        filteredExpenses.forEach(e => {
            csv += `${e.date},${e.description},${e.category || "-"},${e.amount}\n`
        })

        const blob = new Blob([csv], { type: "text/csv" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `expenses_report.csv`
        link.click()
    }

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <Skeleton className="h-20 w-64 rounded-xl" />
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 p-6">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Expenses
                        </h1>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm"
                        >
                            <Download size={16} />
                        </button>
                    </div>

                    {/* ADD EXPENSE FORM */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Add Expense</h3>

                        <div className="grid sm:grid-cols-4 gap-4">
                            <input
                                placeholder="Description"
                                value={newExpense.description}
                                onChange={e =>
                                    setNewExpense({ ...newExpense, description: e.target.value })
                                }
                                className="rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800"
                            />

                            <input
                                placeholder="Category"
                                value={newExpense.category}
                                onChange={e =>
                                    setNewExpense({ ...newExpense, category: e.target.value })
                                }
                                className="rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800"
                            />

                            <input
                                type="number"
                                placeholder="Amount"
                                value={newExpense.amount}
                                onChange={e =>
                                    setNewExpense({ ...newExpense, amount: e.target.value })
                                }
                                className="rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800"
                            />

                            <button
                                onClick={handleAddExpense}
                                disabled={savingExpense}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold"
                            >
                                {savingExpense ? "Saving..." : "Add"}
                            </button>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            Total (Filtered)
                        </p>
                        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                            ₦{totalAmount.toLocaleString()}
                        </p>
                    </div>


                    {/* Search + Filters */}
                    <div className="grid sm:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white dark:bg-neutral-800"
                            />
                        </div>

                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800"
                        />
                    </div>

                    {/* Expense List */}
                    <div className="space-y-3">
                        {paginatedExpenses.map(exp => (
                            <div
                                key={exp.id}
                                className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold">{exp.description}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(exp.date).toLocaleDateString()}
                                    </p>

                                    {exp.category && (
                                        <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            {exp.category}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="font-semibold">
                                        ₦{Number(exp.amount).toLocaleString()}
                                    </p>

                                    <button onClick={() => setEditingExpense(exp)}>
                                        <Edit size={16} />
                                    </button>

                                    <button onClick={() => handleDelete(exp.id)}>
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1
                                            ? "bg-slate-900 text-white"
                                            : "bg-white dark:bg-neutral-800 border"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}



                </div>
            </div>
        </ProtectedRoute>
    )
}