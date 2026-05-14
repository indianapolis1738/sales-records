import { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PublicStorefrontClient from "./PublicStorefrontClient"

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("storefront_name, storefront_description, storefront_banner")
      .eq("storefront_slug", params.slug)
      .eq("storefront_enabled", true)
      .single()

    if (!data) {
      return {
        title: "Store Not Found | Flow",
        description: "This store does not exist or has been disabled.",
        robots: "noindex, nofollow",
      }
    }

    return {
      title: `${data.storefront_name} | Flow Store`,
      description:
        data.storefront_description ||
        `Shop amazing products from ${data.storefront_name}`,
      openGraph: {
        title: data.storefront_name,
        description: data.storefront_description || `Shop from ${data.storefront_name}`,
        type: "website",
        images: data.storefront_banner ? [
          {
            url: data.storefront_banner,
            width: 1200,
            height: 630,
            alt: data.storefront_name,
          },
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: data.storefront_name,
        description: data.storefront_description,
        images: data.storefront_banner ? [data.storefront_banner] : [],
      },
    }
  } catch (error) {
    return {
      title: "Store | Flow",
      description: "Browse our online store",
    }
  }
}

export default function Page() {
  return <PublicStorefrontClient />
}