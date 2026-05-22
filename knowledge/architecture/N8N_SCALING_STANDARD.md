# 🧶 N8N Scaling & Architecture Standard

**Status:** ✅ VibeThink Standard
**Context:** High-Volume Agent Scenarios (Voice/Chat)
**Goal:** Ensure reliability, observability, and idempotency in n8n workflows.

---

## 1. Traceability Protocol (The "Black Box" Fix)
Every execution must be traceable across systems (Retell -> n8n -> Supabase).

### The `Trace ID`
1.  **Generate:** At entry node (Webhook). `trace_id = "agent-{timestamp}-{uuid}"`.
2.  **Propagate:** Pass it to **every** sub-workflow and external API call (`X-Trace-Id` header).
3.  **Log:** Store it in DB logs (`metadata->>'trace_id'`).

> **Rule:** If an error occurs and you can't find it by `trace_id`, the architecture failed.

---

## 2. Idempotency (Duplicate Prevention) 🛡️
Webhooks retry. Networks flake. You WILL receive the same "Create Order" request twice.

**The Solution:**
1.  Generate `idempotency_key` (e.g., hash of `call_id` + `timestamp`).
2.  Send this key to your DB/API.
3.  **Constraint:** Database unique constraint on `idempotency_key` prevents double-charges.

---

## 3. Worker Scaling
- **Cloud:** Use "Queue Mode" (n8n native).
- **Self-Hosted:**
    - 1 Worker process per ~10 concurrent heavy workflows.
    - CPU is the bottleneck for JSON parsing; RAM is the bottleneck for Binary data.

---

## 4. Multi-Tenant Architecture
**Never** hardcode Tenant IDs.
*   ❌ `const restaurantId = '123'`
*   ✅ `const restaurantId = $input.body.restaurant_id` (Filtered and Validated)

**Security:** Always enforce Row Level Security (RLS) in Supabase using the Tenant ID.
