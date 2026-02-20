"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, TrendingUp, Users, Zap, Check, ArrowRight, Menu, X, DollarSign, PieChart, Calendar, Shield, Smartphone, Headphones } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const features = [
        {
            icon: <BarChart3 size={28} />,
            title: "Sales Tracking",
            description: "Track every sale in real-time with detailed invoice records and payment status"
        },
        {
            icon: <Users size={28} />,
            title: "Customer Management",
            description: "Organize and manage your customer relationships effectively in one place"
        },
        {
            icon: <PieChart size={28} />,
            title: "Inventory Control",
            description: "Keep accurate stock records and never run out of essential products"
        },
        {
            icon: <TrendingUp size={28} />,
            title: "Profit Analytics",
            description: "Understand your profit margins and business performance with real insights"
        },
        {
            icon: <Calendar size={28} />,
            title: "Invoice Management",
            description: "Create professional invoices and track payment status effortlessly"
        },
        {
            icon: <Shield size={28} />,
            title: "Secure & Private",
            description: "Your business data is encrypted and protected with enterprise-level security"
        }
    ]

    const benefits = [
        "Save hours on manual record keeping every week",
        "Never lose track of customer payments again",
        "Make data-driven business decisions with real insights",
        "Scale your business without hiring more staff",
        "Reduce errors and improve accuracy",
        "Access your business info anytime, anywhere"
    ]

    const testimonials = [
        {
            name: "Chioma Okafor",
            role: "Fashion Retailer",
            message: "This app saved me so much time! I used to spend hours writing invoices by hand. Now I track everything in minutes.",
            business: "Chichi's Fashion Store"
        },
        {
            name: "Tunde Adeleke",
            role: "Electronics Seller",
            message: "Finally, a tool that understands Nigerian businesses. The payment tracking feature has helped me recover ₦200k in unpaid invoices.",
            business: "Tunde Electronics"
        },
        {
            name: "Amara Nwosu",
            role: "Food Business Owner",
            message: "The inventory and sales tracking helped me identify which products are most profitable. My margins improved by 15%!",
            business: "Amara's Kitchen Supplies"
        }
    ]

    const pricingPlans = [
        {
            name: "Starter",
            price: "₦0",
            period: "Forever Free",
            description: "Perfect for just starting out",
            features: [
                "Up to 100 sales records",
                "Basic inventory tracking",
                "10 customers",
                "Email support"
            ],
            cta: "Get Started",
            highlighted: false
        },
        {
            name: "Professional",
            price: "₦4,999",
            period: "Per month",
            description: "For growing businesses",
            features: [
                "Unlimited sales records",
                "Unlimited customers",
                "Advanced analytics",
                "Priority support",
                "Invoice customization",
                "Export reports"
            ],
            cta: "Start Free Trial",
            highlighted: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "Contact us",
            description: "For large operations",
            features: [
                "Everything in Professional",
                "Custom integrations",
                "Dedicated account manager",
                "Advanced security features",
                "Staff management",
                "API access"
            ],
            cta: "Contact Sales",
            highlighted: false
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center">
                                <BarChart3 size={24} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">Flow</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden sm:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 hover:text-slate-900 transition font-medium">Features</a>
                            <a href="#benefits" className="text-slate-600 hover:text-slate-900 transition font-medium">Why Us</a>
                            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition font-medium">Pricing</a>
                            <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition font-medium">Stories</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex px-6 py-2.5 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-semibold"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                            >
                                Get Started
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="sm:hidden p-2 text-slate-900"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="sm:hidden mt-4 pb-4 space-y-3 border-t border-slate-100 pt-4">
                            <a href="#features" className="block text-slate-600 hover:text-slate-900 font-medium">Features</a>
                            <a href="#benefits" className="block text-slate-600 hover:text-slate-900 font-medium">Why Us</a>
                            <a href="#pricing" className="block text-slate-600 hover:text-slate-900 font-medium">Pricing</a>
                            <a href="#testimonials" className="block text-slate-600 hover:text-slate-900 font-medium">Stories</a>
                            <Link href="/login" className="block text-slate-600 hover:text-slate-900 font-medium">Sign In</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 py-20 sm:py-32">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                                Manage Your Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">The Smart Way</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                                Track sales, manage customers, and grow your business with Nigeria's #1 sales management app for SMEs
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Start Free <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-lg font-semibold text-lg transition"
                            >
                                Learn More
                            </Link>
                        </div>

                        <p className="text-sm text-slate-600">
                            ✓ No credit card required · ✓ 7-day free trial · ✓ Cancel anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Powerful Features Built for Your Business</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to manage sales, customers, and inventory in one place</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-8 border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-lg transition group bg-slate-50">
                                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-20 sm:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Why Nigerian Businesses Choose Us</h2>
                            <p className="text-lg text-slate-600 mb-8">Built by Nigerians, for Nigerians. We understand the unique challenges of running a business in Nigeria.</p>

                            <ul className="space-y-4">
                                {benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Check size={16} className="text-emerald-600" />
                                        </div>
                                        <span className="text-slate-900 font-medium">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="hidden lg:grid grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
                                    <DollarSign size={32} className="text-emerald-600 mb-3" />
                                    <h3 className="font-bold text-slate-900 mb-2">Save Money</h3>
                                    <p className="text-sm text-slate-600">Cut operational costs and eliminate manual work</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
                                    <Smartphone size={32} className="text-teal-600 mb-3" />
                                    <h3 className="font-bold text-slate-900 mb-2">Mobile-First</h3>
                                    <p className="text-sm text-slate-600">Works perfectly on your phone or laptop</p>
                                </div>
                            </div>
                            <div className="space-y-6 mt-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
                                    <TrendingUp size={32} className="text-cyan-600 mb-3" />
                                    <h3 className="font-bold text-slate-900 mb-2">Grow Faster</h3>
                                    <p className="text-sm text-slate-600">Scale without hiring more staff</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
                                    <Headphones size={32} className="text-emerald-700 mb-3" />
                                    <h3 className="font-bold text-slate-900 mb-2">24/7 Support</h3>
                                    <p className="text-sm text-slate-600">Help whenever you need it in Yoruba or English</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 sm:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Loved by Business Owners Across Nigeria</h2>
                        <p className="text-lg text-slate-600">See how Flow is helping Nigerian businesses grow</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md transition">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-400">★</span>
                                    ))}
                                </div>
                                <p className="text-slate-700 mb-4 italic">"{testimonial.message}"</p>
                                <div>
                                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                                    <p className="text-xs text-slate-500 mt-1">{testimonial.business}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-lg text-slate-600">Choose the plan that's right for your business</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`rounded-2xl transition ${
                                    plan.highlighted
                                        ? "lg:scale-105 bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-white shadow-2xl border-0"
                                        : "bg-white border border-slate-200 p-8"
                                }`}
                            >
                                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                                    {plan.name}
                                </h3>
                                <p className={plan.highlighted ? "text-emerald-100" : "text-slate-600"}>
                                    {plan.description}
                                </p>

                                <div className="my-6">
                                    <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-sm ml-2 ${plan.highlighted ? "text-emerald-100" : "text-slate-600"}`}>
                                        {plan.period}
                                    </span>
                                </div>

                                <button
                                    className={`w-full py-3 rounded-lg font-semibold mb-6 transition ${
                                        plan.highlighted
                                            ? "bg-white text-emerald-600 hover:bg-slate-100"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                >
                                    {plan.cta}
                                </button>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3">
                                            <Check size={20} className={plan.highlighted ? "text-emerald-100" : "text-emerald-600"} />
                                            <span className={plan.highlighted ? "text-emerald-50" : "text-slate-700"}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 sm:py-32 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
                    <p className="text-lg sm:text-xl text-emerald-50 mb-8">Join thousands of Nigerian business owners managing their sales smarter</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 hover:bg-slate-100 rounded-lg font-semibold text-lg transition shadow-lg flex items-center justify-center gap-2"
                        >
                            Get Started Free <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="#"
                            className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-emerald-600 rounded-lg font-semibold text-lg transition"
                        >
                            Schedule Demo
                        </Link>
                    </div>

                    <p className="text-emerald-50 text-sm mt-6">No credit card needed • Free forever plan available</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 size={20} className="text-white" />
                                </div>
                                <span className="font-bold text-white">Flow</span>
                            </div>
                            <p className="text-sm text-slate-400">The #1 sales management app for Nigerian SMEs</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between">
                        <p className="text-sm text-slate-400">© 2024 Flow. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 sm:mt-0">
                            <a href="#" className="text-slate-400 hover:text-white transition">Twitter</a>
                            <a href="#" className="text-slate-400 hover:text-white transition">Instagram</a>
                            <a href="#" className="text-slate-400 hover:text-white transition">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}