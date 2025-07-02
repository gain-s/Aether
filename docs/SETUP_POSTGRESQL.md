# Set up and Test PostgreSQL

This guide describes how to set up and test PostgreSQL for AetherPress, without interfering with the current SQLite-based development.

## 1. Start the PostgreSQL Service (or Use SQLite Fallback)

- If Docker and PostgreSQL are available (e.g., in a local or cloud environment with Docker support):
  - The PostgreSQL service will start automatically with Docker Compose when the devcontainer launches.
  - To manually start, run:
    ```sh
    docker-compose up -d db
    ```
- **If Docker is NOT available (e.g., in Codespaces or restricted environments):**
  - Use SQLite as the development database.
  - Set the `DATABASE_URL` environment variable to a SQLite file path, such as:
    ```sh
    DATABASE_URL=sqlite:///data/dev.db
    ```
  - Ensure your backend code can detect and use SQLite when PostgreSQL is not available. Document this fallback in your README and setup docs.

## 2. Create a Separate PostgreSQL Schema

- Design your PostgreSQL schema (tables, indexes, etc.) using the migration tool Prisma.
- Place migration or schema files in a new directory, e.g., `backend/db/postgres/`.
- Continue to use SQLite for all development and testing until you are ready to migrate.

## 3. Keep SQLite Code Unchanged

- Do not modify any code that currently connects to or uses SQLite.
- Continue development and testing with SQLite as usual.
- When ready to switch to PostgreSQL, update the `DATABASE_URL` and backend configuration accordingly.

## 4. Add PostgreSQL Connection Code (Optional, Non-intrusive)

- You may add new modules or services for PostgreSQL connection and queries, but do not wire them into the main application yet.
- Use environment variables (e.g., `DATABASE_URL`) for configuration.

## 5. Test PostgreSQL Setup in Isolation

- Write and run scripts or tests that connect to PostgreSQL and verify schema creation, data insertion, and queries—without touching the main app logic.
- Example test script location: `backend/db/postgres/test-connection.js`

## 6. Document the Setup

- Update this document or add a README in the migration/scripts directory to describe how to start PostgreSQL, run migrations, and test the connection.

## 7. Plan for Future Migration

- When ready, plan a migration path: update the backend to support both databases (if needed), or switch to PostgreSQL by changing configuration and updating code.

---

**Summary:**
You can safely set up and test PostgreSQL in parallel, while using SQLite as a fallback for development in environments where Docker/PostgreSQL are not available. This ensures uninterrupted development and a smooth migration path when ready.
