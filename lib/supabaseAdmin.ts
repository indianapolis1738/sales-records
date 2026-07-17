import { createClient } from "@supabase/supabase-js"

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Use the non-public environment variable
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the service role key for admin access
)