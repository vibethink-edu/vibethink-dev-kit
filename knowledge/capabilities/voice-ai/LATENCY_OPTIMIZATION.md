# Latency Optimization (Prosodic Buffering)

**Status:** Harvested from `v3-andres-cantor-fdp-voice-agent`
**Source:** `prosodicBufferManager.ts`
**Category:** Voice Architecture

## 1. The Latency vs. Naturalness Tradeoff

In Voice Agents, "faster" is not always "better".
-   **Too fast:** Cut off the user (interrupting while they think).
-   **Too slow:** User thinks the bot is broken.

## 2. Adaptive Buffering Strategy

We discovered that **static timestamps** (e.g., "always wait 500ms") fail because different LLM models behave differently.

### Pattern: Model-Aware Parameters
Adapt buffering based on the model class (`Turbo` vs `Standard`).

| Parameter | Turbo Model (Fast) | Standard Model (Smart) |
|-----------|--------------------|------------------------|
| Min Chunk Size | 150 chars | 120 chars |
| Debounce (VAD) | 600ms | 350ms |
| Idle Flush | 1600ms | 500ms |

**Why?**
Turbo models generate text so fast they might hallucinate "end of turn" signals. We need *longer* debouncing to ensure they are truly done.

## 3. Prosodic Analysis

Don't just count characters. Analyze **Prosody** (End-of-sentence markers).

**Algorithm:**
1.  Receive stream chunk.
2.  Check for `. ? !`.
3.  If detected, this is a **Soft Stop**.
    -   Wait `flushDelayMs` (short wait).
4.  If stream pauses without punctuation, this is a **Hard Stop**.
    -   Wait `idleFlushMs` (long wait).

## 4. The "Interruption" Pattern

When the user speaks *while* the AI is playing audio:
1.  **Immediate Cut:** Stop `AudioContext` source nodes immediately.
2.  **Clear Buffer:** Empty the `AudioQueue` instantly.
3.  **Send Signal:** Send `interrupt` signal to Server (to stop LLM generation).

**Code Reference:**
```typescript
// From prosodicBufferManager.ts
const adjustedDebounce = isTurbo
    ? Math.min(baseDebounce + adaptation.debounce, 1200)
    : Math.min(baseDebounce + Math.floor(adaptation.debounce / 2), 900);
```

## 5. WebSocket Hygiene

-   **Keep-Alive:** Send ping every 30s.
-   **Reconnection:** If WS closes with code `1006` (Abnormal), try reconnect *once*. If fails again, degrade to text mode.
