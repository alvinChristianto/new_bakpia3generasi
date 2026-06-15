"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Truck, Store, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const DAY_NAMES: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

const DAY_NAME_TO_NUM: Record<string, number> = {
  Minggu: 0,
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
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

  // Derive selectedStore early so validation helpers can use it
  const selectedStore = outlets.find((s) => s.id_outlet === pickupForm.storeId);

  // ── Calendar computed values ─────────────────────────────────────────────

  const minDate = new Date(getMinDate() + "T12:00:00");

  // Weekday numbers (0=Sun…6=Sat) that are NOT in the outlet's operational days
  const disabledWeekdays: number[] =
    selectedStore?.operational_day?.length
      ? [0, 1, 2, 3, 4, 5, 6].filter(
          (n) =>
            !selectedStore.operational_day!.some(
              (d) => DAY_NAME_TO_NUM[d] === n,
            ),
        )
      : [];

  const selectedCalendarDate = pickupForm.pickupDate
    ? new Date(pickupForm.pickupDate + "T12:00:00")
    : undefined;

  // ── Validation helpers using outlet's operational schedule ───────────────

  const isValidPickupTime = (time: string): boolean => {
    if (!time) return false;
    const { start, end } = selectedStore?.operational_hour ?? {
      start: "09:00",
      end: "18:00",
    };
    const t = timeToMinutes(time);
    return t >= timeToMinutes(start) && t < timeToMinutes(end);
  };

  const isValidPickupDay = (date: string): boolean => {
    if (!date || !selectedStore?.operational_day?.length) return true;
    const dayName = DAY_NAMES[new Date(date + "T12:00:00").getDay()];
    return selectedStore.operational_day.includes(dayName);
  };

  // ── Pickup validation ────────────────────────────────────────────────────

  const isPickupValid =
    !!pickupForm.storeId &&
    !!pickupForm.pickupDate &&
    pickupForm.pickupDate >= getMinDate() &&
    isValidPickupDay(pickupForm.pickupDate) &&
    !!pickupForm.pickupTime &&
    isValidPickupTime(pickupForm.pickupTime);

  const validatePickup = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!pickupForm.storeId) {
      newErrors.storeId = "Pilih outlet terlebih dahulu";
    }

    if (!pickupForm.pickupDate) {
      newErrors.pickupDate = "Tanggal pengambilan harus diisi";
    } else if (pickupForm.pickupDate < getMinDate()) {
      newErrors.pickupDate = "Tanggal pengambilan harus minimal besok";
    } else if (!isValidPickupDay(pickupForm.pickupDate)) {
      const days = selectedStore?.operational_day?.join(", ") ?? "";
      newErrors.pickupDate = `Outlet ini hanya beroperasi: ${days}`;
    }

    if (!pickupForm.pickupTime) {
      newErrors.pickupTime = "Waktu pengambilan harus diisi";
    } else if (!isValidPickupTime(pickupForm.pickupTime)) {
      const { start, end } = selectedStore?.operational_hour ?? {
        start: "09:00",
        end: "18:00",
      };
      newErrors.pickupTime = `Jam pengambilan harus antara ${start} – ${end} WIB`;
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

  const opStart = selectedStore?.operational_hour?.start ?? "09:00";
  const opEnd = selectedStore?.operational_hour?.end ?? "18:00";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
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
                        // Clear date and time when outlet changes — new outlet may have different schedule
                        setPickupForm({
                          ...pickupForm,
                          storeId: e.target.value,
                          pickupDate: "",
                          pickupTime: "",
                        });
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
                      <div className="mt-2 p-3 bg-muted rounded-lg text-xs space-y-1.5">
                        <p className="text-foreground font-medium">
                          {selectedStore.address}
                        </p>
                        {selectedStore.phone_number && (
                          <p className="text-muted-foreground">
                            {selectedStore.phone_number}
                          </p>
                        )}
                        {selectedStore.operational_day &&
                          selectedStore.operational_day.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {selectedStore.operational_day.map((day) => (
                                <span
                                  key={day}
                                  className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          )}
                        {selectedStore.operational_hour && (
                          <p className="text-muted-foreground">
                            {selectedStore.operational_hour.start} –{" "}
                            {selectedStore.operational_hour.end} WIB
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

              {/* Date picker — compact trigger that opens calendar popover */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal Pengambilan *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg bg-background text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.pickupDate
                          ? "border-destructive"
                          : "border-border"
                      } ${
                        pickupForm.pickupDate
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                      {pickupForm.pickupDate
                        ? new Date(
                            pickupForm.pickupDate + "T12:00:00",
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Pilih tanggal"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedCalendarDate}
                      onSelect={(date) => {
                        const str = date
                          ? date.toISOString().split("T")[0]
                          : "";
                        setPickupForm({ ...pickupForm, pickupDate: str });
                        if (errors.pickupDate)
                          setErrors({ ...errors, pickupDate: "" });
                      }}
                      disabled={[
                        { before: minDate },
                        ...(disabledWeekdays.length > 0
                          ? [{ dayOfWeek: disabledWeekdays }]
                          : []),
                      ]}
                    />
                  </PopoverContent>
                </Popover>
                {errors.pickupDate && (
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.pickupDate}</span>
                  </div>
                )}
              </div>

              {/* Time picker */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Waktu Pengambilan *
                </label>
                <input
                  type="time"
                  value={pickupForm.pickupTime}
                  min={opStart}
                  max={opEnd}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setPickupForm({ ...pickupForm, pickupTime: "" });
                      return;
                    }
                    if (isValidPickupTime(val)) {
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
                <p className="text-xs text-muted-foreground mt-1.5">
                  {selectedStore?.operational_hour
                    ? `Jam operasional outlet: ${opStart}–${opEnd} WIB`
                    : "Jam operasional: 09:00–18:00 WIB"}
                </p>
              </div>
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
