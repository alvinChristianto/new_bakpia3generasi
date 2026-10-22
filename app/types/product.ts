export interface Product {
  id: string
  name: string
  image: string | string[]
  rating: number
  /** Effective (discounted) price — the backend applies discounts server-side. */
  price: number
  /** Pre-discount price; only present when a discount is active. */
  original_price?: number | null
  /** `"percent" | "fixed"` — null when not discounted. */
  discount_type?: 'percent' | 'fixed' | null
  /** Human-readable label (e.g. `"Diskon 20%"`) — null when not discounted. */
  discount_label?: string | null
  /** Which pricing source won: flash sale or a normal discount. */
  discount_source?: 'flash_sale' | 'normal_discount' | null
  /** ISO timestamp when the current flash sale ends — only for flash-sale wins. */
  flash_sale_ends_at?: string | null
  description: string
  category: string
  flavor?: string | null
  is_featured?: boolean
  sort_order?: number
}

/** Shape of the paginated `data` object returned by `GET /api/products`. */
export interface ProductPage {
  total: number
  data: Product[]
}
