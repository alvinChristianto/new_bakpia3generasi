'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ProductCard } from './product-card'
import { ProductModal } from './product-modal'
import { useCart } from '@/hooks/use-cart'
import { getAllActiveProducts } from '@/app/api/endpoints/all_active_products'
import { Product } from '@/app/types/product'

const FLAVOR_ALL = '__all__'
const FLAVOR_OTHER = '__other__'

export function ProductsSection() {
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVOR_ALL)
  const [search, setSearch] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const { addItem } = useCart()

  const getDataBakpia = async () => {
    try {
      setError(false)
      const result = await getAllActiveProducts()
      if (result.data) {
        setAllProducts(result.data.data)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDataBakpia()
  }, [])

  // Distinct, non-null flavors present in the catalog, sorted.
  const flavors = useMemo(() => {
    const unique = new Set(
      allProducts
        .map((p) => p.flavor?.trim())
        .filter((f): f is string => Boolean(f)),
    )
    return Array.from(unique).sort()
  }, [allProducts])

  const hasFlavorless = useMemo(
    () => allProducts.some((p) => !p.flavor?.trim()),
    [allProducts],
  )

  // Curated best-sellers: featured products, or top 4 by rating as a fallback.
  const bestSellers = useMemo(() => {
    const featured = allProducts.filter((p) => p.is_featured)
    if (featured.length > 0) return featured
    return [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4)
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return allProducts.filter((p) => {
      const matchesFlavor =
        selectedFlavor === FLAVOR_ALL ||
        (selectedFlavor === FLAVOR_OTHER
          ? !p.flavor?.trim()
          : p.flavor?.trim() === selectedFlavor)
      const matchesSearch = term === '' || p.name.toLowerCase().includes(term)
      return matchesFlavor && matchesSearch
    })
  }, [allProducts, selectedFlavor, search])

  const handleAddToCart = (id: string) => {
    const product = allProducts.find((p) => p.id === id)
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
      })
    }
  }

  // Build the chip list: Semua, each flavor, then Lainnya (if flavorless products exist).
  const chips: { id: string; label: string }[] = [
    { id: FLAVOR_ALL, label: 'Semua' },
    ...flavors.map((f) => ({ id: f, label: f })),
    ...(hasFlavorless ? [{ id: FLAVOR_OTHER, label: 'Lainnya' }] : []),
  ]

  const chipClass = (active: boolean) =>
    `snap-start shrink-0 min-h-11 px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'bg-card text-foreground hover:bg-muted border border-border'
    }`

  return (
    <section id="products" className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance mb-8">
          Koleksi produk Kami
        </h2>

        {/* Best sellers — curated highlight row */}
        {!loading && !error && bestSellers.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Paling Laris
            </h3>
            {/* Snap carousel on mobile, grid on md+ */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 min-w-[70%] sm:min-w-[45%] md:min-w-0"
                >
                  <ProductCard
                    {...product}
                    onAddToCart={handleAddToCart}
                    onOpenModal={() => setModalProduct(product)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="w-full min-h-11 pl-10 pr-4 py-2 rounded-lg bg-background text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Flavor chips — horizontal scroll on mobile, wrap on lg+ */}
        {chips.length > 1 && (
          <div className="flex gap-2 overflow-x-auto snap-x pb-2 mb-8 lg:flex-wrap lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedFlavor(chip.id)}
                className={chipClass(selectedFlavor === chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="bg-muted h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="bg-muted rounded h-4 w-3/4" />
                  <div className="bg-muted rounded h-4 w-1/2" />
                  <div className="bg-muted rounded h-8 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Gagal memuat produk. Silakan coba lagi.
            </p>
            <button
              onClick={() => {
                setLoading(true)
                getDataBakpia()
              }}
              className="min-h-11 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
                onOpenModal={() => setModalProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Tidak ada produk yang cocok dengan pencarian atau rasa ini.
            </p>
          </div>
        )}
      </div>

      <ProductModal
        product={modalProduct}
        isOpen={modalProduct !== null}
        onClose={() => setModalProduct(null)}
      />
    </section>
  )
}
