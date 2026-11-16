# Deployment Guide

The application is deployed using a modern CI/CD pipeline.

## 1. Backend (Spring Boot) & Database
- **Hosting:** Render (Docker container)
- **Database:** Render PostgreSQL
- **Environment Variables Required:**
  - `DB_URL` (JDBC connection string)
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `JWT_SECRET`
- **Deployment:** Any push to the `main` branch triggers Render to rebuild the Docker image and redeploy the Spring Boot app.

## 2. Frontend (React)
- **Hosting:** Vercel
- **Environment Variables Required:**
  - `VITE_API_URL` (Points to the Render backend URL)
- **Deployment:** Any push to the `main` branch triggers Vercel to build the Vite React app and publish it to the global CDN.

## 3. Local Docker Setup
To spin up the entire stack locally:
```bash
docker compose up --build -d
```

## 4. Known Limitations

- Cold Starts: Render's free tier spins down the backend after 15 minutes of inactivity. The first request may take 50 seconds to wake up the server.