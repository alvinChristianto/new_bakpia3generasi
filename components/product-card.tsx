"use client";

import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { randomBytes } from "crypto";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  description: number;
  category: string;
  onAddToCart: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  image,
  rating,
  price,
  description,
  category,
  onAddToCart,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(id);
    setTimeout(() => setIsAdding(false), 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const imageSrc = image && image.length > 0 
    ? `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${image[0]}` 
    : "/placeholder.svg";

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative w-full h-64 bg-muted">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          unoptimized // Tambahkan properti ini
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
          {name}
        </h3>

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

        {/* Price */}
        <p className="text-2xl font-bold text-primary mb-4">
          {formatPrice(price)}
        </p>

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
