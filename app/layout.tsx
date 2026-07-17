import AuthProvider from "@/components/AuthProvider"
import { CartProvider } from "./context/CartContext"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>

      </body>
    </html>
  )
}