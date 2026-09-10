# Sprint 1 — Wholesale Checkout Pricing Integrity Fix

## Objective

Fix the confirmed Devireen Enterprise wholesale checkout pricing defect end-to-end.

### Current production defect

A customer can:

1. Open the public Wholesale page.
2. Add a wholesale product to the cart.
3. See the correct wholesale price in the cart and checkout UI.
4. Submit the order.
5. Have the server re-price the item using the retail price.
6. Receive an order confirmation and invoice containing the retail price.

Example:

- Retail price: KSh 280
- Wholesale price: KSh 200
- Customer sees: KSh 200
- Customer submits order
- Server currently persists: KSh 280

This must be fixed without weakening the existing server-side pricing authority.

---

# 1. Non-Negotiable Engineering Rules

## 1.1 Never trust client-supplied prices

The browser may send pricing intent/context, but it must NEVER be treated as the authoritative price.

The server must:

- fetch the product from the database;
- validate the requested pricing mode;
- validate wholesale eligibility;
- resolve the authoritative price from the database;
- calculate the authoritative subtotal;
- persist only the server-resolved price.

Do NOT restore the old insecure behavior of trusting `unitPrice` from the client.

## 1.2 Do not silently fall back from invalid wholesale to retail

If an item explicitly requests:

```ts
pricingMode: 'WHOLESALE';
```

but fails wholesale eligibility, do NOT silently charge the customer the retail price.

Reject the order with a clear validation error.

## 1.3 Preserve retail behavior

Normal retail product-page checkout must continue to work exactly as before.

A retail item must resolve to:

```text
sale_price when valid > 0
otherwise price
```

according to the existing authoritative pricing logic.

## 1.4 Wholesale context must survive the entire pipeline

The following must remain consistent:

```text
Wholesale Product
    ↓
ProductCard
    ↓
Cart
    ↓
LocalStorage hydration
    ↓
Cart UI
    ↓
Checkout
    ↓
Server Action
    ↓
Order Repository
    ↓
Database RPC
    ↓
orders
    ↓
order_items
    ↓
Invoice
    ↓
WhatsApp / confirmation
```

No layer may infer wholesale status from a generic `price` field.

## 1.5 Do not create a second pricing system

There must be one explicit purchasing-context representation:

```ts
type PricingMode = 'RETAIL' | 'WHOLESALE';
```

Reuse an existing canonical type if one already exists.

---

# 2. First Step — Inspect Before Modifying

Before changing code:

1. Inspect the current repository structure.
2. Inspect every file listed below.
3. Search repository-wide for:
   - `wholesaleMode`
   - `pricingModel`
   - `pricing_mode`
   - `wholesalePrice`
   - `wholesale_price`
   - `wholesale_unit`
   - `order_items`
   - `create_order_rpc`
   - `convert_quote_to_order_rpc`
   - `addItem`
   - `CreateOrderPayload`
   - `unitPrice`
4. Identify every caller of:
   - `ProductCard`
   - `addItem`
   - `createPublicOrderAction`
   - `createOrder`
   - `create_order_rpc`
   - `convert_quote_to_order_rpc`
5. Do not assume the audit is complete if additional pricing paths exist.

Primary files:

```text
app/(public)/wholesale/page.tsx
components/products/ProductCard.tsx
lib/store/quote-cart.ts
components/cart/CartItemRow.tsx
components/cart/QuoteItem.tsx
app/(public)/cart/CheckoutPage.tsx
actions/order.actions.ts
lib/supabase/repositories/order.repository.ts
lib/services/invoice.service.ts
types/database.types.ts
supabase/migrations/*
```

Also inspect related schemas, RPC callers, quote conversion code, tests, and generated database types.

---

# 3. Canonical Pricing Type

Create or reuse a canonical shared type:

```ts
export type PricingMode = 'RETAIL' | 'WHOLESALE';
```

Use it consistently in:

- cart state;
- cart items;
- checkout payload;
- server payload;
- order item persistence;
- repository pricing logic.

Do not create competing values such as `bulk`, `wholesale`, `Wholesale`, or `isWholesale` as substitutes for the canonical purchasing context.

---

# 4. Fix the Wholesale Product Page

## File

```text
app/(public)/wholesale/page.tsx
```

The current defect is conceptually:

