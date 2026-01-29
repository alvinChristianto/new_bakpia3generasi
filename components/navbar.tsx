'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { CartSidebar } from '@/components/cart-sidebar'
import { useCart } from '@/hooks/use-cart'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false)
  const { cartCount } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary">
              Bakpia Jogja Istimewa
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 mx-8">
            <div className="flex items-center justify-center gap-8">
              <Link href="/" className="text-foreground hover:text-primary transition">
                Beranda
              </Link>
              <Link href="/#products" className="text-foreground hover:text-primary transition">
                Produk
              </Link>
              <Link href="/tentang-kami" className="text-foreground hover:text-primary transition">
                Tentang Kami
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 ml-4">
            {/* Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                className="p-2 hover:bg-muted rounded-lg transition hidden md:inline-flex"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>
              {isAuthDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-foreground hover:bg-muted rounded-t-lg transition text-sm"
                    onClick={() => setIsAuthDropdownOpen(false)}
                  >
                    Masuk
                  </Link>
                  <div className="border-t border-border" />
                  <Link
                    href="/register"
                    className="block px-4 py-3 text-foreground hover:bg-muted rounded-b-lg transition text-sm"
                    onClick={() => setIsAuthDropdownOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-muted rounded-lg transition"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <div className="flex flex-col gap-2 pt-4">
              <Link
                href="/"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="/#products"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Produk
              </Link>
              <Link
                href="/tentang-kami"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang Kami
              </Link>
              <div className="border-t border-border my-2" />
              <Link
                href="/login"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
              >
                Daftar
              </Link>
            </div>
          </div>
        )}

        <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />
      </div>
    </nav>
  )
}
