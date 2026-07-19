export interface Product {
  id: string
  name: string
  image: string | string[]
  rating: number
  price: number
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
