import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { ProductsSection } from '@/components/products-section'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Toko Bakpia Premium Asli Yogyakarta',
  description: 'Pesan bakpia premium Bakpia 3 Generasi — dibuat tangan dengan resep tradisional. Tersedia pengiriman ke seluruh Indonesia dan ambil di outlet.',
  alternates: { canonical: '/' },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProductsSection />
      <Footer />
    </div>
  )
}
