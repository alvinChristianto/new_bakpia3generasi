export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-800" },
  paid:       { label: "Sudah Dibayar",       className: "bg-blue-100 text-blue-800" },
  processing: { label: "Sedang Disiapkan",    className: "bg-orange-100 text-orange-800" },
  shipping:   { label: "Dalam Pengiriman",    className: "bg-indigo-100 text-indigo-800" },
  completed:  { label: "Selesai",             className: "bg-green-100 text-green-800" },
  cancelled:  { label: "Dibatalkan",          className: "bg-red-100 text-red-800" },
  failed:     { label: "Gagal",               className: "bg-red-100 text-red-800" },
};
