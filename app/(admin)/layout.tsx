"use client";

import { AdminProvider } from "@/contexts/AdminContext";
import AdminRoute from "@/components/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminRoute>
        <AdminLayout>
          {children}
        </AdminLayout>
      </AdminRoute>
    </AdminProvider>
  );
}