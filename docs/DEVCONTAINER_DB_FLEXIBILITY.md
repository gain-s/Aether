# Gradual Steps for Devcontainer Database Flexibility

## Objective

Ensure the devcontainer setup supports both SQLite (default) and PostgreSQL, with minimal risk to environment stability. All changes should be incremental and reversible.

---

## Suggested Steps

1. **Audit Current Devcontainer Configuration**

   - Review `.devcontainer/devcontainer.json` and any related setup scripts for hard dependencies on PostgreSQL or Docker.

2. **Make Database Setup Optional**

   - Update setup scripts to check for PostgreSQL/Docker before running related commands.
   - If not present, skip PostgreSQL setup and ensure SQLite is used by default.

3. **Use Environment Variables for Database Selection**

   - Set a default environment variable (e.g., `AETHERPRESS_DB_TYPE=sqlite` or `DATABASE_URL`) in the devcontainer config.
   - Document how to override this for PostgreSQL.

4. **Add Conditional Logic in Setup Scripts**

   - Use shell scripting to detect `psql` or `docker` and only run PostgreSQL setup if available.
   - Ensure scripts fail gracefully and fall back to SQLite.

5. **Test the Flexible Setup**

   - Verify that the devcontainer launches and the application runs with SQLite by default.
   - Test switching to PostgreSQL (if/when available) and confirm the setup works.

6. **Document the Behavior**

   - Add clear documentation/comments in the devcontainer config and setup scripts.
   - Explain the fallback mechanism and how to switch databases.

7. **Iterate Gradually**
   - Make one change at a time, test thoroughly, and commit incrementally.
   - Roll back any change that causes instability.

---

## Notes

- Avoid making multiple major changes at once.
- Always test the devcontainer after each change.
- Keep the team informed of changes and document all updates.

---

_Last updated: July 2, 2025_
