import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { ProductsSection } from '@/components/products-section'
import { FlashSaleSection } from '@/components/flash-sale-section'
import { Footer } from '@/components/footer'
import { PromoModal } from '@/components/promo-modal'
import {
  getActiveFlashSale,
  getUpcomingFlashSales,
} from '@/app/api/endpoints/flash-sales'
import { pickFlashSaleTeaser } from '@/lib/flash-sale'

const DEFAULT_METADATA: Metadata = {
  title: 'Toko Bakpia Premium Asli Yogyakarta',
  description:
    'Pesan bakpia premium Bakpia 3 Generasi — dibuat tangan dengan resep tradisional. Tersedia pengiriman ke seluruh Indonesia dan ambil di outlet.',
  alternates: { canonical: '/' },
}

/**
 * A shared link (`/?flash_sale=<id>`) gets event-specific SEO metadata so
 * chat-app previews show the sale's banner and short description. The sale
 * must still be active or upcoming; ended/cancelled events fall back to the
 * default storefront metadata.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const flashSaleId = typeof params.flash_sale === 'string' ? params.flash_sale : null
  if (!flashSaleId) return DEFAULT_METADATA

  const [active, upcoming] = await Promise.all([
    getActiveFlashSale(),
    getUpcomingFlashSales(),
  ])

  const sale =
    (active && active.id === flashSaleId ? active : null) ??
    upcoming.find((s) => s.id === flashSaleId) ??
    null
  if (!sale) return DEFAULT_METADATA

  const title = `${sale.name} | Flash Sale Bakpia`
  const description =
    sale.banner_rect_alt ?? sale.banner_alt ?? DEFAULT_METADATA.description ?? undefined
  const image = sale.banner_rect_url ?? sale.banner_url ?? null

  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description: description ?? undefined,
      url: '/?flash_sale=' + flashSaleId,
      type: 'website',
      images: image
        ? [
            {
              url: image,
              width: sale.banner_rect_url ? 1200 : 1024,
              height: sale.banner_rect_url ? 400 : 1024,
              alt: description ?? sale.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: description ?? undefined,
      images: image ? [image] : undefined,
    },
  }
}

// Flash-sale availability changes with time — never prerender the homepage.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [activeFlashSale, upcomingFlashSales] = await Promise.all([
    getActiveFlashSale(),
    getUpcomingFlashSales(),
  ])
  const upcomingTeaser = pickFlashSaleTeaser(upcomingFlashSales)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PromoModal flashSale={activeFlashSale} upcomingTeaser={upcomingTeaser} />
      <Navbar />
      <HeroSection />
      <FlashSaleSection
        initialSale={activeFlashSale}
        initialUpcomingTeaser={upcomingTeaser}
      />
      <ProductsSection />
      <Footer />
    </div>
  )
}
