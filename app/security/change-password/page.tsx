"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Lock, Eye, EyeOff, Check, ArrowLeft, AlertCircle } from "lucide-react"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Password strength validation
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    passwordsMatch: newPassword === confirmPassword && newPassword.length > 0
  }

  const isPasswordStrong = Object.values(passwordRequirements).every(req => req)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    // Validate password strength
    if (!isPasswordStrong) {
      setError("Password does not meet all requirements")
      return
    }

    // Validate current password is provided
    if (!currentPassword.trim()) {
      setError("Please enter your current password")
      return
    }

    setLoading(true)

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        // Check if it's an authentication error
        if (updateError.message.includes("Invalid login credentials")) {
          setError("Current password is incorrect")
        } else {
          setError(updateError.message)
        }
        return
      }

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/security")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
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
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Lock size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Change Password
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">

            {/* Card Body */}
            <form onSubmit={handleChangePassword} className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
                  <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 text-sm">
                      Password changed successfully!
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                      Redirecting you back to security settings...
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

              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      setError("")
                    }}
                    disabled={loading || success}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-3 sm:py-3.5 pr-12 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    disabled={loading || success}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-neutral-900 text-slate-500 dark:text-slate-400">
                    New Password
                  </span>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                    disabled={loading || success}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-3 sm:py-3.5 pr-12 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    disabled={loading || success}
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                    disabled={loading || success}
                    className="w-full border border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-3 sm:py-3.5 pr-12 text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    disabled={loading || success}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-slate-200 dark:border-neutral-700 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                    Password Requirements
                  </p>
                  <div className="space-y-2">
                    <RequirementItem
                      met={passwordRequirements.minLength}
                      label="At least 8 characters"
                    />
                    <RequirementItem
                      met={passwordRequirements.hasUpperCase}
                      label="One uppercase letter (A-Z)"
                    />
                    <RequirementItem
                      met={passwordRequirements.hasLowerCase}
                      label="One lowercase letter (a-z)"
                    />
                    <RequirementItem
                      met={passwordRequirements.hasNumber}
                      label="One number (0-9)"
                    />
                    <RequirementItem
                      met={passwordRequirements.hasSpecialChar}
                      label="One special character (!@#$%^&*)"
                    />
                    <RequirementItem
                      met={passwordRequirements.passwordsMatch}
                      label="Passwords match"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setError("")
                  }}
                  disabled={loading || success}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || success || !isPasswordStrong || !currentPassword.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 active:scale-95"
                >
                  {loading ? "Updating..." : success ? "Success!" : "Change Password"}
                </button>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  💡 For your security, you'll need to log in again after changing your password on some devices.
                </p>
              </div>

            </form>
          </div>

          {/* Additional Security Tips */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-800 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                ✓ Use a Strong Password
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Use a combination of uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-800 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                ✓ Don't Reuse Passwords
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Create a unique password for this account. Don't use it elsewhere.
              </p>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}

// Helper Component
function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
          met
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-slate-200 dark:bg-neutral-700"
        }`}
      >
        {met && <Check size={12} className="text-green-600 dark:text-green-400" />}
      </div>
      <span
        className={`text-xs ${
          met
            ? "text-green-700 dark:text-green-300 font-medium"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  )
}