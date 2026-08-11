import type { Metadata } from "next";

import ConditionalLayout from "@/components/ConditionalLayout";

import "./globals.css";


// =========================================================
// METADATA
// =========================================================

export const metadata: Metadata = {
  title: {
    default: "HMPTI Universitas Duta Bangsa",
    template: "%s | HMPTI",
  },

  description:
    "Website resmi Himpunan Mahasiswa Program Studi Teknik Informatika Universitas Duta Bangsa.",
};


// =========================================================
// ROOT LAYOUT
// =========================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}