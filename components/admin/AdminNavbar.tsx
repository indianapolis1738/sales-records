"use client";

import { Bell } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminNavbar() {
  const { admin } = useAdmin();

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-8">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell size={22} />
        </button>

        <div className="text-right">
          <p className="font-semibold">
            {admin?.full_name}
          </p>

          <p className="text-sm text-slate-500">
            {admin?.role}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
          {admin?.full_name?.charAt(0)}
        </div>
      </div>
    </header>
  );
}