"use client"

import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import "./globals.css"
import { BarChart, Calculator, Dot, DotSquare, Home, Plus, User } from "lucide-react"
import IOSInstallPrompt from "@/components/IOSInstallPrompt"

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
    { name: "Tax", href: "/tax", icon: <Calculator size={20} /> },
    { name: "More", href: "/more", icon: <DotSquare size={20} /> },
  ]

  // Only show bottom tab on these paths
  const showBottomTab = ["/", "/sales", "/sales/new", "/more", "/tax"].includes(pathname)

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Flowly</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body
        className={`
          bg-gray-50 dark:bg-neutral-950 
          text-gray-900 dark:text-gray-100
          font-sans min-h-screen flex flex-col
          ${geistSans.variable} ${geistMono.variable}
        `}
      >
          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 md:p-10 mb-20">
            {children}
          </main>

          {/* Bottom Navigation */}
          {showBottomTab && (
            <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 flex justify-around items-center h-16 shadow-inner">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      flex flex-col items-center justify-center text-xs sm:text-sm transition-colors
                      ${isActive 
                        ? "text-black dark:text-white font-semibold" 
                        : "text-gray-400 dark:text-gray-500"}
                    `}
                  >
                    {tab.icon}
                    <span className="mt-1">{tab.name}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* iOS Install Prompt */}
          <IOSInstallPrompt />
      </body>
    </html>
  )
}
