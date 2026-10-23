'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import { getProductsByIds } from '@/app/api/endpoints/all_active_products'
import { mergeRefreshedCartItem } from '@/lib/cart-refresh'
import type { Product } from '@/app/types/product'

export interface CartItem {
  id: string
  name: string
  /** Effective (discounted) price at the time the item was added. */
  price: number
  /** Storage-relative path of a single image, e.g. `olproducts/foo.jpg`. */
  image: string
  quantity: number
  note?: string
  /** Pre-discount price — snapshot from the catalog when added. */
  original_price?: number | null
  /** Discount label snapshot (e.g. `"Diskon 20%"`). */
  discount_label?: string | null
  /** Pricing source snapshot: flash sale or normal discount. */
  discount_source?: 'flash_sale' | 'normal_discount' | null
  /** ISO timestamp when the flash sale backing this snapshot ends. */
  flash_sale_ends_at?: string | null
  /** Set by `refreshPrices()` when the live price no longer matches this line. */
  price_changed?: boolean
}

/**
 * The API returns `OlProduct.image` as an array (the model casts it to one);
 * the cart only ever keeps the first path. Every `addItem` caller must funnel
 * its image through here so readers can render `item.image` directly.
 */
export function toCartImage(image: string | string[] | null | undefined): string {
  return (Array.isArray(image) ? image[0] : image) ?? ''
}

/**
 * Transient signal emitted on every `addItem`, consumed by the navbar to show
 * the "produk telah ditambahkan" notification and animate the cart icon.
 * `nonce` changes on each add so repeat adds replay the animation.
 */
export interface CartNotice {
  productName: string
  nonce: number
}

/** How long the add-to-cart notification stays on screen. */
const NOTICE_DURATION = 2000

interface CartContextType {
  cart: CartItem[]
  cartCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  /** Re-sync cart line prices against the live catalog; flags `price_changed`. */
  refreshPrices: () => Promise<void>
  mounted: boolean
  cartNotice: CartNotice | null
  dismissCartNotice: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [cartNotice, setCartNotice] = useState<CartNotice | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bakpia-cart')
    if (savedCart) {
      try {
        // Carts saved before `image` was normalized may hold the raw array,
        // so re-normalize on load instead of leaving those items broken.
        const parsed: CartItem[] = JSON.parse(savedCart)
        setCart(parsed.map((item) => ({ ...item, image: toCartImage(item.image) })))
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error)
      }
    }
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('bakpia-cart', JSON.stringify(cart))
    }
  }, [cart, mounted])

  // Latest-cart ref so async callbacks (refreshPrices) always see the
  // current cart without subscribing to it.
  const cartRef = useRef<CartItem[]>(cart)
  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  // Auto-dismiss the add-to-cart notification. Re-adding bumps `nonce`, which
  // re-runs this effect and restarts the countdown instead of stacking toasts.
  useEffect(() => {
    if (!cartNotice) return
    const timer = setTimeout(() => setCartNotice(null), NOTICE_DURATION)
    return () => clearTimeout(timer)
  }, [cartNotice])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setCartNotice((prev) => ({
      productName: item.name,
      nonce: (prev?.nonce ?? 0) + 1,
    }))
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                price_changed: undefined,
              }
            : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity, price_changed: undefined }
          : item,
      ),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const refreshPricesInternal = useCallback(async () => {
    const ids = Array.from(new Set(cartRef.current.map((item) => item.id)))
    if (ids.length === 0) return

    // Backend caps `?ids=` at 50 — chunk defensively.
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 50) {
      chunks.push(ids.slice(i, i + 50))
    }

    let refreshed: Product[]
    try {
      const pages = await Promise.all(chunks.map((chunk) => getProductsByIds(chunk)))
      refreshed = pages.flatMap((page) => page?.data?.data ?? [])
    } catch {
      // Offline/failed fetch must not clobber the cart snapshot.
      return
    }

    setCart((prev) =>
      prev.map((item) => mergeRefreshedCartItem(item, refreshed)),
    )
  }, [])

  /**
   * Re-sync cart line prices against the live catalog. Lines whose price
   * moved get `price_changed` so the UI can surface a "harga berubah"
   * notice instead of silently charging different amounts.
   */
  const refreshPrices = useCallback(async () => {
    await refreshPricesInternal()
  }, [refreshPricesInternal])

  const dismissCartNotice = () => {
    setCartNotice(null)
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const value: CartContextType = {
    cart,
    cartCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshPrices,
    mounted,
    cartNotice,
    dismissCartNotice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
