# API Design (E-commerce)

**Base URL**: `/api/v1`
**Auth**: Bearer JWT in `Authorization: Bearer <token>`
**Roles**: `customer`, `staff`, `admin` (RBAC via permissions)

## Conventions
- Dates are ISO 8601.
- Money fields are in decimal VND and must be consistent across services.
- List endpoints support pagination: `page`, `limit`, `sort`, `q`.
- Standard error shape:
```json
{ "message": "string", "code": "string", "details": {} }
```

## Auth
**POST** `/auth/register`
Body:
```json
{ "name": "string", "email": "string", "password": "string", "phone": "string" }
```
Response:
```json
{ "token": "string", "user": { "id": "string", "email": "string", "roles": ["string"] } }
```

**POST** `/auth/login`
Body:
```json
{ "email": "string", "password": "string" }
```
Response:
```json
{ "token": "string", "user": { "id": "string", "email": "string", "roles": ["string"] } }
```

**POST** `/auth/logout`
Auth required.

**POST** `/auth/refresh`
Public.

**GET** `/auth/me`
Auth required.

## Users
**GET** `/users/me`
Auth required.

**PATCH** `/users/me`
Auth required. Body:
```json
{ "name": "string", "phone": "string" }
```

**PUT** `/users/me/password`
Auth required. Body:
```json
{ "currentPassword": "string", "newPassword": "string" }
```

**GET** `/admin/users`
Permission: `user:read`.

**GET** `/admin/users/:id`
Permission: `user:read`.

**PATCH** `/admin/users/:id/roles`
Permission: `user:write`. Body:
```json
{ "roleIds": ["string"] }
```

## RBAC
**GET** `/admin/roles`
Permission: `rbac:read`.

**POST** `/admin/roles`
Permission: `rbac:write`. Body:
```json
{ "name": "string", "permissionIds": ["string"] }
```

**PATCH** `/admin/roles/:id`
Permission: `rbac:write`. Body:
```json
{ "name": "string", "permissionIds": ["string"] }
```

**GET** `/admin/permissions`
Permission: `rbac:read`.

## Brands
**GET** `/brands`
Public. Query: `status`, `q`, `page`, `limit`, `sort`.

**GET** `/brands/:id`

**POST** `/admin/brands`
Permission: `brand:write`. Body:
```json
{ "name": "string", "slug": "string", "logo": "string", "status": "active|inactive" }
```

**PATCH** `/admin/brands/:id`
Permission: `brand:write`.

## Categories
**GET** `/categories`
Public. Query: `parentId`, `status`, `q`, `page`, `limit`, `sort`.

**GET** `/categories/:id`

**POST** `/admin/categories`
Permission: `category:write`. Body:
```json
{ "name": "string", "slug": "string", "image": "string", "parentId": "string", "status": "active|inactive" }
```

**PATCH** `/admin/categories/:id`
Permission: `category:write`.

## Uploads
**POST** `/uploads/images`
Permission: `product:write`. Multipart field: `images`.

**POST** `/uploads/category-images`
Permission: `category:write`. Multipart field: `images`.

## Products
**GET** `/products`
Public. Query: `q`, `brandId`, `categoryId`, `status`, `minPrice`, `maxPrice`, `page`, `limit`, `sort`.

**GET** `/products/:slug`
Public.

**POST** `/admin/products`
Permission: `product:write`. Body:
```json
{
  "name": "string",
  "slug": "string",
  "brandId": "string",
  "categoryId": "string",
  "description": "string",
  "images": ["string"],
  "price": 0,
  "salePrice": 0,
  "status": "active|draft|archived"
}
```

**PATCH** `/admin/products/:id`
Permission: `product:write`.

## Variants
**GET** `/products/:id/variants`
Public.

**POST** `/admin/variants`
Permission: `product:write`. Body:
```json
{ "productId": "string", "size": 0, "color": "string", "sku": "string", "stock": 0, "price": 0 }
```

**PATCH** `/admin/variants/:id`
Permission: `product:write`.

## Inventory
**GET** `/admin/inventory`
Permission: `inventory:read`. Query: `variantId`, `page`, `limit`.

**PATCH** `/admin/inventory/:variantId`
Permission: `inventory:write`. Body:
```json
{ "available": 0, "reserved": 0, "sold": 0 }
```

## Cart
**GET** `/cart`
Auth required.

**POST** `/cart/items`
Auth required. Body:
```json
{ "productId": "string", "variantId": "string", "quantity": 1 }
```

