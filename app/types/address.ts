import type { SelectedCourier } from "./kiriminaja";

// ─── Delivery address (KiriminAja) ────────────────────────────────────────────

export interface DeliveryAddress {
  province_id: number;
  province_name: string;
  city_id: number;
  city_name: string;
  kecamatan_id: number;
  kecamatan_name: string;
  kelurahan_id: number;
  kelurahan_name: string;
  /** Free-text street detail, e.g. "Jl. Malioboro No. 5 RT 02/03" */
  street_detail: string;
  /** Full human-readable string built from the cascade + street detail */
  fullAddress: string;
  courier: SelectedCourier;
}

// ─── Pickup address (in-store) ────────────────────────────────────────────────

export interface PickupAddress {
  storeId: string;
  storeName: string;
  storeAddress: string;
  pickupDate: string;
  pickupTime: string;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type AddressData =
  | ({ type: "delivery" } & DeliveryAddress)
  | ({ type: "pickup" } & PickupAddress);