```tsx
<ProductCard price={product.wholesale_price} originalPrice={product.price} />
```

This disguises wholesale price as generic product price.

Change the data flow so the component receives explicit context:

```tsx
<ProductCard
  ...
  price={product.price}
  wholesalePrice={product.wholesale_price}
  wholesaleUnit={product.wholesale_unit}
  pricingMode="WHOLESALE"
/>
```

Requirements:

- `price` means retail/base price.
- `wholesalePrice` means database wholesale price.
- `wholesaleUnit` is preserved.
- `pricingMode` explicitly identifies wholesale.
- Keep the existing wholesale eligibility filtering.
- Keep `show_in_wholesale` and active/deleted checks.
- Do not make every product wholesale merely because a wholesale price exists.

The displayed wholesale price must remain the wholesale price.

---

# 5. Fix ProductCard

## File

```text
components/products/ProductCard.tsx
```

Extend the component contract to support explicit purchasing context.

Conceptually:

```ts
interface ProductCardProps {
  ...
  price: number;
  wholesalePrice?: number | null;
  wholesaleUnit?: string | null;
  pricingMode?: PricingMode;
}
```

Use the project's canonical type.

When adding an item:

```ts
addItem({
  id,
  name,
  sku,
  price,
  wholesalePrice: wholesalePrice ?? null,
  wholesaleUnit: wholesaleUnit ?? null,
  pricingMode,
  imageUrl,
  quantity: addQuantity,
});
```

Do NOT overwrite `price` with `wholesalePrice`.

For retail callers:

```text
price = retail price
pricingMode = RETAIL
```

For wholesale callers:

```text
price = retail price
wholesalePrice = wholesale price
pricingMode = WHOLESALE
```

If `pricingMode` is optional for compatibility, default it to `RETAIL`, never infer it from price fields.

Audit and update all ProductCard callers.

---

# 6. Refactor the Cart Store

## File

```text
lib/store/quote-cart.ts
```

The current global:

```ts
wholesaleMode: boolean;
```

is insufficient because pricing context belongs to individual cart lines.

## CartItem

Refactor the item model to include:

```ts
interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  wholesalePrice?: number | null;
  wholesaleUnit?: string | null;
  pricingMode: PricingMode;
  imageUrl?: string | null;
  quantity: number;
}
```

Preserve any existing required fields.

## Item identity

Current behavior matches only:

```ts
i.id === item.id;
```

This is wrong.

Use product ID + pricing mode:

```ts
const existingItem = state.items.find(
  (i) => i.id === item.id && i.pricingMode === item.pricingMode
);
```

Therefore:

```text
Product A + RETAIL
Product A + WHOLESALE
```

must coexist as separate lines.

But repeated additions of:

```text
Product A + WHOLESALE
```

must merge quantities.

## Remove dead global wholesale state

Do not make `toggleWholesaleMode()` or `setWholesaleMode()` the solution.

If no legitimate code needs them, remove them.

If retained for compatibility, they must not determine checkout pricing.

Item-level `pricingMode` is the source of truth.

---

# 7. LocalStorage Migration

Existing carts may have the old schema.

Use the existing Zustand persistence/versioning mechanism if available.

Legacy items without pricing context should safely migrate with:

```ts
pricingMode ?? 'RETAIL';
```

Do NOT attempt to guess old wholesale context from the numeric value of `price`.

The old model cannot reliably distinguish those carts because wholesale price was stored in `price`.

Therefore:

- new wholesale items must explicitly store `WHOLESALE`;
- ambiguous legacy items default safely to `RETAIL`;
- preserve existing cart data where possible;
- increment persistence version when appropriate.

Also preserve:

```text
wholesalePrice
wholesaleUnit
pricingMode
```

for new wholesale items across refreshes.

---

# 8. Cart UI

Update:

```text
components/cart/CartItemRow.tsx
components/cart/QuoteItem.tsx
```

Use explicit pricing context:

```ts
const effectivePrice =
  item.pricingMode === 'WHOLESALE' && item.wholesalePrice != null
    ? item.wholesalePrice
    : item.price;
```

For valid wholesale items:

- show wholesale price;
- show wholesale unit;
- show a Wholesale indicator/badge;
- calculate subtotal using wholesale price;
- preserve quantity correctly.

