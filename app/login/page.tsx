"use client"

import { useState } from "react"
import { signIn, signUp } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Mail, Lock, User, Phone, Building2, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react"
import GoogleButton from "@/components/GoogleButton"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessname: "",
  })

  // Handlers
  const handleLogin = async () => {
    const { email, password } = loginForm
    if (!email || !password) {
      setError("Please fill all fields")
      return
    }
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => router.push("/home"), 1000)
    } else {
      setError(error.message || "Login failed")
    }
  }

  const handleSignup = async () => {
    const { name, email, password, confirmPassword, phone } = signupForm
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all required fields")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setError(null)
    setLoading(true)
    const { error } = await signUp(email, password, { name, phone })
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => router.push("/home"), 1000)
    } else {
      setError(error.message || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 md:p-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl p-8 sm:p-4">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mb-4">
              <Building2 size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Flow by Kript
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "Welcome back" : "Get started with your business"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 mb-8">
            <TabButton
              active={isLogin}
              onClick={() => {
                setIsLogin(true)
                setError(null)
              }}
            >
              Login
            </TabButton>
            <TabButton
              active={!isLogin}
              onClick={() => {
                setIsLogin(false)
                setError(null)
              }}
            >
              Sign Up
            </TabButton>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex gap-3"
              >
                <div className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg flex gap-3"
              >
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  {isLogin ? "Logging in..." : "Account created successfully!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <InputField
                  icon={<Mail size={18} />}
                  placeholder="Email address"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={loading}
                />
                <InputField
                  icon={<Lock size={18} />}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={loading}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <button
                  onClick={handleLogin}
                  disabled={loading || !loginForm.email || !loginForm.password}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                      or continue with
                    </span>
                  </div>
                </div>
                <GoogleButton />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <InputField
                  icon={<User size={18} />}
                  placeholder="Full name"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                  disabled={loading}
                />
                <InputField
                  icon={<Mail size={18} />}
                  placeholder="Email address"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                  disabled={loading}
                />
                <InputField
                  icon={<Phone size={18} />}
                  placeholder="Phone number (optional)"
                  value={signupForm.phone}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, phone: e.target.value })
                  }
                  disabled={loading}
                />
                <InputField
                  icon={<Lock size={18} />}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  disabled={loading}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
                <InputField
                  icon={<Lock size={18} />}
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupForm.confirmPassword}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmPassword: e.target.value
                    })
                  }
                  disabled={loading}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <div className="text-xs text-slate-600 dark:text-slate-400 pt-2">
                  <p className="mb-2">Password must be:</p>
                  <ul className="space-y-1 ml-4">
                    <li className={`flex gap-2 ${signupForm.password.length >= 8 ? "text-green-600 dark:text-green-400" : "text-slate-500"}`}>
                      <span>•</span> At least 8 characters
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleSignup}
                  disabled={loading || !signupForm.name || !signupForm.email || !signupForm.password}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                      or continue with
                    </span>
                  </div>
                </div>
                <GoogleButton />

                <p className="text-xs text-slate-600 dark:text-slate-400 text-center pt-2">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switch Login/Signup */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-slate-600 dark:text-slate-400 text-center"
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              disabled={loading}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </motion.p>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 text-xs text-slate-400 dark:text-slate-600 text-center w-full px-4"
      >
        © 2025 Flow by Kript. All rights reserved.
      </motion.p>
    </div>
  )
}

// Components

function TabButton({
  active,
  children,
  onClick
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
        active
          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  )
}

function InputField({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  onKeyDown,
  disabled,
  showPassword,
  onTogglePassword
}: {
  icon: React.ReactNode
  placeholder: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className="w-full pl-12 pr-12 py-3.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white bg-white/50 dark:bg-slate-800/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
      />
      {type === "password" && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          disabled={disabled}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition disabled:cursor-not-allowed"
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      )}
    </div>
  )
}
