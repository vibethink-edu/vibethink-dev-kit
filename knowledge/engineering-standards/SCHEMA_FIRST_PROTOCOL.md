# 🛡️ Schema-First Design Protocol

**Status:** ✅ VibeThink Standard
**Philosophy:** "If it's not in the Schema, it doesn't exist."

---

## 1. The Core Rule
**NEVER** write application code (Frontend, Backend, or Agents) until the Data Schema is defined and validated.

### The "VibeThink Flow"
1. **Raw Input** (Client CSVs, PDFs)
2. **Analysis** (Using `DATA_ANALYSIS_TEMPLATE.md`)
3. **Schema Definition** (`schema.sql` & `schema.dbml`)
4. **Validation** (Does this schema solve the client's Excel complexities?)
5. **Code** (Now you can write TS/Python/n8n)

---

## 2. Artifacts

### 2.1 `db/schema.sql`
The PostgreSQL source of truth.
*   Must use `snake_case`.
*   Must include comments on complex columns.
*   **Must be idempotent** (safe to run multiple times or use migrations).

### 2.2 `db/schema.dbml` (Optional but Recommended)
Visual representation for `dbdiagram.io`. Excellent for showing the client relationships without showing code.

```dbml
Table users {
  id integer [primary key]
  username varchar
}

Table posts {
  id integer [primary key]
  user_id integer [ref: > users.id]
}
```

---

## 3. Handling Ambiguity (The "Client Gap")

**Scenario:** Client sends a menu but prices are "Ask Manager".
**Protocol:**
1. Do NOT hardcode "0.00" without flagging it.
2. Add a `metadata` JSONB column to storing raw extra info.
3. Create a GitHub Issue: "Clarify Pricing Logic".

---

## 4. AI Agent Instruction
If you are an AI Agent reading this:
1. **Always** ask to see `db/schema.sql` before proposing backend logic.
2. If `db/schema.sql` does not exist, **STOP** and propose creating it based on Available Context.
