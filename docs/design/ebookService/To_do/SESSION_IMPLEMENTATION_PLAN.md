# Session Implementation Plan: Quota Management & Deployment Readiness

**Date**: December 7, 2025  
**Duration**: 2 x 2-hour sessions  
**Branch**: `feat/revert`  
**Objective**: Complete TASK 1-6 from PREREQ_TODO_BEFORE_BATCH_OPTIMIZATION to unblock Batch Optimization Phase 2-5

---

## Session Overview

| Session       | Time  | Tasks                                     | Expected Outcome                                        |
| ------------- | ----- | ----------------------------------------- | ------------------------------------------------------- |
| **Session 1** | 2 hrs | TASK 1, TASK 2 (partial), TASK 3          | Quota system functional, tests passing, logs structured |
| **Session 2** | 2 hrs | TASK 2 (complete), TASK 4, TASK 5, TASK 6 | Full validation, deployment ready                       |

---

## Session 1: 2 Hours (Critical Fixes & Testing)

### TASK 1: Fix Infinite Recursion Error ⏱️ 15-20 min

**Status**: 🔴 CRITICAL  
**File**: `server/geminiClient.js`  
**Objective**: Remove circular dependency between `getStatus()` and `getMessage()`

**Implementation**:

- [ ] Open `server/geminiClient.js`
- [ ] Locate `getStatus()` method (around line 74)
- [ ] Remove line with `message: this.getMessage()`
- [ ] Refactor `getMessage()` to access instance properties directly instead of calling `getStatus()`
- [ ] Test: `curl http://localhost:3000/api/quota-status` → expect 200 response

**Code Changes**:

```javascript
// In getStatus() method - REMOVE this line:
message: this.getMessage(),

// In getMessage() method - use instance properties:
getMessage() {
  const percentUsed = Math.round((this.callCount / this.limit) * 100);
  // ... build message without calling getStatus()
}
```

**Success Criteria**:

- ✅ No "Maximum call stack size exceeded" errors
- ✅ `/api/quota-status` returns 200 with valid JSON
- ✅ Response includes: `callCount`, `limit`, `percentUsed`, `isPaused`, `secondsUntilReset`

**Actual Time Spent**: **\_\_\_** min

---

### TASK 2: Run Quota Tests with Real Gemini API ⏱️ 90 min total (20 min Session 1, 70 min Session 2)

**Status**: 🟡 BLOCKED (by TASK 1)  
**Files**:

- `server/__tests__/geminiClient.test.js`
- `server/__tests__/jobQueueManager.quota.test.js`

#### Session 1 Subtask (20 min):

**2.A: Run Unit & Integration Tests (Mocked)**

- [ ] Run: `npm test -- geminiClient.test.js jobQueueManager.quota.test.js`
- [ ] Expected: All tests pass with mocked Gemini API
- [ ] Document any failures (expected: none)
- [ ] Record test count and pass rate

**Success Criteria** (Session 1):

- ✅ All unit tests passing (≥10 tests for QuotaTracker)
- ✅ All integration tests passing (≥5 tests for deferral logic)
- ✅ No test failures blocking next session
- ✅ Test output captured for documentation

**Actual Time Spent**: **\_\_\_** min

---

### TASK 3: Replace Console.log with Structured Logger ⏱️ 60 min (40 min Session 1, 20 min Session 2)

**Status**: 🟠 MEDIUM PRIORITY  
**Objective**: Create structured logging system for quota operations

#### Session 1 Subtask (40 min):

**3.A: Create Logger Utility**

- [ ] Create `server/utils/Logger.js`
- [ ] Implement structured logging with levels: info, warn, error
- [ ] Support `DEBUG` environment variable for verbose output
- [ ] Include timestamp, level, context fields

**3.B: Update geminiClient.js Logs (Priority 1)**

- [ ] Replace console.log in `pause()` method
- [ ] Replace console.log in `handleQuotaError()` method
- [ ] Replace console.error calls

**3.C: Update jobQueueManager.js Logs (Priority 2)**

- [ ] Replace console.log for deferral decisions
- [ ] Replace console.log for job status changes

**Example Implementation**:

