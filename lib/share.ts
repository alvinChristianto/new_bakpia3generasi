import type {
  ActiveFlashSale,
  UpcomingFlashSale,
} from '@/app/types/flash-sale'

/** Public storefront URL from env, without a trailing slash. */
function storefrontBase(): string {
  return (process.env.NEXT_PUBLIC_FE_ROUTE ?? '').replace(/\/+$/, '')
}

/**
 * Share link for a flash sale: the storefront homepage carrying the event id
 * as `?flash_sale=`. `app/page.tsx` turns that id into event-specific SEO
 * metadata (og:title = event name, og:image = banner, og:description = alt).
 */
export function buildFlashSaleShareUrl(
  sale: ActiveFlashSale | UpcomingFlashSale,
): string {
  return `${storefrontBase()}/?flash_sale=${sale.id}`
}

const SHARE_TEXT = 'Flash Sale Bakpia — diskon terbatas!'

/**
 * Open the device's native share sheet (Web Share API) when available,
 * otherwise copy the URL to the clipboard. Returns what happened so the
 * button can give inline feedback.
 */
export async function shareFlashSaleUrl(
  sale: ActiveFlashSale | UpcomingFlashSale,
): Promise<'shared' | 'copied' | 'failed'> {
  const url = buildFlashSaleShareUrl(sale)

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: SHARE_TEXT, text: SHARE_TEXT, url })
      return 'shared'
    } catch (error) {
      // User dismissed the sheet — that is not a failure.
      if (error instanceof Error && error.name === 'AbortError') return 'shared'
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
