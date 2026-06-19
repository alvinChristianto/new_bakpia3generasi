'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShoppingBag, Plus, Minus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CartItem, useCart } from '@/hooks/use-cart'
import { useShipping } from '@/hooks/use-shipping'

interface CartSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { cart, subtotal, removeItem, updateQuantity, clearCart } = useCart()
  const { clearCourier } = useShipping()

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col bg-background p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-foreground">
              Keranjang Belanja
            </SheetTitle>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-1 hover:bg-muted rounded-lg transition text-destructive hover:text-destructive/80"
                  title="Kosongkan keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 hover:bg-muted rounded-lg transition"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </SheetHeader>

        {cart.length === 0 ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 p-4 bg-muted rounded-full">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Keranjang Anda Kosong
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Mulai berbelanja Bakpia premium kami sekarang
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Mulai Belanja
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 min-h-0 px-6 py-4">
              <div className="space-y-4">
                {cart.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-muted rounded-lg border border-border hover:border-primary/30 transition"
                  >
                    {/* Product Image */}
                    <div className="relative flex-shrink-0 w-20 h-20 bg-background rounded-md overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${item.image[0]}`  || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-primary font-bold text-sm mt-1">
                        {formatRupiah(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            clearCourier()
                          }}
                          className="p-1 hover:bg-background rounded transition"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <span className="text-sm font-medium text-foreground w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            updateQuantity(item.id, item.quantity + 1)
                            clearCourier()
                          }}
                          className="p-1 hover:bg-background rounded transition"
                        >
                          <Plus className="w-4 h-4 text-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => { removeItem(item.id); clearCourier() }}
                      className="p-1 hover:bg-background rounded transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer - Sticky */}
            <div className="border-t border-border px-6 py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Biaya pengiriman akan dihitung di checkout
                </p>
              </div>
              <Link href="/checkout" onClick={() => onOpenChange(false)} className="block">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Checkout Sekarang
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
