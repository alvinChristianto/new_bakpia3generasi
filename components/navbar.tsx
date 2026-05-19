"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { CartSidebar } from "@/components/cart-sidebar";
import { LogoutModal } from "@/components/logout-modal";
import { useCart } from "@/hooks/use-cart";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession(); // Cek status login
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { cartCount } = useCart();

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
    } finally {
      signOut({ callbackUrl: "/" });
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
                href="/"
                className="text-foreground hover:text-primary transition"
              >
                Beranda
              </Link>
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
                  {status === "authenticated" ? (
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

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </nav>
  );
}
