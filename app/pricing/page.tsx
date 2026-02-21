// "use client"

// import { useRouter } from "next/navigation"
// import { motion } from "framer-motion"
// import { ArrowLeft } from "lucide-react"

// export default function PricingPage() {
//   const router = useRouter()

//   const handleUpgrade = async () => {
//     const res = await fetch("/api/paystack/initialize", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: user.email,
//         userId: user.id,
//       }),
//     })
  
//     const data = await res.json()
  
//     if (data.data?.authorization_url) {
//       window.location.href = data.data.authorization_url
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
//         <br /><br />
//         {/* Back Button */}
//         <button
//             onClick={() => router.back()}
//             className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition group"
//           >
//             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
//             Go Back
//           </button>
// <br /><br />
//       <div className="max-w-6xl mx-auto text-center">
//         <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
//           Simple, Transparent Pricing
//         </h1>
//         <p className="mt-4 text-slate-600 dark:text-slate-300">
//           Choose the plan that fits your business.
//         </p>
//       </div>

//       <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
//         {/* FREE PLAN */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700"
//         >
//           <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
//             Free
//           </h2>
//           <p className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">
//             NGN0
//             <span className="text-base font-medium text-slate-500">
//               /month
//             </span>
//           </p>

//           <ul className="mt-6 space-y-3 text-slate-600 dark:text-slate-300">
//             <li>✔ Up to 5 invoices</li>
//             <li>✔ Basic reporting</li>
//             <li>✔ Customer management</li>
//             <li>✔ Email support</li>
//           </ul>

//           <button
//             disabled
//             className="mt-8 w-full bg-slate-200 dark:bg-slate-700 text-slate-500 py-3 rounded-lg cursor-not-allowed"
//           >
//             Current Plan
//           </button>
//         </motion.div>

//         {/* PRO PLAN */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 relative"
//         >
//           <div className="absolute top-4 right-4 bg-green-500 text-xs px-3 py-1 rounded-full font-medium">
//             Most Popular
//           </div>

//           <h2 className="text-2xl font-semibold">
//             Pro
//           </h2>

//           <p className="mt-4 text-4xl font-bold">
//             NGN4,000
//             <span className="text-base font-medium text-slate-300">
//               /month
//             </span>
//           </p>

//           <ul className="mt-6 space-y-3 text-slate-200">
//             <li>✔ Unlimited invoices</li>
//             <li>✔ Advanced reporting</li>
//             <li>✔ Priority support</li>
//             <li>✔ Custom branding</li>
//             <li>✔ Future premium features</li>
//           </ul>

//           <button
//             onClick={handleUpgrade}
//             className="mt-8 w-full bg-white text-slate-900 py-3 rounded-lg font-medium hover:bg-slate-200 transition"
//           >
//             Upgrade to Pro
//           </button>
//         </motion.div>
//       </div>
//     </div>
//   )
// }