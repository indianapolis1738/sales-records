"use client"

import { useEffect } from "react"
import clarity from "@microsoft/clarity"

export default function ClarityProvider() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLARITY_ID) {
      clarity.init(process.env.NEXT_PUBLIC_CLARITY_ID)
    }
  }, [])

  return null
}