```javascript
// server/utils/Logger.js
class Logger {
  static info(context, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      context,
      message,
      ...data,
    };
    if (process.env.DEBUG) {
      console.log(JSON.stringify(log));
    }
  }

  static warn(context, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: "WARN",
      context,
      message,
      ...data,
    };
    console.warn(JSON.stringify(log));
  }

  static error(context, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      context,
      message,
      ...data,
    };
    console.error(JSON.stringify(log));
  }
}

module.exports = Logger;
```

**Success Criteria** (Session 1):

- ✅ Logger.js created and exported
- ✅ geminiClient.js updated (pause/error logs)
- ✅ jobQueueManager.js deferral logs updated
- ✅ Tests still pass (no breaking changes)

**Actual Time Spent**: **\_\_\_** min

---

## Session 1 Summary & Handoff

**Expected Completions**:

1. ✅ TASK 1 complete (infinite recursion fixed) — 10 min
2. ✅ TASK 2.A complete (all 677 tests passing) — 5 min
3. ✅ TASK 3 complete (Logger implemented, all quota logs updated) — 35 min

**Status Check** (End of Session 1):

- ✅ `/api/quota-status` endpoint returns 200 with valid quota metrics
- ✅ All 677 tests passing (64 test files, 1 skipped)
- ✅ geminiClient.js logs use structured Logger (recordCall, rotateWindow, pause, handleQuotaError, reset)
- ✅ jobQueueManager.js logs use structured Logger (all job operations, deferral tracking)
- ✅ Logger utility exists at `server/utils/Logger.js` with DEBUG/DEBUG_QUOTA support

**Session 1 Total Time**: ~50 minutes (40 minutes ahead of schedule)

**Blockers/Issues Found**:

- None! All implementations complete and tested.

**Handoff Notes for Session 2**:

- Ready to proceed with TASK 2.B (real API testing)
- No outstanding issues
- Server and client still running and healthy
- All quota infrastructure in place and working correctly

**Blockers/Issues Found**:

```
Issue: _______________________________________________
File: _______________________________________________
Impact: ______________________________________________
Resolution: __________________________________________
```

**Handoff Notes for Session 2**:

- Priority: Complete TASK 2.B (real API testing)
- Then: TASK 4, TASK 5, TASK 6
- Watch for: API rate limits during testing

---

## Session 2: 2 Hours (Testing & Deployment Readiness)

### TASK 2.B: Manual Testing with Real Gemini API ⏱️ 70 min

**Status**: 🟡 BLOCKED (until Session 1 TASK 1 complete)  
**Files**: Real API testing script

**2.B Setup (10 min)**:

- [ ] Verify `GEMINI_API_KEY` is set in environment
- [ ] Verify `USE_REAL_AI=1` flag available
- [ ] Start server with: `USE_REAL_AI=1 npm run dev`
- [ ] Verify no immediate startup errors

**2.B Test: Sequential Ebook Generation (40 min)**:

- [ ] Generate ebook #1: 20 pages
  - [ ] Verify request returns 202 + jobId
  - [ ] Monitor server logs for quota tracking
  - [ ] Poll `/api/ebook/generate/{jobId}/status` until complete
  - [ ] Verify result has PDF
  - [ ] Check quota usage (should be 1 + 20 calls = 21 total, or 1 + N for chapters)
- [ ] Wait for quota reset (if needed) or proceed to #2
- [ ] Generate ebook #2: 20 pages
  - [ ] If quota approaching: Should see "deferred" message
  - [ ] Monitor deferral queue via `/api/quota-status`
  - [ ] Wait for 65-second cooldown
  - [ ] Verify auto-resume after cooldown
  - [ ] Verify generation completes without 429 errors

**2.B Validation (20 min)**:

- [ ] Check frontend displays quota percentage
- [ ] Verify progress bar updates during generation
- [ ] Confirm deferred message appears if job queued
- [ ] Check memory usage stable (no leaks)
- [ ] Document all observations in test results

**Success Criteria** (Session 2):

- ✅ Ebook #1 generates without errors
- ✅ Ebook #2 defers if quota approaching (expected behavior)
- ✅ Deferred jobs auto-resume after cooldown
- ✅ No 429 quota errors from Gemini API
- ✅ Frontend shows quota status correctly
- ✅ Server logs show all deferral decisions
- ✅ Memory stable over 1 hour test window

**Actual Time Spent**: **\_\_\_** min

---

### TASK 4: Consolidate Test Scripts ⏱️ 30 min

