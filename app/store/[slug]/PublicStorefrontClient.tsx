"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Phone, MapPin, Package, Search, X, ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Filter, Instagram, Twitter, Mail, Menu, Trash2 } from "lucide-react"
import { useCart } from "@/app/context/CartContext"

const ITEMS_PER_PAGE = 12

export default function PublicStorefront() {
    const { slug } = useParams()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])

    const [cartOpen, setCartOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [wishlist, setWishlist] = useState<string[]>([])
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()

    // FILTER STATES
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState<"default" | "low" | "high" | "newest">("default")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        if (slug) fetchStore()
    }, [slug])

    const fetchStore = async () => {
        setLoading(true)

        const { data: profileData } = await supabase
            .from("profiles")
            .select(`
                id,
                storefront_name,
                storefront_slug,
                storefront_description,
                business_name,
                phone_number,
                business_address,
                storefront_banner,
                business_email,
                instagram_url,
                x_url,
                tiktok_url,
                terms_and_condition,
                avatar_path
            `)
            .eq("storefront_slug", slug)
            .eq("storefront_enabled", true)
            .single()

        if (!profileData) {
            setLoading(false)
            return
        }

        setProfile(profileData)

        const { data: inventoryData } = await supabase
            .from("inventory")
            .select(`
                id,
                product_name,
                sales_price,
                quantity,
                product_images,
                sku,
                imei
            `)
            .eq("user_id", profileData.id)
            .gt("quantity", 0)
            .order("created_at", { ascending: false })

        setProducts(inventoryData || [])
        setLoading(false)
    }

    // FILTERED + SORTED PRODUCTS
    const filteredProducts = products
        .filter((p) => {
            const matchesSearch = p.product_name
                .toLowerCase()
                .includes(search.toLowerCase())

            const price = Number(p.sales_price)
            const matchesMin = minPrice ? price >= Number(minPrice) : true
            const matchesMax = maxPrice ? price <= Number(maxPrice) : true

            return matchesSearch && matchesMin && matchesMax
        })
        .sort((a, b) => {
            if (sortBy === "low") return a.sales_price - b.sales_price
            if (sortBy === "high") return b.sales_price - a.sales_price
            return 0
        })

    // PAGINATION
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    useEffect(() => {
        setCurrentPage(1)
    }, [search, sortBy, minPrice, maxPrice])

    const toggleWishlist = (productId: string) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handleWhatsAppOrder = (product: any, qty: number = 1) => {
        const phone = profile.phone_number?.replace(/\D/g, "").replace(/^0/, "")

        const message = `Hello 👋 I want to order:\n\nProduct: ${product.product_name}\nPrice: ₦${Number(product.sales_price).toLocaleString()}\nQuantity: ${qty}\nTotal: ₦${(Number(product.sales_price) * qty).toLocaleString()}`

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        window.open(url, "_blank")
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 text-sm sm:text-base">Loading store...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center px-4">
                    <Package size={48} className="text-slate-300 mx-auto mb-4" />
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Store Not Found</h1>
                    <p className="text-slate-600 text-sm sm:text-base">This store doesn't exist or has been disabled.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ===== FLOATING CART BUTTON ===== */}
            <div className="fixed bottom-5 right-5 z-40">
                <button
                    onClick={() => setCartOpen(true)}
                    className="relative bg-emerald-600 hover:bg-emerald-700 text-white p-3 sm:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ===== NAVBAR ===== */}
            <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 border-slate-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                            {profile.avatar_path ? (
                                <img
                                    src={profile.avatar_path}
                                    alt={profile.storefront_name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => { e.currentTarget.style.display = "none" }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                    <Package size={20} className="text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block min-w-0">
                            <h2 className="font-semibold text-slate-900 text-sm truncate">{profile.storefront_name}</h2>
                            <p className="text-xs text-slate-500">Official Store</p>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        <a href="#products" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition">Shop</a>
                        <a href="#footer" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition">Contact</a>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <button
                            onClick={() => setCartOpen(true)}
                            className="hidden sm:flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg border border-emerald-200 transition group"
                        >
                            <ShoppingCart size={16} className="text-emerald-600" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-600">
                                {cart.length}
                            </span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
                        >
                            <Menu size={20} className="text-slate-900" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
                        <a href="#products" onClick={() => setMobileMenuOpen(false)} className="block text-slate-900 hover:text-emerald-600 font-medium transition py-2 text-sm">Shop</a>
                        <a href="#footer" onClick={() => setMobileMenuOpen(false)} className="block text-slate-900 hover:text-emerald-600 font-medium transition py-2 text-sm">Contact</a>
                    </div>
                )}
            </nav>

            {/* ===== HERO SECTION ===== */}
            <div className="relative overflow-hidden">
                <div className="h-64 sm:h-80 lg:h-96 overflow-hidden bg-slate-200">
                    {profile.storefront_banner ? (
                        <img
                            src={profile.storefront_banner}
                            alt="Store banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600" />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Hero Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="text-center text-white">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-lg line-clamp-2">
                            {profile.storefront_name}
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto drop-shadow-md opacity-95 line-clamp-2">
                            {profile.storefront_description}
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1">
                {/* ===== FILTERS & SEARCH ===== */}
                <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-10" id="products">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm sm:text-base placeholder-slate-500"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium text-xs sm:text-sm"
                            >
                                <Filter size={16} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 sm:px-4 py-2 bg-white border border-emerald-600 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-medium cursor-pointer"
                            >
                                <option value="default">Sort</option>
                                <option value="low">Price ↑</option>
                                <option value="high">Price ↓</option>
                                <option value="newest">Newest</option>
                            </select>

                            {(search || minPrice || maxPrice) && (
                                <button
                                    onClick={() => {
                                        setSearch("")
                                        setMinPrice("")
                                        setMaxPrice("")
                                    }}
                                    className="px-3 sm:px-4 py-2 bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 rounded-lg transition font-medium text-xs sm:text-sm"
                                >
                                    ✕ Clear
                                </button>
                            )}

                            <div className="text-xs sm:text-sm text-slate-600 font-medium ml-auto">
                                <span className="text-emerald-600 font-bold">{paginatedProducts.length}</span>/<span className="text-emerald-600 font-bold">{filteredProducts.length}</span>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                                <h3 className="font-bold text-slate-900 text-sm">Price Range (₦)</h3>
                                <div className="flex gap-2 sm:gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="flex-1 px-3 sm:px-4 py-2 border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="flex-1 px-3 sm:px-4 py-2 border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== PRODUCTS GRID ===== */}
                <div className="max-w-7xl mx-auto px-4 mb-12 sm:mb-20">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-16 sm:py-24">
                            <Package size={48} className="text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No products found</h3>
                            <p className="text-xs sm:text-sm text-slate-600">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                                {paginatedProducts.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-emerald-500 transition-all duration-300"
                                    >
                                        {/* Product Image */}
                                        <div className="relative h-32 sm:h-44 lg:h-56 bg-slate-100 overflow-hidden cursor-pointer">
                                            {item.product_images?.length ? (
                                                <img
                                                    src={item.product_images[0]}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                    onClick={() => {
                                                        setSelectedProduct(item)
                                                        setActiveImageIndex(0)
                                                        setQuantity(1)
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-slate-200">
                                                    <Package size={24} className="text-slate-400" />
                                                </div>
                                            )}

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleWishlist(item.id)
                                                }}
                                                className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:shadow-lg transition z-10 hover:scale-110 active:scale-95"
                                            >
                                                <Heart
                                                    size={16}
                                                    className={wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}
                                                />
                                            </button>

                                            {/* Stock Badge */}
                                            {item.quantity < 5 && (
                                                <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    {item.quantity} left
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-2 sm:p-3 space-y-2">
                                            <h3 
                                                className="font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition text-xs sm:text-sm cursor-pointer"
                                                onClick={() => {
                                                    setSelectedProduct(item)
                                                    setActiveImageIndex(0)
                                                    setQuantity(1)
                                                }}
                                            >
                                                {item.product_name}
                                            </h3>

                                            <div className="flex items-center gap-1">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={10}
                                                            className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500">(24)</span>
                                            </div>

                                            <p className="text-sm sm:text-base font-bold text-emerald-600">
                                                ₦{Number(item.sales_price).toLocaleString()}
                                            </p>

                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(item)
                                                    setActiveImageIndex(0)
                                                    setQuantity(1)
                                                }}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md transition text-xs sm:text-sm active:scale-95"
                                            >
                                                View & Order
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ===== PAGINATION ===== */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-12">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                                            const pageNum = idx + 1
                                            const isActive = pageNum === currentPage

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold transition text-xs sm:text-sm ${isActive
                                                        ? "bg-emerald-600 text-white"
                                                        : "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <footer className="bg-slate-900 text-white border-t-2 border-emerald-600 mt-auto" id="footer">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
                        {/* Store Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-base sm:text-lg text-emerald-400">{profile.storefront_name}</h3>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                {profile.storefront_description}
                            </p>
                            <div className="flex gap-3 pt-2">
                                {profile.instagram_url && (
                                    <a href={profile.instagram_url} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition" target="_blank" rel="noopener noreferrer">
                                        <Instagram size={18} />
                                    </a>
                                )}
                                {profile.x_url && (
                                    <a href={profile.x_url} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition" target="_blank" rel="noopener noreferrer">
                                        <Twitter size={18} />
                                    </a>
                                )}
                                {profile.tiktok_url && (
                                    <a href={profile.tiktok_url} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M16.5 3a5.5 5.5 0 0 0 5.5 5.5v3a8.5 8.5 0 0 1-6-2.5v5.5a6.5 6.5 0 1 1-6.5-6.5h1v3h-1a3.5 3.5 0 1 0 3.5 3.5V2h3z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-base sm:text-lg text-emerald-400">Contact</h3>
                            <ul className="space-y-2 sm:space-y-3 text-slate-300 text-xs sm:text-sm">
                                <li className="flex items-start gap-2">
                                    <Phone size={16} className="flex-shrink-0 mt-0.5" />
                                    <a href={`tel:${profile.phone_number}`} className="hover:text-emerald-400 transition break-all">
                                        {profile.phone_number}
                                    </a>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{profile.business_address}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Mail size={16} className="flex-shrink-0 mt-0.5" />
                                    <a href={`mailto:${profile.business_email}`} className="hover:text-emerald-400 transition break-all">
                                        {profile.business_email || "Email not provided"}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-base sm:text-lg text-emerald-400">Shop</h3>
                            <ul className="space-y-2 text-slate-300 text-xs sm:text-sm">
                                <li><a href="#products" className="hover:text-emerald-400 transition">New Products</a></li>
                                <li><a href="#products" className="hover:text-emerald-400 transition">Best Sellers</a></li>
                                <li><button onClick={() => setCartOpen(true)} className="hover:text-emerald-400 transition text-left">Cart ({cart.length})</button></li>
                                <li><a href="#products" className="hover:text-emerald-400 transition">Browse All</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-base sm:text-lg text-emerald-400">Legal</h3>
                            <ul className="space-y-2 text-slate-300 text-xs sm:text-sm">
                                {profile.terms_and_condition && (
                                    <li>
                                        <button
                                            onClick={() => setShowTermsModal(true)}
                                            className="hover:text-emerald-400 transition text-left"
                                        >
                                            Terms & Conditions
                                        </button>
                                    </li>
                                )}
                                <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs sm:text-sm">
                        <p>© {new Date().getFullYear()} {profile.storefront_name}. All rights reserved.</p>
                        <p>Powered by <span className="text-emerald-400 font-semibold">Flow</span></p>
                    </div>
                </div>
            </footer>

            {/* ===== PRODUCT DETAIL MODAL ===== */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-lg rounded-lg sm:rounded-xl overflow-hidden shadow-xl my-auto">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:shadow-md transition z-10"
                        >
                            <X size={20} className="text-slate-600" />
                        </button>

                        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">

                            {/* Image Gallery */}
                            <div className="space-y-3">
                                <div className="relative bg-slate-100 rounded-lg overflow-hidden h-56 sm:h-64">
                                    {selectedProduct.product_images?.length ? (
                                        <img
                                            src={selectedProduct.product_images[activeImageIndex]}
                                            alt={selectedProduct.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Package size={32} className="text-slate-300" />
                                        </div>
                                    )}

                                    {/* Image Navigation */}
                                    {selectedProduct.product_images?.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setActiveImageIndex(prev => prev === 0 ? selectedProduct.product_images.length - 1 : prev - 1)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow active:scale-95"
                                            >
                                                <ChevronLeft size={16} className="text-slate-900" />
                                            </button>
                                            <button
                                                onClick={() => setActiveImageIndex(prev => prev === selectedProduct.product_images.length - 1 ? 0 : prev + 1)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow active:scale-95"
                                            >
                                                <ChevronRight size={16} className="text-slate-900" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {selectedProduct.product_images?.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedProduct.product_images.map((img: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition ${activeImageIndex === idx ? "border-emerald-600" : "border-slate-300"}`}
                                            >
                                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                                        {selectedProduct.product_name}
                                    </h2>
                                    <p className="text-lg sm:text-xl font-bold text-emerald-600 mb-2">
                                        ₦{Number(selectedProduct.sales_price).toLocaleString()}
                                    </p>
                                    <p className={`text-sm font-medium ${selectedProduct.quantity > 5 ? "text-green-600" : "text-orange-600"}`}>
                                        {selectedProduct.quantity > 5 ? "✓ In Stock" : `⚠ Only ${selectedProduct.quantity} left`}
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center border border-slate-300 rounded-lg w-fit bg-slate-50">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 sm:px-4 py-2 text-slate-600 hover:bg-white transition font-bold active:scale-95"
                                    >
                                        −
                                    </button>
                                    <span className="px-4 sm:px-6 py-2 font-bold text-slate-900 min-w-[40px] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(selectedProduct.quantity, quantity + 1))}
                                        className="px-3 sm:px-4 py-2 text-slate-600 hover:bg-white transition font-bold active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 sm:space-y-3">
                                    <button
                                        onClick={() => {
                                            handleWhatsAppOrder(selectedProduct, quantity)
                                            setSelectedProduct(null)
                                        }}
                                        className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <ShoppingCart size={18} />
                                        Order on WhatsApp
                                    </button>

                                    <button
                                        onClick={() => toggleWishlist(selectedProduct.id)}
                                        className="w-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
                                    >
                                        <Heart
                                            size={18}
                                            className={wishlist.includes(selectedProduct.id) ? "fill-current" : ""}
                                        />
                                        {wishlist.includes(selectedProduct.id) ? "Added to Wishlist" : "Add to Wishlist"}
                                    </button>

                                    <button
                                        onClick={() => {
                                            addToCart({
                                                id: selectedProduct.id,
                                                name: selectedProduct.product_name,
                                                price: Number(selectedProduct.sales_price),
                                                image: selectedProduct.product_images?.[0] || "",
                                            })
                                            setSelectedProduct(null)
                                        }}
                                        className="w-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>

                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 rounded-lg transition text-sm active:scale-95"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== TERMS & CONDITIONS MODAL ===== */}
            {showTermsModal && profile.terms_and_condition && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-lg sm:rounded-xl overflow-hidden shadow-xl my-auto">

                        {/* Close Button */}
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:shadow-md transition z-10"
                        >
                            <X size={20} className="text-slate-600" />
                        </button>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-8 py-6 sm:py-8">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                                Terms & Conditions
                            </h2>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                                {profile.storefront_name}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-8 space-y-4">
                            <div className="text-slate-700 text-sm sm:text-base whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                                {profile.terms_and_condition}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition text-sm sm:text-base active:scale-95"
                                >
                                    I Agree
                                </button>
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-3 rounded-lg transition text-sm sm:text-base active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CART DRAWER ===== */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex overflow-hidden">
                    {/* BACKDROP */}
                    <div
                        className="flex-1 bg-black/50 transition-opacity"
                        onClick={() => setCartOpen(false)}
                    />

                    {/* DRAWER */}
                    <div className="w-full sm:w-105 bg-white h-full shadow-2xl flex flex-col">

                        {/* HEADER */}
                        <div className="p-4 border-b flex items-center justify-between bg-linear-to-r from-emerald-50 to-teal-50">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                Cart ({cart.length})
                            </h2>

                            <button 
                                onClick={() => setCartOpen(false)}
                                className="p-2 hover:bg-white rounded-lg transition"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>
                        </div>

                        {/* ITEMS */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center text-slate-600 mt-12">
                                    <ShoppingCart size={40} className="mx-auto mb-3 text-slate-400" />
                                    <p className="text-sm">Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-3 border border-slate-200 hover:border-emerald-300 p-3 rounded-lg transition bg-slate-50 hover:bg-white">

                                        {/* IMAGE */}
                                        <img
                                            src={item.image}
                                            className="w-16 h-16 object-cover rounded shrink-0"
                                            onError={(e) => { e.currentTarget.style.display = "none" }}
                                        />

                                        {/* DETAILS */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm text-slate-800 line-clamp-2">
                                                {item.name}
                                            </h3>

                                            <p className="text-emerald-700 font-bold text-sm">
                                                ₦{item.price.toLocaleString()}
                                            </p>

                                            {/* QUANTITY */}
                                            <div className="flex items-center gap-1 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-1 border rounded hover:bg-slate-100 transition text-xs font-bold active:scale-95 text-slate-700"
                                                >
                                                    −
                                                </button>

                                                <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>

                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 border rounded hover:bg-slate-100 transition text-xs font-bold active:scale-95 text-slate-700"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-auto text-red-600 hover:text-red-700 transition p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* FOOTER */}
                        {cart.length > 0 && (
                            <div className="border-t p-4 space-y-3 bg-linear-to-r from-emerald-50 to-teal-50">

                                {/* TOTAL */}
                                <div className="flex justify-between font-bold text-base sm:text-lg text-slate-800">
                                    <span>Total:</span>
                                    <span className="text-emerald-700">₦{cartTotal.toLocaleString()}</span>
                                </div>

                                {/* ACTIONS */}
                                <button
                                    onClick={() => {
                                        setCartOpen(false)
                                        router.push("/checkout")
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 rounded-lg font-bold text-sm sm:text-base transition"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={() => clearCart()}
                                    className="w-full text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium transition"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}