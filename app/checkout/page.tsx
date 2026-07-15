"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCart } from "@/hooks/use-cart";
import {
  useShipping,
  getShippingCost,
  isCourierStale,
} from "@/hooks/use-shipping";
import { CheckoutForm, type CustomerData } from "@/components/checkout-form";
import { AddressEditor } from "@/components/address-editor";
import { GoogleIcon } from "@/components/icons/google-icon";
import { ApiResponse } from "../api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Package,
  Truck,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  ReceiptText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TriangleAlert,
} from "lucide-react";
import Script from "next/script";
import { checkoutOrder } from "../api/endpoints/checkout";
import { getProfile, updatePhone } from "../api/endpoints/profile";
import {
  getCheckoutConfig,
  type CheckoutConfig,
} from "../api/endpoints/checkout-config";

const DEFAULT_CHECKOUT_CONFIG: CheckoutConfig = {
  admin_fee_percent: 10,
  admin_fee_max: 10000,
};

// ─── Midtrans checkout response shape ─────────────────────────────────────────

interface CheckoutData {
  message: string;
  snap_token: string;
  reference: {
    invoice_number_backend: string;
    payment_token_midtrans: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function removeLastPartOrderId(orderId: string): string {
  const parts = orderId.split("-");
  if (parts.length <= 1) return orderId;
  return parts.slice(0, -1).join("-");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, subtotal, removeItem, updateQuantity } = useCart();
  const { address, clearCourier } = useShipping();
  const shippingCost = getShippingCost(address);
  const courierStale = isCourierStale(address);

  // ── Wrap quantity handlers to clear courier on change ───────────────────────
  const handleUpdateQuantity = (id: string, qty: number) => {
    updateQuantity(id, qty);
    clearCourier();
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    clearCourier();
  };

  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>(
    DEFAULT_CHECKOUT_CONFIG,
  );

  // Display-only — the server is authoritative and recomputes the fee itself,
  // so a failed fetch here must not block checkout.
  useEffect(() => {
    getCheckoutConfig()
      .then(setCheckoutConfig)
      .catch(() => {});
  }, []);

  // Guest one-click sign-in/register. Returns to /checkout, where the existing
  // authenticated effect prefills + locks the form from the customer's profile.
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/checkout" });
    } catch (err) {
      console.error("Login Google gagal", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    getProfile(session.accessToken as string).then((profile) => {
      const data = {
        namaPenerima: profile.name ?? "",
        email: profile.email ?? "",
        nomorTelepon: profile.phone_number ?? "",
      };
      setCustomerData(data);
      setIsFormValid(!!(data.namaPenerima && data.email && data.nomorTelepon));
    }).catch(() => {});
  }, [status, session?.accessToken]);