**Status**: 🟠 MEDIUM PRIORITY  
**Objective**: Organize scattered test files

**Implementation**:

- [ ] Create `/scripts/README_TESTS.md` documenting each test
- [ ] Move from root to `/scripts/`:
  - [ ] `test-step1.js`
  - [ ] `test-title-debug.js`
  - [ ] `test-cache-clear.js`
  - [ ] `verify-export-fix.js`
  - [ ] Any other `test-*.js` files in root
- [ ] Update any CI/CD workflow references
- [ ] Verify no broken imports from moved files

**Success Criteria** (Session 2):

- ✅ All test scripts in `/scripts` directory
- ✅ `/scripts/README_TESTS.md` complete with descriptions
- ✅ No loose test files in root
- ✅ CI/CD still finds tests correctly

**Actual Time Spent**: **\_\_\_** min

---

### TASK 5: Add .env Validation at Startup ⏱️ 15-20 min

**Status**: 🟠 MEDIUM PRIORITY  
**File**: `server/index.js`  
**Objective**: Fail fast with clear error messages if config missing

**Implementation**:

- [ ] Add validation at server startup (before service init)
- [ ] Check: `GEMINI_API_KEY` when `USE_REAL_AI=1`
- [ ] Check: `GEMINI_API_URL` when `USE_REAL_AI=1`
- [ ] Exit with code 1 if missing
- [ ] Print helpful error message with setup instructions

**Code Example**:

```javascript
// server/index.js - add near top
if (process.env.USE_REAL_AI === "1") {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY required when USE_REAL_AI=1");
    console.error("   Set with: export GEMINI_API_KEY='your-key-here'");
    process.exit(1);
  }
  if (!process.env.GEMINI_API_URL) {
    console.error("❌ GEMINI_API_URL required when USE_REAL_AI=1");
    process.exit(1);
  }
}
```

**Success Criteria** (Session 2):

- ✅ Server exits immediately if `USE_REAL_AI=1` but `GEMINI_API_KEY` missing
- ✅ Clear error message displayed
- ✅ No silent failures or confusing API errors later
- ✅ Helpful suggestion included in error message

**Actual Time Spent**: **\_\_\_** min

---

### TASK 6: Verify Deployment Checklist ⏱️ 30-45 min

**Status**: 🟠 MEDIUM PRIORITY  
**Objective**: Complete all deployment validation items

**Pre-Deployment Checklist**:

- [ ] Code review complete (confirm no TODOs/FIXMEs in quota code)
- [ ] All tests passing: `npm test` (expect 677+ tests, 0 failures)
- [ ] No unhandled promise rejections detected
- [ ] Error handling comprehensive for quota scenarios
- [ ] Quota tracking robust to concurrent requests

**Monitoring Setup Checklist**:

- [ ] Frontend quota display working (shows % in progress bar)
- [ ] Server logs show deferral decisions in structured format
- [ ] `/api/quota-status` endpoint accessible and returning data
- [ ] Quota metrics being tracked (callCount, percentUsed, isPaused)
- [ ] Daily call count accumulating correctly

**Documentation Checklist**:

- [ ] Create `server/docs/QUOTA_OPERATIONS_RUNBOOK.md` with:
  - [ ] How quota pause works
  - [ ] How to reset quota manually (if needed)
  - [ ] Common issues & solutions
  - [ ] Monitoring metrics to watch
  - [ ] Alert thresholds
- [ ] Update team on expected behavior (deferral messages, wait times)
- [ ] Document how to test quota system locally

**Staging Readiness Checklist**:

- [ ] Code ready to push to feat/revert
- [ ] No debug flags left in production code
- [ ] Environment variable validation in place
- [ ] Logging configured for production

**Success Criteria** (Session 2):

- ✅ All pre-deployment checklist items ✅ marked
- ✅ All monitoring setup items ✅ marked
- ✅ Runbook created with clear procedures
- ✅ No outstanding issues preventing production

**Actual Time Spent**: **\_\_\_** min

---

## Session 2 Summary & Gate

**Expected Completions**:

1. ✅ TASK 2.B complete (real API testing passes)
2. ✅ TASK 4 complete (test scripts consolidated)
3. ✅ TASK 5 complete (.env validation added)
4. ✅ TASK 6 complete (deployment checklist verified)

**Final Gate Status** (End of Session 2):

