'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Mock order data - in real app, this would come from order confirmation
  const orderData = {
    orderId: 'ORD-2024-001234',
    date: new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    total: 425000,
    items: [
      { name: 'Bakpia Kukus Premium', quantity: 2, price: 120000 },
      { name: 'Bakpia Pathok Coklat', quantity: 1, price: 95000 },
    ],
    shippingAddress: 'Jalan Malioboro No. 123, Yogyakarta 55271',
    estimatedDelivery: '3-5 hari kerja',
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8 px-4 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pembayaran Berhasil!
            </h1>
            <p className="text-muted-foreground">
              Pesanan Anda dikonfirmasi dan akan segera diproses
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Left: Order & Shipping Info */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Nomor Pesanan
                </p>
                <p className="text-lg font-bold text-foreground">{orderData.orderId}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Pengiriman Ke
                </p>
                <p className="text-sm text-foreground mb-2">{orderData.shippingAddress}</p>
                <p className="text-xs text-muted-foreground">
                  Estimasi: <span className="font-semibold text-foreground">{orderData.estimatedDelivery}</span>
                </p>
              </div>
            </div>

            {/* Right: Total & Quick Actions */}
            <div className="space-y-6">
              <div className="bg-muted border border-border rounded-lg p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Total Pembayaran
                </p>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-3">
                  {formatRupiah(orderData.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tanggal: {orderData.date}
                </p>
              </div>

              {/* Items Summary */}
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Item Pesanan
                </p>
                <div className="space-y-2">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.name} x{item.quantity}</span>
                      <span className="font-semibold text-foreground">{formatRupiah(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Lihat Pesanan Saya
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-muted-foreground">
            Ada pertanyaan? Hubungi{' '}
            <a href="mailto:support@bakpiajogja.com" className="text-primary hover:underline font-semibold">
              support@bakpiajogja.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
