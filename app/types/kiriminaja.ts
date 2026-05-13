// ─── Coverage Area ────────────────────────────────────────────────────────────

export interface Province {
  id: number;
  provinsi_name: string;
}

export interface City {
  id: number;
  provinsi_id: number;
  kabupaten_name: string;
  type: string;
  postal_code: string;
}

export interface District {
  id: number;
  kecamatan_name: string;
  kabupaten_id: number;
}

export interface SubDistrict {
  id: number;
  kelurahan_name: string;
  kecamatan_id: number;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface ShippingRateDiscount {
  discount: number;
  discount_percentage: number;
  discount_campaign_id: number;
  discount_type: string;
}

export interface ShippingRateSetting {
  cod_fee: string;
  minimum_cod_fee: string;
  insurance_fee: string;
  insurance_add_cost: number;
  cod_fee_amount: number;
}

export interface ShippingRate {
  service: string;
  service_name: string;
  service_type: string;
  cost: string;
  etd: string;
  cod: boolean;
  group: string;
  drop: boolean;
  cut_off_time: string | null;
  force_insurance: boolean;
  use_geolocation: boolean;
  discount_campaign: ShippingRateDiscount;
  discount_amount: number;
  discount_percentage: number;
  discount_type: string | null;
  setting: ShippingRateSetting;
  insurance: number;
}

export interface PricingExpressRequest {
  origin: number;
  subdistrict_origin?: number;
  destination: number;
  subdistrict_destination?: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  item_value?: string | number;
  insurance?: number;
  courier?: string[];
}

export interface PricingExpressResponse {
  status: boolean;
  method: string;
  text: string;
  details: Record<string, unknown>;
  results: ShippingRate[];
}

// ─── Selected Courier (stored in useShipping) ─────────────────────────────────

export interface SelectedCourier {
  service: string;
  service_name: string;
  service_type: string;
  cost: number;
  etd: string;
  cod: boolean;
  group: string;
}