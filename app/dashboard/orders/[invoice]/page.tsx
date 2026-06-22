"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  MapPin,
  Loader2,
  Truck,
  CheckCircle2,
  Clock,
  CreditCard,
  Hash,
  Printer,
} from "lucide-react";
import { STATUS_CONFIG } from "@/app/types/order-status";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  service_fee: number;
  grand_total: number;
  courier_name: string | null;
  courier_service: string | null;
  tracking_number: string | null;
  payment_method: string | null;
  shipping_address_snapshot: Record<string, any> | null;
  requested_shipping_datetime: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface TransactionDetail {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  price_per_item: number;
  note: string | null;
}

interface TrackingHistory {
  created_at: string;
  status: string;
  status_code: number;
  driver: string;
  receiver: string;
}

interface TrackingDetails {
  awb: string | null;
  order_id: string;
  service: string;
  service_name: string;
  delivered: boolean;
  delivered_at: string | null;
  shipped_at: string | null;
  origin: { name: string; address: string; city: string } | null;
  destination: { name: string; address: string; city: string } | null;
}

interface TrackingData {
  status: boolean;
  text: string;
  status_code: number;
  details: TrackingDetails | null;
  histories: TrackingHistory[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });


function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={`${cfg.className} hover:${cfg.className} text-xs font-medium`}>
      {cfg.label}
    </Badge>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </p>
  );
}

// ── Left column: order detail ─────────────────────────────────────────────────

