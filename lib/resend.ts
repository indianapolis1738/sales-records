import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestEmail() {
  return await resend.emails.send({
    from: "Flowly <onboarding@resend.dev>",
    to: "tobilobad1738@gmail.com",
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });
}