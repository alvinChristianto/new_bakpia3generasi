"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddressData } from "../app/types/address";
import { getOutlets, type Outlet } from "@/app/api/endpoints/outlets";

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

  const [activeTab, setActiveTab] = useState<"delivery" | "pickup">(
    currentAddress?.type ?? "delivery",
  );

  const [pickupForm, setPickupForm] = useState<PickupFormState>({
    storeId: currentAddress?.type === "pickup" ? currentAddress.storeId : "",
    pickupDate:
      currentAddress?.type === "pickup" ? currentAddress.pickupDate : "",
    pickupTime:
      currentAddress?.type === "pickup" ? currentAddress.pickupTime : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [outletsLoading, setOutletsLoading] = useState(false);

  useEffect(() => {
    setOutletsLoading(true);
    getOutlets()
      .then(setOutlets)
      .finally(() => setOutletsLoading(false));
  }, []);

  // ── Pickup validation ────────────────────────────────────────────────────

  const isPickupValid =
    !!pickupForm.storeId &&
    !!pickupForm.pickupDate &&
    pickupForm.pickupDate >= getMinDate() &&
    !!pickupForm.pickupTime &&
    isValidPickupTime(pickupForm.pickupTime);

  const validatePickup = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!pickupForm.storeId) newErrors.storeId = "Pilih outlet terlebih dahulu";
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
    const store = outlets.find((s) => s.id_outlet === pickupForm.storeId)!;
    const pickup: AddressData = {
      type: "pickup",
      storeId: store.id_outlet,
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

  const selectedStore = outlets.find((s) => s.id_outlet === pickupForm.storeId);

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
            className="p-1 hover:bg-muted rounded-lg transition"
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
              Ambil di Outlet
            </button>
          </div>

          {/* ── Delivery tab ── */}
          {activeTab === "delivery" && (
            <div className="space-y-4">
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
                  Pilih Outlet *
                </label>

                {outletsLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-muted rounded-lg" />
                  </div>
                ) : (
                  <>
                    <select
                      value={pickupForm.storeId}
                      onChange={(e) => {
                        setPickupForm({ ...pickupForm, storeId: e.target.value });
                        if (errors.storeId)
                          setErrors({ ...errors, storeId: "" });
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm transition ${
                        errors.storeId ? "border-destructive" : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    >
                      <option value="">-- Pilih Outlet --</option>
                      {outlets.map((store) => (
                        <option key={store.id_outlet} value={store.id_outlet}>
                          {store.name}
                        </option>
                      ))}
                    </select>

                    {selectedStore && (
                      <div className="mt-2 p-3 bg-muted rounded-lg text-xs space-y-0.5">
                        <p className="text-foreground font-medium">
                          {selectedStore.address}
                        </p>
                        {selectedStore.phone_number && (
                          <p className="text-muted-foreground">
                            {selectedStore.phone_number}
                          </p>
                        )}
                        {(selectedStore.operational_day ||
                          selectedStore.operational_hour) && (
                          <p className="text-muted-foreground">
                            {[
                              selectedStore.operational_day,
                              selectedStore.operational_hour
                                ? selectedStore.operational_hour + " WIB"
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {errors.storeId && (
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.storeId}</span>
                  </div>
                )}
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
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errors.pickupDate}</span>
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
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errors.pickupTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Jam operasional: 09:00–18:00 WIB
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
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
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
