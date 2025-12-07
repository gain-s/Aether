# Gemini Quota Operations Runbook

**Date**: December 7, 2025  
**System**: Aether - Ebook Generation Platform  
**Component**: Gemini API Quota Management

---

## Quick Reference

| Item                    | Value                                                  |
| ----------------------- | ------------------------------------------------------ |
| **Quota Limit**         | 20 API calls per minute (Gemini free tier)             |
| **Deferral Threshold**  | 90% of quota used (18+ calls in current minute)        |
| **Pause Duration**      | 65 seconds (safe buffer beyond 60s window)             |
| **Max Queue Size**      | 50 deferred jobs                                       |
| **Monitoring Endpoint** | `GET /api/quota-status`                                |
| **Health Check**        | Server logs include quota metrics with `DEBUG_QUOTA=1` |

---

## How Quota Management Works

### The Flow

1. **User Request** → POST `/api/ebook/generate` (returns 202 + jobId)
2. **Job Creation** → jobQueueManager checks quota status
3. **Decision**:
   - **Quota ≤ 90%**: Job enters "processing" status immediately
   - **Quota ≥ 90% OR paused**: Job enters "deferred" status, scheduled to resume
4. **Processing** → genieService.generateEbook() tracks each API call via quotaTracker.recordCall()
5. **Result** → Job completes or enters cooldown

### Quota Pause Mechanism

When quota is exhausted (20/20 calls used):

- System automatically pauses for 65 seconds
- New requests are deferred until pause expires
- Client receives message: _"Quota limit reached. Your request will start in ~45s"_
- Frontend displays waiting indicator with countdown

### Deferral Queue

Jobs deferred due to quota are stored in memory:

- Checked every 5 seconds (`deferralCheckInterval`)
- Resumed when quota pause expires and quota is available
- Max 50 jobs allowed to prevent memory exhaustion
- Older jobs cleaned up after 1 hour

---

## Monitoring & Observability

### Check Quota Status

```bash
# Get current quota metrics
curl http://localhost:3000/api/quota-status

# Expected response:
{
  "quota": {
    "callCount": 8,           # Calls used in current 60-second window
    "limit": 20,
    "remaining": 12,
    "percentUsed": 40,
    "isPaused": false,
    "pauseUntil": null,
    "secondsUntilReset": 45,
    "dailyCallCount": 127
  },
  "queue": {
    "processing": 2,
    "deferred": 1,
    "complete": 15,
    "error": 0,
    "totalJobs": 18,
    "maxQueueSize": 50
  },
  "timestamp": "2025-12-07T17:30:45.123Z"
}
```

### Enable Detailed Logging

```bash
# Show all quota decisions and state changes
export DEBUG_QUOTA=1
npm run dev

# Logs will include:
# {"timestamp":"...", "level":"WARN", "context":"QuotaTracker", "message":"Approaching quota limit", "callCount":15, "limit":20, "percentUsed":75}
# {"timestamp":"...", "level":"INFO", "context":"JobQueue", "message":"Job deferred due to quota", ...}
```

### Metrics to Track

| Metric              | What to Watch              | Alert Threshold                   |
| ------------------- | -------------------------- | --------------------------------- |
| `quota.percentUsed` | Should stay ≤ 90% normally | > 90% = deferral starting         |
| `quota.isPaused`    | Should be false normally   | `true` = system is in cooldown    |
| `queue.deferred`    | Should be < 5 normally     | > 20 = too many jobs waiting      |
| `queue.totalJobs`   | Growth rate indicates load | Doubling unexpectedly = issue     |
| `dailyCallCount`    | Track API consumption      | Approaching monthly limit = issue |

---

## Operational Procedures

### Procedure 1: Verify Quota System is Working

**When to do this**: After deployment, before heavy load testing

```bash
# 1. Start server with real API
export USE_REAL_AI=1
export GEMINI_API_KEY='your-key'
npm run dev

# 2. Check quota endpoint returns data
curl http://localhost:3000/api/quota-status

# 3. Generate small test ebook
curl -X POST http://localhost:3000/api/ebook/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test story", "pageCount":5}'

# 4. Verify quota.callCount increased
curl http://localhost:3000/api/quota-status | grep callCount

# Expected: callCount should be ≥ 1
```

**Success Criteria**:

- ✅ Endpoint returns 200 with valid quota metrics
- ✅ callCount increases as jobs generate
- ✅ No 500 errors or timeouts

---

### Procedure 2: Test Quota Pause & Deferral

**When to do this**: Validate deferral logic works correctly

```bash
# 1. Start server with real API and verbose logging
export USE_REAL_AI=1
export DEBUG_QUOTA=1
npm run dev

# 2. Generate rapid sequential requests (will exhaust quota)
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/ebook/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Test story '$i'", "pageCount":5}' &
done
wait

# 3. Monitor server logs for deferral messages
# Should see: "Job deferred due to quota" in logs

# 4. Check quota endpoint during pause
curl http://localhost:3000/api/quota-status | grep isPaused
# Expected: "isPaused": true

# 5. Wait 65 seconds and check again
sleep 70
curl http://localhost:3000/api/quota-status | grep isPaused
# Expected: "isPaused": false

# 6. Check deferred jobs resumed
# Should see in logs: "Job resumed from deferral"
```

