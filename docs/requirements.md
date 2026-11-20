# Requirements & Scope

## 1. Problem Statement
Users within VisionRoot need a centralized way to submit internal service requests (IT, Facilities, etc.) and track their progress. Administrators need a secure dashboard to triage these requests and update their statuses.

## 2. User Stories & Acceptance Criteria

### MVP User Stories
**US-01: As a User, I want to register and log in securely.**
- **AC:** Passwords are hashed with BCrypt. Public registration forces the `USER` role. Login returns a valid JWT via an HttpOnly Cookie.

**US-02: As a User, I want to create a service request.**
- **AC:** User can provide Title, Description, Category, and Priority. The request defaults to `PENDING` status.

**US-03: As a User, I want to view and edit my requests.**
- **AC:** User can see only their own requests. They can edit a request *only* if it is `PENDING`.

**US-04: As an Admin, I want to view all requests and filter them.**
- **AC:** Admin can search by title, filter by status/priority, and paginate results.

**US-05: As an Admin, I want to update a request status.**
- **AC:** Admin can transition `PENDING` -> `IN_PROGRESS` -> `RESOLVED`. Invalid transitions must be rejected by the backend.

**US-06: As an Admin, I want to manage user roles.**
- **AC:** Admin can promote a `USER` to `ADMIN` or demote them. Self-demotion is prevented to avoid locking the admin out.

## 3. Out of Scope (Future Improvements)
- Email notifications (currently using in-app notifications).
- File attachments.
- Real-time WebSocket updates.
- Comprehensive End-to-End (E2E) testing with Playwright/Cypress.

## 4. Non-Functional Requirements & Security Architecture

### NFR-01: Stateful HttpOnly Cookies (Implemented)
- **Status:**  Completed
- **Implementation:** The backend generates a JWT and returns it via a `Secure, HttpOnly` cookie. The frontend no longer stores the token in `localStorage`.
- **Benefits:** `HttpOnly` prevents JavaScript from reading the token, mitigating XSS token theft. 
- **Session Policy:** The backend uses `SessionCreationPolicy.STATELESS` (no `JSESSIONID` is created). The cookie itself is the session.
- **Logout:** The backend sends an expired cookie (`maxAge=0`) to clear the browser state.

### NFR-02: CSRF Protection (Implementation Trade-off)
- **Status:**  Disabled for Live Demo
- **Context:**  migrated to Stateful HttpOnly Cookies. In a traditional same-origin architecture, CSRF protection would be enabled. However, because the frontend (Vercel) and backend (Render) are on different domains, cross-domain CSRF token synchronization introduced significant complexity.
- **Decision:** For the live demo, CSRF is disabled on the backend (`.csrf(csrf -> csrf.disable())`). The `SameSite=Lax` cookie policy via the Vercel Reverse Proxy provides baseline protection against cross-site requests.
- **Production Roadmap:** Re-enable CSRF using `CookieCsrfTokenRepository` and a custom `CsrfTokenRequestHandler`, or migrate to a same-origin architecture where the frontend and backend are served from the same domain.

### NFR-03: Vercel Reverse Proxy (Implemented)
- **Status:**  Completed
- **Implementation:** The `vercel.json` file rewrites `/api/*` requests to the Render backend.
- **Benefits:** This makes the browser think the API is on the same domain as the frontend, eliminating cross-domain cookie issues (`SameSite=None`, `Partitioned`).

### NFR-04: Known Limitation - Duplicate Requests
- **Status:**  Known Edge Case
- **Context:** The Axios retry interceptor may occasionally cause a duplicate record to be saved if the first request triggers a CSRF token refresh.
- **Production Roadmap:** Implement idempotency keys ( a unique `X-Request-Id` header) to prevent duplicate submissions.