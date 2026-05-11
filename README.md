# Streetwear E-commerce

Full-stack e-commerce application for a streetwear storefront, with a React/Vite frontend and an Express/MongoDB backend. The app includes product browsing, cart and checkout flows, VNPay payment support, customer reviews, role-based dashboards, and admin management for catalog and orders.

## Tech Stack

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, Radix UI components, lucide-react
- TanStack Query for server state
- Zustand for auth/client state
- Axios API client

**Backend**
- Node.js, Express 5
- MongoDB with Mongoose
- JWT authentication and RBAC permissions
- Cloudinary uploads
- VNPay payment integration

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── libs/          # database/cloudinary integrations
│   │   ├── models/        # mongoose models
│   │   ├── modules/       # feature modules and routes
│   │   ├── scripts/       # seed scripts
│   │   └── shared/        # middleware and shared errors
│   └── tests/             # backend service tests
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── public/
├── API.md
└── README.md
```

## Main Features

- Product catalog with brands, categories, collections, variants, inventory, wishlist, and reviews.
- Cart, order creation, order history, COD and VNPay payment flow.
- Authentication with JWT and protected routes.
- Admin dashboard for products, orders, users, roles, permissions, inventory, and reviews.
- Staff/admin account pages with role-based access control.
- Image upload integration through Cloudinary.

## Prerequisites

- Node.js 20 or newer is recommended.
- npm
- MongoDB connection string
- Cloudinary account for upload features
- VNPay sandbox/live credentials if testing online payment

## Environment Variables

Create `backend/.env` locally. Do not commit real secrets.

```env
PORT=5001
MONGODB_CONNECTIONSTRING=mongodb://127.0.0.1:27017/streetwear-ecommerce
ACCESS_TOKEN_SECRET=replace-with-a-long-secret

CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_TIMEOUT_MS=60000

PAYMENT_RESULT_URL=http://localhost:5173/cart
PAYMENT_PENDING_ATTEMPT_TTL_MINUTES=15
PAYMENT_PERMISSION_ROLE_NAMES=admin,staff

VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=
VNPAY_RETURN_URL=
VNPAY_IPN_URL=
VNPAY_API_URL=
```

Create `frontend/.env` if the API URL differs from the default.

```env
VITE_API_URL=http://localhost:5001/api
```

The frontend defaults to `http://localhost:5000/api` in development if `VITE_API_URL` is not set, while the backend defaults to port `5001`. Set `VITE_API_URL` during local development unless you run the backend on port `5000`.

## Installation

Install dependencies separately for backend and frontend:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`

## Useful Scripts

Backend:

```bash
npm run dev
npm start
npm test
npm run seed:payment-permissions
npm run seed:collections
npm run seed:demo-products
```

Frontend:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Validation

Run these before committing changes:

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm test
```

## API Overview

Backend routes are mounted under `/api`. Main modules include:

- `/api/auth`
- `/api/users`
- `/api/products`
- `/api/categories`
- `/api/brands`
- `/api/collections`
- `/api/cart`
- `/api/orders`
- `/api/payments`
- `/api/reviews`
- `/api/wishlist`
- `/api/uploads`
- `/api/admin`
- `/api/admin/users`
- `/api/admin/reviews`
- `/api/admin/inventory`
- `/api/admin/variants`

See [API.md](API.md) for the broader API design notes.

## Git Notes

- Keep `.env` files local. They are ignored by Git.
- Do not commit `node_modules`, `dist`, logs, or local editor files.
- Prefer Conventional Commit messages, for example:

```text
feat: improve product reviews and admin dashboard integration
```
