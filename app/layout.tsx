import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Bakpia Jogja Istimewa - Premium Indonesian Bakpia',
    template: '%s - Bakpia Jogja Istimewa',
  },
  description: 'Rasakan cita rasa autentik Bakpia Jogja Istimewa. Produk bakpia premium buatan tangan dengan resep tradisional yang telah dipercaya selama puluhan tahun.',
  keywords: ['bakpia jogja', 'bakpia istimewa', 'bakpia premium', 'makanan tradisional indonesia', 'souvenir jogja'],
  authors: [{ name: 'Bakpia Jogja Istimewa' }],
  creator: 'Bakpia Jogja Istimewa',
  publisher: 'Bakpia Jogja Istimewa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bakpiajogja.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Bakpia Jogja Istimewa',
    title: 'Bakpia Jogja Istimewa - Premium Indonesian Bakpia',
    description: 'Rasakan cita rasa autentik Bakpia Jogja Istimewa dengan resep tradisional.',
    images: [
      {
        url: '/bakpia-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Bakpia Jogja Istimewa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bakpia Jogja Istimewa',
    description: 'Bakpia Premium dari Yogyakarta',
    creator: '@bakpiajogja',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
