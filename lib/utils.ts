import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** IDR currency formatting with the id-ID locale — Balinese prices have no decimals. */
export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Resolve a backend-stored media path (or already absolute URL) into a
 * loadable <Image> src. Handles backend-hosted `/storage/...` uploads.
 */
export function resolveBackendAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith("http")) return path
  if (path.startsWith("/")) return `${process.env.NEXT_PUBLIC_BE_ROUTE}${path}`
  return `${process.env.NEXT_PUBLIC_BE_ROUTE}/storage/${path}`
}
