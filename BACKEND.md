# SILA Backend

PHP/MySQL backend for the SILA store, designed to run under XAMPP from:

`http://localhost/stor%20Sila/api`

## Setup

Create or select the MySQL database named `sila`, then run:

```powershell
php api\setup.php
```

Default connection settings are in `api/config.php`:

- Host: `127.0.0.1`
- Database: `sila`
- User: `root`
- Password: empty

For local overrides, create `api/config.local.php`. It is ignored by Git.

## Admin Login

- Email: `admin@sila.local`
- Password: `Sila@12345`

## Main Endpoints

Public:

- `GET /health`
- `GET /categories`
- `GET /products`
- `GET /products/{id}`
- `POST /checkout/orders`

Admin session required:

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/register`
- `POST /categories`
- `PATCH /categories/{id}`
- `DELETE /categories/{id}`
- `POST /products`
- `PATCH /products/{id}`
- `DELETE /products/{id}`
- `GET /customers`
- `POST /customers`
- `PATCH /customers/{id}`
- `DELETE /customers/{id}`
- `GET /orders`
- `POST /orders`
- `PATCH /orders/{id}`
- `PATCH /orders/{id}/status`
- `GET /payments`
- `POST /payments`
- `GET /settings`
- `GET /settings/{section}`
- `PUT /settings/{section}`

## Frontend Integration

The frontend reads `VITE_API_BASE_URL` from `.env`.

Current connected flows:

- API authentication.
- Storefront product catalog.
- Product details.
- Checkout order creation.
- Admin customers list/save.
- Admin orders list/status update.

