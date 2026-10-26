import { describe, it, expect } from "vitest";
import { pickFlashSaleTeaser } from "./flash-sale";
import type { UpcomingFlashSale } from "@/app/types/flash-sale";

const HOUR_MS = 3_600_000;

function sale(id: string, startInMs: number): UpcomingFlashSale {
  return {
    id,
    name: `Sale ${id}`,
    banner_url: null,
    banner_alt: null,
    banner_rect_url: null,
    banner_rect_alt: null,
    start_at: new Date(NOW + startInMs).toISOString(),
    end_at: new Date(NOW + startInMs + HOUR_MS).toISOString(),
  };
}

const NOW = 1_000_000_000_000;

describe("pickFlashSaleTeaser", () => {
  it("picks the soonest sale starting within the 24h window", () => {
    const teaser = pickFlashSaleTeaser(
      [sale("far", HOUR_MS * 5), sale("near", HOUR_MS * 1)],
      NOW,
    );

    expect(teaser?.id).toBe("near");
  });

  it("ignores sales outside the 24h window", () => {
    expect(pickFlashSaleTeaser([sale("far", HOUR_MS * 25)], NOW)).toBeNull();
  });

  it("ignores sales that already started (active sale handles them)", () => {
    expect(pickFlashSaleTeaser([sale("past", -HOUR_MS)], NOW)).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(pickFlashSaleTeaser([], NOW)).toBeNull();
  });

  it("picks the exact window boundary (24h = H days before)", () => {
    const teaser = pickFlashSaleTeaser([sale("edge", HOUR_MS * 24)], NOW);

    expect(teaser?.id).toBe("edge");
  });
});
