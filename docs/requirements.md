# Requirements & Scope

## 1. Problem Statement
Users within VisionRoot need a centralized way to submit internal service requests (IT, Facilities, etc.) and track their progress. Administrators need a secure dashboard to triage these requests and update their statuses.

## 2. User Stories & Acceptance Criteria

### MVP User Stories
**US-01: As a User, I want to register and log in securely.**
- **AC:** Passwords are hashed with BCrypt. Public registration forces the `USER` role. Login returns a valid JWT.

**US-02: As a User, I want to create a service request.**
- **AC:** User can provide Title, Description, Category, and Priority. The request defaults to `PENDING` status.

**US-03: As a User, I want to view and edit my requests.**
- **AC:** User can see only their own requests. They can edit a request *only* if it is `PENDING`.

**US-04: As an Admin, I want to view all requests and filter them.**
- **AC:** Admin can search by title, filter by status/priority, and paginate results.

**US-05: As an Admin, I want to update a request status.**
- **AC:** Admin can transition `PENDING` -> `IN_PROGRESS` -> `RESOLVED`. Invalid transitions must be rejected by the backend.

**US-06: As an Admin, I want to manage user roles.**
- **AC:** Admin can promote a `USER` to `ADMIN` or demote them.

## 3. Out of Scope (Future Improvements)
- Email notifications (currently using in-app notifications).
- File attachments.
- Real-time WebSocket updates.

## 4. Non-Functional Requirements & Future Security Improvements

While the current MVP uses a stateless JWT architecture stored in `localStorage` for simplicity of demonstration, the following security enhancement has been identified for the production roadmap.

### NFR-01: Transition from Stateless JWT to Stateful Sessions (HttpOnly Cookies)

**Current State (MVP):**
- The backend generates a Stateless JWT and sends it to the frontend.
- The frontend stores the token in `localStorage`.
- The Axios interceptor attaches the token to the `Authorization` header.
- **Risk:** `localStorage` is accessible via JavaScript, making the application vulnerable to Cross-Site Scripting (XSS). If a malicious script is injected, it can steal the token.

**Proposed State (Production):**
- The backend will generate the JWT and send it via a **Secure, HttpOnly Cookie**.
- The frontend will **not** store the token in JavaScript.
- The browser will automatically attach the cookie to every request.
- **Benefits:** 
  - `HttpOnly` prevents JavaScript from reading the token, mitigating XSS token theft.
  - `Secure` ensures the cookie is only sent over HTTPS.
  - `SameSite=Strict` mitigates Cross-Site Request Forgery (CSRF) attacks.

**Required Implementation Changes:**
1.  **Backend (`AuthenticationController`):** Update the login endpoint to return a `ResponseEntity` with a `Set-Cookie` header instead of a JSON body containing the token.
2.  **Backend (`SecurityConfiguration`):** Enable CSRF protection (since cookies are sent automatically).
3.  **Frontend (`axiosClient.ts`):** Remove the token from `localStorage` and add `withCredentials: true` to the Axios configuration to ensure cookies are sent.