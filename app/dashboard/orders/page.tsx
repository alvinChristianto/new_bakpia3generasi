"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Package, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { STATUS_CONFIG } from "@/app/types/order-status";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  invoice_number: string;
  status: string;
  grand_total: number;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <Badge className={`${cfg.className} hover:${cfg.className} text-xs`}>
      {cfg.label}
    </Badge>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const goToDetail = (invoiceNumber: string) => {
    router.push(`/dashboard/orders/${invoiceNumber}`);
  };

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
                          filter === f.value ? "opacity-80" : "text-muted-foreground"
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
                        <th className="text-left px-4 py-3 font-semibold text-foreground">No. Invoice</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Tanggal</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">Total</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {filtered.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => goToDetail(order.invoice_number)}
                          className="hover:bg-muted/30 transition cursor-pointer"
                        >
                          <td className="px-4 py-4">
                            <span className="font-mono text-primary text-sm font-semibold">
                              {order.invoice_number}
                            </span>
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
                          <td className="px-4 py-4 text-right text-muted-foreground">
                            <ChevronRight className="w-4 h-4 ml-auto" />
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
                      onClick={() => goToDetail(order.invoice_number)}
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
    </>
  );
}
