# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured — verify changes manually in the browser.

## Architecture

**Bakpia Master** is a Next.js 15 (App Router) e-commerce storefront for an Indonesian bakpia shop. The frontend is a pure client for a separate **Laravel 11 + Posgresql backend** running at `http://127.0.0.1:8000`.

### Backend Communication

All Laravel API calls use the axios client in `app/api/client.ts`, which sets `NEXT_PUBLIC_BE_ROUTE` as the base URL. Endpoint functions live in `app/api/endpoints/`.

KiriminAja (shipping provider) calls are **never made directly from the browser**. They are proxied through `app/api/kiriminaja/[...path]/route.ts`, which injects the `KIRIMINAJA_API_KEY` server-side and forwards requests to `KIRIMINAJA_BASE_URL`. The browser-side functions in `lib/kiriminaja.ts` call `/api/kiriminaja/...`.

### Authentication

Uses **next-auth v5** (beta) with Google OAuth only. On successful Google sign-in, `auth.ts` immediately POSTs the OAuth identity to the Laravel backend (`/api/auth/google/callback`), which returns a Laravel Sanctum `access_token`. That token is attached to the JWT and surfaced on the session as `session.accessToken`. Route protection for `/dashboard/**` is handled by `middleware.ts`.

### State Management

Two independent stores:

- **Cart** (`components/cart-provider.tsx`) — React Context, persisted to `localStorage` under key `bakpia-cart`. Access via `useCart` from `hooks/use-cart.ts`.
- **Shipping/Address** (`hooks/use-shipping.ts`) — Zustand `persist` store, saved to `localStorage` under key `shipping-storage`. Holds a `AddressData` union (`delivery | pickup`). When the cart quantity changes, only the courier is cleared (not the full address) so the user only needs to re-select courier.

### Checkout Flow

`app/checkout/page.tsx` orchestrates the full purchase:
1. Collects customer info (`CheckoutForm`) and address/courier (`AddressEditor`).
2. Shipping cost comes from the selected `SelectedCourier` in the Zustand store.
3. Tax is hardcoded as 10% of subtotal, labeled "Biaya Admin".
4. On submit, calls `checkoutOrder` → Laravel `/api/midtranstokenv1`, which returns a Midtrans `snap_token`.
5. Midtrans Snap JS (loaded via `<Script>`) handles the payment UI.

### Shipping Calculation

`lib/kiriminaja.ts` calls `getExpressPricing` with a hardcoded warehouse origin (`origin: 6983`, `subdistrict_origin: 31409`). Package dimensions are calculated in `lib/package-dimensions.ts` — boxes stack vertically, so only height scales with quantity.

### UI

Built with **shadcn/ui** (Radix UI primitives + Tailwind CSS v4). Component configuration is in `components.json`. UI primitives are in `components/ui/`. All currency is formatted as Indonesian Rupiah (`id-ID` locale).

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BE_ROUTE` | Laravel backend URL (e.g. `http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_FE_ROUTE` | Frontend URL |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials |
| `AUTH_SECRET` | next-auth session secret |
| `KIRIMINAJA_API_KEY` | Server-only KiriminAja API key |
| `KIRIMINAJA_BASE_URL` | KiriminAja base URL (sandbox: `https://tdev.kiriminaja.com`) |
| `NEXT_PUBLIC_MIDTRANS_CLIENTKEY` | Midtrans client key (browser) |
| `NEXT_PUBLIC_SNAP_URL` | Midtrans Snap JS URL |

## Next.js Image Configuration

`next.config.ts` allows remote images from `http://127.0.0.1:8000` under `/api/**`, `/partners/**`, and `/storage/**` paths. Product images in the cart use `NEXT_PUBLIC_BE_ROUTE + /storage/` as their base.
