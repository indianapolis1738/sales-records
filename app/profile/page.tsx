"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<{
    full_name?: string
    phone_number?: string
    business_name?: string
    business_address?: string
  }>({})
  const [editing, setEditing] = useState(false)

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
        <div className="flex items-center justify-center h-screen text-gray-500">
          Loading profile...
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {isComplete ? "Your Profile" : "Complete Your Profile"}
            </h1>

            <div className="flex gap-3 md:gap-4">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 text-sm transition"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition"
              >
                Logout
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {isComplete
              ? "View and edit your profile information."
              : "Fill in your details to start using your dashboard."}
          </p>

          {/* Profile Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isComplete || editing ? (
              <>
                <input
                  placeholder="Full Name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition"
                />
                <input
                  placeholder="Phone Number"
                  value={profile.phone_number || ""}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition"
                />
                <input
                  placeholder="Business Name"
                  value={profile.business_name || ""}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition"
                />
                <input
                  placeholder="Business Address"
                  value={profile.business_address || ""}
                  onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition"
                />

                <div className="col-span-full">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 bg-gray-50 p-6 rounded-md border border-gray-200">
                  <p className="text-black"><span className="font-medium text-gray-700">Full Name:</span> {profile.full_name}</p>
                  <p className="text-black"><span className="font-medium text-gray-700">Phone Number:</span> {profile.phone_number}</p>
                </div>
                <div className="space-y-4 bg-gray-50 p-6 rounded-md border border-gray-200">
                  <p className="text-black"><span className="font-medium text-gray-700">Business Name:</span> {profile.business_name}</p>
                  <p className="text-black"><span className="font-medium text-gray-700">Business Address:</span> {profile.business_address || "-"}</p>
                </div>

                <div className="col-span-full">
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
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
