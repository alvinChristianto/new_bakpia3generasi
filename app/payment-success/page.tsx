"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CheckCircle, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { getTransactionByInvNumber } from "../api/endpoints/transaction_by_invoicenumber";
import { useCart } from "@/components/cart-provider";


export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id"); // Reads INV-5N7YVBWP from URL

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState(false);

  const { cart, subtotal, clearCart, removeItem, updateQuantity } = useCart();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    clearCart(); // Clear cart on success page load

    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getTransactionByInvNumber(orderId);

        // Handling the backend structure: { data: $transaction, details: $transactionDetails }
        if (response.success && response.data) {
          // Logic to handle JSON address
          let displayAddress = "";
          try {
            const addr =
              typeof response.data.shipping_address_snapshot === "string"
                ? JSON.parse(response.data.shipping_address_snapshot)
                : response.data.shipping_address_snapshot;

            displayAddress =
              addr.fullAddress || addr.full_address || "Alamat tidak ditemukan";
          } catch (e) {
            displayAddress = response.data.shipping_address_snapshot; // Fallback if parsing fails
          }

          setOrderData({
            invoiceNumber: response.data.invoice_number,
            date: new Date(response.data.created_at).toLocaleDateString(
              "id-ID",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                minute: "2-digit",
                hour: "2-digit",
              },
            ),
            total: response.data.grand_total,
            items: response.details, // This is your $transactionDetails array
            shippingAddress: displayAddress,
            shippingCost: response.data.shipping_cost,
            service_fee: response.data.service_fee,
            estimatedDelivery: "3-5 Hari Kerja",
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // --- 1. LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">
          Mengambil detail pesanan...
        </p>
      </div>
    );
  }

  // --- 2. ERROR / NOT FOUND STATE ---
  if (error || !orderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Maaf, kami tidak dapat menemukan data untuk Invoice{" "}
          <strong>{orderId}</strong>. Pastikan nomor pesanan sudah benar.
        </p>
        <Link href="/">
          <Button size="lg">Kembali Berbelanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-8 px-4 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Terima Kasih!
            </h1>
            <p className="text-muted-foreground">
              Pembayaran Anda telah kami terima dan pesanan sedang diproses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Left Column: Summary */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ID Transaksi
                </p>
                <p className="text-lg font-mono font-bold text-primary">
                  {orderData.invoiceNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Alamat Pengiriman/pengambilan
                </p>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">
                  {orderData.shippingAddress}
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500">
                    Estimasi Tiba:{" "}
                    <span className="font-bold text-slate-900">
                      {orderData.estimatedDelivery}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Billing */}
            <div className="space-y-6">
              <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-md shadow-primary/20">
                <p className="text-xs font-bold uppercase opacity-80 mb-3">
                  Total Pembayaran
                </p>
                <p className="text-3xl md:text-4xl font-black mb-3">
                  {formatRupiah(orderData.total)}
                </p>
                <p className="text-xs opacity-80 font-medium">
                  Lunas pada: {orderData.date}
                </p>
              </div>

              <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Detail Item
                  </p>
                </div>
                <div className="space-y-3">
                  {orderData.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {item.product_name_snapshot}
                        </span>
                        <span className="text-xs text-slate-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatRupiah(item.price_per_item)}
                      </span>
                    </div>
                  ))}

                  {/* Fees Section */}
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex justify-between items-center text-[13px] text-slate-500">
                      <span>Biaya Pengiriman</span>
                      <span>{formatRupiah(orderData.shippingCost || 0)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[13px] text-slate-500">
                      <span>Pajak (10%)</span>
                      <span>{formatRupiah(orderData.service_fee || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                className="w-full h-12 border-2 hover:bg-slate-100 transition-colors"
              >
                Kembali Beranda
              </Button>
            </Link>
            <Link href="/dashboard/orders" className="w-full">
              <Button className="w-full h-12 shadow-lg shadow-primary/30">
                Lacak Pesanan
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400">
            Butuh bantuan? Tim support kami siap membantu di{" "}
            <span className="text-primary font-bold">support@thecabin.com</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
