# Ultravox Integration Guide

**Status:** Harvested from `v3-andres-cantor-fdp-voice-agent`
**Category:** Stack Guide

## 1. Overview
Ultravox is the primary Voice-to-Voice API used in this project. It handles both ASR (Speech-to-Text) and TTS (Text-to-Speech) with an LLM in the middle.

## 2. Client SDK Setup

**Package:** `ultravox-client`

### Initialization Pattern
Do not initialize the client inside a component. Use a singleton service pattern to survive re-renders.

```typescript
// services/ultravoxService.ts
import { UltravoxSession, UltravoxSessionStatus } from 'ultravox-client';

class UltravoxServiceWrapper {
  private session: UltravoxSession | null = null;

  async startCall(joinUrl: string): Promise<void> {
    if (this.session) await this.stopCall();

    this.session = new UltravoxSession();
    await this.session.joinCall(joinUrl);

    // Setup listeners
    this.session.addEventListener('status', this.handleStatusChange);
    this.session.addEventListener('transcripts', this.handleTranscripts);
  }
}
```

## 3. Hook Pattern (`useUltravoxConversation`)

Map the imperative Service API to declarative React state.

```typescript
export function useUltravoxConversation() {
  const [status, setStatus] = useState<UltravoxStatus>('idle');
  const [transcript, setTranscript] = useState<Transcript[]>([]);

  // Cleanup on unmount is CRITICAL
  useEffect(() => {
    return () => {
      UltravoxService.stopCall(); // Ensure mic is released
    };
  }, []);

  return { status, transcript };
}
```

## 4. Debugging

### Common Issues
1.  **Microphone Permission:** Browser denies access if not served over HTTPS (or localhost).
2.  **Zombie Sessions:** If you hot-reload React, the old WebSocket might stay open.
    *   **Fix:** Always call `leaveCall()` in current `useEffect` cleanup.
3.  **Echo:** If `echoCancellation` is false, Ultravox will hear itself.

## 5. Deployment Notes
-   **Join URL:** Must be generated server-side using your API Key.
-   **Time Limit:** Ultravox sessions often have a max duration (e.g., 5-10 mins for free tier). Handle the "End of Call" event gracefully.
