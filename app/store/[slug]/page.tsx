"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
    Phone,
    MapPin,
    Package,
} from "lucide-react"

export default function PublicStorefront() {
    const { slug } = useParams()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        if (slug) {
            fetchStore()
        }
    }, [slug])

    const fetchStore = async () => {
        setLoading(true)

        // Fetch Store Owner
        const { data: profileData, error } = await supabase
            .from("profiles")
            .select(
                `
                    id,
                    storefront_name,
                    storefront_slug,
                    storefront_description,
                    business_name,
                    phone_number,
                    business_address,
                    storefront_banner
                `
            )
            .eq("storefront_slug", slug)
            .eq("storefront_enabled", true)
            .single()

        if (error || !profileData) {
            setLoading(false)
            return
        }

        setProfile(profileData)

        // Fetch Inventory
        const { data: inventoryData } = await supabase
            .from("inventory")
            .select(
                `
                id,
                product_name,
                sales_price,
                quantity,
                product_images
            `
            )
            .eq("user_id", profileData.id)
            .gt("quantity", 0)

        setProducts(inventoryData || [])

        setLoading(false)
    }

    const handleWhatsAppOrder = (product: any) => {
        const phone = profile.phone_number?.replace(/\D/g, "")

        const message = `Hello 👋 I want to order:
    
    Product: ${product.product_name}
    Price: ₦${Number(product.sales_price).toLocaleString()}
    Quantity: 1
    
    Is it available?`

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

        window.open(url, "_blank")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6">
                <div className="max-w-6xl mx-auto animate-pulse space-y-6">
                    <div className="h-64 rounded-3xl bg-slate-200 dark:bg-neutral-800" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="h-52 rounded-2xl bg-slate-200 dark:bg-neutral-800"
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Store Not Found
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400">
                        This storefront does not exist or is disabled.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">

            {/* Banner */}
            <div className="relative h-72 w-full overflow-hidden">
                {profile.storefront_banner ? (
                    <img
                        src={profile.storefront_banner}
                        alt={profile.storefront_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-neutral-800" />
                )}

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {profile.storefront_name}
                        </h1>

                        <p className="text-sm text-white/90 max-w-2xl">
                            {profile.storefront_description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Store Info */}
            <div className="max-w-6xl mx-auto px-4 py-8">

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div className="space-y-2">
                        {profile.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <Phone size={16} />
                                {profile.phone_number}
                            </div>
                        )}

                        {profile.business_address && (
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <MapPin size={16} />
                                {profile.business_address}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-100 dark:bg-neutral-800 px-4 py-3 rounded-xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Products
                        </p>

                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {products.length}
                        </p>
                    </div>
                </div>

                {/* Products */}
                <div className="mb-6 flex items-center gap-2">
                    <Package size={20} className="text-slate-700 dark:text-slate-300" />

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Inventory
                    </h2>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-10 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            No products available yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {products.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSelectedProduct(item)
                                    setActiveImageIndex(0)
                                }}
                                className="cursor-pointer bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg transition"
                            >
                                <div className="h-44 bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                                    {item.product_images?.length > 0 ? (
                                        <img
                                            src={item.product_images[0]}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Package
                                            size={40}
                                            className="text-slate-400 dark:text-slate-600"
                                        />
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                        {item.product_name}
                                    </h3>

                                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                                        ₦{Number(item.sales_price).toLocaleString()}
                                    </p>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl">

                        {/* Header Image Gallery */}
                        <div className="relative bg-slate-100 dark:bg-neutral-800 h-72">
                            {selectedProduct.product_images?.length > 0 ? (
                                <img
                                    src={selectedProduct.product_images[activeImageIndex]}
                                    className="w-full h-full object-cover transition"
                                    alt={selectedProduct.product_name}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Package size={50} className="text-slate-400" />
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-3 right-3 bg-black/40 text-white px-3 py-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedProduct.product_name}
                            </h2>

                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                ₦{Number(selectedProduct.sales_price).toLocaleString()}
                            </p>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Available Quantity: {selectedProduct.quantity}
                            </p>

                            {/* Image thumbnails */}
                            {selectedProduct.product_images?.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto mt-3">
                                    {selectedProduct.product_images.map((img: string, idx: number) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`w-16 h-16 object-cover rounded-lg border cursor-pointer transition ${activeImageIndex === idx
                                                ? "ring-2 ring-slate-900 dark:ring-white"
                                                : "opacity-70"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Extra info */}
                            <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 text-sm text-slate-600 dark:text-slate-400">
                                {selectedProduct.sku && <p>SKU: {selectedProduct.sku}</p>}
                                {selectedProduct.imei && <p>IMEI: {selectedProduct.imei}</p>}
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => handleWhatsAppOrder(selectedProduct)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                                >
                                    Order on WhatsApp
                                </button>

                            </div>

                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-full mt-4 bg-slate-900 dark:bg-white text-white dark:text-black py-2 rounded-lg font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}