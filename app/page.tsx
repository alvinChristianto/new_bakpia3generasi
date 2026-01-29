import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { ProductsSection } from '@/components/products-section'
import { Footer } from '@/components/footer'

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
