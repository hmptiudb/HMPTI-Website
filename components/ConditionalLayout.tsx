"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // =========================================================
  // ROUTES WITHOUT PUBLIC NAVBAR & FOOTER
  // =========================================================

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname.startsWith("/auth/");

  const isAdminPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");


  // =========================================================
  // AUTH / ADMIN
  // =========================================================

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }


  // =========================================================
  // PUBLIC WEBSITE
  // =========================================================

  return (
    <>
      <Navbar />

      <main>{children}</main>

      <Footer />
    </>
  );
}