"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, Lock, Truck, CheckCircle, AlertCircle, Phone, MapPin, User } from "lucide-react";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        setError("");

        if (!name.trim() || !phone.trim() || !address.trim()) {
            setError("Please fill in all fields");
            return;
        }

        if (phone.trim().length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        if (cart.length === 0) {
            setError("Your cart is empty");
            return;
        }

        setLoading(true);

        try {
            // 1. Create order in Supabase
            const { data, error: orderError } = await supabase
                .from("orders")
                .insert({
                    customer_name: name.trim(),
                    customer_phone: phone.trim(),
                    customer_address: address.trim(),
                    total_amount: total,
                    items: cart,
                    status: "pending",
                    created_at: new Date().toISOString(),
                })
                .select();

            if (orderError) throw orderError;

            // 2. WhatsApp notification with store phone
            const message = `
🛒 *New Order Received!*

👤 *Customer Details:*
Name: ${name}
Phone: ${phone}
Address: ${address}

📦 *Items:*
${cart
    .map(
        (item) =>
            `• ${item.name}\n  Qty: ${item.quantity} × ₦${item.price.toLocaleString()}`
    )
    .join("\n\n")}

💰 *Total: ₦${total.toLocaleString()}*

📅 Order ID: ${data?.[0]?.id || "N/A"}
            `;

            // Get store phone from localStorage or use a default
            const storePhone = localStorage.getItem("storePhone") || ""; // You'll set this from profile
            const whatsappUrl = storePhone
                ? `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`
                : `https://wa.me/?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, "_blank");

            // 3. Show success state
            setSuccess(true);

            // 4. Clear cart
            clearCart();

            // 5. Redirect after 2 seconds
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err) {
            console.error(err);
            setError("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-emerald-100 rounded-full p-4">
                                <CheckCircle size={40} className="text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Order Placed! 🎉
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                            Thank you for your purchase. We've sent you a WhatsApp message with order details.
                        </p>
                    </div>

                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 space-y-2">
                        <p className="text-xs text-emerald-600 font-semibold">ORDER CONFIRMATION</p>
                        <p className="text-lg sm:text-xl font-bold text-emerald-700">
                            ₦{total.toLocaleString()}
                        </p>
                    </div>

                    <p className="text-slate-500 text-xs sm:text-sm">
                        Redirecting to home page...
                    </p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-slate-100 rounded-full p-4">
                            <ShoppingBag size={40} className="text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Cart is Empty
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                            Add some items to your cart before checking out.
                        </p>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition active:scale-95"
                    >
                        ← Back to Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <ChevronLeft size={20} className="text-slate-900" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                    {/* LEFT: FORM (2 COLUMNS ON DESKTOP) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-8 space-y-6">

                            {/* Error Alert */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm sm:text-base font-medium">{error}</p>
                                </div>
                            )}

                            {/* Section: Delivery Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Truck size={20} className="text-emerald-600" />
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Delivery Details</h2>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm sm:text-base"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="tel"
                                            placeholder="+234 (0) 123 456 7890"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm sm:text-base"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">We'll contact you on this number</p>
                                </div>

                                {/* Delivery Address */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Delivery Address
                                    </label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <textarea
                                            placeholder="123 Main Street, Apartment 4B, Lagos, Nigeria"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={4}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm sm:text-base resize-none"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Include apartment/house number and landmarks if possible</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t-2 border-slate-200" />

                            {/* Section: Order Items */}
                            <div className="space-y-4">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-emerald-600" />
                                    Order Items
                                </h2>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-transparent rounded-lg border border-slate-200 hover:border-emerald-300 transition"
                                        >
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                                                    onError={(e) => { e.currentTarget.style.display = "none" }}
                                                />
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-1">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs sm:text-sm text-slate-500">
                                                    Qty: <span className="font-bold text-slate-700">{item.quantity}</span>
                                                </p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-sm sm:text-base text-emerald-600">
                                                    ₦{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    ₦{item.price.toLocaleString()} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Security Info */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 sm:p-4 flex gap-2">
                                <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-blue-700">
                                    <span className="font-semibold">Secure checkout:</span> We use industry-standard encryption to protect your information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: ORDER SUMMARY (SIDEBAR ON DESKTOP, BOTTOM ON MOBILE) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6 sticky top-20">

                            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Order Summary</h2>

                            {/* Items Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm sm:text-base">
                                    <span className="text-slate-600">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                                    <span className="font-semibold text-slate-900">
                                        ₦{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2 border-y-2 border-slate-200 py-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="text-slate-900 font-medium">
                                        ₦{total.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Delivery</span>
                                    <span className="text-emerald-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tax</span>
                                    <span className="text-slate-900 font-medium">Included</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-lg sm:text-xl font-bold text-slate-900">Total</span>
                                <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                                    ₦{total.toLocaleString()}
                                </span>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-lg transition active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Place Order
                                    </>
                                )}
                            </button>

                            {/* Trust Badges */}
                            <div className="space-y-2 pt-2 border-t-2 border-slate-200">
                                <p className="text-xs text-slate-500 text-center font-medium">TRUSTED BY THOUSANDS</p>
                                <div className="flex justify-center gap-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-emerald-600">✓</div>
                                        <p className="text-xs text-slate-600">Secure</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-emerald-600">✓</div>
                                        <p className="text-xs text-slate-600">Fast</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-emerald-600">✓</div>
                                        <p className="text-xs text-slate-600">Reliable</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}