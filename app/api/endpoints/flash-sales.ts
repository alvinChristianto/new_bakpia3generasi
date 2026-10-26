import apiClient from "../client";
import { ActiveFlashSale, UpcomingFlashSale } from "@/app/types/flash-sale";

/**
 * Fetch the currently published flash sale (backend-cached 30 s).
 * Resolves to `null` when no sale is active — the backend sends
 * `data: null` in the same envelope, and any unexpected failure
 * (network/4xx/5xx) is also treated as "no sale" so callers keep working.
 */
export const getActiveFlashSale = async (): Promise<ActiveFlashSale | null> => {
  try {
    const response = await apiClient.get("/api/flash-sales/active");
    const data = response?.data?.data;
    return data ?? null;
  } catch {
    return null;
  }
};

/**
 * Fetch published sales that have not started yet (soonest first, max 3).
 * Resolves to `[]` on any failure so callers treat it as "no teaser".
 */
export const getUpcomingFlashSales = async (): Promise<UpcomingFlashSale[]> => {
  try {
    const response = await apiClient.get("/api/flash-sales/upcoming");
    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