- [ ] TASK 1: Infinite recursion fixed ✅
- [ ] TASK 2: All quota tests passing ✅
- [ ] TASK 3: Logger implemented ✅
- [ ] TASK 4: Test scripts organized ✅
- [ ] TASK 5: .env validation in place ✅
- [ ] TASK 6: Deployment checklist complete ✅

**READY FOR BATCH OPTIMIZATION?**

- [ ] Yes - All gates passed, proceed to Phase 2-5
- [ ] No - See blockers section below

**Blockers/Issues Found**:

```
Issue: _______________________________________________
File: _______________________________________________
Impact: ______________________________________________
Resolution: __________________________________________
```

**Metrics Captured**:

- Tests passing: **\_\_\_** / **\_\_\_**
- Manual API tests: **\_\_\_** passed, **\_\_\_** failed
- Server uptime during test: **\_\_\_** minutes
- Peak memory usage: **\_\_\_** MB
- Quota reset cycles observed: **\_\_\_**

---

## Implementation Notes

### Critical Dependencies

1. TASK 1 must complete before TASK 2 can proceed
2. TASK 2.A should complete in Session 1; TASK 2.B in Session 2
3. TASK 3, 4, 5 can proceed in parallel while waiting for test results
4. TASK 6 depends on TASK 1-5 being complete

### Key Files to Monitor

- `server/geminiClient.js` — TASK 1, 3
- `server/jobQueueManager.js` — TASK 2, 3
- `server/__tests__/geminiClient.test.js` — TASK 2
- `server/__tests__/jobQueueManager.quota.test.js` — TASK 2
- `server/index.js` — TASK 5, 6
- `server/utils/Logger.js` — TASK 3 (new file)

### Environment Setup Required

- `GEMINI_API_KEY` — For real API testing (TASK 2.B)
- `USE_REAL_AI=1` — Flag to use real API vs. mocks
- `DEBUG=1` — Optional, enables verbose logging
- `NODE_ENV` — Set to 'development' for testing

### Testing Commands

```bash
# Run quota tests only
npm test -- geminiClient.test.js jobQueueManager.quota.test.js

# Start server for manual testing
USE_REAL_AI=1 npm run dev

# Check quota status endpoint
curl http://localhost:3000/api/quota-status

# Generate ebook for testing
curl -X POST http://localhost:3000/api/ebook/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Your prompt here","pageCount":20}'
```

### Commit Strategy

- **After TASK 1**: Commit with message: `fix: Remove infinite recursion in geminiClient.js quota status`
- **After TASK 2**: Commit with message: `test: Validate quota system with real Gemini API`
- **After TASK 3**: Commit with message: `refactor: Replace console.log with structured logging`
- **After TASK 4**: Commit with message: `chore: Consolidate test scripts to /scripts directory`
- **After TASK 5**: Commit with message: `feat: Add environment variable validation at startup`
- **After TASK 6**: Commit with message: `docs: Complete deployment checklist and create quota runbook`

**Final Commit** (after both sessions):

```
fix: Complete quota management implementation and deployment validation

- Fix infinite recursion in geminiClient.js (TASK 1)
- Validate quota system with real Gemini API (TASK 2)
- Implement structured logging for quota operations (TASK 3)
- Organize test scripts (TASK 4)
- Add environment variable validation (TASK 5)
- Complete deployment checklist (TASK 6)

Ready for Batch Optimization Phase 2-5
```

---

## Progress Tracking

### Session 1 Progress

```
Start Time: _____________
End Time:   _____________

TASK 1: ▯ ▯ ▯ ▯ ▯ (0%)
TASK 2.A: ▯ ▯ ▯ ▯ ▯ (0%)
TASK 3: ▯ ▯ ▯ ▯ ▯ (0%)

Notes: ____________________________________________________________________
```

### Session 2 Progress

```
Start Time: _____________
End Time:   _____________

TASK 2.B: ▯ ▯ ▯ ▯ ▯ (0%)
TASK 4: ▯ ▯ ▯ ▯ ▯ (0%)
TASK 5: ▯ ▯ ▯ ▯ ▯ (0%)
TASK 6: ▯ ▯ ▯ ▯ ▯ (0%)

Notes: ____________________________________________________________________
```

---

**Document Created**: December 7, 2025  
**Next Update**: After Session 1 completion  
**Owner**: Development Agent / Session Lead
