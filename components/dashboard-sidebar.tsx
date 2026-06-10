"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { LogoutModal } from "./logout-modal";
import { useSession, signOut } from "next-auth/react";

export function DashboardSidebar() {
  const { data: session, status } = useSession(); // Cek status login
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

      localStorage.removeItem("bakpia-cart");
    } catch (error) {
      console.error("Gagal revoke token di Laravel", error);
    } finally {
      signOut({ callbackUrl: "/" });
    }
  };

  const menuItems = [
    {
      icon: ShoppingBag,
      label: "Pesanan Saya",
      href: "/dashboard/orders",
    },
    {
      icon: User,
      label: "Edit Profile",
      href: "/dashboard/edit-profile",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 hover:bg-muted rounded-lg transition"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-64 h-screen bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:top-0 top-16 overflow-y-auto`}
      >
        <div className="p-6 space-y-8">
          {/* User Info Section */}
          <div className="border-b border-border pb-6">
            <h2 className="text-lg font-bold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Selamat datang kembali
            </p>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition group"
                >
                  <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsLogoutModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
