# API Contract

All endpoints are prefixed with `/api`. The API uses **JSON** for request and response payloads.

## 🔐 Authentication & Authorization
- **Public Endpoints:** `/api/auth/**` (No token required).
- **User Endpoints:** Require a valid JWT cookie with the `USER` or `ADMIN` role.
- **Admin Endpoints:** Require a valid JWT cookie with the `ADMIN` role only.
- **Authentication Mechanism:** The backend uses **Stateful HttpOnly Cookies**. The JWT is sent in the `jwt` cookie, which is `HttpOnly`, `Secure`, and `SameSite=Lax`. The frontend does NOT manually attach the token to headers.

---

## 1. Authentication Controller (`/api/auth`)

### 1.1 POST `/register`
Register a new user in the system. Public registration strictly forces the `USER` role.

- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }

- **Response(200 OK):**

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "role": "USER",
    "email": "john@example.com",
    "name": "John Doe"
  }
    ```
- Error (400 Bad Request): If the email is already in use or the payload is invalid

### 1.2 POST `/login`

Authenticate an existing user and receive a JWT.

- **Request Body:**
    ```json
    {
    "email": "admin@visionroot.lk",
    "password": "admin123"
    }
    ```
- Response (200 OK): Same as Register.

- Error (401 Unauthorized): Invalid credentials.

### 1.3 POST `/logout`

Log out the user by clearing the JWT cookie.

- **Note:** The backend sends an expired `jwt` cookie (`maxAge=0`) to clear the browser state. No server-side session is destroyed because the backend is stateless.
- **Response (200 OK):** `{ "message": "Logged out successfully" }`


## 2. Service Request Controller (/api/requests)

### 2.1 POST / (User Only)

Create a new service request. Defaults to PENDING status.

- Request Body:
  ```json
  {
  "title": "Cannot connect to VPN",
  "description": "I get an error when connecting from home.",
  "category": "Technical",
  "priority": "HIGH"
  }
  ```
- Response (200 OK): Returns the created ServiceRequestDto.

### 2.2 GET / (USER Only)

List all service requests belonging to the currently logged-in user.

- Response (200 OK): Array of ServiceRequestDto.

### 2.3 GET /{id} (User Only)
Get the details of a specific request. A User can only view their own requests.

- Response (200 OK): ServiceRequestDto.

- Error (400 Bad Request): If the request doesn't exist or the user is not the owner

### 2.4 PUT /{id} (User Only)
Edit a request. Business Rule: Users can only edit requests that are PENDING.

- Request Body: Same as POST (Title, Description, Category, Priority).

- Response (200 OK): Updated ServiceRequestDto.

- Error (400 Bad Request): "You can only edit requests that are PENDING".

### 2.5 DELETE /{id} & PATCH /{id}/cancel (User Only)

Cancel a request. **Business Rule:** Users can only cancel PENDING or IN_PROGRESS requests.

- Response (200 OK): The ServiceRequestDto with status: CANCELLED.

- Error (400 Bad Request): If the request is already RESOLVED or CANCELLED.

### 2.6 GET /admin/all (Admin Only)

List all requests in the system with dynamic filtering and pagination.

- Query Parameters:

   - page (default: 0)

    - size (default: 10)

    - search (search by title or description)

    - status (PENDING, IN_PROGRESS, RESOLVED, CANCELLED)

    - priority (LOW, MEDIUM, HIGH)

    - sortBy (default: createdAt)

    - sortDir (asc, desc)`

- Response (200 OK): Spring Boot Page object containing an array of ServiceRequestDto and pagination metadata (totalPages, totalElements).

### 2.7 PATCH /{id}/status (Admin Only)

Update the status of a request. Business Rule: Strictly enforces valid transitions (e.g., PENDING -> IN_PROGRESS -> RESOLVED).

- Request Body:
    ```json

    {
      "status": "IN_PROGRESS"
    }
    ```

- Response (200 OK): Updated ServiceRequestDto.

- Error (400 Bad Request): "Cannot update a request that is already RESOLVED or CANCELLED" or "Request must be IN_PROGRESS before it can be RESOLVED".

## 3. User Controller (/api/users)
### 3.1 GET / (Admin Only)

List all registered users in the system.

- Response (200 OK): Array of User objects (Passwords are stripped out).

### 3.2 PATCH /{id}/role (Admin Only)

Promote or demote a user.

- Query Parameter: ?role=ADMIN or ?role=USER

- Response (200 OK): The updated User object.

### 3.3 GET /me (User & Admin)

Get the profile of the currently logged-in user.

- Response (200 OK): User object.

### 3.4 PUT /me/password (User & Admin)

Change the currently logged-in user's password.

- Request Body:
  ```json
  {
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword"
  }
  ```
- Response (200 OK): { "message": "Password updated successfully" }

- Error (400 Bad Request): "Incorrect current password".

### 3.5 PUT /me/profile (User & Admin)

Update the currently logged-in user's Name or Email.

- Request Body:
  ```json
  {
    "name": "New Name",
    "email": "newemail@example.com"
  }
  ```
- Response (200 OK): { "message": "Profile updated successfully. Please log in again.", "emailChanged": true }

- Error (400 Bad Request): "Email is already in use".

