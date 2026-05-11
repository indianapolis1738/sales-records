"use client"

import { Zap, Bell, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function StorefrontSettingsPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail("")
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  const features = [
    {
      title: "Online Store",
      description: "Showcase your products and services online",
      icon: "🏪"
    },
    {
      title: "Payment Gateway",
      description: "Accept payments directly from customers",
      icon: "💳"
    },
    {
      title: "Order Management",
      description: "Track and manage all orders in one place",
      icon: "📦"
    },
    {
      title: "Customer Portal",
      description: "Let customers track their orders themselves",
      icon: "👥"
    },
    {
      title: "Analytics",
      description: "Get insights into your store performance",
      icon: "📊"
    },
    {
      title: "Integration",
      description: "Connect with your existing Flow dashboard",
      icon: "🔗"
    }
  ]

  const timeline = [
    { quarter: "Q2 2024", status: "🎯 In Development", color: "from-emerald-500 to-teal-500" },
    { quarter: "Q3 2024", status: "🧪 Beta Testing", color: "from-blue-500 to-cyan-500" },
    { quarter: "Q4 2024", status: "🚀 Full Launch", color: "from-purple-500 to-pink-500" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Floating shapes background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
            <Zap size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Coming Soon</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Storefront</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Take your business online with Flow's integrated storefront. Sell directly to customers, accept payments, and manage everything from your Flow dashboard.
          </p>

          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition group"
          >
            Back to Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Notify Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg mb-16 sm:mb-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto mb-4">
              <Bell size={24} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Be the First to Know
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Get notified when your online storefront is ready to launch
            </p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <p className="text-emerald-700 font-semibold text-center">
                  Thanks! We'll notify you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotify} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4">
            What's Coming
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
            The storefront will include powerful features to help you sell online
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-300 transition group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4">
            Launch Timeline
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Here's what to expect in the coming months
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <div className={`bg-gradient-to-br ${item.color} p-0.5 rounded-xl`}>
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-2xl mb-2">{item.status}</div>
                    <p className="text-slate-600 font-semibold">{item.quarter}</p>
                  </div>
                </div>
                {idx < timeline.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4">
            Frequently Asked
          </h2>
          <p className="text-slate-600 text-center mb-12">
            Common questions about the storefront feature
          </p>

          <div className="space-y-4">
            {[
              {
                q: "Will it cost extra?",
                a: "The storefront will be available as an add-on feature with flexible pricing for all Flow users."
              },
              {
                q: "Can I integrate my current inventory?",
                a: "Yes! The storefront will sync directly with your Flow inventory and sales data automatically."
              },
              {
                q: "What payment methods will be supported?",
                a: "We'll support major payment gateways including card payments, bank transfers, and mobile money."
              },
              {
                q: "How do I get early access?",
                a: "Sign up with your email above and we'll invite you to the beta when it launches."
              }
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-lg border border-slate-200 p-5 hover:border-emerald-300 transition cursor-pointer group"
              >
                <summary className="font-semibold text-slate-900 flex items-center justify-between">
                  {faq.q}
                  <span className="text-emerald-600 group-open:rotate-180 transition">+</span>
                </summary>
                <p className="text-slate-600 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-20 text-center">
          <p className="text-slate-600 mb-4">Have questions?</p>
          <a
            href="mailto:support@flow.com"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Contact our support team
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Padding for bottom nav */}
      <div className="h-32"></div>
    </div>
  )
}