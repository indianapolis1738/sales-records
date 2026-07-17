"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type Admin = {
  id: string;
  full_name: string | null;
  role: string;
};

type AdminContextType = {
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;
};

const AdminContext = createContext<AdminContextType>({
  admin: null,
  setAdmin: () => {},
});

export function AdminProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [admin, setAdmin] = useState<Admin | null>(null);

  return (
    <AdminContext.Provider
      value={{
        admin,
        setAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}