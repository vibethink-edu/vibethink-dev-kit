# 📞 Retell AI Configuration Standard

**Status:** ✅ VibeThink Standard
**Context:** Retell AI Setup
**Goal:** Baseline settings for production-grade reliability.

---

## 1. LLM Settings

### Production Profile (Speed/Stability)
*   **Model:** `gpt-4o` (Optimized for JSON output)
*   **Temperature:** `0.3` (Low creativity, high adherence to JSON specs)
*   **Max Tokens:** `600` (Prevents monologues)

### Development Profile (Cost)
*   **Model:** `gpt-4o-mini`
*   **Temperature:** `0.5`
*   **Max Tokens:** `400`

---

## 2. Voice Settings (Latency vs Quality)
*   **Provider:** 11Labs vs Deepgram vs OpenAI.
*   **Baseline:** 11Labs Turbo v2.5 (Best latency/quality trade-off).
*   **Responsiveness:** Set to `0.8 - 1.0` seconds (Aggressive). Don't wait too long for silence detection.

---

## 3. Webhook Protocol
All Retell agents MUST implement these 2 hooks:
1.  **`function_call`**: For dynamic data (`check_availability`).
2.  **`call_ended`**: For final data persistence (`create_order`).