For retail items:

- show retail price;
- retain existing retail unit behavior;
- do not show wholesale badge.

Do not determine wholesale status merely from `wholesalePrice != null`.

---

# 9. Checkout Page

## File

```text
app/(public)/cart/CheckoutPage.tsx
```

Remove the obsolete global `wholesaleMode` as the pricing authority.

Submit per-item pricing context:

```ts
items: items.map((item) => ({
  productId: item.id,
  quantity: item.quantity,
  pricingMode: item.pricingMode,
}));
```

Do not rely on client `unitPrice` for authoritative pricing.

If the current API temporarily requires `unitPrice`, it must be treated only as a client estimate/reference and ignored for authoritative calculation.

## Order-level pricing model

The current database has an order-level:

```text
RETAIL | WHOLESALE
```

but carts can contain mixed pricing contexts.

The preferred architecture is:

- item-level `pricing_mode` is authoritative;
- retain order-level `pricing_model` only for compatibility/summary where necessary;
- if `MIXED` is introduced, update the database constraint/enum, every RPC, type, query, invoice path, admin path, and test;
- never introduce `MIXED` only in frontend TypeScript while leaving SQL constraints unchanged.

Do not let an order-level flag override per-item pricing.

---

# 10. Server Action

## File

```text
actions/order.actions.ts
```

Update the validation schema for public order creation.

Each item must contain:

```ts
pricingMode: 'RETAIL' | 'WHOLESALE';
```

Reject:

- invalid pricing mode;
- invalid product ID;
- invalid quantity;
- missing pricing mode for new payloads.

Do not trust:

```text
unitPrice
totalAmount
```

as authoritative values.

The repository must recompute them.

---

# 11. Server-Side Pricing Authority

## File

```text
lib/supabase/repositories/order.repository.ts
```

This is the critical security and correctness layer.

For every item, resolve price independently.

## Retail

For:

```ts
pricingMode === 'RETAIL';
```

use the existing authoritative retail rule:

```text
sale_price when valid and > 0
otherwise price
```

from the database.

## Wholesale

For:

```ts
pricingMode === 'WHOLESALE';
```

validate all applicable wholesale invariants.

At minimum:

```text
wholesale_price exists
wholesale_price > 0
show_in_wholesale = true
is_active = true
deleted_at IS NULL
stock_status != DISCONTINUED
```

Then validate the actual wholesale quantity/packaging rules that are represented by the project's data model.

### Important: do not invent quantity semantics

The audit found:

```text
wholesale_unit
```

is currently a display string such as:

```text
Dozen
Box
```

There is no confirmed numeric pack-size field.

Do not parse `"Dozen"` into `12` unless an explicit business rule/schema supports that behavior.

Preserve the existing established semantics for Sprint 1.

If a formal minimum/multiple rule exists elsewhere in the repository, enforce it server-side.

If it does not exist, document the missing business rule rather than guessing.

## Critical behavior

If wholesale validation fails:

```text
REJECT THE ORDER
```

Do NOT silently fall back to retail.

---

# 12. Eliminate the P0 Security Vulnerability

The old model effectively grants wholesale pricing based on:

```ts
payload.pricingModel === 'WHOLESALE';
```

That allows a malicious browser to request wholesale pricing for retail products.

This must be impossible.

A malicious request such as:

```json
{
  "pricingMode": "WHOLESALE"
}
```

must only receive wholesale pricing when the server independently verifies eligibility.

Otherwise reject it.

The server must never accept a browser-supplied price as proof of wholesale eligibility.

---

# 13. Database Schema

Create a NEW migration under:

```text
supabase/migrations/
```

Do not rewrite already-applied historical migrations.

Add:

```text
public.order_items.pricing_mode
```

Recommended:

```sql
pricing_mode text NOT NULL DEFAULT 'RETAIL'
CHECK (pricing_mode IN ('RETAIL', 'WHOLESALE'))
```

Follow existing project conventions if an enum/check pattern is already established.

The migration must:

1. add the column;
2. preserve existing data;
3. default historical rows to `RETAIL`;
4. add the constraint;
5. update generated/manual DB types;
6. update relevant RPCs;
7. verify all RPC callers.

Do not delete or corrupt existing orders.

---

# 14. Update `create_order_rpc`

