'use client'

import Image from 'next/image'
import { Zap, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DiscountedPrice } from '@/components/discounted-price'
import { toCartImage } from '@/components/cart-provider'
import { useCart } from '@/hooks/use-cart'
import { FlashSaleItem, ActiveFlashSale } from '@/app/types/flash-sale'

interface FlashSaleItemCardProps {
  item: FlashSaleItem
  /** ISO timestamp when the sale ends — passed for the cart snapshot. */
  saleEndsAt: ActiveFlashSale['end_at']
  className?: string
}

export function FlashSaleItemCard({
  item,
  saleEndsAt,
  className,
}: FlashSaleItemCardProps) {
  const { addItem } = useCart()

  const image = toCartImage(item.image)
  const imageSrc = image
    ? `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${image}`
    : '/placeholder.svg'

  const handleAddToCart = () => {
    addItem({
      id: item.product_id,
      name: item.name,
      price: item.price,
      image,
      original_price: item.original_price,
      discount_label: item.discount_label,
      discount_source: 'flash_sale',
      flash_sale_ends_at: saleEndsAt,
    })
  }

  return (
    <div
      className={`relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className ?? ''}`}
    >
      {item.sold_out && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[2px]">
          <div className="bg-muted rounded-full p-3">
            <Check className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Kuota Habis
          </span>
        </div>
      )}

      <button
        className="relative w-full h-40 bg-muted block overflow-hidden group"
        aria-label={`Lihat ${item.name}`}
      >
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover"
          unoptimized
        />
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
          <Zap className="w-3.5 h-3.5" fill="currentColor" />
          Flash Sale
        </span>
      </button>

      <div className="p-4">
        <h3 className="font-semibold text-card-foreground truncate">{item.name}</h3>

        <div className="mt-2">
          <DiscountedPrice
            price={item.price}
            originalPrice={item.original_price}
            discountLabel={item.discount_label}
            size="sm"
          />
        </div>

        {item.quota != null && (
          <div className="mt-3">
            <Progress
              value={item.progress_percent ?? 0}
              className="h-2"
              aria-label={`Terjual ${item.sold_count} dari ${item.quota}`}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Terjual {item.sold_count} dari {item.quota}
            </p>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={item.sold_out}
          className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {item.sold_out ? 'Kuota Habis' : 'Tambah ke Keranjang'}
        </Button>
      </div>
    </div>
  )
}
