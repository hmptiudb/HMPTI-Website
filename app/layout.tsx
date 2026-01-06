// app/layout.tsx
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import "tailwindcss/tailwind.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HMPTI | UDB",
  description: "Himpunan Mahasiswa Prodi Teknik Informatika Universitas Duta Bangsa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
