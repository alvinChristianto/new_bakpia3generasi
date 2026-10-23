import type { UpcomingFlashSale } from "@/app/types/flash-sale";
import { FLASH_SALE_TEASER_WINDOW_MS } from "@/app/types/flash-sale";

/**
 * Pick the sale whose teaser banner should be visible right now:
 * the soonest upcoming sale that starts within the 24 h teaser window.
 */
export function pickFlashSaleTeaser(
  upcoming: UpcomingFlashSale[],
  now = Date.now(),
): UpcomingFlashSale | null {
  return (
    [...upcoming]
      .sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
      )
      .find((sale) => {
        const secondsToStart = (new Date(sale.start_at).getTime() - now) / 1000;
        return (
          secondsToStart > 0 &&
          secondsToStart <= FLASH_SALE_TEASER_WINDOW_MS / 1000
        );
      }) ?? null
  );
}
