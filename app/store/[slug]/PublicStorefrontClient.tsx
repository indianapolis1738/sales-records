"use client"



import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Phone, MapPin, Package, Search, X, ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Filter, Facebook, Instagram, Twitter, Mail, Menu } from "lucide-react"

const ITEMS_PER_PAGE = 12

export default function PublicStorefront() {
    const { slug } = useParams()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])

    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [wishlist, setWishlist] = useState<string[]>([])
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                storefront_banner
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

    // Reset to page 1 when filters change
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
        const phone = profile.phone_number?.replace(/\D/g, "")

        const message = `Hello 👋 I want to order:

Product: ${product.product_name}
Price: ₦${Number(product.sales_price).toLocaleString()}
Quantity: ${qty}
Total: ₦${(Number(product.sales_price) * qty).toLocaleString()}`

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        window.open(url, "_blank")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading store...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Package size={48} className="text-slate-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h1>
                    <p className="text-slate-600">This store doesn't exist or has been disabled.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ===== NAVBAR ===== */}
            <nav className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {profile.storefront_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="font-bold text-slate-900 text-lg">{profile.storefront_name}</h2>
                            <p className="text-xs text-slate-500">Official Store</p>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#products" className="text-slate-600 hover:text-emerald-600 font-medium transition">Shop</a>
                        <a href="#" className="text-slate-600 hover:text-emerald-600 font-medium transition">About</a>
                        <a href="#footer" className="text-slate-600 hover:text-emerald-600 font-medium transition">Contact</a>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                            <Heart size={18} className="text-emerald-600" />
                            <span className="text-sm font-semibold text-slate-900">{wishlist.length}</span>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                            <Menu size={24} className="text-slate-900" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t-2 border-slate-200 bg-slate-50 p-4 space-y-3">
                        <a href="#products" className="block text-slate-900 hover:text-emerald-600 font-medium transition py-2">Shop</a>
                        <a href="#" className="block text-slate-900 hover:text-emerald-600 font-medium transition py-2">About</a>
                        <a href="#footer" className="block text-slate-900 hover:text-emerald-600 font-medium transition py-2">Contact</a>
                    </div>
                )}
            </nav>

            {/* ===== HERO SECTION ===== */}
            <div className="relative overflow-hidden">
                <div className="h-96 sm:h-[500px] overflow-hidden bg-slate-200">
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
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                            {profile.storefront_name}
                        </h1>
                        <p className="text-lg sm:text-xl max-w-2xl mx-auto drop-shadow-md opacity-95">
                            {profile.storefront_description}
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== STORE INFO BAR ===== */}
            {/* <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Phone size={24} className="text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-semibold text-emerald-700 uppercase">Call Us</p>
                                <a href={`tel:${profile.phone_number}`} className="text-base font-bold text-slate-900 hover:text-emerald-600 transition">
                                    {profile.phone_number}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <MapPin size={24} className="text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-semibold text-emerald-700 uppercase">Location</p>
                                <p className="text-base font-bold text-slate-900">{profile.business_address}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <ShoppingCart size={24} className="text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-semibold text-emerald-700 uppercase">Products</p>
                                <p className="text-base font-bold text-slate-900">{products.length} Available</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1">
                {/* ===== FILTERS & SEARCH ===== */}
                <div className="max-w-7xl mx-auto px-4 py-10" id="products">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 text-emerald-600" size={20} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-base font-medium placeholder-slate-500"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-semibold text-sm"
                            >
                                <Filter size={18} />
                                Filters
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-5 py-2.5 bg-white border-2 border-emerald-600 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold cursor-pointer"
                            >
                                <option value="default">Sort: Default</option>
                                <option value="low">Price: Low → High</option>
                                <option value="high">Price: High → Low</option>
                                <option value="newest">Newest First</option>
                            </select>

                            {(search || minPrice || maxPrice) && (
                                <button
                                    onClick={() => {
                                        setSearch("")
                                        setMinPrice("")
                                        setMaxPrice("")
                                    }}
                                    className="px-5 py-2.5 bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 rounded-lg transition font-semibold text-sm"
                                >
                                    ✕ Clear Filters
                                </button>
                            )}

                            <div className="text-sm text-slate-600 font-semibold sm:ml-auto">
                                Showing <span className="text-emerald-600 font-bold">{paginatedProducts.length}</span> of <span className="text-emerald-600 font-bold">{filteredProducts.length}</span> products
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 space-y-4">
                                <h3 className="font-bold text-slate-900 text-base">Price Range (₦)</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min Price"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="flex-1 px-4 py-2.5 border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Price"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="flex-1 px-4 py-2.5 border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== PRODUCTS GRID ===== */}
                <div className="max-w-7xl mx-auto px-4 mb-16">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Package size={56} className="text-slate-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
                            <p className="text-slate-600">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {paginatedProducts.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Product Image */}
                                        <div className="relative h-56 bg-slate-100 overflow-hidden">
                                            {item.product_images?.length ? (
                                                <img
                                                    src={item.product_images[0]}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-slate-200">
                                                    <Package size={40} className="text-slate-400" />
                                                </div>
                                            )}

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={() => toggleWishlist(item.id)}
                                                className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition z-10 hover:scale-110"
                                            >
                                                <Heart
                                                    size={20}
                                                    className={wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-slate-400"}
                                                />
                                            </button>

                                            {/* Stock Badge */}
                                            {item.quantity < 5 && (
                                                <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                                    Only {item.quantity} left
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition text-base">
                                                {item.product_name}
                                            </h3>

                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500 font-semibold">(24)</span>
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    ₦{Number(item.sales_price).toLocaleString()}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(item)
                                                    setActiveImageIndex(0)
                                                    setQuantity(1)
                                                }}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart size={18} />
                                                View & Order
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ===== PAGINATION ===== */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2.5 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            const pageNum = idx + 1
                                            const isActive = pageNum === currentPage
                                            const isNearby = Math.abs(pageNum - currentPage) <= 1

                                            if (totalPages <= 5 || isActive || isNearby) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-4 py-2.5 rounded-lg font-bold transition ${
                                                            isActive
                                                                ? "bg-emerald-600 text-white"
                                                                : "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            } else if (isNearby || pageNum === 1 || pageNum === totalPages) {
                                                return null
                                            }
                                            return null
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2.5 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <footer className="bg-slate-900 text-white border-t-2 border-emerald-600 mt-auto" id="footer">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Store Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-emerald-400">{profile.storefront_name}</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {profile.storefront_description}
                            </p>
                            <div className="flex gap-3 pt-2">
                                <a href="#" className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg transition">
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-emerald-400">Contact</h3>
                            <ul className="space-y-3 text-slate-300 text-sm">
                                <li className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <a href={`tel:${profile.phone_number}`} className="hover:text-emerald-400 transition">
                                        {profile.phone_number}
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span>{profile.business_address}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <a href="mailto:support@flow.com" className="hover:text-emerald-400 transition">
                                        support@flow.com
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-emerald-400">Shop</h3>
                            <ul className="space-y-2 text-slate-300 text-sm">
                                <li><a href="#products" className="hover:text-emerald-400 transition">New Products</a></li>
                                <li><a href="#products" className="hover:text-emerald-400 transition">Best Sellers</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition">Wishlist</a></li>
                                <li><a href="#products" className="hover:text-emerald-400 transition">Browse All</a></li>
                            </ul>
                        </div>

                        {/* Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-emerald-400">Info</h3>
                            <ul className="space-y-2 text-slate-300 text-sm">
                                <li><a href="#" className="hover:text-emerald-400 transition">About Us</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition">FAQ</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
                        <p>© {new Date().getFullYear()} {profile.storefront_name}. All rights reserved.</p>
                        <p>Powered by <span className="text-emerald-400 font-semibold">Flow</span></p>
                    </div>
                </div>
            </footer>

            {/* ===== PRODUCT DETAIL MODAL ===== */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition z-10"
                        >
                            <X size={24} className="text-slate-600" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 sm:p-8">

                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative bg-slate-100 rounded-xl overflow-hidden h-96">
                                    {selectedProduct.product_images?.length ? (
                                        <img
                                            src={selectedProduct.product_images[activeImageIndex]}
                                            alt={selectedProduct.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Package size={48} className="text-slate-300" />
                                        </div>
                                    )}

                                    {/* Image Navigation */}
                                    {selectedProduct.product_images?.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setActiveImageIndex(prev => prev === 0 ? selectedProduct.product_images.length - 1 : prev - 1)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full transition shadow-lg"
                                            >
                                                <ChevronLeft size={20} className="text-slate-900" />
                                            </button>
                                            <button
                                                onClick={() => setActiveImageIndex(prev => prev === selectedProduct.product_images.length - 1 ? 0 : prev + 1)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full transition shadow-lg"
                                            >
                                                <ChevronRight size={20} className="text-slate-900" />
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
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-3 transition ${activeImageIndex === idx ? "border-emerald-600" : "border-slate-300"}`}
                                            >
                                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                                        {selectedProduct.product_name}
                                    </h2>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={18}
                                                    className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-base text-slate-600 font-semibold">(24 reviews)</span>
                                    </div>

                                    <p className="text-5xl font-bold text-emerald-600 mb-3">
                                        ₦{Number(selectedProduct.sales_price).toLocaleString()}
                                    </p>

                                    <p className={`text-base font-bold ${selectedProduct.quantity > 5 ? "text-green-600" : "text-orange-600"}`}>
                                        {selectedProduct.quantity > 5 ? "✓ In Stock" : `⚠ Only ${selectedProduct.quantity} in stock`}
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="space-y-3">
                                    <label className="block text-base font-bold text-slate-900">Quantity</label>
                                    <div className="flex items-center border-2 border-slate-300 rounded-lg w-fit">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-3 text-slate-600 hover:bg-slate-100 transition font-bold text-lg"
                                        >
                                            −
                                        </button>
                                        <span className="px-6 py-3 font-bold text-slate-900 text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(selectedProduct.quantity, quantity + 1))}
                                            className="px-4 py-3 text-slate-600 hover:bg-slate-100 transition font-bold text-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="space-y-3 pb-4 border-b-2 border-slate-200">
                                    {selectedProduct.sku && (
                                        <p className="text-base text-slate-700">
                                            <span className="font-bold">SKU:</span> <span className="text-slate-600">{selectedProduct.sku}</span>
                                        </p>
                                    )}
                                    {selectedProduct.imei && (
                                        <p className="text-base text-slate-700">
                                            <span className="font-bold">IMEI:</span> <span className="text-slate-600">{selectedProduct.imei}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleWhatsAppOrder(selectedProduct, quantity)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg"
                                    >
                                        <ShoppingCart size={22} />
                                        Order on WhatsApp
                                    </button>

                                    <button
                                        onClick={() => {
                                            toggleWishlist(selectedProduct.id)
                                        }}
                                        className="w-full border-3 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg"
                                    >
                                        <Heart
                                            size={22}
                                            className={wishlist.includes(selectedProduct.id) ? "fill-current" : ""}
                                        />
                                        {wishlist.includes(selectedProduct.id) ? "Added to Wishlist" : "Add to Wishlist"}
                                    </button>

                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-3 rounded-xl transition"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}