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
import { ApiResponse } from "../api/types";

interface TransactionDetail {
  product_name: string;
  price_per_item: number;
  quantity: number;
}

interface TransactionData {
  invoice_number: string;
  grand_total: number;
  shipping_address: string;
  shipping_cost: number;
  tax_amount: number;
  created_at: string;
  shipping_address_snapshot: string;
  service_fee: number;
  courier_name: string | null;
  courier_service: string | null;
  tracking_number: string | null;
}

// Define the full structure returned by Laravel
interface PaymentSuccessData {
  success: boolean; // Note: if success is inside 'data'
  data: TransactionData;
  details: TransactionDetail[];
}

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
        const response = await getTransactionByInvNumber(orderId) as ApiResponse<PaymentSuccessData>; ;
        
        // Handling the backend structure: { data: $transaction, details: $transactionDetails }
        // if (response?.success === 200 && response.data) {
            console.log("API Response:", response.data.success);
          if (response.data.success && response.data.data) {
          let displayAddress = "";
          try {
            const addr =
              typeof response.data.data.shipping_address_snapshot === "string"
                ? JSON.parse(response.data.data.shipping_address_snapshot)
                : response.data.data.shipping_address_snapshot;

            if (addr.type === "pickup") {
              const pickupDate = addr.pickupDate
                ? new Date(addr.pickupDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "";
              displayAddress = [
                addr.storeName,
                addr.storeAddress,
                pickupDate && addr.pickupTime
                  ? `Jadwal ambil: ${pickupDate}, pukul ${addr.pickupTime} WIB`
                  : "",
              ]
                .filter(Boolean)
                .join("\n");
            } else {
              displayAddress =
                addr.fullAddress || addr.full_address || "Alamat tidak ditemukan";
            }
          } catch (e) {
            displayAddress = response.data.data.shipping_address_snapshot;
          }

          const isDelivery = response.data.data.courier_name !== "pickup";

          setOrderData({
            invoiceNumber: response.data.data.invoice_number,
            date: new Date(response.data.data.created_at).toLocaleDateString(
              "id-ID",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                minute: "2-digit",
                hour: "2-digit",
              },
            ),
            total: response.data.data.grand_total,
            items: response.data.details,
            shippingAddress: displayAddress,
            shippingCost: response.data.data.shipping_cost,
            service_fee: response.data.data.service_fee,
            estimatedDelivery: "3-5 Hari Kerja",
            isDelivery,
            courierName: response.data.data.courier_name,
            courierService: response.data.data.courier_service,
            trackingNumber: response.data.data.tracking_number,
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
      <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 md:py-16">
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
            <div className="bg-card shadow-sm border border-border rounded-xl p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  ID Transaksi
                </p>
                <p className="text-lg font-mono font-bold text-primary">
                  {orderData.invoiceNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Alamat Pengiriman/Pengambilan
                </p>
                <p className="text-sm text-foreground leading-relaxed mb-2 whitespace-pre-line">
                  {orderData.shippingAddress}
                </p>
                {orderData.isDelivery && (
                  <div className="bg-muted/50 p-3 rounded-lg border border-border space-y-1">
                    {orderData.courierName && (
                      <p className="text-xs text-muted-foreground">
                        Kurir:{" "}
                        <span className="font-bold text-foreground">
                          {orderData.courierName}
                        </span>
                      </p>
                    )}
                    {orderData.courierService && (
                      <p className="text-xs text-muted-foreground">
                        Layanan:{" "}
                        <span className="font-bold text-foreground">
                          {orderData.courierService}
                        </span>
                      </p>
                    )}
                    {orderData.trackingNumber && (
                      <p className="text-xs text-muted-foreground">
                        No. Resi:{" "}
                        <span className="font-bold text-foreground">
                          {orderData.trackingNumber}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Estimasi Tiba:{" "}
                      <span className="font-bold text-foreground">
                        {orderData.estimatedDelivery}
                      </span>
                    </p>
                  </div>
                )}
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

              <div className="bg-card shadow-sm border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                        <span className="font-semibold text-foreground">
                          {item.product_name_snapshot}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatRupiah(item.price_per_item)}
                      </span>
                    </div>
                  ))}

                  {/* Fees Section */}
                  <div className="border-t border-border pt-3 mt-3 space-y-2">
                    <div className="flex justify-between items-center text-[13px] text-muted-foreground">
                      <span>Biaya Pengiriman</span>
                      <span>{formatRupiah(orderData.shippingCost || 0)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[13px] text-muted-foreground">
                      <span>Biaya admin</span>
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
                className="w-full h-12 border-2 hover:bg-muted transition-colors"
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

          <p className="text-center text-xs text-muted-foreground">
            Butuh bantuan? Tim support kami siap membantu di{" "}
            <span className="text-primary font-bold">support@thecabin.com</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
