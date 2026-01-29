'use client';

import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10">
      <Image
        src="/bakpia-hero.jpg"
        alt="Bakpia Jogja Istimewa - Premium Indonesian Bakpia"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-balance max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            The Authentic Taste of Jogja, Delivered to You
          </h1>
          <p className="text-lg text-white/90 mb-8 drop-shadow-md">
            Premium handcrafted Bakpia made with traditional recipes and the finest ingredients
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  )
}
