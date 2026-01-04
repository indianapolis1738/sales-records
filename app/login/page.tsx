"use client"

import { useState } from "react"
import { signIn, signUp } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  })

  // ------------------ Handlers ------------------

  const handleLogin = async () => {
    const { email, password } = loginForm
    if (!email || !password) {
      alert("Please fill all fields")
      return
    }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (!error) router.push("/")
    else alert(error.message || "Login failed")
  }

  const handleSignup = async () => {
    const { name, email, password, confirmPassword, phone } = signupForm
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all required fields")
      return
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, { name, phone })
    setLoading(false)
    if (!error) router.push("/")
    else alert(error.message || "Signup failed")
  }

  // ------------------ UI ------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b border-slate-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              isLogin ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              !isLogin ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {isLogin && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-4 w-full bg-slate-900 text-white py-3 rounded-md text-sm hover:bg-black transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}

        {/* Signup Form */}
        {!isLogin && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <input
              type="email"
              placeholder="Email"
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <input
              type="text"
              placeholder="Phone (Optional)"
              value={signupForm.phone}
              onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={signupForm.confirmPassword}
              onChange={(e) =>
                setSignupForm({ ...signupForm, confirmPassword: e.target.value })
              }
              className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              className="mt-4 w-full bg-slate-900 text-white py-3 rounded-md text-sm hover:bg-black transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500 text-center">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            className="underline text-slate-900 font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  )
}
