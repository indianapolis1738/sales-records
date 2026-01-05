"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<{
    full_name?: string
    phone_number?: string
    business_name?: string
    business_address?: string
  }>({})

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileData) setProfile(profileData)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("profiles").upsert([
      { id: user.id, ...profile }
    ])

    setSaving(false)
    if (!error) setEditing(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleChangePassword = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const email = user.email
    if (email) {
      await supabase.auth.resetPasswordForEmail(email)
      alert("Password reset email sent! Check your inbox.")
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 sm:p-10 space-y-8">

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

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isComplete
              ? "View and edit your profile information."
              : "Fill in your details to start using your dashboard."}
          </p>

          {/* Profile Form / Info */}
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

                <div className="col-span-full">
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-black py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            )}
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
