# API Design (E-commerce)

**Base URL**: `/api/v1`  
**Auth**: Bearer JWT in `Authorization: Bearer <token>`  
**Roles**: `customer`, `staff`, `admin` (RBAC via permissions)

## Conventions
- Dates are ISO 8601.
- Money fields are in the smallest currency unit or decimal (choose one and keep consistent).
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
{ "name": "string", "slug": "string", "parentId": "string", "status": "active|inactive" }
```

**PATCH** `/admin/categories/:id`  
Permission: `category:write`.

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
Auth required. Body:
```json
{
  "items": [
    { "productId": "string", "variantId": "string", "quantity": 1 }
  ],
  "shippingAddress": { "name": "string", "phone": "string", "address": "string", "city": "string", "district": "string", "ward": "string" }
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
**POST** `/payments`  
Auth required. Body:
```json
{ "orderId": "string", "method": "cod|momo|vnpay" }
```

**POST** `/payments/callback/momo`  
Public. Used by gateway.

**POST** `/payments/callback/vnpay`  
Public. Used by gateway.

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

