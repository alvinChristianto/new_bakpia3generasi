'use client'

import { formatRupiah } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DiscountedPriceProps {
  /** Effective (discounted) price. */
  price: number
  /** Pre-discount price; omitted/null renders no strike-through. */
  originalPrice?: number | null
  /** Discount label (e.g. `"Flash Sale"`, `"Diskon 20%"`). */
  discountLabel?: string | null
  /** Size variant: `sm` suits cart lines, `lg` suits cards and modals. */
  size?: 'sm' | 'lg'
  className?: string
}

/**
 * Strike-through pricing block: final price + original price + discount
 * badge. Red badge matches the ui-check §9 fixed palette.
 */
export function DiscountedPrice({
  price,
  originalPrice,
  discountLabel,
  size = 'lg',
  className,
}: DiscountedPriceProps) {
  const hasDiscount = originalPrice != null && originalPrice > price
  const mainPrice = size === 'lg' ? 'text-2xl font-bold' : 'font-bold'
  const originalText = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className={cn('flex flex-col items-start gap-0.5', className)}>
      {hasDiscount && (
        <span
          className={cn('text-muted-foreground line-through', originalText)}
        >
          {formatRupiah(originalPrice)}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('text-primary', mainPrice)}>
          {formatRupiah(price)}
        </span>
        {hasDiscount && discountLabel && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
            {discountLabel}
          </span>
        )}
      </div>
    </div>
  )
}
