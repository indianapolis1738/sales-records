"use client"

import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { User, Box, UserCircle2Icon } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function MorePage() {
  const router = useRouter()

  const options = [
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
    { name: "Inventory", icon: <Box size={20} />, path: "/inventory" },
    { name: "Customers", icon: <UserCircle2Icon size={20} />, path: "/customers" },
    // You can add more sections here later
  ]

  // Logout
    const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push("/login")
    }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-4 py-5">
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 space-y-6">

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">
            More Options
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Navigate to your profile, inventory, and more.
          </p>

          <div className="space-y-4">
            {options.map((option) => (
              <button
                key={option.name}
                onClick={() => router.push(option.path)}
                className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
              >
                {option.icon}
                <span className="font-medium text-gray-900 dark:text-gray-100">{option.name}</span>
              </button>
            ))}
          </div>
          <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                >
                  Logout
                </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
