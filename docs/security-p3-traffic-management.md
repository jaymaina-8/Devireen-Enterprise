# Security Phase 3: Traffic Management & API Abuse Prevention

## 1. Threat Model

Devireen Enterprise faces potential abuse vectors from automated bots and malicious actors:

- **Resource Exhaustion:** Flooding expensive API endpoints (e.g., PDF generation, database searches) to exhaust Vercel compute billing or Supabase connection pooling.
- **Data Scraping:** Unrestricted access to public product lists and catalog downloads.
- **Application Logic Abuse:** Spamming quote creation or order creation endpoints with fake data.

## 2. Rate-Limit Architecture

The application employs a defense-in-depth approach:

1. **Edge-Level (Cloudflare):** Provides DNS proxying, SSL/TLS termination, WAF, and DDoS protection.
2. **Application-Level (Next.js/Upstash Redis):** A distributed rate limiter protecting API routes and Server Actions.
3. **Database-Level (Supabase):** Native rate limiting for identity endpoints (e.g., Auth sign-ins, SMS, Emails).

## 3. Rate-Limit Profiles

| Profile          | Limit | Window | Usage                                        | Fail Mode (Redis Outage) |
| ---------------- | ----- | ------ | -------------------------------------------- | ------------------------ |
| `PUBLIC_READ`    | 60    | 1m     | Product fetching, catalog browsing           | Fail-open                |
| `SEARCH`         | 20    | 1m     | Public site search                           | Fail-open                |
| `QUOTE_CREATE`   | 5     | 1m     | Creating quotes, requesting wholesale access | Fail-closed              |
| `ORDER_CREATE`   | 5     | 1m     | Checkout, order submission                   | Fail-closed              |
| `PDF_GENERATION` | 10    | 1m     | Invoices, Catalogs, Quotation PDFs           | Fail-open                |
| `AUTH`           | 5     | 1m     | Legacy/custom auth flows                     | Fail-closed              |
| `ADMIN_MUTATION` | 30    | 1m     | Dashboard data entry                         | Fail-closed              |

## 4. Identity Strategy

The rate limiting key is constructed using the requested `RouteProfile` and a unique identifier.
For public and unauthenticated actions, the application extracts the IP using the following precedence:

1. `x-real-ip` (Vercel standard for the immediate client edge)
2. `x-forwarded-for` (first IP in the comma-separated list)
3. Fallback to `127.0.0.1`

For privileged administrative actions (`ADMIN_MUTATION`), the identity is strictly bound to the authenticated user's ID (`admin:{userId}`) instead of their IP. This prevents "noisy neighbor" penalties if multiple administrators work from the same office IP address.

## 5. Protected Endpoints

**API Routes:**

- `GET /api/catalog` (Profile: `PDF_GENERATION`)
- `GET /api/invoice/[orderId]` (Profile: `PDF_GENERATION`)
- `GET /api/quote/[quoteId]` (Profile: `PDF_GENERATION`)
- `GET /api/search` (Profile: `SEARCH`, plus enforced length bounds)

**Server Actions:**

- `createQuote` in `quote.actions.ts` (Profile: `QUOTE_CREATE`)
- `createPublicOrderAction` in `order.actions.ts` (Profile: `ORDER_CREATE`)
- `fetchProducts`, `fetchProductBySlug` in `product.actions.ts` (Profile: `PUBLIC_READ`)
- All administrative mutations in the `actions/` directory (Profile: `ADMIN_MUTATION`)

## 6. Cloudflare Responsibilities (REQUIRES DASHBOARD VERIFICATION)

While the application defends itself, the following edge rules must be active in the Cloudflare dashboard:

- **Rule A:** Challenge automated traffic targeting `/api/quote/*` and `/api/invoice/*` (PDF generation).
- **Rule B:** Protect authentication endpoints (native Supabase rules apply, but edge WAF adds extra layers).
- **Rule C:** Protect `POST` mutations for quote and order endpoints.
- **Rule D:** Cache static assets and wholesale catalogs aggressively, but NEVER cache private invoices or quotes.
- **Rule E:** Challenge or block obvious automated abuse targeting `/api/search` or known endpoints with high anomalous volume.

## 7. Fail-Open vs Fail-Closed Behavior

In the event that the Upstash Redis provider is unreachable or unconfigured:

- **Fail-Open:** Read-heavy and non-destructive routes (`PUBLIC_READ`, `SEARCH`, `PDF_GENERATION`) will allow traffic through to prevent a total outage.
- **Fail-Closed:** Sensitive mutation routes (`ORDER_CREATE`, `QUOTE_CREATE`, `ADMIN_MUTATION`) will throw an error to prevent DB spam and logic abuse.

## 8. Environment Variables

The following server-side environment variables are required:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

These are validated via Zod on application boot and are never exposed to the client.
