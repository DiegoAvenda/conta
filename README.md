# Contaco

> Todo tu restaurante en un solo ticket — POS, online ordering, expenses, and Mexican SAT (RESICO) tax reporting in one SaaS platform for small restaurants.

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploys_on-Vercel-black?logo=vercel&logoColor=white)

## What it is

Contaco replaces the patchwork of tools a small restaurant juggles (a POS here, spreadsheets there, a separate invoicing flow) with a single system that connects daily operations to financial and tax information:

- **Sell** — in-house POS and commission-free online storefront.
- **Operate** — live kitchen order pipeline, menu and store management.
- **Comply** — expense/CFDI tracking, monthly fiscal summaries, and a step-by-step SAT registration guide (RESICO regime).

The UI is fully bilingual (Spanish / English) and every authenticated page ships with a **demo mode**: visitors explore the whole app with realistic sample data — no account required — plus a guided walkthrough that highlights each feature page by page.

## Feature tour

### Restaurant operations

| Area                             | What it does                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **POS** (`/pos`)                 | Cart-based point of sale with dine-in / takeout modes, table numbers, cash & card payments, automatic 16% IVA totals                            |
| **Orders / Kitchen** (`/orders`) | Order lifecycle `pending → preparing → ready → completed`, filters by status, channel, order type and payment status; mark paid, refund, cancel |
| **Menu** (`/configure-menu`)     | Menu-item CRUD with categories and image uploads (Cloudflare R2)                                                                                |
| **My store** (`/mi-restaurante`) | Public storefront profile: custom slug (`contaco.store/tu-enlace`), hero image, delivery toggle                                                 |

### Finance & SAT

| Area                                        | What it does                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard** (`/dashboard`)                | Monthly P&L: sales, expenses, estimated profit, IVA trasladado vs. acreditable, payment-method breakdown, recent movements |
| **Expenses** (`/egresos`)                   | Manual expense capture plus CFDI (XML) invoice parsing for deductible expenses                                             |
| **Monthly SAT close** (`/sat-monthly`)      | RESICO fiscal summary with copy-ready amounts for the SAT portal                                                           |
| **SAT registration guide** (`/inscripcion`) | Illustrated step-by-step onboarding for getting set up with the SAT                                                        |

### Customer-facing storefront

- Public menu at `/{slug}/menu`, cart, and Stripe Checkout with webhook fulfillment
- Order tracking at `/{slug}/profile`, WhatsApp Cloud API ordering integration

### Platform

- Auth via Better Auth (email/password + Google OAuth), protected routes, per-user data isolation
- Unit-tested fiscal logic (`node:test`): progressive RESICO rate tables per Art. 113-E LISR, ledger entries, monthly summaries
- Demo mode + floating guided tutorial that positions itself next to each feature and advances across pages

## Tech stack

| Layer           | Choice                              |
| --------------- | ----------------------------------- |
| Framework       | SvelteKit 2 + Svelte 5 (runes)      |
| Styling         | Tailwind CSS 4 + DaisyUI 5          |
| Language        | JavaScript (ES modules)             |
| Database        | MongoDB (native driver)             |
| Auth            | Better Auth                         |
| Payments        | Stripe Checkout + webhooks          |
| Storage         | Cloudflare R2 (S3-compatible)       |
| Messaging       | WhatsApp Cloud API (Meta Graph API) |
| i18n            | Custom ES/EN locale store           |
| Testing         | `node:test` + `node:assert`         |
| Deploy          | Vercel (`adapter-vercel`)           |
| Package manager | pnpm                                |

## Getting started

### Prerequisites

- Node.js 22+
- pnpm
- A MongoDB instance (Atlas or local)
- Optional for full functionality: Stripe, Google OAuth, Cloudflare R2, and WhatsApp API credentials

### 1. Install

```sh
pnpm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```sh
# App
ORIGIN=http://localhost:5173
PROD_ORIGIN=https://your-production-domain.com

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DATABASE=contaco

# Auth (Better Auth + Google OAuth)
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET_NAME=<bucket>
R2_PUBLIC_URL=https://<public-bucket-url>

# WhatsApp (Meta Cloud API, optional)
WHATSAPP_ACCESS_TOKEN=<token>
WHATSAPP_PHONE_NUMBER_ID=<phone-number-id>
WHATSAPP_TEST_NUMBER=<e164-test-number>
```

> Demo mode, the landing page, and the SAT guide work without any credentials. Auth, payments, and uploads require their respective variables.

### 3. Run

```sh
pnpm dev        # development server
pnpm build      # production build
pnpm preview    # preview the production build
```

### 4. Test & lint

```sh
node --test tests/              # fiscal + ledger unit tests
pnpm lint                       # prettier check + eslint
pnpm format                     # auto-format
```

## Project structure

```
src/
├── routes/                    # SvelteKit routes (pages + API)
│   ├── pos/                   # Point of sale
│   ├── orders/                # Kitchen order pipeline
│   ├── configure-menu/        # Menu CRUD
│   ├── mi-restaurante/        # Storefront settings
│   ├── dashboard/             # Monthly P&L
│   ├── egresos/               # Expenses + CFDI
│   ├── sat-monthly/           # RESICO monthly close
│   ├── inscripcion/           # SAT registration guide
│   ├── (store)/[slug]/        # Public storefront (menu, checkout, tracking)
│   ├── api/stripe/            # Checkout + webhook fulfillment
│   ├── api/whatsapp/          # Order webhook
│   └── api/meta/              # WhatsApp test tooling
├── lib/
│   ├── server/                # DB, auth, fiscal, sales, invoices, CFDI, R2
│   ├── demo/                  # Sample data + tutorial steps (demo mode)
│   ├── components/            # Navbar, Footer, tutorial overlay, store UI
│   └── i18n/                  # ES/EN dictionaries + locale store
├── hooks.server.js            # Session, locale, route protection
tests/                         # node:test suites (fiscal, ledger)
scripts/                       # One-off ops (e.g. legacy order migration)
```

## How demo mode works

Unauthenticated visitors get realistic sample data from `src/lib/demo/data.js` served directly by each page's `load` function — no database needed. `TutorialOverlay.svelte` reads per-route steps from `src/lib/demo/tutorialSteps.js`, anchors a tooltip next to each feature's DOM selector (with a fixed-position fallback), and advances across the full page flow (`/ → /pos → /orders → /dashboard → /egresos → /sat-monthly → /configure-menu → /mi-restaurante`). Signing in hides the tutorial and swaps in the user's real data.

## Deployment

The app targets Vercel via `@sveltejs/adapter-vercel`. Set the same environment variables from `.env` in the Vercel project dashboard (production values, `PROD_ORIGIN` pointing at the production domain), then deploy from `main`. Stripe webhooks must point at `/api/stripe/webhook` with the matching `STRIPE_WEBHOOK_SECRET`.

## Notes & scope

- Fiscal figures are **estimates** for operational guidance — every SAT-related view states that amounts must be validated against the official SAT portal.
- Refunds deduct the pre-IVA base (not the charged total) so revenue is never understated; cancellations are ledger-tracked separately.
- Menu titles/descriptions are length-capped to stay compatible with WhatsApp list-message limits.
