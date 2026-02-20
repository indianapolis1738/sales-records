import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/resend";

export async function POST() {
  try {
    const data = await sendTestEmail();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}