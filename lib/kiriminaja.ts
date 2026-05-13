import type {
  Province,
  City,
  District,
  SubDistrict,
  PricingExpressRequest,
  ShippingRate,
} from "@/types/kiriminaja";

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
  const data = await post<{ status: boolean; datas: District[] }>("/kecamatan", {
    kabupaten_id,
  });
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

export async function getExpressPricing(
  payload: PricingExpressRequest,
): Promise<ShippingRate[]> {
  const data = await post<{ status: boolean; results: ShippingRate[] }>(
    "/price",
    payload as unknown as Record<string, unknown>,
  );
  return data.results;
}