  // Persist an edited phone number to the customer's profile from checkout.
  const handleSavePhone = async (phone: string) => {
    if (!session?.accessToken) return;
    setPhoneSaved(false);
    setSavingPhone(true);
    try {
      await updatePhone(session.accessToken as string, phone);
      setCustomerData((prev) =>
        prev
          ? { ...prev, nomorTelepon: phone }
          : { namaPenerima: "", email: "", nomorTelepon: phone },
      );
      setIsFormValid(
        !!(customerData?.namaPenerima && customerData?.email && phone),
      );
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 3000);
    } catch {
      triggerModal(
        "Gagal Menyimpan",
        "Nomor telepon tidak dapat disimpan. Periksa format (+62/08) lalu coba lagi.",
        "fail",
      );
    } finally {
      setSavingPhone(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENTKEY;
  const MIDTRANS_SNAP_URL = process.env.NEXT_PUBLIC_SNAP_URL;

  // ── Totals ──────────────────────────────────────────────────────────────────
  const tax = useMemo(
    () =>
      Math.min(
        Math.round((subtotal * checkoutConfig.admin_fee_percent) / 100),
        checkoutConfig.admin_fee_max,
      ),
    [subtotal, checkoutConfig],
  );
  const grandTotal = useMemo(
    () => subtotal + shippingCost + tax,
    [subtotal, shippingCost, tax],
  );

  // ── Modal helper ────────────────────────────────────────────────────────────
  const triggerModal = (
    title: string,
    message: string,
    type: "success" | "fail" | "warning",
  ) => {
    setModalContent({ title, message, type });
    setIsModalOpen(true);
  };

  // ── Payment ─────────────────────────────────────────────────────────────────
  const handleProceedPayment = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const payload = {
        totalPrice: grandTotal,
        bakpia: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingCost,
        taxAmount: tax,
        customerData,
        address,
      };

      const response = (await checkoutOrder(
        payload,
      )) as ApiResponse<CheckoutData>;

      if (response?.data?.snap_token) {
        (window as any).snap.pay(response.data.snap_token, {
          onSuccess: (result: any) => {
            triggerModal(
              "Pembayaran Berhasil",
              "Pesanan Anda sedang kami proses.",
              "success",
            );
            setTimeout(() => {
              const cleanOrderId = removeLastPartOrderId(result.order_id);
              router.push(`/payment-success?order_id=${cleanOrderId}`);
            }, 500);
          },
          onPending: () => {
            triggerModal(
              "Menunggu Pembayaran",
              "Silakan selesaikan pembayaran di aplikasi bank Anda.",
              "warning",
            );
          },
          onError: () => {
            triggerModal(
              "Pembayaran Gagal",
              "Saldo tidak cukup atau transaksi ditolak.",
              "fail",
            );
          },
          onClose: () => {
            triggerModal(
              "Transaksi Dibatalkan",
              "Anda menutup jendela pembayaran sebelum selesai.",
              "warning",
            );
          },
        });
      }
    } catch (error: any) {
      const priceMismatchError =
        error?.response?.data?.errors?.price_mismatch?.[0];
      if (priceMismatchError) {
        triggerModal(
          "Harga Berubah",
          "Harga berubah, silakan muat ulang halaman.",
          "warning",
        );
      } else {
        triggerModal(
          "Sistem Error",
          "Gagal menghubungi server. Coba lagi nanti.",
          "fail",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    
    if (!customerData?.namaPenerima || !customerData?.email || !customerData?.nomorTelepon) {
      setValidationAttempt((v) => v + 1);
      triggerModal(
        "Data Penerima Belum Lengkap",
        "Silakan lengkapi nama, email, dan nomor telepon penerima terlebih dahulu.",
        "warning",
      );

    console.log("test");
      return;
    }
    if (!isFormValid) {
      setValidationAttempt((v) => v + 1);
      triggerModal(
        "Data Penerima Tidak Valid",
        "Periksa kembali nama, email, atau nomor telepon yang Anda masukkan.",
        "warning",
      );

    console.log("test");
      return;
    }
    if (!address) {
      triggerModal(
        "Metode Pengiriman Belum Dipilih",
        "Silakan pilih alamat pengiriman atau outlet pengambilan terlebih dahulu.",
        "warning",
      );
      
    console.log("test");
      return;
    }
    if (courierStale) {
      triggerModal(
        "Kurir Belum Dipilih",
        "Pilih ulang kurir pengiriman sebelum melanjutkan pembayaran.",
        "warning",
      );
      
    console.log("test");
      return;
    }
    await handleProceedPayment();
  };

  // ── Empty cart ───────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Keranjang Kosong
            </h1>
            <p className="text-muted-foreground mb-8">
              Tidak ada produk untuk checkout.
            </p>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Kembali Berbelanja
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <Script src={MIDTRANS_SNAP_URL} data-client-key={MIDTRANS_CLIENT_KEY} />

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
            <h1 className="text-3xl font-bold text-foreground">
              Periksa Pesanan Anda
            </h1>
            <p className="text-muted-foreground mt-2">
              Tinjau detail pesanan sebelum menyelesaikan pembelian
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: Form + Cart ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer form */}
              <div className="bg-card border border-border rounded-lg p-6">
                {/* Guest shortcut: sign in / register with Google to auto-fill */}
                {status === "unauthenticated" && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Punya akun? Masuk dengan Google untuk mengisi data secara
                      otomatis.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full px-4 py-2 border border-border bg-transparent rounded-lg text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <GoogleIcon className="w-4 h-4" />
                          Masuk / Daftar dengan Google
                        </>
                      )}
                    </button>
                    {address && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Anda akan memilih ulang pengiriman setelah masuk.
                      </p>
                    )}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">
                          atau isi data secara manual
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <CheckoutForm
                  onDataChange={setCustomerData}
                  initialData={customerData || undefined}
                  onValidationChange={setIsFormValid}
                  locked={status === "authenticated"}
                  onSavePhone={
                    status === "authenticated" ? handleSavePhone : undefined
                  }
                  savingPhone={savingPhone}
                  phoneSaved={phoneSaved}
                  validationAttempt={validationAttempt}
                />
              </div>

