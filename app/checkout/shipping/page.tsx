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
  getExpressPricing,
  
} from "@/lib/kiriminaja";
import type {
  Province,
  City,
  District,
  SubDistrict,
  ShippingRate,
} from "@/types/kiriminaja";
import type { DeliveryAddress } from "@/types/address";

// ─── Your shop's fixed origin (kecamatan_id of your warehouse/store) ──────────
// Replace with the actual kecamatan_id from the KiriminAja coverage area API
const ORIGIN_KECAMATAN_ID = 548; // example: Pleret, Bantul, DIY
const ORIGIN_KELURAHAN_ID = 31487; // example: Wonolelo

// Default package dimensions (cm) — adjust for your bakpia packaging
const DEFAULT_LENGTH = 20;
const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 10;

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full appearance-none px-3 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{loading ? "Memuat..." : placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

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
      className={`w-full text-left p-4 rounded-lg border transition ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {rate.service_name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimasi {rate.etd} hari
            {rate.cod && (
              <span className="ml-2 inline-block px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                COD
              </span>
            )}
            {rate.drop && (
              <span className="ml-1 inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                Drop-off
              </span>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-foreground">
            {formatRupiah(Number(rate.cost))}
          </p>
          {Number(rate.discount_amount) > 0 && (
            <p className="text-xs text-green-600">
              Hemat {formatRupiah(rate.discount_amount)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShippingPage() {
  const router = useRouter();
  const { setAddress } = useShipping();
  const { cart } = useCart();

  // ── cascade state ──────────────────────────────────────────────────────────
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState("");
  const [streetDetail, setStreetDetail] = useState("");

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

  // ── total weight from cart ─────────────────────────────────────────────────
  const totalWeight = cart.reduce(
    (acc, item) => acc + (item.weight ?? 500) * item.quantity, // fallback 500g per item if no weight
    0,
  );

  // ── load provinces on mount ────────────────────────────────────────────────
  useEffect(() => {
    setLoadingProvinces(true);
    getProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoadingProvinces(false));
  }, []);

  // ── cascade: province → cities ─────────────────────────────────────────────
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

  // ── cascade: city → districts ──────────────────────────────────────────────
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

  // ── cascade: district → sub-districts ─────────────────────────────────────
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

  // ── sub-district selected → fetch rates ───────────────────────────────────
  const handleSubDistrictChange = useCallback(
    (val: string) => {
      setSelectedSubDistrict(val);
      setRates([]);
      setSelectedRate(null);
      setRatesError(null);
      if (!val) return;
      setLoadingRates(true);
      getExpressPricing({
        origin: ORIGIN_KECAMATAN_ID,
        subdistrict_origin: ORIGIN_KELURAHAN_ID,
        destination: Number(selectedDistrict),
        subdistrict_destination: Number(val),
        weight: totalWeight > 0 ? totalWeight : 1000,
        length: DEFAULT_LENGTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      })
        .then((results) => {
          if (results.length === 0) {
            setRatesError(
              "Tidak ada layanan pengiriman tersedia untuk area ini.",
            );
          }
          setRates(results);
        })
        .catch(() => setRatesError("Gagal memuat tarif pengiriman. Coba lagi."))
        .finally(() => setLoadingRates(false));
    },
    [selectedDistrict, totalWeight],
  );

  // ── helpers: get name from id ──────────────────────────────────────────────
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
  const isAddressComplete =
    !!selectedProvince &&
    !!selectedCity &&
    !!selectedDistrict &&
    !!selectedSubDistrict &&
    streetDetail.trim().length >= 10;

  const canConfirm = isAddressComplete && !!selectedRate;

  // ── confirm → save to useShipping store → back ────────────────────────────
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

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/checkout")}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Kembali ke Checkout</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Pilih Pengiriman
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Pilih alamat tujuan dan layanan kurir yang sesuai
            </p>
          </div>

          <div className="space-y-6">
            {/* ── Section 1: Address Cascade ── */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Alamat Tujuan
              </h2>

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
                  selectedProvince
                    ? "Pilih Kota/Kabupaten"
                    : "Pilih provinsi dulu"
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
                  selectedDistrict ? "Pilih Kelurahan" : "Pilih kecamatan dulu"
                }
              />

              {/* Street detail */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Detail Alamat (Nama Jalan, No. Rumah, RT/RW) *
                </label>
                <textarea
                  value={streetDetail}
                  onChange={(e) => setStreetDetail(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Jl. Malioboro No. 5, RT 02/RW 03"
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm placeholder-muted-foreground resize-none transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Minimal 10 karakter · {streetDetail.trim().length} / 200
                </p>
              </div>

              {/* Address preview */}
              {isAddressComplete && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs font-medium text-primary mb-1">
                    Alamat Lengkap:
                  </p>
                  <p className="text-sm text-foreground">
                    {streetDetail.trim()}, {subDistrictName}, {districtName},{" "}
                    {cityName}, {provinceName}
                  </p>
                </div>
              )}
            </div>

            {/* ── Section 2: Courier Selection ── */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Pilih Layanan Kurir
              </h2>

              {!selectedSubDistrict && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Lengkapi alamat tujuan untuk melihat tarif pengiriman
                </p>
              )}

              {loadingRates && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Mencari tarif pengiriman...</span>
                </div>
              )}

              {ratesError && !loadingRates && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{ratesError}</p>
                </div>
              )}

              {!loadingRates && rates.length > 0 && (
                <div className="space-y-2">
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
            </div>

            {/* ── Confirm Button ── */}
            <div className="bg-card border border-border rounded-lg p-6">
              {selectedRate && (
                <div className="flex justify-between text-sm mb-4 pb-4 border-b border-border">
                  <span className="text-muted-foreground">Ongkir dipilih</span>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {selectedRate.service_name}
                    </p>
                    <p className="text-primary font-bold">
                      {formatRupiah(Number(selectedRate.cost))}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`w-full py-3 font-bold text-base transition ${
                  canConfirm
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                }`}
              >
                Konfirmasi Pengiriman
              </Button>

              {!canConfirm && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {!isAddressComplete
                    ? "Lengkapi alamat tujuan terlebih dahulu"
                    : "Pilih layanan kurir terlebih dahulu"}
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
