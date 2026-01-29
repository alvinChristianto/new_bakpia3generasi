'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useCart } from '@/hooks/use-cart'
import { CheckoutForm, type CustomerData } from '@/components/checkout-form'
import { AddressEditor, type AddressData } from '@/components/address-editor'
import { ChevronLeft, Package, Truck, DollarSign, Plus, Minus, Trash2, ReceiptText } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, subtotal, clearCart, removeItem, updateQuantity } = useCart()
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [address, setAddress] = useState<AddressData>({
    type: 'delivery',
    fullAddress: 'Jalan Malioboro No. 123, Yogyakarta 55271',
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const shippingCost = 50000
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + shippingCost + tax

  const handleCompleteOrder = () => {
    if (!isFormValid || !customerData) {
      alert('Silakan lengkapi semua data penerima (nama penerima, email, dan nomor telepon) terlebih dahulu')
      return
    }
    
    // Here you can add order submission logic (API call, etc.)
    clearCart()
    router.push('/payment-success')
  }

  const handleAddressChange = (newAddress: AddressData) => {
    setAddress(newAddress)
  }

  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid)
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Keranjang Kosong</h1>
              <p className="text-muted-foreground mb-8">Tidak ada produk untuk checkout.</p>
              <Link href="/">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Kembali Berbelanja
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>
            <h1 className="text-3xl font-bold text-foreground">Periksa Pesanan Anda</h1>
            <p className="text-muted-foreground mt-2">Tinjau detail pesanan sebelum menyelesaikan pembelian</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Data Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <CheckoutForm
                  onDataChange={setCustomerData}
                  initialData={customerData || undefined}
                  onValidationChange={handleValidationChange}
                />
              </div>

              {/* Order Items Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produk yang Dipesan
                </h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-muted rounded-lg border border-border/50 hover:border-primary/30 transition"
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-background rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {formatRupiah(item.price)} per item
                        </p>
                        <p className="text-primary font-bold mt-2">
                          {formatRupiah(item.price * item.quantity)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-background rounded transition"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="px-3 py-1 bg-background rounded text-foreground text-sm font-medium min-w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-background rounded transition"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1 hover:bg-destructive/10 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Address and Billing Summary */}
            <div className="space-y-6">
              {/* Address/Pickup Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Alamat Pengiriman/Pengambilan
                </h2>
                <div className="space-y-3">
                  {address.type === 'delivery' ? (
                    <>
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                        Pengiriman
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {address.fullAddress}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                        Pengambilan di Toko
                      </div>
                      {address.storeId && (
                        <>
                          <p className="text-foreground font-medium text-sm mb-1">
                            Toko:
                          </p>
                          <p className="text-muted-foreground text-xs mb-2">
                            {(() => {
                              const stores = [
                                { id: '1', name: 'Bakpia Jogja Istimewa - Malioboro', address: 'Jalan Malioboro No. 123, Yogyakarta', phone: '+62 274-512345' },
                                { id: '2', name: 'Bakpia Jogja Istimewa - Kota Baru', address: 'Jalan Kota Baru No. 45, Yogyakarta', phone: '+62 274-623456' },
                                { id: '3', name: 'Bakpia Jogja Istimewa - Borobudur', address: 'Jalan Borobudur No. 67, Magelang', phone: '+62 293-734567' },
                              ]
                              const store = stores.find(s => s.id === address.storeId)
                              return store?.name
                            })()}
                          </p>
                        </>
                      )}
                      <p className="text-foreground font-medium text-sm mb-1">
                        Jadwal Pengambilan:
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {address.pickupDate ? new Date(address.pickupDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : '-'}
                      </p>
                      {address.pickupTime && (
                        <p className="text-muted-foreground text-sm">
                          Pukul {address.pickupTime} WIB
                        </p>
                      )}
                    </>
                  )}
                  <Button
                    onClick={() => setIsAddressEditorOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Ubah Alamat/Pengambilan
                  </Button>
                </div>
              </div>

              {/* Billing Summary Section */}
              <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  {address.type === 'pickup' ? (
                    <ReceiptText className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                  Ringkasan Pesanan
                </h2>
                
                <div className="space-y-3 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">{formatRupiah(subtotal)}</span>
                  </div>
                  {address.type === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Biaya Pengiriman</span>
                      <span className="text-foreground font-medium">{formatRupiah(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pajak (10%)</span>
                    <span className="text-foreground font-medium">{formatRupiah(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
                </div>

                <Button
                  onClick={handleCompleteOrder}
                  disabled={!isFormValid}
                  className={`w-full py-3 font-bold text-lg transition ${
                    isFormValid
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Lanjut Pembayaran
                </Button>
                
                {!isFormValid && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Lengkapi data penerima untuk melanjutkan
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <AddressEditor
        isOpen={isAddressEditorOpen}
        onClose={() => setIsAddressEditorOpen(false)}
        onSave={handleAddressChange}
        initialData={address}
      />
      <Footer />
    </>
  )
}
