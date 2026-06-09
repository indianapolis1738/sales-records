import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import PublicStorefrontClient from "./PublicStorefrontClient"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://flow.com"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        storefront_name,
        storefront_description,
        storefront_banner,
        avatar_path
      `)
      .eq("storefront_slug", slug)
      .eq("storefront_enabled", true)
      .single()

    if (error || !data) {
      return {
        title: "Store Not Found | Flow",
        description: "This store does not exist or has been disabled.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    const title = `${data.storefront_name} | Home`

    const description =
      data.storefront_description ||
      `Shop amazing products from ${data.storefront_name}`

    const image =
      data.avatar_path || `${SITE_URL}/og-image.png`

    const url = `${SITE_URL}/store/${slug}`

    return {
        metadataBase: new URL(SITE_URL),
      
        title,
        description,
      
        
      
        keywords: [
          data.storefront_name,
          "online store",
          "ecommerce",
          "shop",
          "Flow Store",
        ],
      
        alternates: {
          canonical: url,
        },
      
        openGraph: {
          title,
          description,
          url,
          siteName: "Flow",
          type: "website",
      
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: data.storefront_name,
            },
          ],
        },
      
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [image],
        },
      
        robots: {
          index: true,
          follow: true,
        },
      }
  } catch (err) {
    console.error("Metadata generation error:", err)

    return {
      title: "Flow Store",
      description: "Browse products on Flow Store",
    }
  }
}

export default function Page() {
  return <PublicStorefrontClient />
}