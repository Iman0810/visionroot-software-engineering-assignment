# Testing Strategy & Evidence

This document outlines the automated testing strategy for the Service Request Management System backend. The goal is to ensure business logic is strictly enforced and API endpoints respond with the expected HTTP status codes.

## 1. Test Stack

- Framework: JUnit 5
- Mocking: Mockito (for Unit Tests)
- API Testing: Spring Boot MockMvc (for Integration Tests)
- Test Database: H2 In-Memory Database (configured via `application-test.properties`)
- Security Testing: Spring Security Test (`@WithMockUser` and CSRF request post-processors)

## 2. Running the Tests

To run the entire test suite locally:

```bash
cd backend
./mvnw test
```

Note: The tests are also automatically executed on every push to the main branch through the GitHub Actions CI pipeline.

## 3. Test Coverage Overview

The backend currently contains 12 automated test cases across three test classes.

### 3.1 Unit Tests (BusinessRuleTest.java)

These tests use Mockito to mock the ServiceRequestRepository and UserRepository. They do not interact with the actual database, allowing business rules to be tested independently.

Focus: Enforcing strict service request status transition rules.

- Test 1: Ensures a PENDING request cannot be directly transitioned to RESOLVED. An exception is expected.
- Test 2: Ensures a valid transition from PENDING to IN_PROGRESS succeeds and the repository save method is called.
- Test 3: Ensures a request cannot be reverted from IN_PROGRESS back to PENDING. An exception is expected.

Total: 3 tests.

### 3.2 Integration Tests (ServiceRequestIntegrationTest.java)

These tests use `@SpringBootTest` and `MockMvc` to load the Spring application context and interact with an H2 in-memory database. They simulate HTTP requests passing through the application's security filters.

Focus: Service request API endpoints, request validation, and role-based access control.

- Test 1 (Happy Path): Sends a valid POST `/api/requests` request as an authenticated USER and expects a 200 OK response containing the created request with PENDING status.
- Test 2 (Validation): Sends a POST `/api/requests` request with a missing title and expects a 400 Bad Request response.
- Test 3 (Not Found): Attempts to retrieve a non-existent request using GET `/api/requests/9999`. Verifies that a ServletException is thrown.
- Test 4 (Security): Attempts to access GET `/api/users` as an authenticated USER and expects a 403 Forbidden response.

Total: 4 tests.

### 3.3 Security Integration Tests (SecurityIntegrationTest.java)

These tests use `@SpringBootTest` and `MockMvc` to verify authentication, registration, and security enforcement through the Spring Security filter chain.

Focus: Authentication, registration, credential validation, and unauthorized access prevention.

- Test 1 (Registration): Registers a new user and verifies that the application automatically assigns the USER role, regardless of the registration request.
- Test 2 (Successful Login): Verifies that a user can successfully authenticate using valid credentials and that a token is returned in the response.
- Test 3 (Invalid Credentials): Attempts to log in using an incorrect password and expects a 403 Forbidden response.
- Test 4 (Unauthorized Access): Attempts to access GET `/api/users` without authentication and expects a 403 Forbidden response.
- Test 5 (Invalid Token): Attempts to access GET `/api/requests` using an invalid JWT bearer token and expects a 403 Forbidden response.

The registration and login POST requests include CSRF tokens to satisfy Spring Security's CSRF protection in the test environment.

Total: 5 tests.

### 3.4 Application Context Test (ServiceRequestSystemApplicationTests.java)

This test uses `@SpringBootTest` to verify that the Spring Boot application context loads successfully under the test profile.

Focus: Application startup and configuration validation.

- Test 1 (Context Loading): Verifies that the Spring application context initializes successfully without throwing any startup exceptions.

Total: 1 test.

## 4. Test Execution Summary

| Test Class | Test Cases | Testing Type |
|---|---:|---|
| BusinessRuleTest | 3 | Unit |
| ServiceRequestIntegrationTest | 4 | Integration |
| SecurityIntegrationTest | 5 | Security Integration |
| ServiceRequestSystemApplicationTests | 1 | Context Loading |
| **Total** | **13** | **Automated** |

## 5. Security Testing Considerations

- CSRF Protection: Integration tests for POST requests include CSRF tokens using Spring Security's `.with(csrf())` request post-processor.
- Authentication: `@WithMockUser` is used to simulate authenticated users with specific roles.
- Authorization: Tests verify that regular USER accounts cannot access administrative endpoints.
- Invalid Credentials: Tests verify that unsuccessful login attempts are rejected.
- JWT Validation: Tests verify that requests containing invalid JWT tokens are rejected.

## 6. Known Limitations & Future Improvements

- Global Exception Handler: The current implementation does not have a centralized `@RestControllerAdvice` to consistently handle custom exceptions. The missing service request test currently verifies that a `ServletException` is thrown rather than asserting a specific HTTP response. A future improvement would be implementing a Global Exception Handler to return appropriate HTTP status codes and structured JSON error responses.

- End-to-End (E2E) Testing: Current integration tests focus on backend APIs. A future improvement would be implementing E2E tests using Playwright or Cypress to verify the React frontend interacting with the backend.

- Test Coverage Tooling: Integrating JaCoCo to measure actual code coverage. The current estimated service-layer coverage is approximately 70%, but this has not yet been verified through a coverage report.

- Authentication Lifecycle Testing: Extend integration tests to cover the complete Stateful JWT authentication lifecycle, including cookie issuance, authenticated requests using cookies, logout, and cookie invalidation.

- Role Management Testing: Add additional tests for administrative operations, including role changes, self-demotion prevention, and access restrictions.

- Production Security Testing: Add tests to verify cookie security attributes and CSRF behaviour under the production security configuration.

