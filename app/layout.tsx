import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart-provider";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bakpia 3 Generasi - Premium Indonesian Bakpia",
    template: "%s - Bakpia 3 Generasi",
  },
  description:
    "Rasakan cita rasa autentik Bakpia 3 Generasi. Produk bakpia premium buatan tangan dengan resep tradisional yang telah dipercaya selama puluhan tahun.",
  keywords: [
    "bakpia 3 generasi",
    "bakpia istimewa",
    "bakpia premium",
    "makanan tradisional indonesia",
    "souvenir jogja",
  ],
  authors: [{ name: "Bakpia 3 Generasi" }],
  creator: "Bakpia 3 Generasi",
  publisher: "Bakpia 3 Generasi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://bakpia3generasi.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Bakpia 3 Generasi",
    title: "Bakpia 3 Generasi - Premium Indonesian Bakpia",
    description:
      "Bakpia 3 Generasi, oleh-oleh dari yogyakarta yang enak dan terjangkau",
    images: [
      {
        url: "/bakpia-hero.webp",
        width: 1200,
        height: 630,
        alt: "Bakpia 3 Generasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bakpia 3 Generasi",
    description:
      "Bakpia 3 Generasi, oleh-oleh dari yogyakarta yang enak dan terjangkau",
    creator: "@bakpiajogja",
    images: ["/bakpia-hero.webp"],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon.ico",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.ico",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

const geistSans = Geist({
  variable: "--font-sans", // Ini harus cocok dengan variabel di CSS Anda
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono", // Ini harus cocok dengan variabel di CSS Anda
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
