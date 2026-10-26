import type { Product } from '@/app/types/product'
import type { CartItem } from '@/components/cart-provider'

/**
 * Pure merge step behind `CartProvider.refreshPrices()`: patch a cart line
 * from the live catalog snapshot and flag price changes.
 *
 * - Product inactive/deleted (`live` undefined) leaves the snapshot
 *   untouched — the backend rejects such lines at checkout instead.
 * - Unavailable discount → flash/dedicated fields are cleared.
 * - `price_changed` is set only when this refresh moved the price.
 */
export function mergeRefreshedCartItem(
  item: CartItem,
  refreshedProducts: Product[],
): CartItem {
  const live =
    refreshedProducts.find((p) => p.id === item.id)
  if (!live) return item

  const priceChanged = live.price !== item.price
  const discounted = live.discount_source != null

  return {
    ...item,
    price: live.price,
    original_price: discounted ? (live.original_price ?? null) : null,
    discount_label: discounted ? live.discount_label : null,
    discount_source: discounted ? live.discount_source : undefined,
    flash_sale_ends_at:
      live.discount_source === 'flash_sale' ? live.flash_sale_ends_at : undefined,
    price_changed: priceChanged ? true : undefined,
  }
}
