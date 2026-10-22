import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActiveFlashSale } from "./flash-sales";
import apiClient from "../client";

vi.mock("../client", () => ({
  default: { get: vi.fn() },
}));

const mockedGet = vi.mocked(apiClient.get);

describe("getActiveFlashSale", () => {
  beforeEach(() => mockedGet.mockReset());

  it("returns the sale payload when one is active", async () => {
    const sale = {
      id: "sale-1",
      name: "Gajian Sale",
      banner_url: null,
      banner_alt: null,
      start_at: "2026-10-01T00:00:00Z",
      end_at: "2026-10-31T00:00:00Z",
      server_time: "2026-10-22T00:00:00Z",
      remaining_seconds: 3600,
      items: [],
    };
    mockedGet.mockResolvedValueOnce({
      data: { success: true, message: "ok", data: sale },
    });

    const result = await getActiveFlashSale();

    expect(mockedGet).toHaveBeenCalledWith("/api/flash-sales/active");
    expect(result).toEqual(sale);
  });

  it("resolves to null when the backend reports no active sale (data: null)", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, message: "No active flash sale", data: null },
    });

    await expect(getActiveFlashSale()).resolves.toBeNull();
  });

  it("resolves to null on network/API failure so callers keep working", async () => {
    mockedGet.mockRejectedValueOnce(new Error("network down"));

    await expect(getActiveFlashSale()).resolves.toBeNull();
  });
});