Find the actual current RPC definition.

Do not assume a historical migration file is the only source of truth.

Update the RPC to accept item-level:

```text
pricing_mode
```

and persist it to:

```text
order_items.pricing_mode
```

Continue protecting the database against client-side price manipulation.

The application layer should send server-resolved prices to the RPC.

Preserve the existing subtotal/precision validation.

If the current tolerance is approximately:

```text
ABS(expected - supplied) <= 0.05
```

do not weaken it.

---

# 15. Fix `convert_quote_to_order_rpc`

The audit found this RPC hardcodes:

```text
pricing_model = 'RETAIL'
```

This must be corrected.

Inspect the quote schema first.

Determine where quote pricing context currently lives.

The conversion must preserve actual pricing context.

If quote items support item-level pricing, preserve:

```text
pricing_mode
```

If the quote system currently supports only an order-level model, update it consistently.

Test:

```text
Retail quote → retail order
Wholesale quote → wholesale order
Mixed quote → correct representation if mixed quotes are supported
```

Do not simply replace one SQL literal and leave the conversion architecture broken.

---

# 16. Database Types

Update:

```text
types/database.types.ts
```

and/or regenerate Supabase types using the project's existing workflow.

Verify the generated types for:

```text
order_items.Row
order_items.Insert
order_items.Update
```

contain the new field where appropriate.

Do not create conflicting hand-written types if generated types are authoritative.

---

# 17. Invoice Generation

## File

```text
lib/services/invoice.service.ts
```

The invoice must consume persisted order data.

Use:

```text
order_items.pricing_mode
order_items.unit_price
order_items.quantity
```

as transaction data.

For wholesale items:

- display wholesale unit price;
- display wholesale unit where applicable;
- show wholesale pricing indicator where supported;
- calculate line total as persisted quantity × persisted unit price.

For retail items, retain existing behavior.

CRITICAL:

Do not recalculate historical invoice pricing from the current product catalog.

A historical order must remain financially immutable.

---

# 18. Confirmation and WhatsApp

Inspect all order confirmation and WhatsApp notification paths.

They must use the authoritative persisted order totals.

Do not calculate totals from:

```text
cart.price
product.price
```

Use the persisted order/order-item values.

Verify both:

- customer-facing confirmation;
- admin/business notification.

---

# 19. Price Changes Between Cart and Checkout

The cart is only an estimate.

At checkout:

```text
cart estimate
    ↓
server revalidation
    ↓
authoritative database price
```

If a product's price changes between cart and checkout, the server must win.

Do not silently create an order at a different amount from what the customer reviewed.

If the existing action architecture supports it, return a structured pricing-change response requiring customer review.

Do not create an unrelated checkout subsystem just for this behavior.

---

# 20. Required Automated Tests

Use the repository's existing test framework.

## A — Retail checkout

Product:

```text
retail = 280
wholesale = 200
```

Retail flow:

```text
pricingMode = RETAIL
quantity = 2
```

Expected:

```text
unit_price = 280
total = 560
```

PASS required.

## B — Wholesale checkout

Same product through Wholesale page.

Expected:

```text
pricingMode = WHOLESALE
unit_price = 200
quantity = 2
total = 400
```

Verify:

```text
orders
order_items
confirmation
WhatsApp
invoice
```

all reflect KSh 400.

## C — Malicious wholesale request

Product:

```text
show_in_wholesale = false
wholesale_price = 200
retail = 280
```

Client requests:

```text
pricingMode = WHOLESALE
```

Expected:

```text
ORDER REJECTED
```

Never grant KSh 200.

## D — Missing wholesale price

```text
show_in_wholesale = true
wholesale_price = null
```

Wholesale request must be rejected.

## E — Discontinued product

```text
stock_status = DISCONTINUED
```

Wholesale request must be rejected.

## F — Same product in both contexts

Add:

```text
Product A — RETAIL
Product A — WHOLESALE
```

Expected two separate cart lines.

## G — Same product, same context

Add wholesale Product A twice.

Expected:

```text
one line
quantity = 2
pricingMode = WHOLESALE
```

## H — Refresh

Add wholesale item, refresh browser.

Expected:

```text
pricingMode = WHOLESALE
wholesalePrice preserved
wholesaleUnit preserved
```

