"use client"

import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import "./globals.css"
import { BarChart, Calculator, DotSquare, Home, Plus, LogOut, Settings, User } from "lucide-react"
import IOSInstallPrompt from "@/components/IOSInstallPrompt"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ClarityProvider from "@/components/ClarityProvider"

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
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const tabs = [
    { name: "Home", href: "/home", icon: <Home size={20} /> },
    { name: "Sales", href: "/sales", icon: <BarChart size={20} /> },
    // { name: "Customers", href: "/customers", icon: <User size={20} /> },
    { name: "New Sale", href: "/sales/new", icon: <Plus size={20} /> },
    { name: "Tax", href: "/tax", icon: <Calculator size={20} /> },
    { name: "More", href: "/more", icon: <DotSquare size={20} /> },
  ]

  const showNav = !["/login", "/auth", "/"].includes(pathname)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Flow by Kript</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e293b" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>

      <body
        className={`
          bg-gradient-to-br from-slate-50 to-slate-100 
          dark:from-neutral-950 dark:to-neutral-900 
          text-slate-900 dark:text-slate-100
          font-sans min-h-screen
          ${geistSans.variable} ${geistMono.variable}
        `}
      >
        <ClarityProvider />
        <div className="flex min-h-screen">
          
          {/* Sidebar (Desktop) */}
          {showNav && (
            <aside className={`hidden md:flex flex-col border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} h-screen sticky top-0 shadow-sm`}>
              
              {/* Logo */}
              <div className="flex items-center justify-between px-4 py-6 border-b border-slate-200 dark:border-neutral-800">
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Flow By Kript</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Records</p>
                  </div>
                )}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                {tabs.map((tab) => {
                   const isActive = pathname === tab.href
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`
                        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${isActive
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"}
                      `}
                      title={!sidebarOpen ? tab.name : undefined}
                    >
                      <span className="flex-shrink-0">{tab.icon}</span>
                      {sidebarOpen && <span>{tab.name}</span>}
                    </Link>
                  )
                })}
              </nav>

              {/* User Profile Section */}
              <div className="border-t border-slate-200 dark:border-neutral-800 p-4">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-neutral-800 transition ${sidebarOpen ? "" : "justify-center"}`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      A
                    </div>
                    {sidebarOpen && (
                      <div className="flex-1 text-left">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Account</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">user@example.com</p>
                      </div>
                    )}
                  </button>

                  {showProfileMenu && sidebarOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg shadow-lg p-2 space-y-1">
                      {/* <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition">
                        <Settings size={16} />
                        Settings
                      </button> */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <main className="flex-1 flex flex-col min-h-screen">
            {children}
          </main>
        </div>

        {/* Bottom Tabs (Mobile only) */}
        {showNav && (
          <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-slate-200 dark:border-neutral-800 flex justify-between items-center h-20 px-2 shadow-2xl z-50">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-1
                    ${isActive
                      ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}
                  `}
                >
                  <div className={`transition-transform ${isActive ? "scale-110" : "scale-100"}`}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] leading-tight truncate">{tab.name}</span>
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-slate-900 dark:bg-white mt-0.5"></div>
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        <IOSInstallPrompt />
      </body>
    </html>
  )
}
