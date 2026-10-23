import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildFlashSaleShareUrl, shareFlashSaleUrl } from "./share";
import type { ActiveFlashSale } from "@/app/types/flash-sale";

const SALE = {
  id: "sale-uuid-1",
  name: "Gajian Sale",
  banner_url: null,
  banner_alt: null,
  banner_rect_url: null,
  banner_rect_alt: null,
  start_at: "2026-10-23T12:00:00Z",
  end_at: "2026-10-23T13:00:00Z",
  server_time: "2026-10-23T12:00:00Z",
  remaining_seconds: 3600,
  items: [],
} satisfies ActiveFlashSale;

describe("buildFlashSaleShareUrl", () => {
  const ORIGINAL = process.env.NEXT_PUBLIC_FE_ROUTE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_FE_ROUTE = "http://localhost:3000/";
  });

  it("builds the homepage URL with the flash_sale param", () => {
    expect(buildFlashSaleShareUrl(SALE)).toBe(
      "http://localhost:3000/?flash_sale=sale-uuid-1",
    );
  });

  it("normalizes trailing slashes in the FE route", () => {
    process.env.NEXT_PUBLIC_FE_ROUTE = "https://bakpia.example.com///";
    expect(buildFlashSaleShareUrl(SALE)).toBe(
      "https://bakpia.example.com/?flash_sale=sale-uuid-1",
    );

    process.env.NEXT_PUBLIC_FE_ROUTE = ORIGINAL;
  });
});

describe("shareFlashSaleUrl", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the Web Share API when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share, clipboard: undefined });

    const result = await shareFlashSaleUrl(SALE);

    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining("?flash_sale=sale-uuid-1") }),
    );
  });

  it("falls back to the clipboard when Web Share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const result = await shareFlashSaleUrl(SALE);

    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("?flash_sale=sale-uuid-1"),
    );
  });

  it("returns failed when both mechanisms reject", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(shareFlashSaleUrl(SALE)).resolves.toBe("failed");
  });
});
