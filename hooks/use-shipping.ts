import { create } from "zustand";
import type { AddressData } from "../app/types/address";

interface ShippingState {
  address: AddressData | null;
  setAddress: (address: AddressData) => void;
  clearAddress: () => void;
  /**
   * Clears only the courier from a delivery address.
   * Called when cart quantity changes — preserves the full address
   * so user only needs to re-pick courier, not redo the full cascade.
   * No-op if address is pickup or null.
   */
  clearCourier: () => void;
}

export const useShipping = create<ShippingState>()((set, get) => ({
  address: null,

  setAddress: (address: AddressData) => set({ address }),

  clearAddress: () => set({ address: null }),

  clearCourier: () => {
    const current = get().address;
    if (!current || current.type !== "delivery") return;
    set({
      address: {
        ...current,
        courier: null,
      },
    });
  },
}));

/** Derive shipping cost from address — use in components, not in the store */
export function getShippingCost(address: AddressData | null): number {
  if (!address) return 0;
  if (address.type === "pickup") return 0;
  if (!address.courier) return 0;
  return Number(address.courier.cost) || 0;
}

/** Returns true if delivery address exists but courier has been cleared */
export function isCourierStale(address: AddressData | null): boolean {
  if (!address) return false;
  if (address.type !== "delivery") return false;
  return address.courier === null;
}
