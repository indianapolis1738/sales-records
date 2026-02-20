"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Lock, Shield, Key, LogOut, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SecurityPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-slate-200 dark:bg-neutral-700 rounded-lg"></div>
              <div className="h-64 bg-slate-200 dark:bg-neutral-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Shield size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  Security Settings
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                  Manage your account security, passwords, and sessions
                </p>
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Account Information
              </h2>
            </div>
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Email Address
                  </p>
                  <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white break-all">
                    {userEmail || "Loading..."}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    This is the email address associated with your account. Contact support if you need to change it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Security Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key size={24} className="text-blue-600 dark:text-blue-400" />
              Password & Access
            </h2>

            {/* Change Password Card */}
            <Link href="/security/change-password">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer group">
                <div className="px-6 py-6 sm:px-8 sm:py-8 flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                      <Lock size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        Change Password
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Update your password to keep your account secure
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ArrowRight size={24} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Reset Password Card */}
            <Link href="/security/reset-password">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer group">
                <div className="px-6 py-6 sm:px-8 sm:py-8 flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition">
                      <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        Reset Password
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive a reset link via email if you forgot your password
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ArrowRight size={24} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Security Tips */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
              Security Tips
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-sm">
                  Strong Password
                </h3>
                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                  <li>✓ Use at least 8 characters</li>
                  <li>✓ Mix uppercase and lowercase</li>
                  <li>✓ Add numbers and symbols</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-sm">
                  Account Safety
                </h3>
                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                  <li>✓ Never share your password</li>
                  <li>✓ Log out on shared devices</li>
                  <li>✓ Update regularly</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                  Unique Passwords
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✓ Don't reuse passwords</li>
                  <li>✓ Use different passwords</li>
                  <li>✓ Consider a password manager</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                  Session Management
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✓ Check active sessions</li>
                  <li>✓ Log out old sessions</li>
                  <li>✓ Monitor login activity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Danger Zone
            </h2>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <LogOut size={24} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
                        Sign Out
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Sign out of your account. You'll need to log in again to access your data.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={signingOut}
                    className="flex-shrink-0 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 active:scale-95 mt-2 sm:mt-0"
                  >
                    {signingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sign Out Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 w-full max-w-sm animate-in zoom-in-95">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Sign Out?
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to sign out? You'll need to log in again to access your account.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={signingOut}
                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
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