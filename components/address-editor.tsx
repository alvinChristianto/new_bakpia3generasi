"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddressData, PickupAddress } from "../app/types/address";

// ─── Offline stores (unchanged) ───────────────────────────────────────────────

export interface OfflineStore {
  id: string;
  name: string;
  address: string;
  phone: string;
}

const OFFLINE_STORES: OfflineStore[] = [
  {
    id: "1",
    name: "Bakpia 3 Generasi - Jl Magelang",
    address:
      "Jl. Magelang No.Km. 5,8, Kutu Patran, Sinduadi, Kec. Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55284",
    phone: "0821 3806 0002",
  },
  {
    id: "2",
    name: "Bakpia 3 Generasi - Jl Mataram",
    address:
      "Jl. Mataram No.50, Suryatmajan, Kec. Danurejan, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55213",
    phone: "0823 4231 2204",
  },
  {
    id: "3",
    name: "Bakpia 3 Generasi - The Cabin Hotel Tugu",
    address:
      "Jl. Margo Utomo No.9, Gowongan, Kec. Jetis, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55232",
    phone: "0821 3806 0002",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddressEditorProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called only for pickup — delivery is handled by the shipping page */
  onSave: (address: AddressData) => void;
  currentAddress: AddressData | null;
}

// ─── Pickup form state ────────────────────────────────────────────────────────

interface PickupFormState {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const isValidPickupTime = (time: string): boolean => {
  if (!time) return false;
  const [hours] = time.split(":").map(Number);
  return hours >= 9 && hours < 18;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AddressEditor({
  isOpen,
  onClose,
  onSave,
  currentAddress,
}: AddressEditorProps) {
  const router = useRouter();

  // Which tab is active in the modal
  const [activeTab, setActiveTab] = useState<"delivery" | "pickup">(
    currentAddress?.type ?? "delivery",
  );

  // Pickup form state
  const [pickupForm, setPickupForm] = useState<PickupFormState>({
    storeId: currentAddress?.type === "pickup" ? currentAddress.storeId : "",
    pickupDate:
      currentAddress?.type === "pickup" ? currentAddress.pickupDate : "",
    pickupTime:
      currentAddress?.type === "pickup" ? currentAddress.pickupTime : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Pickup validation ────────────────────────────────────────────────────

  const isPickupValid =
    !!pickupForm.storeId &&
    !!pickupForm.pickupDate &&
    pickupForm.pickupDate >= getMinDate() &&
    !!pickupForm.pickupTime &&
    isValidPickupTime(pickupForm.pickupTime);

  const validatePickup = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!pickupForm.storeId) newErrors.storeId = "Pilih toko terlebih dahulu";
    if (!pickupForm.pickupDate) {
      newErrors.pickupDate = "Tanggal pengambilan harus diisi";
    } else if (pickupForm.pickupDate < getMinDate()) {
      newErrors.pickupDate = "Tanggal pengambilan harus minimal besok";
    }
    if (!pickupForm.pickupTime) {
      newErrors.pickupTime = "Waktu pengambilan harus diisi";
    } else if (!isValidPickupTime(pickupForm.pickupTime)) {
      newErrors.pickupTime = "Jam pengambilan harus antara 09:00 - 18:00 WIB";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Save pickup ──────────────────────────────────────────────────────────

  const handleSavePickup = () => {
    if (!validatePickup()) return;
    const store = OFFLINE_STORES.find((s) => s.id === pickupForm.storeId)!;
    const pickup: AddressData = {
      type: "pickup",
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address,
      pickupDate: pickupForm.pickupDate,
      pickupTime: pickupForm.pickupTime,
    };
    onSave(pickup);
    onClose();
  };

  // ── Navigate to shipping page (delivery) ─────────────────────────────────

  const handleGoToShipping = () => {
    onClose();
    router.push("/checkout/shipping");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Metode Pengiriman
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ── Tab selector ── */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab("delivery");
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 p-3 border rounded-lg text-sm font-medium transition ${
                activeTab === "delivery"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Truck className="w-4 h-4" />
              Kirim ke Alamat
            </button>
            <button
              onClick={() => {
                setActiveTab("pickup");
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 p-3 border rounded-lg text-sm font-medium transition ${
                activeTab === "pickup"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Store className="w-4 h-4" />
              Ambil di Toko
            </button>
          </div>

          {/* ── Delivery tab ── */}
          {activeTab === "delivery" && (
            <div className="space-y-4">
              {/* Show current delivery address if already set and courier exists */}
              {currentAddress?.type === "delivery" &&
                currentAddress.courier && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-1">
                      Alamat saat ini:
                    </p>
                    <p className="text-sm text-foreground">
                      {currentAddress.fullAddress}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentAddress.courier.service_name} ·{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(currentAddress.courier.cost)}
                    </p>
                  </div>
                )}

              {/* Show stale warning when courier was cleared */}
              {currentAddress?.type === "delivery" &&
                !currentAddress.courier && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-0.5">
                      Jumlah produk berubah
                    </p>
                    <p className="text-xs text-amber-600">
                      {currentAddress.fullAddress}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Silakan pilih ulang kurir pengiriman
                    </p>
                  </div>
                )}

              <p className="text-sm text-muted-foreground">
                Pilih alamat tujuan dan kurir pengiriman melalui halaman
                berikut.
              </p>

              <Button
                onClick={handleGoToShipping}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {currentAddress?.type === "delivery"
                  ? "Ubah Alamat & Kurir"
                  : "Pilih Alamat & Kurir"}
              </Button>
            </div>
          )}

          {/* ── Pickup tab ── */}
          {activeTab === "pickup" && (
            <div className="space-y-4">
              {/* Store selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pilih Toko *
                </label>
                <select
                  value={pickupForm.storeId}
                  onChange={(e) => {
                    setPickupForm({ ...pickupForm, storeId: e.target.value });
                    if (errors.storeId) setErrors({ ...errors, storeId: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm transition ${
                    errors.storeId ? "border-destructive" : "border-border"
                  } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                >
                  <option value="">-- Pilih Toko --</option>
                  {OFFLINE_STORES.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                {errors.storeId && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {errors.storeId}
                  </div>
                )}
                {pickupForm.storeId &&
                  (() => {
                    const store = OFFLINE_STORES.find(
                      (s) => s.id === pickupForm.storeId,
                    );
                    return (
                      <div className="mt-2 p-3 bg-muted rounded-lg text-xs">
                        <p className="text-foreground font-medium">
                          {store?.address}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {store?.phone}
                        </p>
                      </div>
                    );
                  })()}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={pickupForm.pickupDate}
                    min={getMinDate()}
                    onChange={(e) => {
                      setPickupForm({
                        ...pickupForm,
                        pickupDate: e.target.value,
                      });
                      if (errors.pickupDate)
                        setErrors({ ...errors, pickupDate: "" });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm transition ${
                      errors.pickupDate ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.pickupDate && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.pickupDate}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Waktu *
                  </label>
                  <input
                    type="time"
                    value={pickupForm.pickupTime}
                    min="09:00"
                    max="17:59"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setPickupForm({ ...pickupForm, pickupTime: "" });
                        return;
                      }
                      const [h] = val.split(":").map(Number);
                      if (h >= 9 && h < 18) {
                        setPickupForm({ ...pickupForm, pickupTime: val });
                        if (errors.pickupTime)
                          setErrors({ ...errors, pickupTime: "" });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm transition ${
                      errors.pickupTime ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.pickupTime && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.pickupTime}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Jam operasional: Senin–Minggu 09:00–18:00 WIB
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent"
          >
            Batal
          </Button>

          {activeTab === "pickup" && (
            <Button
              onClick={handleSavePickup}
              disabled={!isPickupValid}
              className={`flex-1 ${
                isPickupValid
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Simpan
            </Button>
          )}

          {activeTab === "delivery" && (
            <Button
              onClick={handleGoToShipping}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {currentAddress?.type === "delivery" ? "Ubah" : "Pilih Kurir"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
