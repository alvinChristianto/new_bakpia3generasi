"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Package,
  Calendar,
  MapPin,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  service_fee: number;
  grand_total: number;
  courier_name: string | null;
  payment_method: string | null;
  shipping_address_snapshot: Record<string, any> | null;
  paid_at: string | null;
  created_at: string;
}

interface TransactionDetail {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  price_per_item: number;
  note: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    className: "bg-yellow-100 text-yellow-800",
  },
  paid: {
    label: "Sudah Dibayar",
    className: "bg-blue-100 text-blue-800",
  },
  processing: {
    label: "Sedang Disiapkan",
    className: "bg-orange-100 text-orange-800",
  },
  shipping: {
    label: "Dalam Pengiriman",
    className: "bg-indigo-100 text-indigo-800",
  },
  completed: {
    label: "Selesai",
    className: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-800",
  },
  failed: {
    label: "Gagal",
    className: "bg-red-100 text-red-800",
  },
};

const STATUS_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipping", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={`${cfg.className} hover:${cfg.className} text-xs`}>
      {cfg.label}
    </Badge>
  );
}

// ── Invoice Modal ─────────────────────────────────────────────────────────────

function InvoiceModal({
  invoiceNumber,
  accessToken,
  onClose,
}: {
  invoiceNumber: string;
  accessToken: string;
  onClose: () => void;
}) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/transaction/${invoiceNumber}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
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
  }, [invoiceNumber, accessToken]);

  const addr = transaction?.shipping_address_snapshot;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Detail Pesanan — {invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4 text-center">{error}</p>
        )}

        {!loading && !error && transaction && (
          <div className="space-y-5 text-sm">
            {/* Status + date */}
            <div className="flex items-center justify-between">
              <StatusBadge status={transaction.status} />
              <span className="text-muted-foreground text-xs">
                {formatDate(transaction.created_at)}
              </span>
            </div>

            {/* Items */}
            <div>
              <p className="font-semibold text-foreground mb-2">Produk</p>
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {details.length === 0 ? (
                  <p className="px-4 py-3 text-muted-foreground">
                    Tidak ada data produk
                  </p>
                ) : (
                  details.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-start justify-between px-4 py-3 gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
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
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="divide-y divide-border">
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
                <div className="flex justify-between px-4 py-3 font-bold text-base bg-muted/40">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatRupiah(transaction.grand_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            {addr && (
              <div>
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Alamat Pengiriman
                </div>
                <div className="bg-muted/40 rounded-lg px-4 py-3 space-y-0.5 text-foreground">
                  {addr.name && <p className="font-medium">{addr.name}</p>}
                  {addr.phone && (
                    <p className="text-muted-foreground">{addr.phone}</p>
                  )}
                  {addr.address && <p>{addr.address}</p>}
                  {(addr.subdistrict || addr.city || addr.province) && (
                    <p>
                      {[addr.subdistrict, addr.city, addr.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {addr.postal_code && <p>Kode Pos: {addr.postal_code}</p>}
                </div>
              </div>
            )}

            {/* Courier + payment */}
            {(transaction.courier_name || transaction.payment_method) && (
              <div className="grid grid-cols-2 gap-3">
                {transaction.courier_name && (
                  <div className="bg-muted/40 rounded-lg px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Kurir
                    </p>
                    <p className="font-medium uppercase text-foreground">
                      {transaction.courier_name}
                    </p>
                  </div>
                )}
                {transaction.payment_method && (
                  <div className="bg-muted/40 rounded-lg px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Pembayaran
                    </p>
                    <p className="font-medium uppercase text-foreground">
                      {transaction.payment_method}
                    </p>
                  </div>
                )}
              </div>
            )}

            {transaction.paid_at && (
              <p className="text-xs text-muted-foreground">
                Dibayar pada: {formatDate(transaction.paid_at)}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/orderlists`,
          {
            headers: {
              Authorization: `Bearer ${(session as any).accessToken}`,
              Accept: "application/json",
            },
          }
        );
        const json = await res.json();
        setOrders(json.data?.orders ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [session]);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="w-8 h-8" />
                Pesanan Saya
              </h1>
              <p className="text-muted-foreground mt-1">
                Riwayat dan status pesanan Anda
              </p>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {STATUS_FILTERS.map((f) => {
                const count =
                  f.value === "all"
                    ? orders.length
                    : orders.filter((o) => o.status === f.value).length;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                      filter === f.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f.label}
                    {count > 0 && (
                      <span
                        className={`ml-1.5 text-xs ${
                          filter === f.value
                            ? "opacity-80"
                            : "text-muted-foreground"
                        }`}
                      >
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty state */}
            {!loading && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-20 h-20 text-muted-foreground opacity-30 mb-4" />
                <p className="text-xl font-semibold text-foreground mb-2">
                  Belum Ada Pesanan
                </p>
                <p className="text-muted-foreground max-w-xs">
                  Anda belum memiliki pesanan sampai saat ini. Yuk, mulai belanja
                  bakpia favorit Anda!
                </p>
              </div>
            )}

            {/* Filtered empty state */}
            {!loading && orders.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-14 h-14 text-muted-foreground opacity-30 mb-3" />
                <p className="text-foreground font-medium">
                  Tidak ada pesanan dengan status ini
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && filtered.length > 0 && (
              <>
                {/* Desktop table */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">
                          No. Invoice
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">
                          Tanggal
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">
                          Status
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">
                          Total
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {filtered.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-muted/30 transition"
                        >
                          <td className="px-4 py-4">
                            <button
                              onClick={() =>
                                setSelectedInvoice(order.invoice_number)
                              }
                              className="font-mono text-primary hover:underline text-sm font-semibold"
                            >
                              {order.invoice_number}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-foreground">
                            {formatRupiah(order.grand_total)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() =>
                                setSelectedInvoice(order.invoice_number)
                              }
                              className="text-muted-foreground hover:text-foreground transition"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filtered.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedInvoice(order.invoice_number)}
                      className="w-full bg-card border border-border rounded-lg p-4 text-left hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="font-mono text-primary font-semibold text-sm">
                          {order.invoice_number}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatRupiah(order.grand_total)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {selectedInvoice && session?.accessToken && (
        <InvoiceModal
          invoiceNumber={selectedInvoice}
          accessToken={(session as any).accessToken}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
