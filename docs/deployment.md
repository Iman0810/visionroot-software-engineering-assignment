# Deployment Guide

The application is deployed using a modern CI/CD pipeline with a Vercel Reverse Proxy to eliminate cross-domain cookie issues.

## 1. Architecture Overview
- **Frontend:** Vercel (React + Vite)
- **Backend:** Render (Dockerized Spring Boot 4)
- **Database:** Render PostgreSQL
- **Proxy:** Vercel Rewrites (`vercel.json`) route `/api/*` to the Render backend.

## 2. Backend (Spring Boot) & Database

- **Hosting:** Render (Docker container)
- **Database:** Render PostgreSQL

### Required Environment Variables (Render Dashboard)
- `DB_URL` (JDBC connection string: `jdbc:postgresql://...`)
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `SPRING_PROFILES_ACTIVE` = `prod`
- `APP_COOKIE_SECURE` = `true`
- `APP_COOKIE_SAME_SITE` = `Lax`
- `APP_COOKIE_PARTITIONED` = `false`

### Spring Profile Configuration
- **`application.properties`** (Local): `secure=false`, `same-site=Lax`
- **`application-prod.properties`** (Production): `secure=true`, `same-site=Lax`, `forward-headers-strategy=framework`

### Deployment
Any push to the `main` branch triggers Render to rebuild the Docker image and redeploy the Spring Boot app.

## 3. Frontend (React)

- **Hosting:** Vercel
- **Framework:** Vite + React (TypeScript)

### Required Environment Variables (Vercel Dashboard)
- `VITE_API_URL` = `https://visionroot-backend.onrender.com/api` *(Only needed if not using the proxy)*

### Vercel Reverse Proxy (`client/vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://visionroot-backend.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
* This proxy eliminates cross-domain cookie issues by making the browser think the API is on the same domain as the frontend.

### Deployment

- Any push to the main branch triggers Vercel to build the Vite React app and publish it to the global CDN.

## 4.Local Docker Setup

- To spin up the entire stack (Frontend via Nginx + Backend + PostgreSQL) locally:

 ```bash
docker compose up --build -d
 ```
## 5. CI/CD Pipeline

- GitHub Actions: Runs 16 automated tests on every push to main.

- Render: Auto-deploys the backend on push.

- Vercel: Auto-deploys the frontend on push.

## 6. Known Limitations

- Cold Starts: Render's free tier spins down the backend after 15 minutes of inactivity. The first request may take 50 - 120 seconds to wake up the server.

- CSRF Disabled: CSRF protection is disabled for the live demo due to cross-domain cookie complexities. In a production environment, it would be re-enabled using CookieCsrfTokenRepository and a custom CsrfTokenRequestHandler.

- Duplicate Requests: The Axios retry interceptor may occasionally cause a duplicate record to be saved if the first request triggers a CSRF token refresh. This is a known edge case and would be mitigated with idempotency keys in production.