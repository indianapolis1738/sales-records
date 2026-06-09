"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
  Store,
  Globe,
  Image as ImageIcon,
  Copy,
  Check,
  ChevronRight,
  Instagram,
  Twitter,
  Music,
  FileText,
} from "lucide-react"

export default function StorefrontSettingsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const [profile, setProfile] = useState<any>({
    storefront_name: "",
    storefront_slug: "",
    storefront_description: "",
    storefront_banner: "",
    storefront_enabled: false,
    instagram_url: "",
    x_url: "",
    tiktok_url: "",
    terms_and_condition: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!error && data) {
      setProfile({
        storefront_name: data.storefront_name || "",
        storefront_slug: data.storefront_slug || "",
        storefront_description: data.storefront_description || "",
        storefront_banner: data.storefront_banner || "",
        storefront_enabled: data.storefront_enabled || false,
        instagram_url: data.instagram_url || "",
        x_url: data.x_url || "",
        tiktok_url: data.tiktok_url || "",
        terms_and_condition: data.terms_and_condition || "",
      })
    }

    setLoading(false)
  }

  // Handle banner image upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
  
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) return
  
      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}/banner-${Date.now()}.${fileExt}`
  
      // IMPORTANT: bucket name MUST match exactly
      const { error: uploadError } = await supabase.storage
        .from("storefront_banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })
  
      if (uploadError) {
        console.log("UPLOAD ERROR:", uploadError)
        throw uploadError
      }
  
      const { data } = supabase.storage
        .from("storefront_banners")
        .getPublicUrl(filePath)
  
      const publicUrl = data.publicUrl
  
      setProfile((prev: any) => ({
        ...prev,
        storefront_banner: publicUrl,
      }))
    } catch (err: any) {
      console.log("UPLOAD FAILED:", err)
      alert(err.message)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        storefront_name: profile.storefront_name,
        storefront_slug: profile.storefront_slug
          .toLowerCase()
          .replace(/\s+/g, "-"),
        storefront_description: profile.storefront_description,
        storefront_banner: profile.storefront_banner,
        storefront_enabled: profile.storefront_enabled,
        instagram_url: profile.instagram_url,
        x_url: profile.x_url,
        tiktok_url: profile.tiktok_url,
        terms_and_condition: profile.terms_and_condition,
      })

      if (error) throw error

      alert("Storefront settings updated successfully")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }
  
  const storefrontUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/store/${profile.storefront_slug}`
      : ""

  const copyLink = async () => {
    await navigator.clipboard.writeText(storefrontUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-10 w-40 rounded-lg bg-slate-200 dark:bg-neutral-800" />
            <div className="h-96 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            ← Back
          </button>

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
                  <Store className="text-white dark:text-slate-900" size={22} />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Storefront Settings
                  </h1>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Customize your public storefront and share your inventory with customers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Storefront Card */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">

            {/* Top Banner */}
            <div className="p-6 border-b border-slate-200 dark:border-neutral-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800">
              <div className="flex items-center justify-between gap-4 flex-wrap">

                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Public Storefront
                  </p>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {profile.storefront_name || "Your Storefront"}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setProfile({
                      ...profile,
                      storefront_enabled: !profile.storefront_enabled,
                    })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    profile.storefront_enabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-200 text-slate-700 dark:bg-neutral-800 dark:text-slate-300"
                  }`}
                >
                  {profile.storefront_enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* Store Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Storefront Name
                </label>

                <div className="relative">
                  <Store
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="TechNest Store"
                    value={profile.storefront_name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        storefront_name: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Storefront URL
                </label>

                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="technest"
                    value={profile.storefront_slug}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        storefront_slug: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                  />
                </div>

                {profile.storefront_slug && (
                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap bg-slate-50 dark:bg-neutral-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-neutral-700">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 break-all">
                      {storefrontUrl}
                    </p>

                    <button
                      onClick={copyLink}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition"
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Store Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Tell customers about your store, products and services..."
                  value={profile.storefront_description}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      storefront_description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                />
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Banner Image
                </label>

                <div className="relative">
                  <ImageIcon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>
              </div>

              {/* Preview */}
              {profile.storefront_banner && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Banner Preview
                  </p>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-neutral-700">
                    <img
                      src={profile.storefront_banner}
                      alt="Banner Preview"
                      className="w-full h-52 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Social Media Links */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Social Media Links
                </h3>

                <div className="space-y-4">
                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Instagram URL
                    </label>

                    <div className="relative">
                      <Instagram
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="url"
                        placeholder="https://instagram.com/yourusername"
                        value={profile.instagram_url}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            instagram_url: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-600 transition"
                      />
                    </div>
                  </div>

                  {/* X (Twitter) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      X (Twitter) URL
                    </label>

                    <div className="relative">
                      <Twitter
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="url"
                        placeholder="https://x.com/yourusername"
                        value={profile.x_url}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            x_url: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                      />
                    </div>
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      TikTok URL
                    </label>

                    <div className="relative">
                      <Music
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="url"
                        placeholder="https://tiktok.com/@yourusername"
                        value={profile.tiktok_url}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            tiktok_url: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-slate-600 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Terms and Conditions
                  </h3>
                </div>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Add your terms and conditions
                </label>

                <textarea
                  rows={6}
                  placeholder="Enter your store's terms and conditions... (e.g., payment methods, delivery policies, return policies, etc.)"
                  value={profile.terms_and_condition}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      terms_and_condition: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-600 transition font-mono"
                />

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {profile.terms_and_condition.length} characters • This will be displayed to customers before they order
                </p>
              </div>


              {/* Save */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Storefront"}
                  {!saving && <ChevronRight size={16} />}
                </button>
              </div>

            </div>
          </div>

          {/* Extra Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What happens next?
            </h3>

            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Customers will be able to view your inventory publicly.</p>
              <p>• Products marked as available will appear automatically.</p>
              <p>• Your storefront can be shared on WhatsApp, Instagram, TikTok and more.</p>
              <p>• Social media links will be displayed in your storefront footer.</p>
              <p>• You can later add direct checkout, payments and order requests.</p>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}