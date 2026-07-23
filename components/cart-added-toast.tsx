'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CartNotice } from '@/components/cart-provider'

interface CartAddedToastProps {
  notice: CartNotice | null
  onOpenCart: () => void
}

/** Matches the exit animation duration below, so the card unmounts after fading out. */
const EXIT_DURATION = 200

/**
 * "Produk telah ditambahkan" notification. Rendered inside the navbar's cart
 * button wrapper: anchored under the icon on sm+, a full-width bar under the
 * navbar on mobile. Clicking it opens the cart sidebar.
 */
export function CartAddedToast({ notice, onOpenCart }: CartAddedToastProps) {
  // Keep the last notice around while the exit animation plays.
  const [shown, setShown] = useState<CartNotice | null>(notice)

  useEffect(() => {
    if (notice) {
      setShown(notice)
      return
    }
    const timer = setTimeout(() => setShown(null), EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [notice])

  if (!shown) return null

  const leaving = notice === null

  return (
    <button
      type="button"
      onClick={onOpenCart}
      aria-live="polite"
      aria-label="Produk telah ditambahkan. Buka keranjang"
      className={`fixed left-4 right-4 top-[4.5rem] z-50 touch-manipulation rounded-lg border border-border bg-card p-4 text-left shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 ${
        leaving
          ? 'animate-out fade-out slide-out-to-top-1 duration-200'
          : 'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200'
      }`}
    >
      {/* Pointer arrow towards the cart icon (desktop; mobile has its own in the navbar) */}
      <span
        aria-hidden
        className="absolute -top-1.5 right-6 hidden h-3 w-3 rotate-45 border-l border-t border-border bg-card sm:block"
      />

      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 rounded-full bg-green-100 p-1.5 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-card-foreground">
            Produk telah ditambahkan
          </p>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {shown.productName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Silahkan lakukan pembayaran dengan klik icon Keranjang diatas.
          </p>
        </div>
      </div>
    </button>
  )
}
