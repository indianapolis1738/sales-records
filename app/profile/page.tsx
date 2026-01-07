"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<{
    full_name?: string
    phone_number?: string
    business_name?: string
    business_address?: string
    logo_path?: string
    logo_url?: string
  }>({})
  const [message, setMessage] = useState<string | null>(null)

  // ------------------ Fetch profile ------------------
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

        // Generate signed URL for logo if exists
        if (profileData.logo_path) {
          const { data: signedData, error: urlError } = await supabase.storage
            .from("logos")
            .createSignedUrl(profileData.logo_path, 60) // valid for 60s
          if (!urlError && signedData) {
            setProfile(prev => ({ ...prev, logo_url: signedData.signedUrl }))
          }
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  // ------------------ Save profile ------------------
  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("profiles").upsert([{ id: user.id, ...profile }])
    setSaving(false)
    if (error) {
      setMessage("Failed to save profile")
    } else {
      setEditing(false)
      setMessage("Profile saved successfully")
    }
  }

  // ------------------ Logout ------------------
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // ------------------ Password reset ------------------
  const handleChangePassword = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return
    await supabase.auth.resetPasswordForEmail(user.email)
    alert("Password reset email sent! Check your inbox.")
  }

  // ------------------ Logo Upload ------------------
  const handleUploadLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)

    const filePath = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert("Failed to upload logo")
      setUploading(false)
      return
    }

    // Generate signed URL immediately for preview
    const { data: signedData, error: urlError } = await supabase.storage
      .from("logos")
      .createSignedUrl(filePath, 60) // valid 60s

    if (!urlError && signedData) {
      setProfile(prev => ({ ...prev, logo_path: filePath, logo_url: signedData.signedUrl }))
    }

    setUploading(false)
  }

  const isComplete = profile.full_name && profile.phone_number && profile.business_name

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
          Loading profile...
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-2 py-5">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm hover:text-gray-900 dark:hover:text-gray-100 transition mb-2"
          >
            ← Back
          </button>

          {/* Profile Container */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm md:p-6 p-2 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {isComplete ? "Your Profile" : "Complete Your Profile"}
              </h1>
              <div className="flex gap-3 sm:gap-4 flex-wrap">
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm transition"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            </div>

            {message && (
              <p className="text-sm text-center text-green-600 dark:text-green-400">{message}</p>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isComplete
                ? "View and edit your profile information."
                : "Fill in your details to start using your dashboard."}
            </p>

            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-2">
              {profile.logo_url && (
                <img
                  src={profile.logo_url}
                  alt="Business Logo"
                  className="w-24 h-24 object-contain rounded-lg border border-gray-300 dark:border-neutral-700"
                />
              )}
              <label className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-neutral-700 text-sm transition">
                {uploading ? "Uploading..." : "Upload Logo"}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} />
              </label>
            </div>

            {/* Profile Fields / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(!isComplete || editing) ? (
                <>
                  <ProfileInput
                    placeholder="Full Name"
                    value={profile.full_name || ""}
                    onChange={(v) => setProfile({ ...profile, full_name: v })}
                  />
                  <ProfileInput
                    placeholder="Phone Number"
                    value={profile.phone_number || ""}
                    onChange={(v) => setProfile({ ...profile, phone_number: v })}
                  />
                  <ProfileInput
                    placeholder="Business Name"
                    value={profile.business_name || ""}
                    onChange={(v) => setProfile({ ...profile, business_name: v })}
                  />
                  <ProfileInput
                    placeholder="Business Address"
                    value={profile.business_address || ""}
                    onChange={(v) => setProfile({ ...profile, business_address: v })}
                  />

                  <div className="col-span-full">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ProfileCard label="Full Name" value={profile.full_name} />
                  <ProfileCard label="Phone Number" value={profile.phone_number} />
                  <ProfileCard label="Business Name" value={profile.business_name} />
                  <ProfileCard label="Business Address" value={profile.business_address || "-"} />

                  <div className="col-span-full flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-black py-2 rounded-lg hover:opacity-90 transition"
                    >
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Notion-style input
function ProfileInput({ placeholder, value, onChange }: { placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full rounded-lg border border-gray-300 dark:border-neutral-700
        bg-white dark:bg-neutral-900
        px-3 py-2 text-gray-900 dark:text-gray-100
        placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-neutral-600
        transition
      "
    />
  )
}

// Notion-style info card
function ProfileCard({ label, value }: { label: string, value: string | undefined }) {
  return (
    <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-gray-100">{value || "-"}</p>
    </div>
  )
}