              {/* Cart items */}
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
                      <div className="relative w-24 h-24 bg-background rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${item.image[0]}` ||
                            "/placeholder.svg"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {formatRupiah(item.price)} per item
                        </p>
                        <p className="text-primary font-bold mt-2">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            className="p-1 hover:bg-background rounded transition"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="px-3 py-1 bg-background rounded text-foreground text-sm font-medium min-w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-background rounded transition"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
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

            {/* ── Right: Address + Summary ── */}
            <div className="space-y-6">
              {/* Address card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Pengiriman / Pengambilan
                </h2>

                {!address ? (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      Belum ada alamat dipilih. Klik tombol di bawah untuk
                      memilih.
                    </p>
                  </div>
                ) : address.type === "delivery" ? (
                  <div className="space-y-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      Pengiriman
                    </span>
                    {courierStale ? (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">
                            Jumlah produk berubah
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Silakan pilih ulang kurir pengiriman
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground font-medium">
                          {address.courier?.service_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.fullAddress}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatRupiah(address.courier?.cost ?? 0)} · Est.{" "}
                          {address.courier?.etd} hari
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      Pengambilan di Outlet
                    </span>
                    <p className="text-sm text-foreground font-medium">
                      {address.storeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {address.storeAddress}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(address.pickupDate).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}{" "}
                      pukul {address.pickupTime} WIB
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setIsAddressEditorOpen(true)}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {address
                    ? "Ubah Alamat/Pengambilan"
                    : "Pilih Alamat/Pengambilan"}
                </Button>
              </div>

              {/* Billing summary */}
              <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  {address?.type === "pickup" ? (
                    <ReceiptText className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  {address?.type === "delivery" && address.courier && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Ongkir ({address.courier.service_name})
                      </span>
                      <span className="text-foreground font-medium">
                        {formatRupiah(shippingCost)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Admin</span>
                    <span className="text-foreground font-medium">
                      {formatRupiah(tax)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-foreground">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>

                <Button
                  onClick={handleCompleteOrder}
                  disabled={isLoading}
                  className="w-full py-3 font-bold text-lg transition flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Lanjut Pembayaran"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address Editor Modal (delivery → navigates away; pickup → stays in modal) */}
      <AddressEditor
        isOpen={isAddressEditorOpen}
        onClose={() => setIsAddressEditorOpen(false)}
        onSave={(newAddress) => useShipping.getState().setAddress(newAddress)}
        currentAddress={address}
      />

      {/* Status Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {modalContent.type === "success" && (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
              {modalContent.type === "fail" && (
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
              )}
              {modalContent.type === "warning" && (
                <TriangleAlert className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              )}
              <DialogTitle>{modalContent.title}</DialogTitle>
            </div>
            <DialogDescription>{modalContent.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
