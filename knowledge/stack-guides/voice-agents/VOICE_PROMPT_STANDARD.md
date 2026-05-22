# 🎙️ Voice Prompt Standard

**Status:** ✅ VibeThink Standard
**Context:** Voice Agents (Retell AI, Vapi, Bland)
**Goal:** Prevent hallucinations, reduce latency, and ensure multi-language stability.

---

## 1. The Golden Rule: "Split Architecture"
Don't put business logic in the Prompt. The LLM is for **Conversation**, n8n/Backend is for **Logic**.

| Component | Responsibility | Bad Example | Good Example |
|-----------|----------------|-------------|--------------|
| **Prompt** | UX, Tone, Gathering Intent | "If order > $50 add tax" | "I'll check the total for you." |
| **Backend** | Calculation, Database, Validation | N/A | `calculate_total(items)` |

---

## 2. Language Lock Protocol 🔒
LLMs often hallucinate (switch languages) mid-call unless strictly constrained.

### The Algorithm:
1.  **Detection Phase:** Listen to the first 2 user turns.
2.  **Locking Phase:** Explicitly set a `locked_language` variable in the backend context.
3.  **Enforcement:**
    *   If user speaks `English` but lock is `Spanish` -> Politely clarify boundaries.
    *   **Prompt Instruction:**
        > "You are locked to {{language}}. If the user switches language, politely ask to continue in {{language}}."

---

## 3. Short Prompt Structure (Low Latency)
Every token costs milliseconds. Keep system prompts under **800 tokens**.

```markdown
# Role
You are [Name], a friendly assistant for [Business].

# Dynamic Context (Injected)
- Store Hours: {{store_hours}}
- Menu Status: {{menu_availability}}

# Objective
Take orders efficiently. Confirm items.

# Tools
- check_availability(item)
- place_order(order_details)
```

---

## 4. Anti-Hallucination Rules
1.  **Don't Guess Prices:** "The burger is $10" (Bad) -> Call `get_price('burger')` (Good).
2.  **Don't Invent Policy:** If the policy isn't in `{{store_policy}}`, transfer to human.