## I — Quantity update

Wholesale:

```text
unit price = 200
quantity = 5
```

Expected:

```text
subtotal = 1000
```

Persisted order must contain:

```text
unit_price = 200
quantity = 5
```

## J — Mixed cart

```text
Product A — RETAIL — 280
Product B — WHOLESALE — 200
```

Each line must resolve independently.

No global wholesale flag may affect the entire cart.

## K — Quote conversion

Test:

```text
retail quote → retail order
wholesale quote → wholesale order
```

No inappropriate hardcoded RETAIL.

## L — Invoice

Wholesale order invoice must show:

```text
correct wholesale unit price
correct quantity
correct line total
correct order total
```

---

# 21. Manual End-to-End Verification

Perform a real browser verification after implementation.

## Retail

```text
/product/[slug]
→ Add to cart
→ Cart
→ Checkout
→ Submit
→ Confirmation
→ Invoice
```

Verify retail price throughout.

## Wholesale

```text
/wholesale
→ Add wholesale product
→ Cart drawer
→ Cart page
→ Checkout
→ Submit
→ Confirmation
→ Invoice
```

Use a product where retail and wholesale prices differ, e.g.:

```text
Retail: KSh 280
Wholesale: KSh 200
```

Verify the final persisted order, not just browser display.

## Mixed

```text
Retail Product A
+
Wholesale Product B
→ Cart
→ Checkout
→ Order
→ Invoice
```

Verify each line independently.

## Same product in both contexts

```text
Product A retail
+
Product A wholesale
```

Verify both remain separate lines.

---

# 22. Database Verification

After a wholesale test order:

```sql
select
  id,
  pricing_model,
  subtotal_amount,
  total_amount
from public.orders
where id = '<test-order-id>';
```

Then:

```sql
select
  product_id,
  quantity,
  unit_price,
  pricing_mode
from public.order_items
where order_id = '<test-order-id>';
```

For the wholesale line:

```text
unit_price = authoritative product.wholesale_price
pricing_mode = WHOLESALE
```

Do not consider a UI screenshot proof of financial correctness.

---

# 23. Repository-Wide Post-Fix Audit

After implementation, search again for:

```text
wholesaleMode
```

It must no longer control pricing.

Search for:

```text
pricingModel
pricing_mode
```

and verify order-level and item-level semantics are consistent.

Search for:

```text
item.id ===
```

inside cart deduplication.

Ensure pricing mode is included.

Search for:

```text
unitPrice
```

and ensure client values are not authoritative.

Search for:

```text
pricing_model = 'RETAIL'
```

especially inside quote conversion.

Search for:

```text
product.wholesale_price
```

and classify each use as:

```text
display
eligibility validation
authoritative server pricing
```

No client-only path may bypass server validation.

---

# 24. Do Not Over-Fix

This task is the wholesale pricing pipeline.

Do NOT:

- redesign the entire checkout UI;
- redesign the catalog;
- rewrite invoice styling unnecessarily;
- replace Zustand;
- replace Supabase;
- rewrite the order architecture;
- introduce a new payment gateway;
- create an unrelated pricing service;
- alter retail pricing rules without evidence;
- invent wholesale quantity semantics;
- remove server-side security checks;
- make the test pass by trusting browser prices.

Make the smallest architecturally correct change.

---

# 25. Error Handling

Wholesale validation failures must be explicit and customer-safe.

Examples:

```text
This product is not available for wholesale ordering.
```

```text
Wholesale pricing is not currently available for this product.
```

```text
This product is no longer available.
```

Do not expose SQL/database errors to customers.

Use the project's structured logging system for server diagnostics.

Do not introduce new `console.log` / `console.error` if structured logging is already established.

---

# 26. Core Data Integrity Invariants

For every newly created order:

```text
order total
=
sum(order_items.quantity × order_items.unit_price)
```

For wholesale:

```text
unit_price = product.wholesale_price
```

only after server-side eligibility validation.

For retail:

```text
unit_price = existing authoritative retail price
```

Invoices must use persisted order-item transaction values.

---

# 27. Acceptance Criteria

The implementation is NOT COMPLETE unless all are true.

## Wholesale

