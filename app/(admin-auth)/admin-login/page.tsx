"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function signIn() {
    setLoading(true);
    setError("");

    // Login to Supabase
    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Unable to authenticate.");
      setLoading(false);
      return;
    }

    // Check if user is an admin
    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!admin) {
      // Not an admin
      await supabase.auth.signOut();

      setError("Access denied.");

      setLoading(false);

      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 p-8">

        <h1 className="text-3xl font-bold text-center">
          Super Admin
        </h1>

        <p className="text-sm text-slate-500 text-center mt-2 mb-8">
          Sign in to continue
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">

          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-transparent px-4 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-transparent px-4 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </div>
      </div>
    </div>
  );
}