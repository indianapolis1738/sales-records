"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AlertCircle, Check, Mail, ArrowLeft } from "lucide-react"
// import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Fetch user email on mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setEmail(user.email)
        }
      } catch (err) {
        console.error("Error fetching user email:", err)
      } finally {
        setLoading(false)
      }
    }

    getUserEmail()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setSubmitting(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/security/reset-password-confirm`
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-neutral-700 rounded w-32"></div>
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
        <div className="max-w-2xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm mb-6 transition group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Mail size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Receive a reset link via email if you forgot your password
                </p>
              </div>
            </div>
          </div>

          {/* Reset Password Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">

            {/* Card Body */}
            <form onSubmit={handleResetPassword} className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
                  <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 text-sm">
                      Reset email sent successfully!
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                      Check your email inbox for a password reset link. The link will expire in 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100 text-sm">
                      Error
                    </p>
                    <p className="text-xs text-red-800 dark:text-red-200 mt-0.5">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  📧 We've pre-filled your account email, we'll send you a password reset link.
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  disabled
                  className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-3 sm:py-3.5 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-neutral-900"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                  disabled={submitting || success}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || success || !email.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 active:scale-95"
                >
                  {submitting ? "Sending..." : success ? "Email Sent!" : "Send Reset Link"}
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-neutral-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  What happens next?
                </h3>
                <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                    <span>We'll send a password reset link to your email</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                    <span>Click the link in your email (valid for 24 hours)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                    <span>Enter your new password</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                    <span>Log in with your new password</span>
                  </li>
                </ol>
              </div>

            </form>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}