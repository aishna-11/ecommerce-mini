# Mini E-Commerce Website (Task 04)

A small but complete online store: browse products, view product details,
manage a cart, register/login, and check out (no real payment, as requested).

- **Backend:** Node.js + Express + MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** Plain HTML + CSS + JavaScript (no build step, no framework)

```
ecommerce-mini/
├── backend/
│   ├── models/          User.js, Product.js, Order.js
│   ├── routes/          auth.js, products.js, cart.js, orders.js
│   ├── middleware/       auth.js (JWT check)
│   ├── server.js         Express app entry point
│   ├── seed.js            Populates sample products
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html         Product listing (home page)
    ├── product.html       Product detail + add to cart
    ├── cart.html          View/edit cart
    ├── checkout.html      Shipping form + place order (no payment)
    ├── login.html / register.html
    ├── css/style.css
    └── js/                api.js, main.js, product.js, cart.js, auth.js, checkout.js
```

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18+
- MongoDB running locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 2. Install & configure the backend

```bash
cd ecommerce-mini/backend
npm install
cp .env.example .env
```

Open `.env` and set:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — any long random string
- `PORT` — defaults to 5000

## 3. Seed sample products (optional but recommended)

```bash
npm run seed
```

This inserts 8 sample products so the storefront isn't empty on first run.

## 4. Run the server

```bash
npm start        # production
# or
npm run dev       # auto-restarts on file changes (requires nodemon, already in devDependencies)
```

The server does two things at once:
- Serves the **API** at `http://localhost:5000/api/...`
- Serves the **frontend** (the `frontend/` folder) as static files at `http://localhost:5000/`

So you only need **one process** — open your browser to:

```
http://localhost:5000
```

That's it. Register an account, browse products, add to cart, and check out.

## 5. API reference

| Method | Endpoint                        | Auth? | Description                        |
|--------|----------------------------------|-------|-------------------------------------|
| POST   | `/api/auth/register`             | No    | Create an account                   |
| POST   | `/api/auth/login`                | No    | Log in, returns a JWT               |
| GET    | `/api/auth/me`                   | Yes   | Get current logged-in user          |
| GET    | `/api/products`                  | No    | List products (supports `?search=` & `?category=`) |
| GET    | `/api/products/:id`              | No    | Single product detail               |
| POST   | `/api/products`                  | No*   | Create a product (admin utility)    |
| PUT    | `/api/products/:id`               | No*   | Update a product                    |
| DELETE | `/api/products/:id`               | No*   | Delete a product                    |
| GET    | `/api/cart`                      | Yes   | Get current user's cart             |
| POST   | `/api/cart/add`                   | Yes   | Add item `{ productId, quantity }` |
| PUT    | `/api/cart/update`                 | Yes   | Change quantity `{ productId, quantity }` |
| DELETE | `/api/cart/remove/:productId`     | Yes   | Remove item from cart               |
| POST   | `/api/orders/checkout`             | Yes   | Turn cart into an order `{ shippingAddress }` |
| GET    | `/api/orders`                     | Yes   | Order history for the logged-in user |

\* Product management routes are left open in this mini project for simplicity/seeding.
In a production app you'd protect these with an admin-only auth check.

## 6. How auth works (short version)

1. On register/login, the backend hashes the password with **bcrypt** and returns a
   **JWT** signed with `JWT_SECRET`.
2. The frontend stores the token in `localStorage` and sends it as
   `Authorization: Bearer <token>` on every request that needs a logged-in user
   (cart, checkout).
3. The `requireAuth` middleware on the backend verifies that token before
   letting the request through.

## 7. Notes / possible next steps

- Checkout has **no real payment integration** — it just records the order and
  empties the cart, exactly as the task specifies.
- To go further, you could add: product image uploads, an admin dashboard,
  order status tracking, pagination, or swap the plain JS frontend for React.
