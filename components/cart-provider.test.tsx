import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./cart-provider";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleItem = {
  id: "p1",
  name: "Bakpia Kacang Hijau",
  price: 25000,
  image: "/img.jpg",
};

describe("CartProvider / useCart", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty and reports zero count and subtotal", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.mounted).toBe(true));

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("adds an item the first time and increments quantity on re-add", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.addItem(sampleItem));
    act(() => result.current.addItem(sampleItem));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.cartCount).toBe(2);
    expect(result.current.subtotal).toBe(50000);
  });

  it("updates quantity, and removes the item when quantity drops to 0", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.addItem(sampleItem));
    act(() => result.current.updateQuantity("p1", 5));
    expect(result.current.cart[0].quantity).toBe(5);
    expect(result.current.subtotal).toBe(125000);

    act(() => result.current.updateQuantity("p1", 0));
    expect(result.current.cart).toEqual([]);
  });

  it("clearCart empties the cart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.addItem(sampleItem));
    act(() => result.current.addItem({ ...sampleItem, id: "p2", name: "Bakpia Coklat" }));
    expect(result.current.cart).toHaveLength(2);

    act(() => result.current.clearCart());
    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
  });

  it("persists the cart to localStorage under bakpia-cart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.addItem(sampleItem));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("bakpia-cart") ?? "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ id: "p1", quantity: 1 });
    });
  });

  it("restores a previously persisted cart on mount", async () => {
    localStorage.setItem(
      "bakpia-cart",
      JSON.stringify([{ ...sampleItem, quantity: 3 }]),
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.mounted).toBe(true));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cartCount).toBe(3);
    expect(result.current.subtotal).toBe(3 * sampleItem.price);
  });
});
