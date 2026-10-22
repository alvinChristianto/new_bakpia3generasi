'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Zap } from 'lucide-react'
import { Countdown } from '@/components/countdown'
import { FlashSaleItemCard } from '@/components/flash-sale-item-card'
import { getActiveFlashSale } from '@/app/api/endpoints/flash-sales'
import { ActiveFlashSale } from '@/app/types/flash-sale'

interface FlashSaleSectionProps {
  /** Initial sale data fetched server-side in `app/page.tsx`. */
  initialSale: ActiveFlashSale | null
}

/** Backend flash-sale cache TTL — the client re-syncs on the same cadence. */
const REFETCH_INTERVAL_MS = 30_000

function resolveBannerSrc(bannerUrl: string | null): string | null {
  if (!bannerUrl) return null
  if (bannerUrl.startsWith('http')) return bannerUrl
  if (bannerUrl.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_BE_ROUTE}${bannerUrl}`
  }
  return `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${bannerUrl}`
}

/**
 * Homepage flash-sale block. Renders nothing when no sale is running.
 * Countdown is anchored to the backend's `remaining_seconds` clock and
 * re-fetched every 30 s to re-sync with server time (drift + quota updates).
 */
export function FlashSaleSection({ initialSale }: FlashSaleSectionProps) {
  const [sale, setSale] = useState<ActiveFlashSale | null>(initialSale)

  useEffect(() => {
    // In case this chunk hydrates before the server-resolved prop is fresh.
    getActiveFlashSale().then(setSale)

    const interval = setInterval(async () => {
      setSale(await getActiveFlashSale())
    }, REFETCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  if (!sale || sale.items.length === 0) return null

  const bannerSrc = resolveBannerSrc(sale.banner_url)

  return (
    <section id="flash-sale" className="py-12 md:py-16 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm">
              <Zap className="w-4 h-4" fill="currentColor" />
              Flash Sale
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
              {sale.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Berakhir dalam{' '}
            <Countdown
              key={sale.server_time}
              initialRemainingSeconds={sale.remaining_seconds}
              className="text-base text-red-800"
            />
          </div>
        </div>

        {bannerSrc && (
          <div className="relative w-full h-40 md:h-64 rounded-xl overflow-hidden bg-muted mb-8">
            <Image
              src={bannerSrc}
              alt={sale.banner_alt ?? sale.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sale.items.map((item) => (
            <FlashSaleItemCard
              key={item.id}
              item={item}
              saleEndsAt={sale.end_at}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
