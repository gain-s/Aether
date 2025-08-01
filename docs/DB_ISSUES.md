# Database Test Isolation & Minimal Setup

## Purpose

Document minimal, effective strategies for reliable backend test isolation and future database migration.

---

## Actionables for Minimal, Effective Test Setup

1. **Use a Dedicated Test Database**

   - Configure tests to use an in-memory SQLite database (`:memory:`) or a separate test file (e.g., `aetherpress_test.db`).
   - Prevents test data from affecting production or development databases.

2. **Clean Relevant Tables Before/After Tests**

   - Run `DELETE FROM` statements for all tables before each test run (or suite) to ensure a known state.
   - Guarantees test isolation and reliability.

3. **Only Create Schema/Data Needed for Tests**

   - Initialize only the tables and columns required for the tests.
   - Avoid unnecessary schema complexity in the test environment.

4. **Assert on Test Data, Not Global State**

   - Write assertions for the specific data created by the test, not the total row count or global state.
   - Makes tests robust and independent of pre-existing data.

5. **Document Test Isolation Strategy**
   - Clearly note in test suite documentation that a dedicated test database and table cleanup are used for isolation.
   - Facilitates future migration and onboarding.

---

## Implementation Example

```js
// Example: Clean tables before all tests
beforeAll(async () => {
  await db.run("DELETE FROM prompts");
  await db.run("DELETE FROM ai_results");
  await db.run("DELETE FROM overrides");
  await db.run("DELETE FROM pdf_exports");
});
```

---

## Migration Readiness

- Centralize schema and data access logic for easy porting to PostgreSQL or other databases.
- Keep test setup minimal and maintainable.
