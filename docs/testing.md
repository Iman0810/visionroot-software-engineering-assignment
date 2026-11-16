# Testing Strategy & Evidence

This document outlines the automated testing strategy for the Service Request Management System backend. The goal is to ensure business logic is strictly enforced and API endpoints respond with the correct HTTP status codes.

## 1. Test Stack
- **Framework:** JUnit 5
- **Mocking:** Mockito (for Unit tests)
- **API Testing:** Spring Boot MockMvc (for Integration tests)
- **Test Database:** H2 In-Memory Database (configured via `application-test.properties`)

## 2. Running the Tests
To run the entire test suite locally:
```bash
cd backend
./mvnw test
```
Note: The tests are also automatically run on every push to main via the GitHub Actions CI pipeline.

## 3. Test Coverage Overview
### 3.1 Unit Tests (BusinessRuleTest.java)

These tests use Mockito to mock the ServiceRequestRepository and UserRepository. They do not hit the database, making them extremely fast.
Focus: Enforcing the strict status transition business rules.

- Test 1: Ensures a PENDING request cannot be directly RESOLVED.

- Test 2: Ensures a valid transition from PENDING to IN_PROGRESS succeeds.

- Test 3: Ensures a request cannot be reverted from IN_PROGRESS back to PENDING.

### 3.2 Integration Tests (ServiceRequestIntegrationTest.java)

These tests use @SpringBootTest and MockMvc. They spin up the full Spring application context and an H2 in-memory database. They simulate real HTTP requests passing through the actual security filters.
Focus: API endpoints, validation, and security.

- Test 1 (Happy Path): Sends a valid POST /api/requests and expects a 200 OK with status: PENDING.

- Test 2 (Validation): Sends a POST /api/requests with a missing Title and expects a 400 Bad Request.

- Test 3 (Not Found): Sends a GET /api/requests/9999 and expects the backend to throw the BadRequestException.

- Test 4 (Security): Sends a GET /api/users as a USER role and expects a 403 Forbidden.

## 4. Known Limitations & Future Improvements

- Global Exception Handler: Currently, our custom BadRequestException bubbles up as a ServletException (500 status) in MockMvc because we lack a @RestControllerAdvice. In production, we would add a Global Handler to map this to a clean 400 Bad Request with a custom JSON error body.

- End-to-End (E2E) Testing: The current integration tests verify the backend API. A future improvement would be implementing E2E tests using Playwright or Cypress to test the React frontend interacting with the backend.

- Test Coverage Tooling: Integrating JaCoCo to measure code coverage (currently estimating ~70% coverage on the service layer).


