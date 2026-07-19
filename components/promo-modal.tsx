'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Welcome/promo modal shown on every homepage visit (no persistence — opens
 * fresh on each mount). Page-scoped: rendered only from `app/page.tsx`.
 */
export function PromoModal() {
  const [open, setOpen] = useState(true)

  const handleShopNow = () => {
    setOpen(false)
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[92vw] sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
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
            onClick={handleShopNow}
            className="w-full min-h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
          >
            Lihat Produk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
