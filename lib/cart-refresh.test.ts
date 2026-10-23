import { describe, it, expect } from "vitest";
import { mergeRefreshedCartItem } from "./cart-refresh";
import type { CartItem } from "@/components/cart-provider";
import type { Product } from "@/app/types/product";

const baseCartItem: CartItem = {
  id: "p1",
  name: "Bakpia Kacang",
  price: 20_000,
  image: "olproducts/a.jpg",
  quantity: 2,
};

const baseProduct: Product = {
  id: "p1",
  name: "Bakpia Kacang",
  image: ["olproducts/a.jpg"],
  rating: 5,
  price: 20_000,
  description: "d",
  category: "BAKPIA",
};

describe("mergeRefreshedCartItem", () => {
  it("returns the snapshot untouched when the product is missing/inactive", () => {
    const result = mergeRefreshedCartItem(baseCartItem, [baseProduct]);

    expect(result).toEqual({
      ...baseCartItem,
      original_price: null,
      discount_label: null,
      discount_source: undefined,
      flash_sale_ends_at: undefined,
    });
  });

  it("leaves the line untouched when the cart product was dropped by the lookup", () => {
    const otherProduct: Product = { ...baseProduct, id: "p2" };

    const result = mergeRefreshedCartItem(baseCartItem, [otherProduct]);

    expect(result).toEqual(baseCartItem);
  });

  it("keeps unit price and flags nothing when the price is unchanged", () => {
    const result = mergeRefreshedCartItem(baseCartItem, [baseProduct]);

    expect(result.price).toBe(20_000);
    expect(result.price_changed).toBeUndefined();
  });

  it("flags the line when the live price moved to a normal discount", () => {
    const discountedProduct: Product = {
      ...baseProduct,
      price: 18_000,
      original_price: 25_000,
      discount_type: "percent",
      discount_label: "Diskon 10%",
      discount_source: "normal_discount",
    };

    const result = mergeRefreshedCartItem(baseCartItem, [discountedProduct]);

    expect(result.price).toBe(18_000);
    expect(result.original_price).toBe(25_000);
    expect(result.discount_label).toBe("Diskon 10%");
    expect(result.discount_source).toBe("normal_discount");
    expect(result.flash_sale_ends_at).toBeUndefined();
    expect(result.price_changed).toBe(true);
  });

  it("carries the flash-sale end timestamp for flash-sale wins", () => {
    const flashProduct: Product = {
      ...baseProduct,
      price: 15_000,
      original_price: 20_000,
      discount_type: "percent",
      discount_label: "Flash Sale",
      discount_source: "flash_sale",
      flash_sale_ends_at: "2026-10-22T12:00:00Z",
    };

    const result = mergeRefreshedCartItem(baseCartItem, [flashProduct]);

    expect(result.flash_sale_ends_at).toBe("2026-10-22T12:00:00Z");
    expect(result.discount_source).toBe("flash_sale");
    expect(result.price_changed).toBe(true);
  });

  it("clears stale discount fields when the live price is no longer discounted", () => {
    const staleCart: CartItem = {
      ...baseCartItem,
      price: 18_000,
      original_price: 25_000,
      discount_label: "Flash Sale",
      discount_source: "flash_sale",
      flash_sale_ends_at: "2026-10-22T12:00:00Z",
    };
    const normalProduct: Product = { ...baseProduct, price: 18_000 };

    const result = mergeRefreshedCartItem(staleCart, [normalProduct]);

    expect(result.original_price).toBeNull();
    expect(result.discount_label).toBeNull();
    expect(result.discount_source).toBeUndefined();
    expect(result.flash_sale_ends_at).toBeUndefined();
    expect(result.price_changed).toBeUndefined();
  });
});
