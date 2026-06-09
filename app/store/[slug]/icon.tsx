import { ImageResponse } from "next/og"
import { createClient } from "@supabase/supabase-js"

export const size = {
  width: 32,
  height: 32,
}

export const contentType = "image/png"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Icon({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("storefront_slug", slug)
    .single()

  const image = data?.avatar_path

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          borderRadius: "9999px",
        }}
      >
        {image ? (
          <img
            src={image}
            width="32"
            height="32"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            alt="Store Icon"
          />
        ) : (
          <div
            style={{
              background: "#000",
              color: "#fff",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            F
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  )
}