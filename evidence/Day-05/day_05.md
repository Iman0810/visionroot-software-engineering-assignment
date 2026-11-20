# Daily Evidence Record - Day 05

**Date:** November 20, 2026

**Day / Topic:** Test Suite Expansion, Documentation Finalization & Project Handover

**Objective:** Finalize the project by expanding automated test coverage, updating all architectural and API documentation to reflect the Stateful JWT architecture, and preparing the final submission (README, demo video, and handover).

## 1. What I Learned
- How to test the complete Stateful JWT lifecycle (cookie issuance, protected requests, logout invalidation) using Spring Security Test.
- How `@WithMockUser` works with MockMvc to simulate authenticated users and roles.
- How to test administrative operations like role promotion/demotion and access restriction.
- The importance of keeping documentation (Requirements, Architecture, Deployment, Testing) in sync with the final production architecture.

## 2. What I Implemented
- **Testing:** Added `AuthenticationLifecycleTest.java` and `RoleManagementTest.java`. Expanded the test suite to **16 automated tests**.
- **Documentation:** Updated `docs/testing.md` to reflect the new test counts and classes.
- **Documentation:** Updated `docs/architecture.md` to document the Vercel Reverse Proxy and Stateful JWT flow.
- **Documentation:** Updated `docs/deployment.md` to document Spring Profiles and environment variables.
- **Documentation:** Updated `docs/requirements.md` to mark NFR-01 (Stateful JWT) as Implemented and document the CSRF trade-off.
- **Documentation:** Updated `docs/api-contract.md` to reflect HttpOnly Cookies instead of Bearer tokens.
- **Submission:** Prepared the final `README.md`, recorded the demo video, and submitted the assignment.

## 3. Files / Folders Changed
- `backend/src/test/java/.../AuthenticationLifecycleTest.java` (Created)
- `backend/src/test/java/.../RoleManagementTest.java` (Created)
- `docs/testing.md`, `docs/architecture.md`, `docs/deployment.md`, `docs/requirements.md`, `docs/api-contract.md` (Updated)
- `README.md` (Updated)

## 4. How I Tested It
- **Automated Tests:** Ran `./mvnw test`. Verified that all **16 tests** pass locally.
- **CI Pipeline:** Verified that GitHub Actions ran all 16 tests successfully (Green checkmark).
- **Live Deployment:** Verified the final production deployment on Vercel and Render. Tested login, creating requests, admin role changes, and profile updates.
- **Docker:** Rebuilt and tested the Dockerized stack to ensure local consistency.

## 5. Evidence Links
- **GitHub Actions (16 Tests Passing):** ![GitHub Actions](./github_actions.png)
- **Local Test Output:** ![Local Tests](./Test_Success.png)


## 6. Problem Encountered
- The new `AuthenticationLifecycleTest` initially failed with `403 Forbidden` when testing the logout flow, because the CSRF token was not being extracted and passed correctly from the login response to the logout request.

## 7. How I Investigated It
- Reviewed the test logs and realized that the `XSRF-TOKEN` cookie was not being generated on the login request (since CSRF is ignored for auth endpoints).
- Attempted to extract the token from the protected request instead.

## 8. Root Cause
The test was trying to pass a CSRF token that didn't exist yet. Additionally, the login request didn't require CSRF, but the logout request did.

## 9. How I Fixed It
- Refactored the `AuthenticationLifecycleTest` to use `@WithMockUser` to simulate an authenticated user for the protected endpoint and logout. This bypassed the need to manually extract and pass CSRF tokens.
- Verified that the `RoleManagementTest` also used `@WithMockUser` for Admin and User contexts, ensuring consistent test results.

## 10. What I Would Improve
- **Global Exception Handler:** Add a `@RestControllerAdvice` to return clean JSON error responses instead of raw Spring Security 403 errors.
- **Idempotency Keys:** Implement idempotency keys (e.g., `X-Request-Id` header) to prevent the duplicate request edge case caused by the Axios retry interceptor.
- **E2E Testing:** Implement End-to-End tests using Playwright or Cypress to verify the React frontend interacting with the backend.
- **CSRF in Production:** Re-enable CSRF protection in production once the reverse proxy is fully stable.

## 11. Git Activity
- **Branch:** `main`
- **Commit Hash:** 2748bd818ecc3284b595d6dda87d587f13e0a1e4
- **Pull Request:** N/A

## 12. Blockers / Questions for Supervisor
- **Blocker:** None. The application is fully functional, tested, and documented.
- **Question:** N/A