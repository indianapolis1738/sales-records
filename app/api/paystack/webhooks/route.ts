import { NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-paystack-signature")

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex")

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === "charge.success") {
    const userId = event.data.metadata.userId

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT: use service key
    )

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await supabase
      .from("profiles")
      .update({
        plan: "pro",
        subscription_status: "active",
        invoice_limit: null,
        current_period_end: nextMonth.toISOString(),
      })
      .eq("id", userId)
  }

  return NextResponse.json({ received: true })
}