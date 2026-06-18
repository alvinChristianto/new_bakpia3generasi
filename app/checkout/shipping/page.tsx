"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Loader2,
  Truck,
  MapPin,
  Package,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useShipping } from "@/hooks/use-shipping";
import { useCart } from "@/hooks/use-cart";
import {
  getProvinces,
  getCities,
  getDistricts,
  getSubDistricts,
} from "@/lib/kiriminaja";
import { getShippingPricing } from "@/app/api/endpoints/shipping";
import type {
  Province,
  City,
  District,
  SubDistrict,
  ShippingRate,
} from "../../types/kiriminaja";
import type { DeliveryAddress } from "../../types/address";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-medium shadow-lg transition-all duration-300 whitespace-nowrap ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {message}
    </div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  loading,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  loading?: boolean;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full appearance-none px-2.5 py-2 pr-8 border border-border rounded-lg bg-background text-foreground text-xs transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{loading ? "Memuat..." : placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CourierCard ──────────────────────────────────────────────────────────────

function CourierCard({
  rate,
  selected,
  onSelect,
}: {
  rate: ShippingRate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg border transition flex items-center justify-between gap-2 ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {selected ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-border flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-foreground truncate">
          {rate.service_name}
        </span>
      </div>
      <span className="text-xs font-bold text-primary flex-shrink-0">
        {formatRupiah(Number(rate.cost))}
      </span>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShippingPage() {
  const router = useRouter();
  const { address, setAddress } = useShipping();
  const { cart, subtotal } = useCart();

  // ── total quantity drives package dimensions (computed server-side) ────────
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── pre-populate from existing delivery address in store ───────────────────
  const existingDelivery = address?.type === "delivery" ? address : null;

  // ── cascade state — init from store if available ───────────────────────────
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);

  const [selectedProvince, setSelectedProvince] = useState(
    existingDelivery ? String(existingDelivery.province_id) : "",
  );
  const [selectedCity, setSelectedCity] = useState(
    existingDelivery ? String(existingDelivery.city_id) : "",
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    existingDelivery ? String(existingDelivery.kecamatan_id) : "",
  );
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(
    existingDelivery ? String(existingDelivery.kelurahan_id) : "",
  );
  const [streetDetail, setStreetDetail] = useState(
    existingDelivery ? existingDelivery.street_detail : "",
  );

  // ── loading states ─────────────────────────────────────────────────────────
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);

  // ── courier rates ──────────────────────────────────────────────────────────
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // ── toast ──────────────────────────────────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // ── load provinces on mount ────────────────────────────────────────────────
  useEffect(() => {
    setLoadingProvinces(true);
    getProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoadingProvinces(false));
  }, []);

  // ── pre-load cascade dropdowns when returning with existing address ─────────
  useEffect(() => {
    if (!existingDelivery) return;

    // Load cities for saved province
    setLoadingCities(true);
    getCities(existingDelivery.province_id)
      .then(setCities)
      .catch(console.error)
      .finally(() => setLoadingCities(false));

    // Load districts for saved city
    setLoadingDistricts(true);
    getDistricts(existingDelivery.city_id)
      .then(setDistricts)
      .catch(console.error)
      .finally(() => setLoadingDistricts(false));

    // Load sub-districts for saved district
    setLoadingSubDistricts(true);
    getSubDistricts(existingDelivery.kecamatan_id)
      .then(setSubDistricts)
      .catch(console.error)
      .finally(() => setLoadingSubDistricts(false));

    // Auto-trigger pricing if courier was cleared due to quantity change
    if (existingDelivery.courier === null) {
      setLoadingRates(true);
      getShippingPricing({
        destination_kecamatan_id: existingDelivery.kecamatan_id,
        destination_kelurahan_id: existingDelivery.kelurahan_id,
        total_qty: totalQty,
        item_value: subtotal,
      })
        .then((results) => {
          if (!results || results.length === 0) {
            setRatesError(
              "Tidak ada layanan pengiriman tersedia untuk area ini.",
            );
          } else {
            setRates(results);
            showToast();
          }
        })
        .catch(() => setRatesError("Gagal memuat tarif pengiriman. Coba lagi."))
        .finally(() => setLoadingRates(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // ── cascade handlers ───────────────────────────────────────────────────────
  const handleProvinceChange = useCallback((val: string) => {
    setSelectedProvince(val);
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedSubDistrict("");
    setCities([]);
    setDistricts([]);
    setSubDistricts([]);
    setRates([]);
    setSelectedRate(null);
    if (!val) return;
    setLoadingCities(true);
    getCities(Number(val))
      .then(setCities)
      .catch(console.error)
      .finally(() => setLoadingCities(false));
  }, []);

  const handleCityChange = useCallback((val: string) => {
    setSelectedCity(val);
    setSelectedDistrict("");
    setSelectedSubDistrict("");
    setDistricts([]);
    setSubDistricts([]);
    setRates([]);
    setSelectedRate(null);
    if (!val) return;
    setLoadingDistricts(true);
    getDistricts(Number(val))
      .then(setDistricts)
      .catch(console.error)
      .finally(() => setLoadingDistricts(false));
  }, []);

  const handleDistrictChange = useCallback((val: string) => {
    setSelectedDistrict(val);
    setSelectedSubDistrict("");
    setSubDistricts([]);
    setRates([]);
    setSelectedRate(null);
    if (!val) return;
    setLoadingSubDistricts(true);
    getSubDistricts(Number(val))
      .then(setSubDistricts)
      .catch(console.error)
      .finally(() => setLoadingSubDistricts(false));
  }, []);

  // ── kelurahan → fetch rates + show toast ──────────────────────────────────
  const handleSubDistrictChange = useCallback(
    (val: string) => {
      setSelectedSubDistrict(val);
      setRates([]);
      setSelectedRate(null);
      setRatesError(null);
      if (!val) return;
      setLoadingRates(true);
      getShippingPricing({
        destination_kecamatan_id: Number(selectedDistrict),
        destination_kelurahan_id: Number(val),
        total_qty: totalQty,
        item_value: subtotal,
      })
        .then((results) => {
          if (!results || results.length === 0) {
            setRatesError(
              "Tidak ada layanan pengiriman tersedia untuk area ini.",
            );
          } else {
            setRates(results);
            showToast();
          }
        })
        .catch(() => setRatesError("Gagal memuat tarif pengiriman. Coba lagi."))
        .finally(() => setLoadingRates(false));
    },
    [selectedDistrict, subtotal, totalQty],
  );

  // ── name helpers ───────────────────────────────────────────────────────────
  const provinceName =
    provinces.find((p) => String(p.id) === selectedProvince)?.provinsi_name ??
    "";
  const cityName =
    cities.find((c) => String(c.id) === selectedCity)?.kabupaten_name ?? "";
  const districtName =
    districts.find((d) => String(d.id) === selectedDistrict)?.kecamatan_name ??
    "";
  const subDistrictName =
    subDistricts.find((s) => String(s.id) === selectedSubDistrict)
      ?.kelurahan_name ?? "";

  // ── form validity ──────────────────────────────────────────────────────────
  const isStreetValid = streetDetail.trim().length >= 10;
  const canConfirm =
    !!selectedProvince &&
    !!selectedCity &&
    !!selectedDistrict &&
    !!selectedSubDistrict &&
    isStreetValid &&
    !!selectedRate;

  // ── confirm ────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedRate) return;

    const fullAddress = `${streetDetail.trim()}, ${subDistrictName}, ${districtName}, ${cityName}, ${provinceName}`;

    const delivery: DeliveryAddress = {
      province_id: Number(selectedProvince),
      province_name: provinceName,
      city_id: Number(selectedCity),
      city_name: cityName,
      kecamatan_id: Number(selectedDistrict),
      kecamatan_name: districtName,
      kelurahan_id: Number(selectedSubDistrict),
      kelurahan_name: subDistrictName,
      street_detail: streetDetail.trim(),
      fullAddress,
      courier: {
        service: selectedRate.service,
        service_name: selectedRate.service_name,
        service_type: selectedRate.service_type,
        cost: Number(selectedRate.cost),
        etd: selectedRate.etd,
        cod: selectedRate.cod,
        group: selectedRate.group,
      },
    };

    setAddress({ type: "delivery", ...delivery });
    router.push("/checkout");
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <Toast
        message="✓ Layanan pengiriman sudah diperbarui"
        visible={toastVisible}
      />

      <main className="min-h-screen bg-background py-6">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/checkout")}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Kembali ke Checkout</span>
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                Pilih Pengiriman
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Pilih alamat tujuan dan layanan kurir
            </p>
          </div>

          <div className="space-y-4">
            {/* ── Section 1: Address Cascade ── */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Alamat Tujuan
              </h2>

              {/* 2-column grid for dropdowns */}
              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Provinsi"
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  options={provinces.map((p) => ({
                    value: String(p.id),
                    label: p.provinsi_name,
                  }))}
                  loading={loadingProvinces}
                  placeholder="Pilih Provinsi"
                />

                <SelectField
                  label="Kota / Kabupaten"
                  value={selectedCity}
                  onChange={handleCityChange}
                  options={cities.map((c) => ({
                    value: String(c.id),
                    label: `${c.type} ${c.kabupaten_name}`,
                  }))}
                  disabled={!selectedProvince}
                  loading={loadingCities}
                  placeholder={
                    selectedProvince ? "Pilih Kota" : "Pilih provinsi dulu"
                  }
                />

                <SelectField
                  label="Kecamatan"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  options={districts.map((d) => ({
                    value: String(d.id),
                    label: d.kecamatan_name,
                  }))}
                  disabled={!selectedCity}
                  loading={loadingDistricts}
                  placeholder={
                    selectedCity ? "Pilih Kecamatan" : "Pilih kota dulu"
                  }
                />

                <SelectField
                  label="Kelurahan / Desa"
                  value={selectedSubDistrict}
                  onChange={handleSubDistrictChange}
                  options={subDistricts.map((s) => ({
                    value: String(s.id),
                    label: s.kelurahan_name,
                  }))}
                  disabled={!selectedDistrict}
                  loading={loadingSubDistricts}
                  placeholder={
                    selectedDistrict
                      ? "Pilih Kelurahan"
                      : "Pilih kecamatan dulu"
                  }
                />
              </div>

              {/* Address preview */}
              {selectedProvince &&
                selectedCity &&
                selectedDistrict &&
                selectedSubDistrict && (
                  <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-[10px] font-medium text-primary mb-0.5">
                      Area terpilih:
                    </p>
                    <p className="text-xs text-foreground">
                      {subDistrictName}, {districtName}, {cityName},{" "}
                      {provinceName}
                    </p>
                  </div>
                )}
            </div>

            {/* ── Section 2: Courier + Street Detail ── */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Pilih Layanan Kurir
              </h2>

              {/* Empty state */}
              {!selectedSubDistrict && !loadingRates && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Pilih kelurahan tujuan untuk melihat tarif pengiriman
                </p>
              )}

              {/* Loading */}
              {loadingRates && (
                <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Mencari tarif pengiriman...</span>
                </div>
              )}

              {/* Error */}
              {ratesError && !loadingRates && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{ratesError}</p>
                </div>
              )}

              {/* Courier list — 2 columns */}
              {!loadingRates && rates.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {rates.map((rate, idx) => (
                    <CourierCard
                      key={`${rate.service}-${rate.service_type}-${idx}`}
                      rate={rate}
                      selected={
                        selectedRate?.service === rate.service &&
                        selectedRate?.service_type === rate.service_type
                      }
                      onSelect={() => setSelectedRate(rate)}
                    />
                  ))}
                </div>
              )}

              {/* Street detail — shown after courier is selected */}
              {selectedRate && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="block text-xs font-medium text-foreground">
                    Detail Alamat (Nama Jalan, No. Rumah, RT/RW) *
                  </label>
                  <textarea
                    value={streetDetail}
                    onChange={(e) => setStreetDetail(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Jl. Malioboro No. 5, RT 02/RW 03"
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-xs placeholder-muted-foreground resize-none transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      streetDetail.trim().length > 0 && !isStreetValid
                        ? "border-destructive"
                        : "border-border"
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    {streetDetail.trim().length > 0 && !isStreetValid ? (
                      <p className="text-[10px] text-destructive">
                        Minimal 10 karakter
                      </p>
                    ) : (
                      <span />
                    )}
                    <p className="text-[10px] text-muted-foreground ml-auto">
                      {streetDetail.trim().length} / 200
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 3: Confirm ── */}
            <div className="bg-card border border-border rounded-lg p-4">
              {/* Selected summary */}
              {selectedRate && (
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                  <span className="text-xs text-muted-foreground">
                    Kurir dipilih
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">
                      {selectedRate.service_name}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatRupiah(Number(selectedRate.cost))}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`w-full py-2.5 font-bold text-sm transition ${
                  canConfirm
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                }`}
              >
                Konfirmasi Pengiriman
              </Button>

              {!canConfirm && (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  {!selectedSubDistrict
                    ? "Pilih kelurahan tujuan terlebih dahulu"
                    : !selectedRate
                      ? "Pilih layanan kurir terlebih dahulu"
                      : !isStreetValid
                        ? "Lengkapi detail alamat (min. 10 karakter)"
                        : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
