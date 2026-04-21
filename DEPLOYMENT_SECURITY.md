# Security deployment notes

## Required backend contract

The production storefront must use `VITE_AUTH_MODE=api`. The frontend expects the backend to expose these endpoints and set authentication with secure `HttpOnly` cookies:

- `GET /auth/me`
- `POST /auth/login`
- `POST /auth/register` only if public registration is enabled
- `POST /auth/logout`

Backend cookie requirements:

- `HttpOnly`
- `Secure`
- `SameSite=Lax` or `Strict`
- Short session lifetime with server-side invalidation
- CSRF protection for mutating requests if cookies are used cross-site

## Environment

Use `.env.example` as a template. For production:

```env
VITE_AUTH_MODE=api
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ENABLE_DEMO_AUTH=false
VITE_ENABLE_PUBLIC_REGISTRATION=false
VITE_AUTH_SESSION_MINUTES=60
```

Do not put real payment, shipping, AI, or webhook secrets in any `VITE_*` variable. Vite exposes those values to the browser bundle.

## Payment and shipping secrets

Payment gateway API keys, secret keys, webhook secrets, and shipping provider keys must live on the backend only. The React dashboard can display masked placeholders and send settings requests to the backend, but it must not store real secrets in `localStorage`.

## Admin access

The frontend enforces admin-only routes for user experience, but final authorization must happen on the backend for every admin API request.

## Hosting headers

`vercel.json` includes baseline security headers:

- Content Security Policy
- `X-Content-Type-Options: nosniff`
- Referrer Policy
- Permissions Policy
- SPA rewrites

Adjust `connect-src` in the CSP if you restrict API domains more tightly.
