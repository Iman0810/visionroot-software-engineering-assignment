# VisionRoot - Service Request Management System

A production-ready full-stack web application built for the VisionRoot Software Engineering Intern Technical Assignment. It allows registered users to create and manage service requests, while administrators can view, filter, update, and manage request statuses based on strict business rules.

## Technology Stack & Architecture
This project is structured as a monorepo containing both the backend and frontend for simplified development and deployment.

### Backend (`/backend`)
- **Framework:** Spring Boot 4.1.2 (Java 21)
- **Database:** PostgreSQL (Relational DB chosen for data integrity and status transition consistency)
- **Security:** Spring Security with JWT (Stateless authentication and Role-Based Access Control)
- **ORM:** Spring Data JPA (Hibernate) with JPA Specifications for dynamic filtering
- **Testing:** JUnit 5 & Mockito (Unit tests for status transition business rules)
- **API Docs:** Swagger / OpenAPI 3
- **DevOps:** Dockerized with Multi-stage build & GitHub Actions CI

### Frontend (`/client`)
- **Framework:** React 19 (Vite + TypeScript)
- **Styling:** Tailwind CSS (v4) with fully responsive Dark Mode
- **Routing:** React Router DOM (with Protected Routes)
- **HTTP Client:** Axios (with interceptors for JWT attachment)

## Database Schema Overview
- **Users Table:** `id`, `name`, `email` (unique), `password` (BCrypt hashed), `role` (USER/ADMIN)
- **Service Requests Table:** `id`, `title`, `description`, `category`, `priority`, `status`, `user_id` (Foreign Key), `created_at`, `updated_at`

##  Authentication & Authorization
- Authentication is handled via JWT. Passwords are strictly hashed using BCrypt.
- **Security Rule:** To prevent privilege escalation, public registration strictly forces the `USER` role. 
- **Initial Admin Account:** The application includes a `DataSeeder` (`CommandLineRunner`) that automatically runs on the first startup to create a default Admin account. 
  - **Email:** `admin@visionroot.lk`
  - **Password:** `admin123`
- **Role Management:** Admins can promote regular users to Admins via the Admin Dashboard.
- **Business Rules:** The backend strictly enforces valid status transitions (e.g., `PENDING` -> `IN_PROGRESS` -> `RESOLVED`). Invalid transitions (like `RESOLVED` -> `PENDING`) are rejected with a `400 Bad Request`. This is verified by JUnit tests.

##  Environment Variables
Create a `.env` file in the `backend` folder (refer to `.env.example`).
```env
DB_URL=jdbc:postgresql://localhost:5432/visionroot_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```
### Installation & Setup

## 1.Local Development

1.Database setup

Ensure PostgreSQL is running and Creat the database:
```bash
psql -U postgres -c "CREATE DATABASE visionroot_db;"
```
(hibernate will automatically create the tables on startup)

2. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
The backend runs on http://localhost:8080.

Swagger API Docs: http://localhost:8080/swagger-ui/index.html

3.Frontend Setup

Open a new Terminal
```bash
cd client
npm install
npm run dev
```
The frontend runs on http://localhost:5173.

## 2. Run with Docker
if you have Docker installed, you can spin up the entire backend (Springboot+Postgres) with a single command from the root directory:
```bash
docker-compose up --build -d
```

## Running Automated Tests
To run the backend JUnit tests(which verify the strict business rules for status transitions)

```bash
cd backend
./mvnw test
```

## Key Assumptions and Features
1. Dual Login: Users can log in using either their Email or their Name.

2. Search, Filter, Sort, Pagination: Fully implemented on the backend using Spring Data JPA Specifications and returned as a paginated Page object to the frontend.

3. In-App Notifications: A polling-based notification bell alerts users when their request status changes, and alerts admins when new requests are submitted.

4. Dark Mode: Fully responsive UI with a toggleable dark mode that persists via localStorage.

## Known Limitations & Future Improvements

1. JWT Expiry: If an Admin changes a user's role, the user must log out and log back in for the JWT token to refresh with the new role. (Standard stateless JWT behavior).

2. Real-time Notifications: The notification bell uses interval polling. In a high-traffic production environment, this should be upgraded to WebSockets (STOMP) or an email service (SendGrid).

3. Profile Management: Name and Email can be updated via the Profile page, but changing the email requires a re-login as the JWT becomes invalid.
