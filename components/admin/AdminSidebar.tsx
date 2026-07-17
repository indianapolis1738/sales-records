"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Boxes,
  ShoppingCart,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

const menus = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Stores",
    href: "/admin/stores",
    icon: Store,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="p-6 border-b border-slate-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold">
          Kript Admin
        </h1>
      </div>

      <nav className="p-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-black text-white"
                  : "hover:bg-slate-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon size={20} />

              {menu.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}