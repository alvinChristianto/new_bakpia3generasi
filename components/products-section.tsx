'use client'

import { useState } from 'react'
import { ProductCard } from './product-card'
import { useCart } from '@/hooks/use-cart'

interface Product {
  id: string
  title: string
  image: string
  rating: number
  price: number
  category: string
}

const allProducts: Product[] = [
  {
    id: '1',
    title: 'Bakpia Kukus Original - Keju',
    image: '/bakpia-kukus.jpg',
    rating: 4.8,
    price: 55000,
    category: 'Bakpia Kukus',
  },
  {
    id: '2',
    title: 'Bakpia Kukus - Coklat Almond',
    image: '/bakpia-kukus.jpg',
    rating: 4.7,
    price: 60000,
    category: 'Bakpia Kukus',
  },
  {
    id: '3',
    title: 'Bakpia Pathok Premium - Hijau Telur',
    image: '/bakpia-pathok.jpg',
    rating: 4.9,
    price: 65000,
    category: 'Bakpia Pathok',
  },
  {
    id: '4',
    title: 'Bakpia Pathok - Kacang',
    image: '/bakpia-pathok.jpg',
    rating: 4.6,
    price: 62000,
    category: 'Bakpia Pathok',
  },
  {
    id: '5',
    title: 'Edisi Premium - Assorted Box',
    image: '/bakpia-premium.jpg',
    rating: 5.0,
    price: 150000,
    category: 'Edisi Premium',
  },
  {
    id: '6',
    title: 'Edisi Premium - Deluxe Set',
    image: '/bakpia-premium.jpg',
    rating: 4.9,
    price: 200000,
    category: 'Edisi Premium',
  },
]

const categories = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'bakpia-kukus', label: 'Bakpia Kukus' },
  { id: 'bakpia-pathok', label: 'Bakpia Pathok' },
  { id: 'edisi-premium', label: 'Edisi Premium' },
]

export function ProductsSection() {
  const [selectedCategory, setSelectedCategory] = useState('semua')
  const { addItem } = useCart()

  const filteredProducts = selectedCategory === 'semua'
    ? allProducts
    : allProducts.filter((p) => p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory)

  const handleAddToCart = (id: string) => {
    const product = allProducts.find((p) => p.id === id)
    if (product) {
      addItem({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image,
      })
    }
  }

  return (
    <section id="products" className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance mb-12">
          Koleksi Bakpia Kami
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
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
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
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={handleAddToCart}
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
    </section>
  )
}
