# ADR-001: Choice of Modular Monolith Architecture

## Context
The project required a full-stack Service Request Management System with a secure API, a relational database, and role-based access control (User vs. Admin). A decision was needed regarding the overall system architecture: specifically, whether to adopt a Microservices architecture or a Modular Monolith.

## Decision
A **Modular Monolith** architecture was chosen. The system is implemented using React (frontend), Spring Boot (backend), and PostgreSQL (database). The backend is deployed as a single container on Render, while the frontend is hosted on Vercel.

## Alternatives Considered
1. **Microservices:** Splitting the Auth, Requests, and Users modules into separate, independently deployable services.
2. **Serverless:** Using AWS Lambda for backend logic to eliminate server management.

## Consequences
- **Positive:**
  - **Simplicity:** The monolith is easier to develop, debug, and deploy, requiring only one Dockerfile and one Render service.
  - **Performance:** Internal method calls (e.g., from Controller to Service) incur zero network latency compared to inter-service communication in a microservices setup.
  - **Data Consistency:** A single PostgreSQL database is used, which avoids the complexity of distributed transactions and eventual consistency.
- **Negative:**
  - **Scaling:** If one specific module (e.g., Requests) experiences heavy traffic, the entire monolith must be scaled, rather than just that specific module.
  - **Blast Radius:** A memory leak or crash in one module could potentially bring down the entire server.