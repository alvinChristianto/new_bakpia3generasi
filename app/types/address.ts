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
  street_detail: string;
  fullAddress: string;
  /** null when courier was cleared due to quantity change */
  courier: SelectedCourier | null;
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
