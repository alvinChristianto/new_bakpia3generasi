"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AddressData {
  type: "delivery" | "pickup";
  fullAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  storeId?: string;
}

export interface OfflineStore {
  id: string;
  name: string;
  address: string;
  phone: string;
}

const OFFLINE_STORES: OfflineStore[] = [
  {
    id: "1",
    name: "Bakpia 3 Generasi - Malioboro",
    address: "Jalan Malioboro No. 123, Yogyakarta",
    phone: "+62 274-512345",
  },
  {
    id: "2",
    name: "Bakpia 3 Generasi - Kota Baru",
    address: "Jalan Kota Baru No. 45, Yogyakarta",
    phone: "+62 274-623456",
  },
  {
    id: "3",
    name: "Bakpia 3 Generasi - Borobudur",
    address: "Jalan Borobudur No. 67, Magelang",
    phone: "+62 293-734567",
  },
];

interface AddressEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialData?: AddressData;
}

export function AddressEditor({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddressEditorProps) {
  const [formData, setFormData] = useState<AddressData>(
    initialData || {
      type: "delivery",
      fullAddress: "",
      pickupDate: "",
      pickupTime: "",
      storeId: "",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Validate time is between 9 AM and 6 PM
  const isValidPickupTime = (time: string): boolean => {
    if (!time) return false;
    const [hours] = time.split(":").map(Number);
    return hours >= 9 && hours < 18;
  };

  // Check if form is valid for button enable/disable
  const isFormValid = (): boolean => {
    if (formData.type === "delivery") {
      // Delivery: address must be at least 10 characters and not empty
      return !!(
        formData.fullAddress?.trim() && formData.fullAddress.trim().length >= 10
      );
    } else {
      // Pickup: store, date, and time must all be selected
      return !!(
        formData.storeId &&
        formData.pickupDate &&
        formData.pickupTime &&
        isValidPickupTime(formData.pickupTime)
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.type === "delivery") {
      if (!formData.fullAddress?.trim()) {
        newErrors.fullAddress = "Alamat harus diisi";
      } else if (formData.fullAddress.trim().length < 10) {
        newErrors.fullAddress = "Alamat minimal 10 karakter";
      }
    } else if (formData.type === "pickup") {
      if (!formData.storeId) {
        newErrors.storeId = "Pilih toko terlebih dahulu";
      }
      if (!formData.pickupDate?.trim()) {
        newErrors.pickupDate = "Tanggal pengambilan harus diisi";
      } else {
        // Validate that date is at least tomorrow
        const minDate = getMinDate();
        if (formData.pickupDate < minDate) {
          newErrors.pickupDate = "Tanggal pengambilan harus minimal besok";
        }
      }
      if (!formData.pickupTime?.trim()) {
        newErrors.pickupTime = "Waktu pengambilan harus diisi";
      } else if (!isValidPickupTime(formData.pickupTime)) {
        newErrors.pickupTime = "Jam pengambilan harus antara 09:00 - 18:00 WIB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const getStoreInfo = (id: string) => {
    const store = OFFLINE_STORES.find((s) => s.id === id);
    return store
      ? `${store.name} | ${store.address} | ${store.phone}`
      : undefined;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Alamat Pengiriman/Pengambilan
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Delivery Method Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Pilih Metode *
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={formData.type === "delivery"}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      type: "delivery",
                      // clear pickup-only fields when switching to delivery
                      storeId: "",
                      pickupDate: "",
                      pickupTime: "",
                      fullAddress: "",
                    });
                    setErrors({});
                  }}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-foreground font-medium">
                  Pengiriman ke Alamat
                </span>
              </label>
              <label className="flex items-center p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={formData.type === "pickup"}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      type: "pickup",
                      // clear delivery-only field when switching to pickup
                      // fullAddress: "teste",
                    });
                    setErrors({});
                  }}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-foreground font-medium">
                  Pengambilan di Toko Offline
                </span>
              </label>
            </div>
          </div>

          {/* Delivery Address Input */}
          {formData.type === "delivery" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Alamat Lengkap *
              </label>
              <textarea
                value={formData.fullAddress || ""}
                onChange={(e) => {
                  setFormData({ ...formData, fullAddress: e.target.value });
                  if (errors.fullAddress)
                    setErrors({ ...errors, fullAddress: "" });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition resize-none ${
                  errors.fullAddress ? "border-destructive" : "border-border"
                } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                placeholder="Jalan, nomor rumah, RT/RW, kota, provinsi, kode pos"
                rows={4}
              />
              {errors.fullAddress && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullAddress}
                </div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">
                Isikan alamat pengiriman dengan benar agar barang dapat dikirim
                dengan lebih cepat
              </p>
            </div>
          )}

          {/* Store Selection */}
          {formData.type === "pickup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pilih Toko *
                </label>
                <select
                  value={formData.storeId || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      storeId: e.target.value,
                      fullAddress: getStoreInfo(e.target.value),
                    });
                    if (errors.storeId) setErrors({ ...errors, storeId: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground transition ${
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
                  <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.storeId}
                  </div>
                )}
                {formData.storeId && (
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    {(() => {
                      const store = OFFLINE_STORES.find(
                        (s) => s.id === formData.storeId,
                      );
                      return (
                        <>
                          <p className="text-foreground font-medium mb-1">
                            {store?.address}
                          </p>
                          <p className="text-muted-foreground">
                            {store?.phone}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tanggal Pengambilan *
                  </label>
                  <input
                    type="date"
                    value={formData.pickupDate || ""}
                    min={getMinDate()}
                    onChange={(e) => {
                      setFormData({ ...formData, pickupDate: e.target.value });
                      if (errors.pickupDate)
                        setErrors({ ...errors, pickupDate: "" });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground transition ${
                      errors.pickupDate ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.pickupDate && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.pickupDate}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Waktu Pengambilan *
                  </label>
                  <input
                    type="time"
                    value={formData.pickupTime || ""}
                    min="09:00"
                    max="17:59"
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      if (selectedTime) {
                        const [hours] = selectedTime.split(":").map(Number);
                        // Only allow times between 09:00 and 17:59 (9 AM to 5:59 PM)
                        if (hours >= 9 && hours < 18) {
                          setFormData({
                            ...formData,
                            pickupTime: selectedTime,
                          });
                          if (errors.pickupTime)
                            setErrors({ ...errors, pickupTime: "" });
                        }
                      } else {
                        setFormData({ ...formData, pickupTime: "" });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground transition ${
                      errors.pickupTime ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.pickupTime && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.pickupTime}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Jam operasional toko: Senin-Minggu 09:00-18:00 WIB
              </p>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`flex-1 ${
              isFormValid()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Simpan Alamat
          </Button>
        </div>
      </div>
    </div>
  );
}
