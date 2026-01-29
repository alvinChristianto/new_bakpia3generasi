'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Welcome Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Selamat datang kembali!
              </h1>
              <p className="text-muted-foreground text-lg">
                Kelola akun dan pesanan Anda dengan mudah
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pesanan Saya Card */}
              <Link href="/dashboard/orders">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="w-12 h-12 text-primary" />
                    <span className="text-3xl font-bold text-primary">3</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Pesanan Saya</h2>
                  <p className="text-muted-foreground mb-4">
                    Lihat riwayat dan status pesanan Anda
                  </p>
                  <Button
                    variant="outline"
                    className="bg-transparent hover:bg-muted w-full"
                  >
                    Lihat Pesanan
                  </Button>
                </div>
              </Link>

              {/* Edit Profile Card */}
              <Link href="/dashboard/edit-profile">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <User className="w-12 h-12 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Kelola
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Edit Profile
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Ubah informasi akun dan password Anda
                  </p>
                  <Button
                    variant="outline"
                    className="bg-transparent hover:bg-muted w-full"
                  >
                    Ubah Profile
                  </Button>
                </div>
              </Link>
            </div>

            {/* Account Info Section */}
            <div className="mt-12 bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">
                Informasi Akun
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nama</p>
                  <p className="text-lg font-semibold text-foreground">
                    Andi Kurniawan
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="text-lg font-semibold text-foreground">
                    andi@email.com
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nomor Telepon
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    +62 812-3456-7890
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Bergabung Sejak
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    15 Januari 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}
