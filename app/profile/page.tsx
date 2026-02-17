"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import Skeleton from "@/components/Skeleton"
import { ChevronRight, LogOut, Lock, Upload, Check } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<{
    full_name?: string
    phone_number?: string
    business_name?: string
    business_address?: string
    logo_path?: string
    logo_url?: string
    plan?: string
  }>({})
  const [message, setMessage] = useState<string | null>(null)

  const isComplete =
    !!profile.full_name &&
    !!profile.phone_number &&
    !!profile.business_name &&
    !!profile.business_address

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) setMessage("Failed to load profile")
      if (profileData) {
        setProfile(profileData)
        if (profileData.logo_path) {
          const { data: signedData } = await supabase.storage
            .from("logos")
            .createSignedUrl(profileData.logo_path, 60)
          if (signedData) {
            setProfile(prev => ({ ...prev, logo_url: signedData.signedUrl }))
          }
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("profiles").upsert([{
      id: user.id,
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      business_name: profile.business_name,
      business_address: profile.business_address,
    }])

    setSaving(false)
    if (error) {
      setMessage("Failed to save profile")
    } else {
      setMessage("Profile updated successfully")
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleChangePassword = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return
    await supabase.auth.resetPasswordForEmail(user.email)
    setMessage("Password reset email sent! Check your inbox.")
    setTimeout(() => setMessage(null), 3000)
  }

  const handleUploadLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)

    const filePath = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setMessage("Failed to upload logo")
      setUploading(false)
      return
    }

    const { data: signedData } = await supabase.storage
      .from("logos")
      .createSignedUrl(filePath, 60)

    if (signedData) {
      setProfile(prev => ({ ...prev, logo_path: filePath, logo_url: signedData.signedUrl }))
    }
    setUploading(false)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-8 w-1/3 mb-6 sm:mb-8 rounded-lg" />
            <Skeleton className="h-40 w-full rounded-2xl mb-4 sm:mb-6" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-slate-200 transition mb-4"
            >
              ← Back
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                  Business Profile
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Manage your business information and account settings
                </p>
              </div>
              {isComplete && (
                <div className="px-3 sm:px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full w-fit">
                  <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">✓ Profile Complete</p>
                </div>
              )}
            </div>
          </div>

          {/* Upgrade Banner - Premium */}
          {profile.plan === "free" && (
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl flex-shrink-0">✨</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Upgrade to Premium
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    Get unlimited sales records, advanced analytics, customer insights, and dedicated support to scale your business.
                  </p>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition shadow-sm"
                  >
                    View Plans
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium">
              {message}
            </div>
          )}

          {/* Main Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* Left Column - Logo & Plan */}
            <div className="lg:col-span-1">
              {/* Logo Upload */}
              <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-4">Business Logo</h3>
                <div className="relative group">
                  {profile.logo_url ? (
                    <div className="relative">
                      <img
                        src={profile.logo_url}
                        alt="Business Logo"
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border border-slate-200 dark:border-neutral-700"
                      />
                      <label className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <Upload size={20} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadLogo}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition cursor-pointer">
                      <Upload size={20} className="text-slate-400 mb-2 sm:w-6 sm:h-6" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogo}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {uploading && <p className="text-xs text-slate-500 mt-2">Uploading...</p>}
              </div>

              {/* Plan plan */}
              <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-4">Account Plan</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Current Plan</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
                      {profile.plan === "free" ? "Free" : "Premium"}
                    </p>
                  </div>
                  {profile.plan === "free" && (
                    <button
                      onClick={() => router.push("/pricing")}
                      className="w-full py-2 px-3 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-900 dark:text-white rounded-lg text-xs sm:text-sm font-medium transition mt-4"
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">Business Information</h2>

                <div className="space-y-4 sm:space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Full Name
                    </label>
                    <input
                      placeholder="Your name"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Phone Number
                    </label>
                    <input
                      placeholder="+234 (0) 800 0000 000"
                      value={profile.phone_number || ""}
                      onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Business Name
                    </label>
                    <input
                      placeholder="Your business name"
                      value={profile.business_name || ""}
                      onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                    />
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Business Address
                    </label>
                    <textarea
                      placeholder="123 Business Street, City, State 12345"
                      value={profile.business_address || ""}
                      onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm sm:text-base font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4 sm:mt-6"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="mt-6 sm:mt-8 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Account Settings</h2>
            
            <div className="space-y-2 sm:space-y-3">
              {/* Change Password */}
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border border-slate-200 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition group"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Lock size={18} className="text-slate-600 dark:text-slate-400 flex-shrink-0 hidden sm:block" />
                  <Lock size={16} className="text-slate-600 dark:text-slate-400 flex-shrink-0 sm:hidden" />
                  <div className="text-left min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Change Password</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Update your password</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition flex-shrink-0 hidden sm:block" />
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition flex-shrink-0 sm:hidden" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition group"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <LogOut size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 hidden sm:block" />
                  <LogOut size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 sm:hidden" />
                  <div className="text-left min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">Logout</p>
                    <p className="text-xs text-red-500 dark:text-red-500 hidden sm:block">Sign out from your account</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition flex-shrink-0 hidden sm:block" />
                <ChevronRight size={16} className="text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition flex-shrink-0 sm:hidden" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
