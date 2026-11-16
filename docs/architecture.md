# System Architecture

## 1. Architecture Style
This project utilizes a **Modular Monolith** architecture. A single Spring Boot application contains all the business modules (Auth, Requests, Users), deployed as one Docker container. This was chosen over microservices to reduce network latency, simplify local development, and avoid distributed transaction complexity for a project of this scope.

## 2. Request Flow (Example: Creating a Request)
1. **Frontend (React):** The user submits the "Create Request" form. Axios sends a `POST /api/requests` with the JSON payload and the JWT in the `Authorization` header.
2. **Security Filter (`JwtAuthenticationFilter`):** Intercepts the request, validates the JWT, and sets the authenticated User in the `SecurityContext`.
3. **Controller (`ServiceRequestController`):** Receives the request, validates the DTO using `@Valid`, and passes it to the Service.
4. **Service (`ServiceRequestService`):** Applies business logic (sets status to `PENDING`, associates the logged-in User) and calls the Repository.
5. **Repository (`ServiceRequestRepository`):** Persists the Entity to the PostgreSQL database.
6. **Response:** The Service maps the saved Entity to a DTO and returns a `200 OK`.

## 3. Layer Responsibilities
- **Frontend (React):** Handles UI state, routing, and user experience.
- **Controllers:** Handle HTTP routing, validation, and status codes. No business logic.
- **Services:** The "brain" of the app. Enforces business rules (e.g., status transitions) and coordinates transactions.
- **Repositories:** Handles data access via Spring Data JPA.
- **Database:** PostgreSQL for persistent, relational data storage.