**PATCH** `/cart/items/:id`
Auth required. Body:
```json
{ "quantity": 1 }
```

**DELETE** `/cart/items/:id`
Auth required.

## Wishlist
**GET** `/wishlist`
Auth required.

**POST** `/wishlist/items`
Auth required. Body:
```json
{ "productId": "string" }
```

**DELETE** `/wishlist/items/:productId`
Auth required.

## Orders
**POST** `/orders`
Auth required. Create order from user's current cart.

Body:
```json
{
  "shippingAddress": {
    "name": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "district": "string",
    "ward": "string"
  },
  "paymentMethod": "cod|momo|vnpay",
  "note": "string",
  "couponCode": "string"
}
```

Response `201`:
```json
{
  "order": {},
  "payment": {},
  "paymentTransaction": {}
}
```

**GET** `/orders`
Auth required. Query: `status`, `page`, `limit`, `sort`.

**GET** `/orders/:id`
Auth required.

**PATCH** `/admin/orders/:id/status`
Permission: `order:write`. Body:
```json
{ "status": "pending|confirmed|shipping|delivered|cancelled" }
```

## Payments
Payment is split from Order at domain/data level. Current phase includes internal payment lifecycle and VNPay callback flow.

**GET** `/payments/:id`
Auth required. Ownership-first access. Backoffice can read across users with `payment:read|payment:write`.

**POST** `/payments/:paymentId/attempts`
Auth required. Create a new transaction attempt.

Body:
```json
{ "provider": "momo|vnpay" }
```

Rules:
- `provider` must match `payment.method`.
- New attempt is allowed only when latest attempt is `failed`.
- If latest attempt is `pending`, it must be expired first (`PAYMENT_PENDING_ATTEMPT_TTL_MINUTES`, default 15).

Response:
```json
{
  "payment": {},
  "paymentTransaction": {},
  "nextAction": { "type": "gateway_pending", "provider": "momo|vnpay" },
  "orderId": "string"
}
```

**POST** `/payments/:paymentId/vnpay/checkout`
Auth required. Create VNPay attempt and signed checkout URL.

Response:
```json
{
  "payment": {},
  "paymentTransaction": {},
  "nextAction": {
    "type": "gateway_pending",
    "provider": "vnpay",
    "checkoutUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  },
  "checkoutUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "string"
}
```

**GET** `/payments/:paymentId/transactions`
Auth required. List attempts by `attemptNo` desc.

**GET** `/payments/transactions/:id`
Auth required.

**PATCH** `/payments/transactions/:id/status`
Permission: `payment:write`. Internal/manual update endpoint.

Body:
```json
{
  "status": "pending|paid|failed",
  "providerTransactionId": "string",
  "paidAt": "ISO date",
  "failureReason": "string",
  "rawResponse": {}
}
```

Transition policy:
- `pending -> pending|paid|failed`
- `paid -> paid` (idempotent only)
- `failed -> failed` (idempotent only)

Idempotency policy:
- Duplicate final callback is ignored (no-op).
- Stale callback from older attempt is ignored (no-op).

**GET** `/payments/vnpay/return`
Public. Browser return endpoint. Verify checksum, then return status or redirect to frontend result page.

**GET** `/payments/vnpay/ipn`
Public. Server-to-server callback endpoint. Verify checksum, enforce idempotency, and update `paymentTransaction` / `payment` / `order.paymentStatus`.

**POST** `/payments/transactions/:id/reconcile/vnpay`
Permission: `payment:write`. Manual reconcile a specific VNPay transaction with gateway query API.

**POST** `/payments/reconcile/vnpay/pending-expired`
Permission: `payment:write`. Batch reconcile pending VNPay transactions older than TTL.

Error code policy (backend):
- `PAYMENT_ATTEMPT_NOT_ALLOWED`
- `PAYMENT_DUPLICATE_ATTEMPT`
- `PAYMENT_INVALID_STATUS_TRANSITION`
- `PAYMENT_STALE_CALLBACK`
- `PAYMENT_DUPLICATE_CALLBACK`

Audit policy:
- Payment module writes audit log for attempt creation, status transitions, and reconcile actions.

## Reviews
**GET** `/products/:id/reviews`
Public. Query: `page`, `limit`, `sort`.

**POST** `/reviews`
Auth required. Body:
```json
{ "productId": "string", "rating": 5, "comment": "string" }
```

**DELETE** `/admin/reviews/:id`
Permission: `review:write`.
