'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/use-cart'
import { Product } from '@/app/types/product'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const { addItem } = useCart()

  useEffect(() => {
    if (isOpen) {
      setQty(1)
      setActiveImg(0)
    }
  }, [isOpen, product?.id])

  if (!product) return null

  const images: string[] = Array.isArray(product.image) ? product.image : [product.image]
  const imageUrls = images.map(
    (img) => `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${img}`,
  )

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image as string,
      })
    }
    onClose()
  }

  const prevImg = () => setActiveImg((i) => (i - 1 + imageUrls.length) % imageUrls.length)
  const nextImg = () => setActiveImg((i) => (i + 1) % imageUrls.length)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] sm:max-w-3xl p-0 overflow-hidden gap-0"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 rounded-full bg-background/90 backdrop-blur-sm p-1.5 hover:bg-muted transition shadow-sm"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Image gallery — top on mobile, left on desktop */}
          <div className="md:w-1/2 flex-shrink-0 bg-muted">
            {/* Main image */}
            <div className="relative w-full aspect-square">
              <Image
                src={imageUrls[activeImg] ?? '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 hover:bg-background transition shadow"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 hover:bg-background transition shadow"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {/* Dot indicators */}
              {imageUrls.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imageUrls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-2 h-2 rounded-full transition ${i === activeImg ? 'bg-primary' : 'bg-background/60'}`}
                      aria-label={`Foto ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition ${
                      activeImg === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info — below on mobile, right on desktop */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <DialogTitle className="text-xl font-bold text-foreground leading-tight pr-6">
              {product.name}
            </DialogTitle>

            {/* Flavor */}
            {product.flavor && (
              <Badge variant="secondary" className="w-fit">
                {product.flavor}
              </Badge>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating}/5</span>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {product.description}
            </p>

            {/* Qty selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Jumlah:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-muted transition"
                  aria-label="Kurangi"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-foreground font-medium min-w-[2.5rem] text-center select-none">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2 hover:bg-muted transition"
                  aria-label="Tambah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Tambah ke Keranjang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
