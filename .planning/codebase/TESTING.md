# Testing Patterns

**Analysis Date:** 2026-05-17

## Test Framework

**Runner:**

- **Web/Server:** Lightweight node runtime executing TypeScript directly via **tsx** compiler. No large test frameworks (like Jest, Vitest, or Mocha) are currently utilized.
- **Mobile:** Core **flutter_test** package for native Flutter test runner.

**Assertion Library:**

- **Web/Server:** Standard built-in Node.js **assert** module, employing strict assertion calls (e.g. `assert.throws`, `assert.doesNotThrow`).
- **Mobile:** standard Dart/Flutter testing matchers (`expect`, `findsOneWidget`, `findsNothing`).

**Run Commands:**

```bash
# Run web/server assertions
npx tsx tests/validation.test.ts

# Run mobile unit and widget tests
cd mobile && flutter test
```

## Test File Organization

**Location:**

- **Web/Server:** Custom test scripts are centralized in the `tests/` directory at the project root. Application code is kept clean of test files.
- **Mobile:** Tests are physically separated in the `mobile/test/` directory, mirroring the structure of `mobile/lib/`.

**Structure:**

```
virat-crm/
├── tests/
│   └── validation.test.ts   # Custom pincode and RBAC test definitions
└── mobile/
    └── test/
        └── widget_test.dart  # Mobile widget smoke test
```

## Test Structure

**Suite Organization:**
Tests are structured as modular simulation functions (e.g. `testPincodeValidation`, `testRBAC`) called by an orchestrating wrapper `runAll()`. Success is verified via exit codes: code `0` for success and `1` for failures.

**Pattern Example (`tests/validation.test.ts`):**

```typescript
import assert from "assert";

function testSomething() {
  console.log("Running Something Tests...");

  // Arrange & Act & Assert
  assert.doesNotThrow(
    () => checkBehavior("valid"),
    "Should not throw on valid",
  );
  assert.throws(
    () => checkBehavior("invalid"),
    /Error pattern/,
    "Should throw on invalid",
  );

  console.log("✔ Something Tests Passed!");
}
```

## Mocking

- **Web/Server:** The codebase relies on **Direct Simulation** instead of a mocking framework. For example, role permissions and hierarchy relationships are simulated using static logic branches in `tests/validation.test.ts` to test expected outputs under different inputs.
- **Mobile:** Widget rendering utilizes Flutter's `WidgetTester` to pump components into memory, simulating user gestures (taps/scrolls) and verifying properties.

## Fixtures and Factories

- **Web/Server:** Mock parameters (e.g. Indian pincodes `"110001"`, `"010001"`, and test roles `"Admin"`, `"Manager"`, `"Employee"`) are kept inline inside assertion files to keep the setup minimal and extremely fast to execute.
- **Mobile:** Widget testing builds mock environments (`MyApp()`) to verify component initialization.

## Coverage

- **Enforcement:** No formal coverage minimums are currently enforced via CI/CD gates.
- **Focus:** Focus is on securing critical pathways, such as regex filters for Indian postal APIs and strict Role-Based Access Control verification.

## Test Types

### 1. Schema Validation (Unit Tests)

- **Scope:** Verifies Zod parsing filters against regular expressions.
- **Focus:** Ensures edge cases for data entries are caught before hitting the database (e.g. Indian pincodes starting with `0` are rejected).
- **Execution:** Runs in milliseconds via `tsx`.

### 2. Permissions Simulation (Integration Tests)

- **Scope:** Simulates active user context actions to evaluate permission barriers.
- **Focus:** Ensures that:
  - Admins can update any status.
  - Managers can only modify sales belonging to their own branches.
  - Employees are rejected immediately when attempting updates.

---

_Testing analysis: 2026-05-17_
_Update when test patterns change_
