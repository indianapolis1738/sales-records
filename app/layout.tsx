"use client"

import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import "./globals.css"
import { BarChart, Calculator, DotSquare, Home, Plus } from "lucide-react"
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

  const showNav = ["/", "/sales", "/sales/new", "/more", "/tax"].includes(pathname)

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
          font-sans min-h-screen
          ${geistSans.variable} ${geistMono.variable}
        `}
      >
        <div className="flex min-h-screen">
          
          {/* Sidebar (Desktop) */}
          {showNav && (
            <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <div className="mb-8 text-lg font-semibold">
                Flowly
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`
                        flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                        ${isActive
                          ? "bg-gray-100 dark:bg-neutral-800 text-black dark:text-white font-medium"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"}
                      `}
                    >
                      {tab.icon}
                      {tab.name}
                    </Link>
                  )
                })}
              </nav>
            </aside>
          )}

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 md:p-10 mb-20 md:mb-0">
            {children}
          </main>
        </div>

        {/* Bottom Tabs (Mobile only) */}
        {showNav && (
          <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 flex justify-around items-center h-16">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex flex-col items-center text-xs transition
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

        <IOSInstallPrompt />
      </body>
    </html>
  )
}
