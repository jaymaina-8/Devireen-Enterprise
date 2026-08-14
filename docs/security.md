# Security Hardening & Implementation Details

This document outlines the security measures implemented in the Devireen Enterprise application, conforming to production best practices.

## 1. Global Security Headers

Global HTTP headers are injected via `next.config.ts` for every response `/(.*)`:

- **Strict-Transport-Security (HSTS):** `max-age=63072000; includeSubDomains; preload`
  Enforces HTTPS connections for 2 years, preventing protocol downgrade attacks.
- **X-Content-Type-Options:** `nosniff`
  Prevents MIME type sniffing, forcing the browser to respect the declared `Content-Type`.
- **X-Frame-Options:** `DENY`
  Protects against Clickjacking by preventing the application from being embedded in an `<iframe>`.
- **Referrer-Policy:** `strict-origin-when-cross-origin`
  Prevents leaking full URL paths in the `Referer` header to cross-origin requests, protecting sensitive tokens in URLs.
- **Permissions-Policy:**
  Disables unnecessary browser APIs (camera, microphone, geolocation, bluetooth, etc.) to limit attack surface and prevent misuse of device features.

## 2. Content Security Policy (CSP)

A strict Content-Security-Policy is enforced to prevent Cross-Site Scripting (XSS) and data injection attacks:

- **`default-src 'self'`**: Only allows loading resources from the same origin by default.
- **`script-src`**: Allows same origin, Google Maps, Google Tag Manager, and Vercel analytics. (`'unsafe-inline'` is used temporarily for Next.js app router hydration).
- **`style-src`**: Allows same origin and Google Fonts.
- **`img-src`**: Allows same origin, Supabase storage, Google Maps, and data/blob URIs for client-side generated images.
- **`connect-src`**: Allows Supabase API, Google Analytics, and Vercel Insights.

## 3. Server Fingerprinting

The `X-Powered-By: Next.js` header has been removed (`poweredByHeader: false` in `next.config.ts`) to obscure implementation details from potential attackers.

## 4. Cookie Security

All authentication session cookies (managed via Supabase SSR in `lib/supabase/server.ts` and `lib/supabase/middleware.ts`) enforce the following attributes:

- `HttpOnly: true` (Prevents client-side JavaScript access to tokens, mitigating XSS token theft)
- `Secure: process.env.NODE_ENV === 'production'` (Ensures cookies are only sent over HTTPS in production)
- `SameSite: lax` (Prevents CSRF attacks while allowing top-level navigation)

## 5. Environment Variable Isolation

The environment variable configuration (`lib/env.ts`) uses Zod validation to ensure secrets never leak to the client bundle. The `SUPABASE_SERVICE_ROLE_KEY` is explicitly restricted to `typeof window === 'undefined'` environments.

## 6. Traffic Management & API Abuse (Phase 3)

- **IMPLEMENTED IN CODE:** A distributed rate-limiting architecture using Upstash Redis protects all vulnerable public endpoints and Server Actions.
- **Profiles:** Distinct profiles (e.g., `PUBLIC_READ`, `PDF_GENERATION`, `ORDER_CREATE`) apply context-aware limits to mitigate DB exhaustion and Vercel compute abuse.
- **Fail-Open/Closed:** Non-destructive reads fail open during Redis outages, while mutations fail closed to guarantee data integrity.
- **Identity:** `x-real-ip` and `x-forwarded-for` headers are securely parsed to identify edge clients.

> **REQUIRES CLOUDFLARE DASHBOARD VERIFICATION:**
> Cloudflare must be configured to cache static assets, enforce WAF rules, and challenge automated traffic targeting `/api/quote/*` and `/api/invoice/*`.

> **REQUIRES PRODUCTION ENVIRONMENT CONFIGURATION:**
> `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` must be provisioned in the Vercel production environment.

## Future Hardening Plans

- **Penetration Testing:** Schedule automated vulnerability scanning (e.g., OWASP ZAP) and manual audits.
- **Nonce Implementation for CSP:** Transition away from `'unsafe-inline'` in `script-src` by injecting cryptographic nonces per request.