**Success Criteria**:

- ✅ First 1-2 jobs process immediately
- ✅ Later jobs enter "deferred" status
- ✅ Jobs auto-resume after 65s cooldown
- ✅ No quota 429 errors from Gemini

---

### Procedure 3: Manually Reset Quota (If Needed)

**When to do this**: If quota appears stuck or incorrect (rare)

**WARNING**: This is a last resort. Only use if quota is clearly broken.

```bash
# 1. Stop the server
# (Ctrl+C in terminal)

# 2. Edit server/geminiClient.js if permanent reset needed, OR
# 3. Simply restart server - in-memory quota resets
npm run dev

# Quota tracker will reinitialize with:
# - callCount: 0
# - pauseUntil: null
# - dailyCallCount: 0 (preserved in logs)

# 4. Verify quota reset
curl http://localhost:3000/api/quota-status
# Should show: "callCount": 0, "percentUsed": 0, "isPaused": false
```

**Note**: Quota resets automatically every 60 seconds anyway. Only restart if stuck > 90s.

---

## Troubleshooting

### Issue: "Quota at 100%. 0 calls remaining" but no pause

**Cause**: Window rotation may be delayed or quota not persisting  
**Solution**:

1. Check server logs: `export DEBUG_QUOTA=1`
2. Verify quota endpoint: `curl http://localhost:3000/api/quota-status`
3. If stuck, restart server (in-memory quota resets)

### Issue: Jobs stuck in "deferred" status, not resuming

**Cause**: Deferral processor may not be running or quota still paused  
**Solution**:

1. Check server logs for "Deferral processor started"
2. Verify quota.isPaused = false with endpoint check
3. Check deferral queue size: `curl http://localhost:3000/api/quota-status | grep deferred`
4. If queue > 50, oldest jobs are rejected (max queue reached)

### Issue: HTTP 503 "Queue is full"

**Cause**: More than 50 jobs deferred simultaneously  
**Solution**:

1. Wait for quota to reset and jobs to resume
2. Implement request throttling on client side
3. Consider batch optimization (TASK 2.B in roadmap)

### Issue: API returns 429 "Quota exceeded" even with deferral enabled

**Cause**: Deferral logic may be overridden or quota tracking missed a call  
**Solution**:

1. Check `quotaTracker.recordCall()` is called BEFORE each Gemini API call
2. Search genieService.js for all `callGemini()` invocations
3. Ensure `quotaTracker.recordCall()` happens first
4. Verify response is checked before retrying

### Issue: Daily call count always 0 or not incrementing

**Cause**: Metrics not tracked, or quota tracker not properly initialized  
**Solution**:

1. Verify quotaTracker is singleton: `const { quotaTracker } = require('./geminiClient')`
2. Check Logger output: `export DEBUG_QUOTA=1 npm run dev | grep dailyCallCount`
3. Confirm calls are happening: `curl /api/quota-status`

---

## Prevention & Best Practices

### For Development

- Use mock AI service for testing: Set `USE_REAL_AI=0` (default)
- Only enable `USE_REAL_AI=1` when ready to test quota
- Keep `DEBUG_QUOTA=1` enabled during development for visibility

### For Staging

- Monitor quota status regularly during load testing
- Set up alerts when percentUsed > 75%
- Test at realistic concurrency levels before production
- Document any patterns seen (e.g., "peak at 9 AM, 60 calls/hour")

### For Production

- Monitor daily call count to track consumption
- Set budget alert when `dailyCallCount > 500` (adjust per usage)
- Implement request throttling if quota exhaustion becomes common
- Plan batch optimization (Phase 2) if quota is consistently tight

### For Incident Response

If quota-related outage occurs:

1. **Immediate**: Check `GET /api/quota-status` - is system paused?
2. **Short-term**: If stuck, restart server (reset in-memory quota)
3. **Medium-term**: Enable `DEBUG_QUOTA=1`, check logs for missed calls
4. **Long-term**: Implement batch optimization or upgrade API tier

---

## Related Documentation

- **Implementation Details**: `/docs/design/ebookService/GEMINI_QUOTA_IMPLEMENTATION_GUIDE.md`
- **Architecture Overview**: `/docs/design/ebookService/EBOOK_ARCHITECTURE_FINAL_RECAP.md`
- **Strategy & Rationale**: `/docs/design/ebookService/GEMINI_QUOTA_MANAGEMENT_STRATEGY.md`

---

## Support Contact

For quota-related issues:

1. Check this runbook first
2. Review logs with `DEBUG_QUOTA=1`
3. Consult architecture documentation
4. Escalate with quota metrics and logs to dev team

---

**Last Updated**: December 7, 2025  
**Status**: Active & Tested  
**Version**: 1.0
