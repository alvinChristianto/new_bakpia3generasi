'use client'

import { useEffect, useMemo, useState } from 'react'
import { ProductCard } from './product-card'
import { ProductModal } from './product-modal'
import { useCart } from '@/hooks/use-cart'
import { getAllActiveProducts } from '@/app/api/endpoints/all_active_products'

interface Product {
  id: string
  name: string
  image: string
  rating: number
  price: number
  description: string
  category: string
}

const categories = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'BAKPIA', label: 'Bakpia' },
  { id: 'ROTI', label: 'Roti' },
]

export function ProductsSection() {
  const [selectedCategory, setSelectedCategory] = useState('semua')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const { addItem } = useCart()

  const getDataBakpia = async () => {
    try {
      const result = await getAllActiveProducts()
      console.log('Fetched products:', result.data.data)
      if (result.data) {
        setAllProducts(result.data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDataBakpia()
  }, [])

  // Inside your component
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'semua') return allProducts;
    console.log("Selected:", selectedCategory)
    return allProducts.filter((p) => {
      const slug = p.category.trim();
      return slug === selectedCategory;
    });
  }, [allProducts, selectedCategory]);

  const handleAddToCart = (id: string) => {
    const product = allProducts.find((p) => p.id === id)
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
  }

  return (
    <section id="products" className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance mb-12">
          Koleksi produk Kami
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories Filter */}
          <aside className="w-full lg:w-48 flex-shrink-0">
            <div className="bg-card rounded-lg p-6 shadow-sm h-fit sticky top-20">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Kategori
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-muted'
                      }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Product Grid */}
          <main className="flex-1">
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
                  Tidak ada produk yang tersedia untuk kategori ini.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <ProductModal
        product={modalProduct}
        isOpen={modalProduct !== null}
        onClose={() => setModalProduct(null)}
      />
    </section>
  )
}
