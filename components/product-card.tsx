"use client";

import Image from "next/image";
import { Star, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscountedPrice } from "@/components/discounted-price";
import { useState } from "react";
import { Product } from "@/app/types/product";

interface ProductCardProps extends Product {
  onAddToCart: (id: string) => void;
  onOpenModal: () => void;
}

export function ProductCard({
  id,
  name,
  image,
  rating,
  price,
  original_price,
  discount_label,
  discount_source,
  description,
  category,
  flavor,
  onAddToCart,
  onOpenModal,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(id);
    setTimeout(() => setIsAdding(false), 300);
  };

  const imageSrc = image && image.length > 0
    ? `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${image[0]}`
    : "/placeholder.svg";

  const hasDiscount = original_price != null && original_price > price;

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Product Image — clickable */}
      <button
        onClick={onOpenModal}
        className="relative w-full h-64 bg-muted block overflow-hidden group"
        aria-label={`Lihat detail ${name}`}
      >
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        {hasDiscount && discount_source === "flash_sale" && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            Flash Sale
          </span>
        )}
      </button>

      {/* Product Info */}
      <div className="p-4">
        {/* Title — clickable */}
        <button
          onClick={onOpenModal}
          className="text-left w-full"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </button>

        {/* Flavor */}
        {flavor && (
          <Badge variant="secondary" className="mb-2">
            {flavor}
          </Badge>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating}/5
          </span>
        </div>

        {/* Price — strike-through original when discounted */}
        <div className="mb-4">
          <DiscountedPrice
            price={price}
            originalPrice={original_price}
            discountLabel={hasDiscount ? discount_label : null}
          />
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isAdding ? "Menambahkan..." : "Tambah ke Keranjang"}
        </Button>
      </div>
    </div>
  );
}