- [ ] Wholesale page explicitly sets `pricingMode = WHOLESALE`.
- [ ] Wholesale price is stored in `wholesalePrice`.
- [ ] Retail price remains in `price`.
- [ ] Wholesale unit is preserved.
- [ ] Cart survives refresh with wholesale context.
- [ ] Checkout submits per-item pricing context.
- [ ] Server validates wholesale eligibility.
- [ ] Server resolves wholesale price authoritatively.
- [ ] `order_items.pricing_mode = WHOLESALE`.
- [ ] Wholesale `unit_price` is persisted.
- [ ] Confirmation shows correct total.
- [ ] WhatsApp/admin notification shows correct total.
- [ ] Invoice shows correct wholesale price and total.

## Retail

- [ ] Retail behavior remains unchanged.
- [ ] Retail orders persist `pricing_mode = RETAIL`.
- [ ] Retail invoices remain correct.

## Mixed carts

- [ ] Retail and wholesale versions of the same product can coexist.
- [ ] Different products can use different pricing modes.
- [ ] No global wholesale flag determines the cart.

## Security

- [ ] Client cannot force wholesale pricing merely by sending `WHOLESALE`.
- [ ] Wholesale eligibility is verified server-side.
- [ ] Client-supplied unit prices are not authoritative.
- [ ] Invalid wholesale intent is rejected rather than silently converted to retail.

## Database

- [ ] `order_items.pricing_mode` exists.
- [ ] Existing orders remain readable.
- [ ] `create_order_rpc` persists item pricing mode.
- [ ] `convert_quote_to_order_rpc` preserves pricing context.
- [ ] Database constraints remain valid.
- [ ] Database types are synchronized.

## Regression

- [ ] Public product pages work.
- [ ] Cart works.
- [ ] Quote flow works.
- [ ] Invoice generation works.
- [ ] Typecheck passes.
- [ ] Build passes.
- [ ] Tests pass.
- [ ] Lint passes if configured.
- [ ] No obsolete wholesale state remains as a pricing authority.

---

# 28. Required Final Engineering Report

When implementation is complete, do NOT simply say `Done`.

Report:

## Files changed

List every modified file.

## Database migrations

List:

- migration filename;
- schema changes;
- RPC changes.

## Pricing architecture

Show:

```text
Wholesale page
→ ProductCard
→ Cart
→ Checkout
→ Server validation
→ Authoritative pricing
→ Database
→ Invoice
```

## Security

Explain exactly how the P0 vulnerability was removed.

Demonstrate why:

```text
pricingMode = WHOLESALE
```

alone cannot obtain wholesale pricing.

## Test results

Report:

```text
Retail checkout: PASS/FAIL
Wholesale checkout: PASS/FAIL
Mixed cart: PASS/FAIL
Same product dual context: PASS/FAIL
Refresh persistence: PASS/FAIL
Quantity update: PASS/FAIL
Malicious wholesale request: PASS/FAIL
Quote conversion: PASS/FAIL
Invoice: PASS/FAIL
```

## Validation

Report:

```text
Typecheck: PASS/FAIL
Build: PASS/FAIL
Tests: PASS/FAIL
Lint: PASS/FAIL
```

## Remaining issues

If wholesale quantity/packaging rules are not formally represented in the current database/business model, explicitly identify that as a separate unresolved business-rule issue.

Do not claim the whole wholesale system is complete if a real business requirement remains undefined.

---

# Final Instruction

Implement this as a production-grade repair.

The central invariant is:

> **Pricing context may come from the client, but pricing authority must always remain on the server.**

The customer must see one consistent transaction:

```text
Wholesale price in product page
        ↓
Wholesale price in cart
        ↓
Wholesale price in checkout
        ↓
Server validates wholesale eligibility
        ↓
Server resolves wholesale price
        ↓
Wholesale price persisted in order_items
        ↓
Wholesale price in confirmation
        ↓
Wholesale price in WhatsApp notification
        ↓
Wholesale price in invoice
```

For retail:

```text
Retail price
        ↓
Retail cart
        ↓
Retail checkout
        ↓
Server resolves retail price
        ↓
Retail order
        ↓
Retail invoice
```

Do not declare success merely because the browser now displays KSh 200.

Success means the **authoritative persisted order** contains KSh 200 for a valid wholesale purchase and the complete downstream financial/document pipeline reflects that same value.
