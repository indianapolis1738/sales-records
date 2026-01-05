"use client"

import { useEffect, useState } from "react"

export default function IOSInstallPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    const isStandalone =
      (window.navigator as any).standalone === true

    if (isIOS && !isStandalone) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-sm z-50 max-w-xs text-center">
      <p className="text-slate-700 mb-2">
        Install this app on your iPhone
      </p>
      <p className="text-slate-500 text-xs">
        Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
      </p>
    </div>
  )
}
