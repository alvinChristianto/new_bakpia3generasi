'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  note?: string
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
        setCart(JSON.parse(savedCart))
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
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
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
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

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
