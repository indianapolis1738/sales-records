import { supabase } from "@/lib/supabase"
import type { Metadata } from "next"

// Since we can't access the slug in layout.tsx directly, we'll use a default
// and the page component will handle the specific metadata
export const metadata: Metadata = {
  title: 'Online Store | Flow',
  description: 'Shop amazing products from our store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}