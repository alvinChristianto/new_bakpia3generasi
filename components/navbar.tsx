"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { CartSidebar } from "@/components/cart-sidebar";
import { CartAddedToast } from "@/components/cart-added-toast";
import { LogoutModal } from "@/components/logout-modal";
import { useCart } from "@/hooks/use-cart";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession(); // Cek status login
  const isAuthed = status === "authenticated";
  const isAuthLoading = status === "loading";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { cartCount, cartNotice, dismissCartNotice } = useCart();
  const cueActive = cartNotice !== null;

  // A fresh add collapses the mobile menu so the notification doesn't cover it.
  useEffect(() => {
    if (cartNotice) setIsMenuOpen(false);
  }, [cartNotice]);

  const openCart = () => {
    dismissCartNotice();
    setIsCartOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (session?.accessToken) {
        await fetch(`${process.env.NEXT_PUBLIC_BE_ROUTE}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Gagal revoke token di Laravel", error);
    }

    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Gagal signOut", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary">
              Bakpia 3 Generasi
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 mx-8">
            <div className="flex items-center justify-center gap-8">
             
              <Link
                href="/#products"
                className="text-foreground hover:text-primary transition"
              >
                Produk
              </Link>
              <Link
                href="/tentang-kami"
                className="text-foreground hover:text-primary transition"
              >
                Tentang Kami
              </Link>
              <Link
                href="/outlet-kami"
                className="text-foreground hover:text-primary transition"
              >
                Outlet Kami
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
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {isAuthLoading ? (
                    <div className="px-4 py-3 space-y-2" aria-hidden>
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                    </div>
                  ) : isAuthed ? (
                    <>
                      {/* Menu jika SUDAH login */}
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                          Masuk sebagai
                        </p>
                        <p className="text-sm font-medium truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-foreground hover:bg-muted transition text-sm"
                        onClick={() => setIsAuthDropdownOpen(false)}
                      >
                        <p className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsAuthDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-destructive hover:bg-destructive/10 transition text-sm"
                      >
                        <p className="w-4 h-4" /> Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Menu jika BELUM login */}
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-foreground hover:bg-muted transition text-sm"
                        onClick={() => setIsAuthDropdownOpen(false)}
                      >
                        Masuk
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-3 text-foreground hover:bg-muted transition text-sm"
                        onClick={() => setIsAuthDropdownOpen(false)}
                      >
                        Daftar
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Cart button — also the anchor for the add-to-cart notification */}
            <div className="relative">
              <button
                onClick={openCart}
                aria-label="Buka keranjang"
                className={`relative p-2 hover:bg-muted rounded-lg transition-all duration-300 ${
                  cueActive
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : ""
                }`}
              >
                {cueActive && (
                  <span
                    key={cartNotice.nonce}
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-primary/20 animate-ping"
                  />
                )}
                <ShoppingCart
                  key={cartNotice ? `icon-${cartNotice.nonce}` : "icon"}
                  className={`w-5 h-5 relative ${
                    cueActive ? "text-primary animate-cart-pop" : "text-foreground"
                  }`}
                />
                {cartCount > 0 && (
                  <span
                    className={`absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold transition-transform duration-300 ${
                      cueActive ? "scale-125" : "scale-100"
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile pointer arrow — the toast is fixed on mobile, so the
                  arrow stays anchored to the icon instead of to the card. */}
              {cueActive && (
                <span
                  aria-hidden
                  className="sm:hidden absolute left-1/2 top-full z-50 w-3 h-3 -translate-x-1/2 translate-y-[14px] rotate-45 border-l border-t border-border bg-card"
                />
              )}

              <CartAddedToast notice={cartNotice} onOpenCart={openCart} />
            </div>

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
              <Link
                href="/outlet-kami"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Outlet Kami
              </Link>
              <div className="border-t border-border my-2" />
              {isAuthLoading ? (
                <div className="px-4 py-2 space-y-2" aria-hidden>
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
              ) : isAuthed ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs text-muted-foreground">Masuk sebagai</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </nav>
  );
}
