'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Countdown } from '@/components/countdown'
import { ActiveFlashSale } from '@/app/types/flash-sale'

interface PromoModalProps {
  /** Active flash sale resolved server-side in `app/page.tsx`; null = none. */
  flashSale: ActiveFlashSale | null
}

/**
 * Welcome/promo modal shown on every homepage visit (no persistence — opens
 * fresh on each mount). Page-scoped: rendered only from `app/page.tsx`.
 * When a flash sale is running, swaps the static welcome copy for the sale
 * with a live countdown and a CTA that scrolls to the flash-sale section.
 */
export function PromoModal({ flashSale }: PromoModalProps) {
  const [open, setOpen] = useState(true)

  const scrollToProducts = () => {
    setOpen(false)
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToFlashSale = () => {
    setOpen(false)
    document.getElementById('flash-sale')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[92vw] sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {flashSale ? (
          <>
            <div className="relative aspect-square bg-red-600">
              {flashSale.banner_url ? (
                (() => {
                  const bannerSrc = flashSale.banner_url.startsWith('http')
                    ? flashSale.banner_url
                    : flashSale.banner_url.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_BE_ROUTE}${flashSale.banner_url}`
                      : `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${flashSale.banner_url}`
                  return (
                    <Image
                      src={bannerSrc}
                      alt={flashSale.banner_alt ?? flashSale.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )
                })()
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-16 h-16 text-white/80" fill="currentColor" />
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col gap-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Zap className="w-5 h-5 text-red-800" fill="currentColor" />
                </div>
                <DialogTitle className="text-xl font-bold text-card-foreground">
                  {flashSale.name}
                </DialogTitle>
              </div>

              <DialogDescription className="text-base text-muted-foreground">
                Diskon terbatas sedang berjalan — jangan lewatkan! Berakhir
                dalam{' '}
                <Countdown
                  key={flashSale.server_time}
                  initialRemainingSeconds={flashSale.remaining_seconds}
                  className="font-semibold text-red-800"
                />
                .
              </DialogDescription>

              <Button
                onClick={scrollToFlashSale}
                className="w-full min-h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              >
                <Zap className="w-4 h-4 mr-2" fill="currentColor" />
                Lihat Flash Sale
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Promo image */}
            <div className="relative w-full aspect-square bg-muted">
              <Image
                src="/promo.webp"
                alt="Bakpia premium"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6 flex flex-col gap-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle className="text-xl font-bold text-card-foreground">
                  Selamat Datang di Bakpia 3 Generasi!
                </DialogTitle>
              </div>

              <DialogDescription className="text-base text-muted-foreground">
                Nikmati bakpia premium khas Jogja, dibuat tangan dengan resep
                tradisional. Pilih rasa favoritmu dan pesan sekarang — dikirim ke
                seluruh Indonesia.
              </DialogDescription>

              <Button
                onClick={scrollToProducts}
                className="w-full min-h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              >
                Lihat Produk
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
