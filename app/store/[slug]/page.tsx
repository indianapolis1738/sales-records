import { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PublicStorefrontClient from "./PublicStorefrontClient"

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data } = await supabase
    .from("profiles")
    .select("storefront_name, storefront_description")
    .eq("storefront_slug", params.slug)
    .eq("storefront_enabled", true)
    .single()

  if (!data) {
    return {
      title: "Store Not Found",
      description: "This store does not exist.",
    }
  }

  return {
    title: `${data.storefront_name} | Shop Now`,
    description:
      data.storefront_description ||
      `Shop products from ${data.storefront_name}`,
  }
}

export default function Page() {
  return <PublicStorefrontClient />
}