"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { setAdmin } = useAdmin();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      router.replace("/");
      return;
    }

    setAdmin(data);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin...
      </div>
    );
  }

  return <>{children}</>;
}