import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import RecentStores from "@/components/admin/RecentStores";
import RecentProducts from "@/components/admin/RecentProducts";
// import QuickActions from "@/components/admin/QuickActions";
// import ActivityFeed from "@/components/admin/ActivityFeed";

import { getDashboardStats } from "@/lib/admin/dashboard";

import {
  Users,
  Store,
  Boxes,
  Crown,
  User,
  AlertTriangle,
} from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6 lg:p-8">

      {/* <DashboardHeader /> */}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

        <StatCard
          title="Users"
          value={stats.totalUsers}
          icon={Users}
        />

        <StatCard
          title="Stores"
          value={stats.totalStores}
          icon={Store}
        />

        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Boxes}
        />

        <StatCard
          title="Premium"
          value={stats.proUsers}
          icon={Crown}
        />

        <StatCard
          title="Free"
          value={stats.freeUsers}
          icon={User}
        />

        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
        />

      </div>

    </div>
  );
}