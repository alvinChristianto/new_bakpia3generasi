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
    "bakpia jogja",
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
  metadataBase: new URL("https://bakpiajogja.com"),
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
      "Rasakan cita rasa autentik Bakpia 3 Generasi dengan resep tradisional.",
    images: [
      {
        url: "/bakpia-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Bakpia 3 Generasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bakpia 3 Generasi",
    description: "Bakpia Premium dari Yogyakarta",
    creator: "@bakpiajogja",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
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
