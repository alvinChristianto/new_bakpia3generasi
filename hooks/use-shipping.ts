import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddressData } from "@/types/address";

interface ShippingState {
  address: AddressData | null;
  setAddress: (address: AddressData) => void;
  clearAddress: () => void;

  /** Convenience getter: shipping cost in IDR (0 for pickup) */
  shippingCost: number;
}

export const useShipping = create<ShippingState>()(
  persist(
    (set, get) => ({
      address: null,

      setAddress: (address: AddressData) => set({ address }),

      clearAddress: () => set({ address: null }),

      get shippingCost() {
        const addr = get().address;
        if (!addr) return 0;
        if (addr.type === "pickup") return 0;
        return Number(addr.courier.cost) || 0;
      },
    }),
    {
      name: "shipping-storage",
    },
  ),
);