function OrderDetailColumn({
  transaction,
  details,
}: {
  transaction: Transaction;
  details: TransactionDetail[];
}) {
  const addr = transaction.shipping_address_snapshot;

  return (
    <div className="space-y-5 text-sm">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <StatusBadge status={transaction.status} />
        <span className="text-xs text-muted-foreground">
          {formatDate(transaction.created_at)}
        </span>
      </div>

      {/* Products */}
      <div>
        <SectionHeading>Produk</SectionHeading>
        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
          {details.length === 0 ? (
            <p className="px-4 py-3 text-muted-foreground">Tidak ada data produk</p>
          ) : (
            details.map((d) => (
              <div key={d.id} className="flex justify-between items-start px-4 py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {d.product_name_snapshot}
                  </p>
                  {d.note && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Catatan: {d.note}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1">
                    {d.quantity} × {formatRupiah(d.price_per_item)}
                  </p>
                </div>
                <p className="font-semibold text-foreground whitespace-nowrap">
                  {formatRupiah(d.quantity * d.price_per_item)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cost breakdown */}
      <div>
        <SectionHeading>Ringkasan Biaya</SectionHeading>
        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
          <div className="flex justify-between px-4 py-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatRupiah(transaction.subtotal)}</span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span>{formatRupiah(transaction.shipping_cost)}</span>
          </div>
          {transaction.service_fee > 0 && (
            <div className="flex justify-between px-4 py-2">
              <span className="text-muted-foreground">Biaya Admin</span>
              <span>{formatRupiah(transaction.service_fee)}</span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3 font-bold bg-muted/40">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(transaction.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Courier + payment */}
      {(transaction.courier_name || transaction.payment_method) && (
        <div className="grid grid-cols-2 gap-3">
          {transaction.courier_name && (
            <div className="bg-muted/40 rounded-lg px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Truck className="w-3 h-3" />
                Kurir
              </div>
              <p className="font-medium uppercase text-foreground text-sm">
                {transaction.courier_service ?? transaction.courier_name}
              </p>
            </div>
          )}
          {transaction.payment_method && (
            <div className="bg-muted/40 rounded-lg px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <CreditCard className="w-3 h-3" />
                Pembayaran
              </div>
              <p className="font-medium uppercase text-foreground text-sm">
                {transaction.payment_method}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tracking number */}
      {transaction.tracking_number && (
        <div className="bg-muted/40 rounded-lg px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Hash className="w-3 h-3" />
            No. Resi
          </div>
          <p className="font-mono font-semibold text-foreground text-sm">
            {transaction.tracking_number}
          </p>
        </div>
      )}

      {/* Shipping label link — paid courier-delivery orders only */}
      {["paid", "shipping", "completed"].includes(transaction.status) &&
        transaction.courier_name !== "pickup" && (
          <div className="bg-muted/40 rounded-lg px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Printer className="w-3 h-3" />
              Label Pengiriman
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_BE_ROUTE}/api/transaction/${transaction.invoice_number}/label`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak Label
            </a>
          </div>
        )}

      {/* Shipping address */}
      {addr && (
        <div>
          <SectionHeading>
            {addr.type === "pickup" ? "Lokasi Ambil" : "Alamat Pengiriman"}
          </SectionHeading>
          <div className="bg-muted/40 rounded-lg px-4 py-3 space-y-0.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                {addr.type === "pickup" ? (
                  <>
                    <p className="font-medium text-foreground">{addr.storeName}</p>
                    <p className="text-muted-foreground text-xs">{addr.storeAddress}</p>
                    {addr.pickupDate && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Ambil:{" "}
                        {new Date(addr.pickupDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        pukul {addr.pickupTime}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {addr.street_detail && (
                      <p className="text-foreground">{addr.street_detail}</p>
                    )}
                    {(addr.kelurahan_name ||
                      addr.kecamatan_name ||
                      addr.city_name ||
                      addr.province_name) && (
                      <p className="text-muted-foreground text-xs">
                        {[
                          addr.kelurahan_name,
                          addr.kecamatan_name,
                          addr.city_name,
                          addr.province_name,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {addr.fullAddress && !addr.street_detail && (
                      <p className="text-foreground text-xs">{addr.fullAddress}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      {(transaction.paid_at ||
        transaction.shipped_at ||
        transaction.completed_at ||
        transaction.requested_shipping_datetime) && (
        <div className="space-y-1 border-t border-border pt-3">
          {transaction.paid_at && (
            <p className="text-xs text-muted-foreground">
              Dibayar: {formatDate(transaction.paid_at)}
            </p>
          )}
          {transaction.shipped_at && (
            <p className="text-xs text-muted-foreground">
              Dikirim: {formatDate(transaction.shipped_at)}
            </p>
          )}
          {transaction.completed_at && (
            <p className="text-xs text-muted-foreground">
              Selesai: {formatDate(transaction.completed_at)}
            </p>
          )}
          {transaction.requested_shipping_datetime && (
            <p className="text-xs text-muted-foreground">
              Jadwal ambil: {formatDateTime(transaction.requested_shipping_datetime)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Right column: tracking ────────────────────────────────────────────────────

function TrackingColumn({
  transaction,
  tracking,
  loading,
}: {
  transaction: Transaction;
  tracking: TrackingData | null;
  loading: boolean;
}) {
  const hasTracking = !!transaction.tracking_number;
  const isDelivered = tracking?.details?.delivered;
  const histories = [...(tracking?.histories ?? [])].reverse();

  if (!hasTracking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
        <Truck className="w-10 h-10 opacity-30" />
        <div>
          <p className="text-sm font-medium text-foreground">Belum Ada Pengiriman</p>
          <p className="text-xs mt-1">
            {transaction.status === "pending" || transaction.status === "paid"
              ? "Pesanan sedang diproses, pengiriman akan segera dimulai."
              : "Data pengiriman tidak tersedia."}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat data pelacakan...
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
        <Truck className="w-10 h-10 opacity-30" />
        <p className="text-sm">Data pelacakan belum tersedia</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm">
      {/* Carrier header */}
      {tracking.details && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            <span className="font-semibold uppercase text-foreground">
              {tracking.details.service}
            </span>
            <span className="text-muted-foreground text-xs">
              {tracking.details.service_name}
            </span>
          </div>
          {tracking.details.awb && (
            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {tracking.details.awb}
            </span>
          )}
        </div>
      )}

      {/* Status banner */}
      <div
        className={`rounded-lg px-4 py-3 flex items-center gap-2 ${
          isDelivered
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-indigo-50 text-indigo-800 border border-indigo-200"
        }`}
      >
        {isDelivered ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <Clock className="w-4 h-4 shrink-0" />
        )}
        <span className="text-sm font-medium">
          {tracking.text ||
            (isDelivered ? "Paket telah diterima" : "Paket dalam pengiriman")}
        </span>
      </div>

      {/* Origin → destination */}
      {tracking.details?.origin && tracking.details?.destination && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-2">
          <span className="font-medium text-foreground">
            {tracking.details.origin.city}
          </span>
          <span className="flex-1 border-t border-dashed border-muted-foreground/40" />
          <Truck className="w-3 h-3 shrink-0" />
          <span className="flex-1 border-t border-dashed border-muted-foreground/40" />
          <span className="font-medium text-foreground">
            {tracking.details.destination.city}
          </span>
        </div>
      )}

      {/* Timeline */}
      <div>
        <SectionHeading>Riwayat Pengiriman</SectionHeading>
        {histories.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Belum ada riwayat pengiriman
          </p>
        ) : (
          <ol className="relative border-l-2 border-border ml-2 space-y-0">
            {histories.map((h, i) => (
              <li key={i} className="mb-5 ml-5">
                <span
                  className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-background ${
                    i === 0 ? "bg-primary" : "bg-muted-foreground/25"
                  }`}
                />
                <p
                  className={`text-sm leading-snug ${
                    i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {h.status}
                </p>
                <time className="text-xs text-muted-foreground">
                  {formatDateTime(h.created_at)}
                </time>
                {(h.driver || h.receiver) && (
                  <div className="mt-0.5 space-y-0.5">
                    {h.driver && (
                      <p className="text-xs text-muted-foreground">Kurir: {h.driver}</p>
                    )}
                    {h.receiver && (
                      <p className="text-xs text-muted-foreground">
                        Diterima: {h.receiver}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceNumber = params.invoice as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/transaction/${invoiceNumber}`,
          { headers: { Accept: "application/json" } }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal memuat detail");
        setTransaction(json.data.data);
        setDetails(json.data.details ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [invoiceNumber]);

  useEffect(() => {
    if (!transaction?.tracking_number) return;
    const fetchTracking = async () => {
      setTrackingLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/tracking/${invoiceNumber}`,
          { headers: { Accept: "application/json" } }
        );
        const json = await res.json();
        if (json.success && json.tracking) setTracking(json.tracking);
      } catch {
        // silently ignore — tracking is optional
      } finally {
        setTrackingLoading(false);
      }
    };
    fetchTracking();
  }, [transaction, invoiceNumber]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Pesanan
              </button>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Detail Pesanan</h1>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-0.5 ml-7">
                {invoiceNumber}
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive py-4 text-center">{error}</p>
            )}

            {/* Two-column layout */}
            {!loading && !error && transaction && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left: order detail */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <OrderDetailColumn transaction={transaction} details={details} />
                </div>

                {/* Right: tracking */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-4 h-4 text-primary" />
                    <h2 className="font-semibold text-foreground text-sm">
                      Status Pengiriman
                    </h2>
                  </div>
                  <TrackingColumn
                    transaction={transaction}
                    tracking={tracking}
                    loading={trackingLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
