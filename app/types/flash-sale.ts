import { Product } from "./product";

/** One flash-sale line item returned by `GET /api/flash-sales/active`. */
export interface FlashSaleItem {
  id: string
  product_id: string
  name: string
  image: string | string[]
  price: number
  original_price: number | null
  discount_type: 'percent' | 'fixed' | null
  discount_label: string | null
  discount_source: 'flash_sale' | 'normal_discount' | null
  sold_count: number
  /** Null when the sale has unlimited stock. */
  quota: number | null
  sold_out: boolean
  /** 0–100, null when quota is unlimited. */
  progress_percent: number | null
}

/**
 * The active flash sale. The backend returns `data: null` in the same
 * envelope when no sale is currently running.
 */
export interface ActiveFlashSale {
  id: string
  name: string
  banner_url: string | null
  banner_alt: string | null
  start_at: string
  end_at: string
  /** Server clock snapshot — anchor countdowns to this, never the browser clock. */
  server_time: string
  remaining_seconds: number
  items: FlashSaleItem[]
}

/** Flash-sale item rendered as a storefront product. */
export type FlashSaleProduct = Product & Pick<
  FlashSaleItem,
  'sold_count' | 'quota' | 'sold_out' | 'progress_percent'
>
