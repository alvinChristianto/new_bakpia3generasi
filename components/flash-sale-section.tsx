'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Zap, AlarmClock } from 'lucide-react'
import { Countdown } from '@/components/countdown'
import { FlashSaleItemCard } from '@/components/flash-sale-item-card'
import {
  getActiveFlashSale,
  getUpcomingFlashSales,
} from '@/app/api/endpoints/flash-sales'
import {
  ActiveFlashSale,
  UpcomingFlashSale,
} from '@/app/types/flash-sale'
import { pickFlashSaleTeaser } from '@/lib/flash-sale'
import { resolveBackendAssetUrl } from '@/lib/utils'
import { ShareButton } from '@/components/share-button'

interface FlashSaleSectionProps {
  /** Initial sale data fetched server-side in `app/page.tsx`. */
  initialSale: ActiveFlashSale | null
  /** Initial 24h-ahead teaser sale fetched server-side in `app/page.tsx`. */
  initialUpcomingTeaser: UpcomingFlashSale | null
}

/**
 * Pick the banner to show in the wide homepage slot: the landscape crop when
 * the admin uploaded one, else the square banner (CSS-cropped to fit), else
 * nothing (the block is omitted and the caller keeps its fallback layout).
 */
function pickHomepageBanner(sale: ActiveFlashSale | UpcomingFlashSale) {
  const src =
    resolveBackendAssetUrl(sale.banner_rect_url) ??
    resolveBackendAssetUrl(sale.banner_url)
  if (!src) return null
  return {
    src,
    alt: sale.banner_rect_alt ?? sale.banner_alt ?? sale.name,
  }
}

/** Backend flash-sale cache TTL — the client re-syncs on the same cadence. */
const REFETCH_INTERVAL_MS = 30_000

/**
 * Homepage flash-sale block. Two states:
 * - A live sale → banner + countdown + purchasable items.
 * - No live sale but a published sale starting within 24 h → teaser: the
 *   sale banner with a "Dimulai dalam" countdown (no items yet).
 * Renders nothing otherwise. Polled every 30 s so the teaser flips to the
 * live sale (or a live sale disappears shortly after ending) automatically.
 */
export function FlashSaleSection({
  initialSale,
  initialUpcomingTeaser,
}: FlashSaleSectionProps) {
  const [sale, setSale] = useState<ActiveFlashSale | null>(initialSale)
  const [upcomingTeaser, setUpcomingTeaser] = useState<UpcomingFlashSale | null>(
    initialUpcomingTeaser,
  )

  useEffect(() => {
    // In case this chunk hydrates before the server-resolved props are fresh.
    const resync = async () => {
      const active = await getActiveFlashSale()
      setSale(active)
      if (!active) {
        setUpcomingTeaser(pickFlashSaleTeaser(await getUpcomingFlashSales()))
      } else {
        setUpcomingTeaser(null)
      }
    }
    resync()

    const interval = setInterval(resync, REFETCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // The live poll may lag up to 30 s past the teaser's start time — when the
  // countdown hits zero, fire an immediate resync so the swap is snappy.
  const handleTeaserCountdownEnd = () => {
    getActiveFlashSale().then((active) => {
      if (!active) return
      setSale(active)
      setUpcomingTeaser(null)
    })
  }

  const renderBanner = (
    sale: ActiveFlashSale | UpcomingFlashSale,
    className: string,
    targetId: string,
  ) => {
    const banner = pickHomepageBanner(sale)
    if (!banner) {
      return <ShareButton sale={sale} className="right-3" />
    }
    return (
      <div className={`relative rounded-xl bg-muted ${className}`}>
        <button
          onClick={() => {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="relative block w-full h-full rounded-xl overflow-hidden group"
          aria-label={`Lihat ${sale.name}`}
        >
          <Image
            src={banner.src}
            alt={banner.alt}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            unoptimized
          />
        </button>
        <ShareButton sale={sale} />
      </div>
    )
  }

  if (sale && sale.items.length > 0) {
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

          {renderBanner(sale, 'h-40 md:h-56 mb-8', 'flash-sale-items')}

          <div id="flash-sale-items" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

  if (upcomingTeaser) {
    const secondsToStart = Math.max(
      0,
      Math.floor(
        (new Date(upcomingTeaser.start_at).getTime() - Date.now()) / 1000,
      ),
    )

    return (
      <section id="flash-sale" className="py-12 md:py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            {renderBanner(upcomingTeaser, 'w-full h-48 md:h-72 mb-6', 'products')}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-red-800">
                  <AlarmClock className="w-4 h-4" />
                  Segera
                </span>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground text-balance">
                  {upcomingTeaser.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Dimulai dalam{' '}
                <Countdown
                  initialRemainingSeconds={secondsToStart}
                  onEnd={handleTeaserCountdownEnd}
                  className="text-base text-red-800"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return null
}
