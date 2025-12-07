# Test Scripts Documentation

This directory contains manual testing and verification scripts for the Aether application.

## Quick Test Scripts

### test-cache-clear.js

**Purpose**: Verify cache clearing endpoint  
**Usage**: `node test-cache-clear.js`  
**What it does**:

- Sends POST request to `/api/cache/clear`
- Verifies response status and payload
- Tests cache invalidation functionality

**When to use**: When testing cache management or after deployment to verify endpoints are working

---

### test-step1.js

**Purpose**: End-to-end HTML pipeline testing  
**Usage**: `node test-step1.js`  
**What it does**:

- Tests 3-layer logging infrastructure
- Tests HTML field flow through generation pipeline
- Generates a 10-page ebook with test prompt
- Polls job status until completion
- Verifies HTML output contains expected fields

**When to use**: For full pipeline validation, content generation testing

**Test Data**: "Benny the Brave Bunny" - A children's story prompt

---

### test-title-debug.js

**Purpose**: Detailed title extraction and processing debug  
**Usage**: `node test-title-debug.js`  
**What it does**:

- Tests title extraction from prompts
- Verifies title processing in generation pipeline
- Generates a 10-page ebook
- Monitors title-specific handling

**When to use**: When debugging title extraction issues, validating prompt parsing

---

### verify-export-fix.js

**Purpose**: Verify exportContent method implementation  
**Usage**: `node verify-export-fix.js`  
**What it does**:

- Checks that `genieService.exportContent` exists
- Verifies CASE 1 uses `getResultById` (not `getPersistedContent`)
- Validates CASE 2 handles direct content
- Confirms CASE 3 handles legacy format
- Inspects code implementation without running backend

**When to use**: After code changes to export functionality, before running full tests

---

## Common Usage Patterns

### Running a single test

```bash
cd /workspaces/Aether
node scripts/test-cache-clear.js
```

### Running sequential tests

```bash
node scripts/test-cache-clear.js && node scripts/test-step1.js
```

### Running with debug output

```bash
DEBUG=1 node scripts/test-step1.js
```

### Running against different servers

```bash
# Against local development server (default: localhost:3000)
node scripts/test-step1.js

# Against staging (requires environment variable)
API_URL=https://staging.example.com node scripts/test-step1.js
```

---

## Server Requirements

Most tests require the backend server to be running:

```bash
cd /workspaces/Aether/server
npm run dev
```

**Exception**: `verify-export-fix.js` does NOT require a running server—it inspects source code only.

---

## Test Results

Tests output:

- ✓ for passed checks
- ✗ or error messages for failures
- HTTP status codes and response bodies for API calls
- Timing information where applicable

---

## Related Resources

- Backend tests: See `server/__tests__/` directory
- Integration tests: See `server/__tests__/*integration*` files
- Client tests: See `client/__tests__/` directory

---

## Contributing

When adding new test scripts:

1. Place in this directory
2. Add shebang: `#!/usr/bin/env node`
3. Add JSDoc comment explaining purpose
4. Document in this README
5. Ensure script is executable: `chmod +x script-name.js`

---

**Last Updated**: December 7, 2025
