"use client"

import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import "./globals.css"
import ProtectedRoute from "@/components/ProtectedRoute"
import { BarChart, Home, Plus, User } from "lucide-react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()

  const tabs = [
    { name: "Home", href: "/", icon: <Home size={20} /> },
    { name: "Sales", href: "/sales", icon: <BarChart size={20} /> },
    { name: "New Sale", href: "/sales/new", icon: <Plus size={20} /> },
    { name: "Profile", href: "/profile", icon: <User size={20} /> },
  ]

  // Only show bottom tab on these paths
  const showBottomTab = ["/","/sales", "/sales/new", "/profile"].includes(pathname)

  return (
    <html lang="en">
      <head>
        {/* PWA Manifest & meta */}
        <title>Kript Dashboard</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className="bg-slate-50 font-sans text-slate-900 min-h-screen flex flex-col">
        <ProtectedRoute>
          {/* Main content */}
          <main className="flex-1 p-4 mb-18">{children}</main>

          {/* Bottom Tabs */}
          {showBottomTab && (
            <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 shadow-inner">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`flex flex-col items-center justify-center text-sm transition-colors ${
                      isActive ? "text-black font-semibold" : "text-slate-400"
                    }`}
                  >
                    {tab.icon}
                    <span className="mt-1">{tab.name}</span>
                  </Link>
                )
              })}
            </nav>
          )}
        </ProtectedRoute>
      </body>
    </html>
  )
}
