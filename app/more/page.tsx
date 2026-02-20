"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { User, Box, UserCircle2, Settings, LogOut, ArrowRight, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function MorePage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const options = [
    {
      name: "Profile",
      description: "View and edit your personal information",
      icon: <User size={24} />,
      path: "/profile",
      color: "blue"
    },
    {
      name: "Inventory",
      description: "Manage your products and stock",
      icon: <Box size={24} />,
      path: "/inventory",
      color: "purple"
    },
    {
      name: "Customers",
      description: "View and manage your customers",
      icon: <UserCircle2 size={24} />,
      path: "/customers",
      color: "green"
    },
    {
      name: "Security",
      description: "Manage passwords and account security",
      icon: <Settings size={24} />,
      path: "/security",
      color: "amber"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; bgHover: string; icon: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        bgHover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
        icon: "text-blue-600 dark:text-blue-400"
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        bgHover: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
        icon: "text-purple-600 dark:text-purple-400"
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        bgHover: "hover:bg-green-100 dark:hover:bg-green-900/30",
        icon: "text-green-600 dark:text-green-400"
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        bgHover: "hover:bg-amber-100 dark:hover:bg-amber-900/30",
        icon: "text-amber-600 dark:text-amber-400"
      }
    }
    return colors[color] || colors.blue
  }

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      alert("Failed to sign out")
    } finally {
      setSigningOut(false)
      setShowLogoutConfirm(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              More Options
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Access all the features and settings for your account
            </p>
          </div>

          {/* Main Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option) => {
              const colorClasses = getColorClasses(option.color)
              return (
                <button
                  key={option.name}
                  onClick={() => router.push(option.path)}
                  className={`${colorClasses.bg} ${colorClasses.bgHover} border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 text-left transition-all duration-200 group hover:shadow-md active:scale-95`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center ${colorClasses.bgHover} transition`}>
                      <div className={colorClasses.icon}>
                        {option.icon}
                      </div>
                    </div>
                    <ArrowRight
                      size={20}
                      className={`${colorClasses.icon} opacity-0 group-hover:opacity-100 transition-opacity mt-1`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {option.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Account
            </h2>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              disabled={signingOut}
              className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl p-6 text-left transition-all duration-200 group active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <LogOut size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
                      Sign Out
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {signingOut ? "Signing out..." : "Log out of your account"}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={20}
                  className="text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0"
                />
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              💡 <span className="font-semibold">Tip:</span> You can access your profile, inventory, customer list, and security settings from here. Your data is secure and encrypted.
            </p>
          </div>

        </div>

        {/* Sign Out Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 w-full max-w-sm animate-in zoom-in-95 shadow-xl">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Sign Out?
                  </h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Are you sure you want to sign out? You'll need to log in again to access your account.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={signingOut}
                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 active:scale-95"
                  >
                    {signingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}
