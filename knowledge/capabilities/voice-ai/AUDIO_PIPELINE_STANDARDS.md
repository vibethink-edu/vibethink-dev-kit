# Audio Pipeline Standards

**Status:** Harvested from `v3-andres-cantor-fdp-voice-agent`
**Category:** Voice Architecture

## 1. Core Principles

The Audio Pipeline is the nervous system of the Voice Agent. It must handle:
1.  **Input Capture:** Getting microphone data from the user.
2.  **Processing:** converting sample rates, buffering.
3.  **Transport:** Sending to AI via WebSocket.
4.  **Output Playback:** Queuing and playing audio chunks from AI.

## 2. Audio Context Management

### Best Practice: Single Context
Always maintain a **Singleton AudioContext**. Creating multiple contexts will crash the browser or cause "crackling".

```typescript
// Pattern: Singleton Service
class AudioService {
  private context: AudioContext | null = null;

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
    }
    return this.context;
  }
}
```

## 3. Input Processing (AudioWorklets)

**Don't use `ScriptProcessorNode`.** It runs on the main thread and causes UI jank.
**Use `AudioWorklet`.**

### Pattern: Worklet with SharedArrayBuffer
For minimal latency, use `SharedArrayBuffer` (requires secure context) or `MessagePort` to stream raw Float32 data to the WebSocket.

## 4. Sample Rate Conversion

AI services (Gemini, ElevenLabs) often expect specific sample rates (e.g., 16kHz or 24kHz).
**Do not** allow the browser to send 44.1kHz or 48kHz directly if the specific API doesn't downsample.

**Recommendation:**
-   Use an AudioWorklet to downsample *before* sending via WebSocket.
-   Bandwidth saving: 16kHz mono PCM is 3x smaller than 48kHz.

## 5. Output Management

### The "Crackling" Problem
If you play chunks immediately as they arrive, network jitter will cause gaps (silence).
**Solution:** The Jitter Buffer.

**Standard:**
1.  Receive Chunk.
2.  Push to `AudioQueue`.
3.  `AudioScheduler` checks: "Do I have enough buffered (e.g., 200ms) to start playing?"
4.  If yes, schedule `bufferSource.start(nextStartTime)`.
5.  `nextStartTime = currentEndTime`.

## 6. Echo Cancellation

**Crucial:** Browser Echo Cancellation (`echoCancellation: true` in `getUserMedia`) is **MANDATORY** for full-duplex voice.

```typescript
navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
})
```
