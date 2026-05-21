<!-- generated-by: gsd-doc-writer -->

## Test Framework and Setup

The project currently uses ad-hoc TypeScript scripts using Node's built-in `assert` module for validation and unit testing. No formal testing framework (such as Jest or Vitest) is installed. Tests are written in the `tests/` directory.

To run the tests, you must have `tsx` installed (which is included in `devDependencies`) to execute TypeScript files directly.

## Running Tests

There are no pre-configured `test` scripts in `package.json` for running the test suite automatically. You can execute individual test files manually using `tsx`.

Run the validation tests:

```bash
npx tsx tests/validation.test.ts
```

## Writing New Tests

If you are adding new ad-hoc tests, follow the existing pattern in `tests/validation.test.ts`:

- Use `assert.doesNotThrow` and `assert.throws` for validation logic.
- Wrap test categories in functions (e.g., `testPincodeValidation()`).
- Call all test functions inside a `runAll()` executor that exits with `process.exit(1)` on failure or `process.exit(0)` on success.

## Coverage Requirements

No coverage threshold is currently configured.

## CI Integration

No CI/CD pipelines (e.g., GitHub Actions) are currently configured to run these tests automatically. All testing should be performed locally before submitting a Pull Request.
