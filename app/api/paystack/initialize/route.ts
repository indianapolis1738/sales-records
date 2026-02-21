import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, userId } = await req.json()

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: 190000, // 1900.00 in kobo if NGN (adjust currency)
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      metadata: {
        userId,
      },
    }),
  })

  const data = await response.json()

  return NextResponse.json(data)
}