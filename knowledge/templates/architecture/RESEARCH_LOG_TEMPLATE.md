# 🔬 Research Log Template (ADR Lite)

**Status:** Draft / Active / Deprecated
**Author:** [Agent Name]
**Date:** YYYY-MM-DD

---

## 1. Executive Summary
**Question:** What are we trying to solve?
**Verdict:** What is the recommended path?

> **Example:** "Should we use n8n or Make for the backend?" -> "n8n, because of self-hosting capabilities."

---

## 2. Industry Benchmarks
List 3-5 external sources that validate your hypothesis. Don't guess; cite.

| Metric | Value | Source |
|--------|-------|--------|
| Average API Latency | < 200ms | Cloudflare Radar |
| Max Payload Size | 6MB | Lambda Limits |

---

## 3. Key Findings
Bulleted list of discoveries.

### 3.1 Pros / Opportunities
*   Feature X allows...
*   Cost reduction of...

### 3.2 Cons / Risks
*   Complexity increases...
*   Vendor lock-in risk...

---

## 4. Architecture Decision (The "Why")
Explain the logic behind the final choice.

**Why we chose Option A over Option B:**
1.  **Cost:** Option A is free.
2.  **Speed:** Option A is native, Option B uses HTTP.

---

## 5. Implementation Guide
How does this research translate into code?

### 5.1 Configuration Changes
```json
{
  "setting_a": "value"
}
```

### 5.2 Metrics to Watch
*   Latency
*   Error Rate
