import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllActiveProducts } from "./all_active_products";
import apiClient from "../client";

vi.mock("../client", () => ({
  default: { get: vi.fn() },
}));

const mockedGet = vi.mocked(apiClient.get);

describe("getAllActiveProducts", () => {
  beforeEach(() => mockedGet.mockReset());

  it("calls GET /api/products and returns the payload", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, message: "ok", data: { total: 0, data: [] } },
    });

    const result = await getAllActiveProducts();

    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(mockedGet).toHaveBeenCalledWith(
      "/api/products",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    expect(result).toEqual({ success: true, message: "ok", data: { total: 0, data: [] } });
  });

  it("propagates errors from the API client", async () => {
    mockedGet.mockRejectedValueOnce(new Error("network down"));
    await expect(getAllActiveProducts()).rejects.toThrow("network down");
  });
});
