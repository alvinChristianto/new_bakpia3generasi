# CLAUDE.md — `FE-bakpia` (Frontend)

Guidance for Claude Code when working inside the Next.js storefront. For cross-repo rules (auth flow, gateway boundaries, IDR locale, etc.), see `../CLAUDE.md`.

## Purpose

**Bakpia Master** — a Next.js 16 (App Router) e-commerce storefront for an Indonesian bakpia shop. This is a pure client of the Laravel backend at `../bakpiajurnal/`; it owns no business data, only UX state (cart, courier selection).

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run the production build
npm run lint     # ESLint
npx vitest       # Unit tests (Vitest)
```

Unit tests live in `app/api/endpoints/*.test.ts` (Vitest). **Also verify changes manually in the browser** before reporting a task as done. Check the golden path (browse → cart → checkout → payment) and watch for regressions in other flows.

## Stack

- **Next.js 16** (App Router) with **React 19**
- **next-auth v5 (beta)** — Google OAuth **and** email/password (Credentials); unified per email
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives in `components/ui/`)
- **Zustand** (in-memory, not persisted) for shipping/address state; **React Context** for cart
- **axios** for backend calls
- **react-hook-form** + **zod** for forms and validation
- **sonner** for toasts; **lucide-react** for icons

## Directory Map

| Path | Role |
|---|---|
| `app/` | App Router pages — `page.tsx`, `checkout/`, `dashboard/`, `login/`, `register/`, `payment-success/`, `tentang-kami/`, `not-found.tsx`. |
| `app/dashboard/orders/` | Order list with status filters. |
| `app/dashboard/orders/[invoice]/` | Order detail page with KiriminAja shipping tracking timeline. |
| `app/dashboard/edit-profile/` | Edit display name and email for the logged-in customer. |
| `app/dashboard/edit-addresses/` | Manage saved delivery addresses. |
| `app/api/client.ts` | Single axios instance using `NEXT_PUBLIC_BE_ROUTE` as base URL. |
| `app/api/endpoints/` | One module per backend call — `all_active_products.ts`, `checkout.ts`, `transaction_by_invoicenumber.ts`, `profile.ts`. |
| `app/api/auth/` | next-auth route handler. |
| `app/api/kiriminaja/[...path]/route.ts` | **Server-side proxy** to KiriminAja. Injects `KIRIMINAJA_API_KEY`; the browser must never call upstream directly. |
| `app/types/` | Shared TypeScript types. |
| `auth.ts` | next-auth v5 config. Exchanges Google identity for a Laravel Sanctum token via `/api/auth/google/callback`. |
| `middleware.ts` | Gates `/dashboard/**` behind a logged-in session. |
| `components/` | Feature components (`cart-sidebar`, `checkout-form`, `address-editor`, `product-card`, `navbar`, etc.). |
| `components/ui/` | shadcn primitives — don't hand-roll, install via `npx shadcn@latest add <name>`. |
| `components/providers/` | Top-level providers (theme, session, cart). |
| `hooks/` | `use-cart.ts` (Context wrapper), `use-shipping.ts` (Zustand, in-memory). |
| `lib/kiriminaja.ts` | Browser-side wrappers that call `/api/kiriminaja/...` (the proxy, not upstream). |
| `app/api/endpoints/shipping.ts` | Shipping-price quote call to Laravel (`POST /api/shipping/pricing`). Dimensions/origin are computed backend-side. |
| `lib/utils.ts` | `cn()` and other shared helpers. |

## Backend Communication

All Laravel calls go through `app/api/client.ts` (axios, `baseURL = NEXT_PUBLIC_BE_ROUTE`). Endpoint functions belong in `app/api/endpoints/<feature>.ts` — one file per backend resource. Do not call axios from components directly; always go through an endpoint module so the surface stays discoverable.

When the backend adds or changes an endpoint, add/update the matching endpoint module here in the same change set.

## Authentication

- **next-auth v5 (beta)** with **two providers**: Google OAuth and email/password (Credentials in `auth.ts`). Both resolve to one identity per email.
- Google sign-in: `auth.ts` POSTs the OAuth identity to Laravel `POST /api/auth/google/callback`. Email/password: the Credentials `authorize` POSTs to `POST /api/login`; on failure it throws a `CredentialsSignin` subclass carrying the backend `error_code` (e.g. `oauth_only`), read as `loginResult.code` on `/login`. Laravel returns a Sanctum `access_token`, stored in the JWT and surfaced as `session.accessToken`.
- Attach the token as `Authorization: Bearer ${session.accessToken}` when calling protected endpoints (`/api/profile`, `/api/orderlists`, `/api/logout`, `/api/profile/linked-accounts`, …).
- Auth surfaces: `app/forgot-password`, `app/reset-password` (also set-password for Google-only), `app/verify-email`, the "Akun Tertaut" tab in `app/dashboard/edit-profile`, and `components/verify-email-banner.tsx`. Endpoint modules: `app/api/endpoints/{password-reset,email-verification,linked-accounts}.ts`.
- Email verification is **informational only** (banner + resend) — it does **not** block checkout.
- Route protection for `/dashboard/**` is in `middleware.ts`.

## State Management

Two independent stores — do not merge them:

- **Cart** — `components/cart-provider.tsx` (React Context), persisted to `localStorage` under key `bakpia-cart`. Access via `useCart` in `hooks/use-cart.ts`.
- **Shipping / Address** — `hooks/use-shipping.ts` (Zustand, **in-memory only — not persisted**). Holds an `AddressData` union (`delivery | pickup`). Survives client-side navigation within the SPA but resets to default (`address: null`) on a full page refresh, so the customer re-selects shipping after a reload. When cart quantity changes, only the courier is cleared — the address is preserved so the user only re-picks a courier.

## Checkout Flow (`app/checkout/page.tsx`)

1. Collect customer info (`CheckoutForm`) and address + courier (`AddressEditor`).
2. Shipping cost comes from the `SelectedCourier` in the Zustand store.
3. Tax line is currently a hardcoded **10% of subtotal**, labeled "Biaya Admin". If this needs to be dynamic, move it to the backend so it's authoritative.
4. On submit, call `checkoutOrder` (`app/api/endpoints/checkout.ts`) → Laravel `POST /api/midtranstokenv1`, which returns a Midtrans `snap_token`.
5. Midtrans Snap JS is loaded via `<Script src={NEXT_PUBLIC_SNAP_URL}>` and handles the payment UI in the browser. The webhook hits Laravel, not this app.

## Shipping (KiriminAja)

- **Coverage area** (province/city/kecamatan/kelurahan dropdowns): browser → `/api/kiriminaja/[...path]/route.ts` → upstream `KIRIMINAJA_BASE_URL`. The key is injected server-side. `lib/kiriminaja.ts` holds these wrappers.
- **Shipping-price quote**: calculated by the **Laravel backend**, not the frontend. The shipping page calls `getShippingPricing` (`app/api/endpoints/shipping.ts` → `POST /api/shipping/pricing`) with just `destination_kecamatan_id`, `destination_kelurahan_id`, `total_qty`, and `item_value`. The warehouse origin and box dimensions live in the backend's `config/kiriminaja.php` as the single source of truth — there is no frontend dimension math. If the bakery changes warehouses or box sizes, update that config.

## UI Conventions

- Built with **shadcn/ui** on top of Radix + Tailwind v4. Config is `components.json`.
- Install new primitives with `npx shadcn@latest add <name>` rather than copying code by hand.
- Currency: always format as IDR with `id-ID` locale (e.g. `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`).
- Indonesian copy is the default UX language; English appears only in code and identifiers.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BE_ROUTE` | Laravel backend base URL (e.g. `http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_FE_ROUTE` | Public frontend URL |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials |
| `AUTH_SECRET` | next-auth session encryption secret |
| `KIRIMINAJA_API_KEY` | **Server-only** KiriminAja API key — never expose to the browser |
| `KIRIMINAJA_BASE_URL` | KiriminAja base URL (sandbox: `https://tdev.kiriminaja.com`) |
| `NEXT_PUBLIC_MIDTRANS_CLIENTKEY` | Midtrans client key (browser-safe) |
| `NEXT_PUBLIC_SNAP_URL` | Midtrans Snap JS URL |

Anything prefixed `NEXT_PUBLIC_` is shipped to the browser. Do not add secrets with that prefix.

## Image Configuration

`next.config.ts` allows remote images from `http://127.0.0.1:8000` under `/api/**`, `/partners/**`, and `/storage/**`. Product images use `NEXT_PUBLIC_BE_ROUTE + /storage/` as their base. If the backend host changes, update both `.env.local` and `next.config.ts.images.remotePatterns`.

## When Adding a Feature

1. If the feature needs new backend data, add the API endpoint in `../bakpiajurnal/` first (see that project's `CLAUDE.md`).
2. Add an endpoint module: `app/api/endpoints/<feature>.ts` — typed request + response, calling `apiClient` from `app/api/client.ts`.
3. Add TypeScript types in `app/types/` (or co-locate with the endpoint).
4. Build the UI:
   - Page → `app/<route>/page.tsx`
   - Reusable piece → `components/<name>.tsx`
   - Use existing shadcn primitives from `components/ui/` before adding new ones.
5. Persist UX state via the existing stores (Cart Context or shipping Zustand). Don't add a third store unless the state genuinely doesn't fit either.
6. For anything under `/dashboard/**`, confirm `middleware.ts` already protects the route.
7. **Run `/ui-check <file>` on every new or modified UI file** and fix all findings before proceeding.
8. Run `npm run lint` and **open the browser** to walk through the new flow before declaring done.

## UI Consistency — Mandatory for Every Frontend Task

The `/ui-check` skill (`../.claude/commands/ui-check.md`) defines the Bakpia design system rules. It **must be applied** to every file that touches UI — new pages, new components, edits to existing ones.

**When to run it:**
- After writing or editing any `page.tsx`, `layout.tsx`, or `*.tsx` component.
- Before marking any frontend task done.

**What it enforces:** color tokens (`bg-card`, `text-muted-foreground`, `border-border`, etc.), typography hierarchy, spacing/layout, card templates, button variants, form patterns, loading skeletons, empty states, status badge config, feedback icons, responsive breakpoints, and z-index.

Quick reference of the most-broken rules:
- Never hardcode `text-gray-*` or `bg-gray-*` — use `text-muted-foreground` / `bg-muted`.
- Every loading branch must show skeleton cards (`animate-pulse`), never the empty-state message.
- All prices: `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)`.
- All buttons follow the three variants: primary (`bg-primary`), outline (`border-border`), destructive (`text-destructive`).

## Things to Avoid

- Don't call KiriminAja from client code — always go through `/api/kiriminaja/[...path]`.
- Don't add a second axios client, a second auth provider, or a second global state library.
- Don't put business logic (pricing, tax, stock) in the frontend — push it to Laravel.
- Don't expose any non-`NEXT_PUBLIC_` env var to client code.
