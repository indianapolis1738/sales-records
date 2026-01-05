"use client"

import { useState } from "react"
import { signIn, signUp } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
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
    if (!email || !password) return alert("Please fill all fields")
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (!error) router.push("/")
    else alert(error.message || "Login failed")
  }

  const handleSignup = async () => {
    const { name, email, password, confirmPassword, phone } = signupForm
    if (!name || !email || !password || !confirmPassword)
      return alert("Please fill all required fields")
    if (password !== confirmPassword) return alert("Passwords do not match")
    setLoading(true)
    const { error } = await signUp(email, password, { name, phone })
    setLoading(false)
    if (!error) router.push("/")
    else alert(error.message || "Signup failed")
  }

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-md transition-colors duration-300">
        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isLogin
                ? "border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-300"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              !isLogin
                ? "border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-300"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Animated Forms */}
        <AnimatePresence>
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <InputField
                placeholder="Email"
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
              <InputField
                placeholder="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="mt-2 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-3 rounded-md text-sm hover:bg-black dark:hover:bg-slate-200 transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <InputField
                placeholder="Full Name"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, name: e.target.value })
                }
              />
              <InputField
                placeholder="Email"
                type="email"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, email: e.target.value })
                }
              />
              <InputField
                placeholder="Phone (Optional)"
                value={signupForm.phone}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, phone: e.target.value })
                }
              />
              <InputField
                placeholder="Password"
                type="password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
              />
              <InputField
                placeholder="Confirm Password"
                type="password"
                value={signupForm.confirmPassword}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    confirmPassword: e.target.value
                  })
                }
              />
              <button
                onClick={handleSignup}
                disabled={loading}
                className="mt-2 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-3 rounded-md text-sm hover:bg-black dark:hover:bg-slate-200 transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch Login/Signup */}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="underline text-slate-900 dark:text-white font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  )
}

// ------------------ Input Component ------------------
function InputField({
  placeholder,
  type = "text",
  value,
  onChange
}: {
  placeholder: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border border-slate-200 dark:border-slate-600 rounded-md p-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition"
    />
  )
}
