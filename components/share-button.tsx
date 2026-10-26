'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Check, XCircle } from 'lucide-react'
import { shareFlashSaleUrl } from '@/lib/share'
import type {
  ActiveFlashSale,
  UpcomingFlashSale,
} from '@/app/types/flash-sale'

interface ShareButtonProps {
  sale: ActiveFlashSale | UpcomingFlashSale
  /** Position the button inside its banner; tweak offset per usage. */
  className?: string
}

/**
 * Floating share button pinned on a flash-sale banner (top-right). Shares
 * the storefront link (`?flash_sale=<id>`, which resolves to event-specific
 * SEO metadata) via the native share sheet, falling back to the clipboard.
 */
export function ShareButton({ sale, className }: ShareButtonProps) {
  const [state, setState] = useState<'idle' | 'ok' | 'failed'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    if (state !== 'idle') return

    const result = await shareFlashSaleUrl(sale)
    if (result === 'failed') {
      setState('failed')
    } else {
      setState('ok')
    }
    timerRef.current = setTimeout(() => setState('idle'), 2000)
  }

  const shared =
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm hover:bg-background transition'

  return (
    <button
      onClick={handleClick}
      aria-label="Bagikan flash sale"
      title="Bagikan flash sale"
      className={`absolute top-2 right-2 md:top-3 md:right-3 z-10 ${
        state === 'failed'
          ? `${shared} text-destructive`
          : state === 'ok'
            ? `${shared} text-green-700`
            : shared
      } ${className ?? ''}`}
    >
      {state === 'ok' ? (
        <>
          <Check className="w-4 h-4" />
          Tautan dibagikan
        </>
      ) : state === 'failed' ? (
        <>
          <XCircle className="w-4 h-4" />
          Gagal menyalin tautan
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Bagikan
        </>
      )}
    </button>
  )
}
