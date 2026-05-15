import type {
  Province,
  City,
  District,
  SubDistrict,
  PricingExpressRequest,
  ShippingRate,
} from "../app/types/kiriminaja";

/**
 * All KiriminAja calls are proxied through our own Next.js API route
 * (/api/kiriminaja/[...path]) so the API key is never exposed to the browser.
 *
 * The proxy route forwards the request to:
 *   Sandbox  → https://tdev.kiriminaja.com
 *   Prod     → https://client.kiriminaja.com
 *
 * and injects the Authorization header server-side.
 */
const BASE = "/api/kiriminaja";

async function post<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KiriminAja API error [${res.status}]: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Coverage Area ────────────────────────────────────────────────────────────

export async function getProvinces(): Promise<Province[]> {
  const data = await post<{ status: boolean; datas: Province[] }>("/province");
  return data.datas;
}

export async function getCities(provinsi_id: number): Promise<City[]> {
  const data = await post<{ status: boolean; datas: City[] }>("/city", {
    provinsi_id,
  });
  return data.datas;
}

export async function getDistricts(kabupaten_id: number): Promise<District[]> {
  const data = await post<{ status: boolean; datas: District[] }>(
    "/kecamatan",
    {
      kabupaten_id,
    },
  );
  return data.datas;
}

export async function getSubDistricts(
  kecamatan_id: number,
): Promise<SubDistrict[]> {
  const data = await post<{ status: boolean; results: SubDistrict[] }>(
    "/kelurahan",
    { kecamatan_id },
  );
  return data.results;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
export interface ExpressPricingPayload {
  destination: number; // kecamatan_id
  subdistrict_destination: number; // kelurahan_id
  item_value: string; // total product price as string
  weight: number; // grams — from calculatePackageDimensions
  length: number; // cm
  width: number; // cm
  height: number; // cm
}

export async function getExpressPricing(
  payload: ExpressPricingPayload,
): Promise<ShippingRate[]> {
  const body = {
    // ── hardcoded origin (your warehouse) ──────────────────────────────────
    origin: 6983,
    subdistrict_origin: 31409,
    // ── from user address selection ────────────────────────────────────────
    destination: payload.destination,
    subdistrict_destination: payload.subdistrict_destination,
    // ── from cart dimensions ───────────────────────────────────────────────
    weight: payload.weight,
    length: payload.length,
    width: payload.width,
    height: payload.height,
    // ── from cart subtotal ─────────────────────────────────────────────────
    item_value: payload.item_value,
    // ── fixed ──────────────────────────────────────────────────────────────
    insurance: 1,
    courier: ["jne", "tiki", "spx"],
  };

  const data = await post<{ status: boolean; results: ShippingRate[] }>(
    "/v6.1/shipping_price",
    body,
  );
  return data.results;
}
