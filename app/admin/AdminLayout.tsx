"use client";

import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { ToastContainer } from "react-toastify";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // ✅ SIDEBAR STATE DI LAYOUT (WAJIB)
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <ToastContainer />

      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MAIN CONTENT */}
      <main
        className={`
          min-h-screen bg-gray-50
          transition-[padding] duration-300 ease-in-out
          ${collapsed ? "pl-16" : "pl-64"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
