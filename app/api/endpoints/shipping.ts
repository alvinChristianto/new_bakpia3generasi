import apiClient from "../client";
import type { ShippingRate } from "../../types/kiriminaja";

export interface ShippingPricingPayload {
  destination_kecamatan_id: number;
  destination_kelurahan_id: number;
  total_qty: number;
  item_value: number;
}

/**
 * Fetch express shipping rates from the Laravel backend, which proxies the
 * quote to KiriminAja. Origin and box dimensions are resolved server-side from
 * config/kiriminaja.php — we only send the destination, total quantity and
 * item value.
 */
export const getShippingPricing = async (
  payload: ShippingPricingPayload,
): Promise<ShippingRate[]> => {
  const response = await apiClient.post("/api/shipping/pricing", payload);
  return response.data.results;
};
