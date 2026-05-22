# 🎙️ ELEVENLABS - Complete Technical Documentation

**THE ONLY SOURCE OF TRUTH FOR ELEVENLABS INTEGRATION**

**Version:** V2.27.1  
**Last Updated:** 2025-11-27  
**Status:** ✅ Production Ready

---

## ⚠️ CRITICAL WARNINGS

### 🚨 WARNING #1: `auto_mode=true` IS MANDATORY

```typescript
// ❌ WITHOUT auto_mode=true → AUDIO WILL CUT AFTER FIRST SENTENCE
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_24000`;

// ✅ WITH auto_mode=true → AUDIO WORKS PERFECTLY
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_24000&auto_mode=true`;
```

**WHY:** Without `auto_mode=true`, ElevenLabs waits for explicit flush signals. Text gets stuck in ElevenLabs' internal buffer and audio generation stalls indefinitely.

**RESULT IF MISSING:** First sentence plays, then silence. No subsequent audio.

**LOCATION:** `services/voiceService.ts` line ~942

---

### 🚨 WARNING #2: Initialize ProsodicBuffer BEFORE Gemini Connection

```typescript
// ❌ WRONG ORDER → RACE CONDITION, NO AUDIO
ai.live.connect();  // Gemini sends deltas immediately
prosodicBufferManagerRef.current = new ProsodicBufferManager(...);  // TOO LATE!

// ✅ CORRECT ORDER → ALL DELTAS CAPTURED
prosodicBufferManagerRef.current = new ProsodicBufferManager(...);
ai.live.connect();  // Now buffer is ready
```

**WHY:** Gemini can send text deltas within milliseconds of connection. If ProsodicBuffer isn't ready, those deltas are lost forever.

**RESULT IF WRONG:** Buffer empty at TurnComplete, no audio generated.

**LOCATION:** `services/voiceService.ts` lines ~945-960

---

### 🚨 WARNING #3: MUST Reset ProsodicBuffer on Interruption AND TurnComplete

```typescript
// ❌ WITHOUT RESET → BUFFER DEADLOCKS, NO AUDIO ON NEXT TURN
if (serverContent?.interrupted) {
    // Missing reset!
}

// ✅ WITH RESET → NEXT TURN WORKS PERFECTLY
if (serverContent?.interrupted) {
    prosodicBufferManagerRef.current.reset();  // CRITICAL!
}
```

**WHY:** ProsodicBuffer has an `isStreamComplete` flag. If not reset, it ignores all new deltas.

**RESULT IF MISSING:** First turn works, second turn has no audio.

**LOCATION:** 
- Interruption: `services/voiceService.ts` line ~1755
- TurnComplete: `services/voiceService.ts` line ~1895

---

### 🚨 WARNING #4: `maxCharsPerChunk` MUST BE ≤ 80

```typescript
// ❌ > 100 CHARS → "TORTUGA" (SLOW) VOICE
const PROSODIC_CONFIG_ELEVENLABS = {
    maxCharsPerChunk: 120,  // TOO LARGE!
};

// ✅ ≤ 80 CHARS → NATURAL SPEED
const PROSODIC_CONFIG_ELEVENLABS = {
    maxCharsPerChunk: 80,  // PERFECT!
};
```

**WHY:** ElevenLabs processes large chunks slower, causing unnaturally slow voice.

**RESULT IF TOO LARGE:** Voice sounds like it's speaking in slow motion.

**LOCATION:** `services/voiceService.ts` line ~169

---

### 🚨 WARNING #5: `optimizeStreamingLatency` MUST BE 0 for Options 1 & 2

```typescript
// ❌ > 0 → AUDIO CUTS AND QUALITY LOSS
const latencyOptimization = 2;  // TOO AGGRESSIVE!

// ✅ = 0 → PERFECT QUALITY, NO CUTS
const latencyOptimization = 0;  // QUALITY PRIORITY!
```

**WHY:** Latency optimization > 0 sacrifices quality and can cause audio cuts.

**RESULT IF > 0:** Audio cuts, robotic voice, inconsistent tone.

**LOCATION:** `services/voiceService.ts` line ~942 (in URL)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Options Using ElevenLabs](#options-using-elevenlabs)
3. [Architecture](#architecture)
4. [ProsodicBufferManager](#prosodicbuffermanager)
5. [Critical Requirements](#critical-requirements)
6. [Configuration](#configuration)
7. [Implementation Guide](#implementation-guide)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Testing & Verification](#testing--verification)
10. [Performance Tuning](#performance-tuning)
11. [How to Create Sad/Happy/Angry Voice](#how-to-create-emotional-voices)

---

## 🎯 Overview

### What is ElevenLabs?

ElevenLabs is a **Text-to-Speech (TTS) API** that provides:
- ✅ High-quality voice cloning
- ✅ Real-time streaming audio
- ✅ Natural prosody and intonation
- ✅ Multiple models (turbo, multilingual)
- ✅ Voice customization (stability, similarity, style)

**Official Docs:** https://elevenlabs.io/docs

---

### Why ElevenLabs in This Project?

We use ElevenLabs for **3 voice options** in the Andrés Cántor Voice Agent:

| Option | Name | Voice ID | Model | Use Case |
|--------|------|----------|-------|----------|
| 1 | Pro Cloned Voice (PVC) | `fRZzFrBocQIoWbwY94c2` | `eleven_turbo_v2_5` | High-quality professional clone |
| 2 | Instant Cloned Voice (IVC) | `UltTvqUHgs6EfVePtvr4` | `eleven_turbo_v2_5` | Fast cloning with turbo |
| 5 | Ultravox + ElevenLabs | `UltTvqUHgs6EfVePtvr4` | `eleven_multilingual_v2` | Hybrid: Ultravox + ElevenLabs TTS |

---

## 🎙️ Options Using ElevenLabs

### Option 1: Pro Cloned Voice (PVC)

**What it does:**
- Gemini handles conversation (STT + AI)
- ElevenLabs handles TTS with Pro Clone
- ProsodicBufferManager ensures smooth audio

**Voice ID:** `fRZzFrBocQIoWbwY94c2`  
**Model:** `eleven_turbo_v2_5`  
**Latency:** 400-600ms first audio

**When to use:**
- ✅ Need highest quality cloned voice
- ✅ Want natural prosody
- ✅ Professional use case

---

### Option 2: Instant Cloned Voice (IVC)

**What it does:**
- Same as Option 1 but with different voice
- Gemini + ElevenLabs + ProsodicBuffer
- Fast cloning with turbo model

**Voice ID:** `UltTvqUHgs6EfVePtvr4`  
**Model:** `eleven_turbo_v2_5`  
**Latency:** 400-600ms first audio

**When to use:**
- ✅ Need fast voice cloning
- ✅ Want turbo speed
- ✅ Testing or development

---

### Option 5: Ultravox + ElevenLabs

**What it does:**
- Ultravox handles conversation (STT + AI)
- ElevenLabs handles TTS
- ProsodicBufferManager ensures smooth audio

**Voice ID:** `UltTvqUHgs6EfVePtvr4`  
**Model:** `eleven_multilingual_v2` (NOT turbo)  
**Latency:** 800-1200ms first audio

**When to use:**
- ✅ Need robust conversation handling
- ✅ Want multilingual support
- ✅ Best of both worlds (Ultravox + ElevenLabs)

**Key Difference:** Uses `eleven_multilingual_v2` for better Spanish support.

---

## 🏗️ Architecture

### Complete Flow (Options 1 & 2)

```
User Speech
    ↓
Microphone (Web Audio API)
    ↓
Gemini Multimodal Live API
    ├─ Speech-to-Text
    ├─ AI Reasoning
    └─ Text Generation (streaming deltas)
    ↓
ProsodicBufferManager
    ├─ Buffers text deltas
    ├─ Detects sentence boundaries
    ├─ Decides when to send
    └─ Sends optimal chunks
    ↓
ElevenLabs WebSocket API
    ├─ Receives text chunks
    ├─ Generates audio (streaming)
    └─ Sends PCM audio chunks
    ↓
Audio Output Buffer
    ├─ Pre-buffers 2 chunks
    ├─ Applies gapless overlap (15ms)
    └─ Schedules playback
    ↓
Speaker (Continuous Audio)
```

---

### Complete Flow (Option 5)

```
User Speech
    ↓
Microphone (Web Audio API)
    ↓
Ultravox Proxy (localhost:3001)
    ├─ Hides API keys
    ├─ Creates Ultravox call
    └─ Returns WebSocket URL
    ↓
Ultravox WebSocket (wss://api.ultravox.ai)
    ├─ Speech-to-Text
    ├─ AI Reasoning
    └─ Text Generation (streaming)
    ↓
ProsodicBufferManager
    ├─ Buffers text deltas
    ├─ Detects sentence boundaries
    ├─ Decides when to send
    └─ Sends optimal chunks
    ↓
ElevenLabs WebSocket API
    ├─ Receives text chunks
    ├─ Generates audio (streaming)
    └─ Sends PCM audio chunks
    ↓
Audio Output Buffer
    ├─ Pre-buffers 2 chunks
    ├─ Applies gapless overlap (15ms)
    └─ Schedules playback
    ↓
Speaker (Continuous Audio)
```

**Key Difference:** Text comes from Ultravox instead of Gemini directly.

---

### Key Components

#### 1. ProsodicBufferManager
- **Purpose:** Intelligent text buffering and chunking
- **Location:** `services/prosodicBufferManager.ts`
- **Responsibility:** Decide when and how much text to send
- **Critical:** MUST be initialized BEFORE Gemini/Ultravox connection

#### 2. ElevenLabs WebSocket
- **Purpose:** Streaming TTS connection
- **Location:** `services/voiceService.ts` (connectToElevenLabs)
- **Responsibility:** Send text, receive audio
- **Critical:** MUST have `auto_mode=true` in URL

#### 3. Audio Output Buffer
- **Purpose:** Smooth audio playback
- **Location:** `services/voiceService.ts` (playAudioBuffer)
- **Responsibility:** Pre-buffer and schedule audio
- **Critical:** MUST pre-buffer 2 chunks for gapless playback

---

## 🧠 ProsodicBufferManager

### What is a "Prosodic Unit"?

A prosodic unit is a chunk of text that should be spoken together with natural intonation:
- Complete sentence: "¡Hola! ¿Cómo estás?"
- Phrase with comma: "Bueno, te cuento que..."
- Question: "¿Qué te gustaría saber?"

**Why it matters:** Sending incomplete sentences causes:
- ❌ Inconsistent tone
- ❌ Robotic voice
- ❌ Unnatural pauses
- ❌ "Tortuga" (slow) effect

---

### How ProsodicBufferManager Works

#### Phase 1: Accumulation

```typescript
public addDelta(delta: string): void {
    // Intelligent space handling
    if (this.state.text.length > 0) {
        const bufferEndsWithSpace = /\s$/.test(this.state.text);
        const deltaStartsWithSpace = /^\s/.test(delta);
        const deltaStartsWithLetter = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(delta);
        
        // Add space if needed (prevents "Perocon" → "Pero con")
        if (!bufferEndsWithSpace && !deltaStartsWithSpace && deltaStartsWithLetter) {
            this.state.text += ' ';
        }
    }
    
    // Add delta to buffer
    this.state.text += delta;
    
    // Update metrics
    this.updateSentenceMetrics();
    
    // Evaluate if we should send
    this.evaluateAndMaybeSend();
}
```

**Key features:**
- ✅ Automatic space handling
- ✅ Sentence detection
- ✅ Real-time evaluation

---

#### Phase 2: Decision

```typescript
private makeDecision(): SendDecision {
    const text = this.state.text;
    const sentenceCount = this.state.sentenceCount;
    
    // Rule 1: Buffer too small → Wait
    if (text.length < minCharsBeforeSend) {
        return { shouldSend: false, reason: 'buffer_too_small' };
    }
    
    // Rule 2: Buffer too large → Force send (prevent "tortuga")
    if (text.length >= maxCharsPerChunk) {
        return { 
            shouldSend: true, 
            triggerGeneration: true,
            reason: 'buffer_too_large'
        };
    }
    
    // Rule 3: Question detected → Send immediately
    if (this.state.hasPendingQuestion) {
        return { 
            shouldSend: true, 
            triggerGeneration: true,
            reason: 'question_detected'
        };
    }
    
    // Rule 4: Complete sentence ready → Send
    if (sentenceCount >= minSentencesBeforeTrigger) {
        return { 
            shouldSend: true, 
            triggerGeneration: true,
            reason: 'sentence_complete'
        };
    }
    
    // Rule 5: Silence timeout → Force send
    if (timeSinceLastDelta > maxSilenceTimeout) {
        return { 
            shouldSend: true, 
            triggerGeneration: true,
            reason: 'silence_timeout'
        };
    }
    
    // Default: Wait for more text
    return { shouldSend: false, reason: 'waiting' };
}
```

**Decision tree:**
1. Too small? → Wait
2. Too large? → Send (prevent slow voice)
3. Question? → Send immediately
4. Complete sentence? → Send
5. Silence? → Force send
6. Default → Wait

---

#### Phase 3: Sending

```typescript
private send(text: string, triggerGeneration: boolean, reason: string): void {
    // Clean text (remove extra spaces)
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Log for debugging
    this.log(`📤 Sending | trigger=${triggerGeneration} | reason=${reason} | "${cleanText.substring(0, 50)}..." (${cleanText.length} chars)`, 'info');
    
    // Send via callback (to ElevenLabs)
    this.sendCallback(cleanText, triggerGeneration);
    
    // Update state
    this.state.text = this.state.text.substring(cleanText.length).trim();
    this.state.lastSentWithTrigger = triggerGeneration;
    this.state.sentenceCount = 0;
}
```

**Key features:**
- ✅ Text cleaning
- ✅ Detailed logging
- ✅ State management

---

#### Phase 4: Cleanup

```typescript
public reset(): void {
    console.log(`[ProsodicBuffer] reset() called. isStreamComplete was: ${this.isStreamComplete}`);
    
    // Clear timers
    this.clearTimers();
    
    // Reset state
    this.state = this.createInitialState();
    
    // ✅ CRITICAL: Reset isStreamComplete flag
    this.isStreamComplete = false;
    
    console.log('[ProsodicBuffer] Reset complete - isStreamComplete now: false');
}
```

**Why reset is critical:**
- Clears stale text
- Resets `isStreamComplete` flag (allows new deltas)
- Prepares for next turn
- **Without reset:** Buffer ignores all new deltas

---

## 🔑 Critical Requirements (ALWAYS)

### ✅ Requirement 1: `auto_mode=true` in WebSocket URL

**Code:**
```typescript
// File: services/voiceService.ts (line ~942)

const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_24000&inactivity_timeout=180&optimize_streaming_latency=${latencyOptimization}&auto_mode=true`;
//                                                                                                                                                                                                                                                          ^^^^^^^^^^^^^^^^
//                                                                                                                                                                                                                                                          CRITICAL!
```

**Why it's critical:**
- ElevenLabs automatically manages generation triggers
- Prevents text from getting stuck in buffer
- Ensures continuous audio generation

**Without it:**
- ❌ Audio cuts after first chunk
- ❌ Text accumulates but no audio generated
- ❌ Requires manual flush signals (unreliable)

---

### ✅ Requirement 2: Initialize ProsodicBuffer BEFORE Connection

**Code:**
```typescript
// File: services/voiceService.ts (lines ~945-960)

// ✅ CORRECT ORDER:

// 1. Initialize ProsodicBufferManager
if (isProClone || isInstantClone || isHybridUltravox) {
    onLog('🔧 Init ProsodicBuffer...', 'info');
    prosodicBufferManagerRef.current = new ProsodicBufferManager(
        PROSODIC_CONFIG_ELEVENLABS,
        sendCallback,
        onLog
    );
}

// 2. THEN connect to ElevenLabs WebSocket
const socket = new WebSocket(wsUrl);

// 3. THEN connect to Gemini/Ultravox (in socket.onopen)
socket.onopen = () => {
    ai.live.connect();  // Now ProsodicBuffer is ready
};
```

**Why this order matters:**
- Gemini/Ultravox can send text immediately after connection
- Buffer must be ready to receive deltas
- Race condition if buffer initialized late

**Without it:**
- ❌ First deltas are lost
- ❌ Buffer empty at TurnComplete
- ❌ No audio generated

---

### ✅ Requirement 3: Reset on Interruption

**Code:**
```typescript
// File: services/voiceService.ts (lines ~1750-1760)

if (serverContent?.interrupted) {
    onLog("⚠️ Interrupted", 'warning');
    
    if (intentionToUseElevenLabs && prosodicBufferManagerRef.current) {
        // ✅ CRITICAL: Reset ProsodicBufferManager
        prosodicBufferManagerRef.current.reset();
        onLog("🔄 ProsodicBuffer reset on interruption", 'info');
    }
    
    // Stop audio playback
    stopAudio();
    
    // Clear other buffers
    elevenLabsTextBufferRef.current = "";
    elevenLabsSentLengthRef.current = 0;
}
```

**Why it's critical:**
- Clears stale text from buffer
- Resets `isStreamComplete` flag
- Prepares for new input

**Without it:**
- ❌ Buffer ignores new deltas
- ❌ No audio on next turn
- ❌ "Deadlock" state

---

### ✅ Requirement 4: Reset on Turn Complete

**Code:**
```typescript
// File: services/voiceService.ts (lines ~1870-1900)

if (serverContent?.turnComplete) {
    onLog("🔄 Turn Complete", 'info');
    
    if (prosodicBufferManagerRef.current) {
        // Get buffer state
        const bufferState = prosodicBufferManagerRef.current.getState();
        onLog(`🔄 TurnComplete: Buffer="${bufferState.text}" (${bufferState.text.length} chars)`, 'info');
        
        // Send remaining text
        const hadRemainingText = prosodicBufferManagerRef.current.streamComplete();
        
        if (!hadRemainingText) {
            // No remaining text, send EOS
            setTimeout(() => {
                sendToElevenLabs("", true, true);
                onLog(`🔄 TurnComplete: EOS sent after streamComplete`, 'info');
            }, 100);
        }
        
        // ✅ CRITICAL: Reset for next turn
        prosodicBufferManagerRef.current.reset();
        onLog(`🔄 ProsodicBuffer reset for next turn`, 'info');
    }
}
```

**Why it's critical:**
- Prepares buffer for next conversation turn
- Prevents "deadlock" between turns
- Ensures buffer accepts new deltas

**Without it:**
- ❌ First turn works
- ❌ Second turn has no audio
- ❌ Buffer stuck in `isStreamComplete = true` state

---

### ✅ Requirement 5: Correct Configuration Values

**Code:**
```typescript
// File: services/voiceService.ts (lines ~164-173)

const PROSODIC_CONFIG_ELEVENLABS = {
    minSentencesBeforeTrigger: 1,      // ✅ Send with 1 sentence (fast response)
    maxSentencesBeforeTrigger: 2,      // ✅ Max 2 sentences (prevent accumulation)
    maxSilenceTimeout: 1200,           // ✅ 1.2s silence timeout
    punctuationGracePeriod: 300,       // ✅ 300ms grace after punctuation
    optimizeStreamingLatency: 0,       // ✅ 0 = quality priority (NO CUTS)
    minCharsBeforeSend: 40,            // ✅ Minimum context for prosody
    maxCharsPerChunk: 80,              // ✅ Prevent "tortuga" effect
    forceFlushIntervalMs: 1500,        // ✅ Periodic flush
    forceFlushAfterChars: 80,          // ✅ Force flush threshold
};
```

**Why these specific values:**
- `minSentencesBeforeTrigger: 1` → Fast response (400-600ms)
- `maxCharsPerChunk: 80` → Prevents slow voice
- `minCharsBeforeSend: 40` → Ensures natural prosody
- `optimizeStreamingLatency: 0` → Prevents cuts

**If values are wrong:**
- ❌ `maxCharsPerChunk > 100` → "Tortuga" (slow) voice
- ❌ `optimizeStreamingLatency > 0` → Audio cuts
- ❌ `minCharsBeforeSend < 30` → Inconsistent tone

---

### ✅ Requirement 6: Pre-Buffering & Gapless Playback

**Code:**
```typescript
// File: services/voiceService.ts (lines ~420-450)

const MIN_BUFFER_COUNT = 2;        // Wait for 2 chunks before playing
const GAPLESS_OVERLAP = 0.015;     // 15ms overlap between chunks

// Pre-buffering logic
if (elevenLabsAudioQueueRef.current.length >= MIN_BUFFER_COUNT && !elevenLabsIsPlayingRef.current) {
    playNextAudioChunk();
}

// Gapless playback
const playNextAudioChunk = () => {
    const chunk = elevenLabsAudioQueueRef.current.shift();
    
    // Schedule with overlap to prevent gaps
    const startTime = elevenLabsNextPlayTimeRef.current || audioContext.currentTime;
    source.start(startTime);
    
    // Update next play time with overlap
    elevenLabsNextPlayTimeRef.current = startTime + duration - GAPLESS_OVERLAP;
};
```

**Why it's critical:**
- Network latency causes gaps
- ElevenLabs sends multiple small chunks
- Pre-buffering ensures continuous stream
- Gapless overlap eliminates clicks

**Without it:**
- ❌ Audio has gaps and pops
- ❌ Stuttering playback
- ❌ Clicks between chunks

---

## ⚙️ Configuration

### ElevenLabs Settings

**Recommended for Options 1 & 2:**

```typescript
{
    stability: 0.50,              // Dynamic, not robotic
    similarity_boost: 0.80,       // High similarity to original
    style: 0.0,                   // Neutral style
    use_speaker_boost: true       // Enhanced clarity
}
```

**Recommended for Option 5:**

```typescript
{
    stability: 0.55,              // Slightly more stable for multilingual
    similarity_boost: 0.65,       // Balanced for multilingual
    style: 0.2,                   // Slight expressiveness
    use_speaker_boost: true       // Enhanced clarity
}
```

---

### Parameter Explanations

#### `stability` (0.0 - 1.0)

**What it controls:** Voice consistency and variation

| Value | Effect | Use Case |
|-------|--------|----------|
| 0.0-0.3 | Very expressive, variable | Emotional, dramatic |
| 0.4-0.6 | Balanced, natural | **Recommended** (Andrés Cántor) |
| 0.7-1.0 | Very stable, monotone | Robotic, announcements |

**For Andrés Cántor:** `0.50` (dynamic sports commentary)

**⚠️ Warning:** Too low (< 0.3) → Unstable, inconsistent  
**⚠️ Warning:** Too high (> 0.7) → Robotic, monotone

---

#### `similarity_boost` (0.0 - 1.0)

**What it controls:** Similarity to original cloned voice

| Value | Effect | Use Case |
|-------|--------|----------|
| 0.0-0.5 | Generic voice | Not recommended for clones |
| 0.6-0.8 | Balanced similarity | **Recommended** |
| 0.9-1.0 | Maximum similarity | May sound unnatural |

**For cloned voices:** `0.80` (high similarity)  
**For multilingual:** `0.65` (balanced)

**⚠️ Warning:** Too low (< 0.5) → Loses voice identity  
**⚠️ Warning:** Too high (> 0.9) → Can sound unnatural

---

#### `style` (0.0 - 1.0)

**What it controls:** Style exaggeration

| Value | Effect | Use Case |
|-------|--------|----------|
| 0.0 | Neutral, no exaggeration | **Recommended** (natural speech) |
| 0.1-0.3 | Slight expressiveness | Slightly animated |
| 0.4-1.0 | High exaggeration | Can sound unnatural |

**For natural speech:** `0.0` (neutral)  
**For Option 5 (multilingual):** `0.2` (slight expressiveness)

**⚠️ Warning:** Too high (> 0.3) → Exaggerated, unnatural

---

#### `use_speaker_boost` (boolean)

**What it controls:** Enhanced clarity and volume

| Value | Effect |
|-------|--------|
| `true` | Enhanced clarity and volume (**Recommended**) |
| `false` | Natural volume |

**Always use:** `true` (better audio quality)

---

### ProsodicBuffer Configuration

#### `minSentencesBeforeTrigger` (number)

**Default:** `1`  
**Range:** `1-3`  
**Purpose:** Minimum complete sentences before sending

| Value | Latency | Prosody | Use Case |
|-------|---------|---------|----------|
| 1 | 400-600ms | Good | **Recommended** (fast response) |
| 2 | 600-800ms | Better | Long, complex responses |
| 3 | 800-1000ms | Best | Maximum quality |

**Recommended:** `1` (balanced)

---

#### `maxSentencesBeforeTrigger` (number)

**Default:** `2`  
**Range:** `2-4`  
**Purpose:** Maximum sentences before forcing send

| Value | Effect |
|-------|--------|
| 2 | Prevents accumulation, faster chunks (**Recommended**) |
| 4 | Allows more context, better for long responses |

**Recommended:** `2` (prevents "tortuga")

---

#### `maxSilenceTimeout` (milliseconds)

**Default:** `1200`  
**Range:** `800-2000`  
**Purpose:** Force send after silence

| Value | Effect |
|-------|--------|
| 800 | Aggressive, fast response |
| 1200 | Balanced (**Recommended**) |
| 2000 | Patient, waits longer |

**Recommended:** `1200` (balanced)

---

#### `punctuationGracePeriod` (milliseconds)

**Default:** `300`  
**Range:** `150-600`  
**Purpose:** Wait after punctuation for continuation

| Value | Effect |
|-------|--------|
| 150 | Send immediately after punctuation |
| 300 | Balanced (**Recommended**) |
| 600 | Wait longer (better for complex sentences) |

**Recommended:** `300` (balanced)

---

#### `optimizeStreamingLatency` (0 | 1 | 2 | 3 | 4)

**Default:** `0`  
**Purpose:** ElevenLabs latency optimization level

| Value | Quality | Latency | Cuts Risk |
|-------|---------|---------|-----------|
| 0 | Maximum | Normal | None (**Recommended**) |
| 1 | Slight loss | Slightly faster | Low |
| 2-4 | Noticeable loss | Much faster | High |

**Recommended:** `0` (quality priority)

**⚠️ WARNING:** Values > 0 can cause audio cuts!

---

#### `minCharsBeforeSend` (number)

**Default:** `40`  
**Range:** `30-100`  
**Purpose:** Minimum characters before sending

| Value | Effect |
|-------|--------|
| 30 | Fast, less context |
| 40 | Balanced (**Recommended**) |
| 60-100 | Slow, maximum context |

**Recommended:** `40` (balanced)

**Why 40:**
- Ensures enough context for natural prosody
- Not too long (prevents "tortuga")
- Not too short (prevents tone changes)

---

#### `maxCharsPerChunk` (number)

**Default:** `80`  
**Range:** `60-120`  
**Purpose:** Maximum characters per chunk

| Value | Effect |
|-------|--------|
| 60 | Small chunks, faster, may sound choppy |
| 80 | Balanced (**Recommended**) |
| 100-120 | Large chunks, **"TORTUGA" EFFECT** |

**Recommended:** `80` (prevents slow voice)

**⚠️ WARNING:** Values > 100 cause unnaturally slow voice!

---

#### `forceFlushIntervalMs` (milliseconds)

**Default:** `1500`  
**Range:** `1000-3000`  
**Purpose:** Force flush periodically

| Value | Effect |
|-------|--------|
| 1000 | Aggressive flushing |
| 1500 | Balanced (**Recommended**) |
| 3000 | Patient, less frequent |

**Recommended:** `1500` (ensures audio doesn't stall)

---

#### `forceFlushAfterChars` (number)

**Default:** `80`  
**Range:** `60-120`  
**Purpose:** Force flush after character count

| Value | Effect |
|-------|--------|
| 60 | Frequent flushing |
| 80 | Balanced (**Recommended**) |
| 120 | Less frequent |

**Recommended:** `80` (matches maxCharsPerChunk)

---

## 🛠️ Implementation Guide

### Step-by-Step Implementation

#### Step 1: Define Voice ID Sets

```typescript
// File: services/voiceService.ts (lines ~20-25)

const PRO_CLONED_VOICE_IDS = new Set(['fRZzFrBocQIoWbwY94c2']);
const INSTANT_CLONED_VOICE_IDS = new Set(['UltTvqUHgs6EfVePtvr4']);
const HYBRID_ULTRAVOX_VOICE_IDS = new Set(['UltTvqUHgs6EfVePtvr4']);
```

**Purpose:** Identify which voices should use ProsodicBufferManager

---

#### Step 2: Define Configuration

```typescript
// File: services/voiceService.ts (lines ~164-173)

const PROSODIC_CONFIG_ELEVENLABS = {
    minSentencesBeforeTrigger: 1,
    maxSentencesBeforeTrigger: 2,
    maxSilenceTimeout: 1200,
    punctuationGracePeriod: 300,
    optimizeStreamingLatency: 0,
    minCharsBeforeSend: 40,
    maxCharsPerChunk: 80,
    forceFlushIntervalMs: 1500,
    forceFlushAfterChars: 80,
};
```

**Purpose:** Control how ProsodicBufferManager behaves

---

#### Step 3: Initialize ProsodicBufferManager

```typescript
// File: services/voiceService.ts (lines ~945-960)

const connectToElevenLabs = useCallback(async (settings: ElevenLabsSettings) => {
    const voiceId = settings.voice_id;
    const model = settings.model_id || 'eleven_turbo_v2_5';
    
    // Detect voice type
    const isProClone = PRO_CLONED_VOICE_IDS.has(voiceId);
    const isInstantClone = INSTANT_CLONED_VOICE_IDS.has(voiceId);
    const isHybridUltravox = HYBRID_ULTRAVOX_VOICE_IDS.has(voiceId) && !model.includes('turbo');
    
    // Build WebSocket URL with auto_mode=true
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_24000&inactivity_timeout=180&optimize_streaming_latency=0&auto_mode=true`;
    
    // ✅ CRITICAL: Initialize ProsodicBuffer BEFORE connecting
    if (isProClone || isInstantClone || isHybridUltravox) {
        onLog('🔧 Init ProsodicBuffer...', 'info');
        prosodicBufferManagerRef.current = new ProsodicBufferManager(
            PROSODIC_CONFIG_ELEVENLABS,
            (text, trigger) => {
                // Callback when buffer decides to send
                if (elevenLabsStatusRef.current !== 'connected') {
                    elevenLabsTxQueueRef.current.push(text);
                    return;
                }
                if (text.trim()) {
                    elevenLabsVisualTextQueueRef.current.push(text.trim());
                }
                sendToElevenLabs(text, false, trigger);
            },
            (msg, type) => onLog(msg, type)
        );
        const modeName = isProClone ? 'Pro (Option 1)' : 
                         isInstantClone ? 'Instant (Option 2)' : 
                         'Ultravox+EL (Option 5)';
        onLog(`🎯 Prosodic Buffer Manager enabled for ${modeName}`, 'success');
    }
    
    // Connect WebSocket
    const socket = new WebSocket(wsUrl);
    // ... rest of connection logic
});
```

**Critical points:**
- Initialize BEFORE WebSocket connection
- Pass `PROSODIC_CONFIG_ELEVENLABS`
- Provide send callback
- Provide log callback for debugging

---

#### Step 4: Route Text Deltas to ProsodicBuffer

```typescript
// File: services/voiceService.ts (lines ~1630-1640)

if (serverContent?.outputTranscription) {
    const incomingDelta = serverContent.outputTranscription;
    
    if (intentionToUseElevenLabs && prosodicBufferManagerRef.current) {
        // ✅ Route to ProsodicBufferManager (Options 1, 2, 5)
        prosodicBufferManagerRef.current.addDelta(incomingDelta);
    } else if (intentionToUseElevenLabs) {
        // Fallback: Sentence-First strategy (other modes)
        elevenLabsTextBufferRef.current += incomingDelta;
        // ...
    }
}
```

**Critical points:**
- Check if ProsodicBufferManager exists
- Route deltas to `addDelta()`
- Don't use fallback for Options 1, 2, 5

---

#### Step 5: Handle Interruptions

```typescript
// File: services/voiceService.ts (lines ~1750-1760)

if (serverContent?.interrupted) {
    onLog("⚠️ Interrupted", 'warning');
    
    if (intentionToUseElevenLabs) {
        // Stop audio playback
        stopAudio();
        
        // ✅ CRITICAL: Reset ProsodicBufferManager
        if (prosodicBufferManagerRef.current) {
            prosodicBufferManagerRef.current.reset();
            onLog("🔄 ProsodicBuffer reset on interruption", 'info');
        }
        
        // Clear other buffers
        elevenLabsTextBufferRef.current = "";
        elevenLabsSentLengthRef.current = 0;
    }
}
```

**Critical points:**
- Reset ProsodicBufferManager
- Clear all buffers
- Stop audio playback

---

#### Step 6: Handle Turn Complete

```typescript
// File: services/voiceService.ts (lines ~1870-1900)

if (serverContent?.turnComplete) {
    onLog("🔄 Turn Complete", 'info');
    
    if (prosodicBufferManagerRef.current) {
        // Get buffer state
        const bufferState = prosodicBufferManagerRef.current.getState();
        onLog(`🔄 TurnComplete: Buffer="${bufferState.text}" (${bufferState.text.length} chars)`, 'info');
        
        // Send remaining text
        const hadRemainingText = prosodicBufferManagerRef.current.streamComplete();
        
        if (!hadRemainingText) {
            // No remaining text, send EOS
            setTimeout(() => {
                sendToElevenLabs("", true, true);
                onLog(`🔄 TurnComplete: EOS sent after streamComplete`, 'info');
            }, 100);
        }
        
        // ✅ CRITICAL: Reset for next turn
        prosodicBufferManagerRef.current.reset();
        onLog(`🔄 ProsodicBuffer reset for next turn`, 'info');
    }
}
```

**Critical points:**
- Call `streamComplete()` to flush remaining text
- Send EOS if no remaining text
- **MUST call `reset()`** for next turn

---

## 🐛 Common Issues & Solutions

### Issue 1: Audio Cuts After First Sentence

**Log Evidence:**
```
[23:11:43] 📥 Gemini Delta: "¡Hola!" (6 chars)
[23:11:43] ▶️ Playing (Duration: 1.25s, Rate: 1x)
[23:11:48] 📥 Gemini Delta: "¿Cómo estás?" (12 chars)
[23:11:51] 🔄 TurnComplete: Buffer = "" (0 chars, 0 sentences)
```

**Diagnosis:** Buffer is empty at TurnComplete, meaning deltas weren't captured

**Root Causes:**
1. ProsodicBufferManager not initialized
2. ProsodicBufferManager initialized AFTER Gemini connection (race condition)
3. `reset()` not called in previous turn

**Solution:**
```typescript
// 1. Verify initialization BEFORE connection
if (isProClone || isInstantClone) {
    prosodicBufferManagerRef.current = new ProsodicBufferManager(...);
}

// 2. Verify reset on interruption
if (serverContent?.interrupted) {
    prosodicBufferManagerRef.current.reset();
}

// 3. Verify reset on turnComplete
if (serverContent?.turnComplete) {
    prosodicBufferManagerRef.current.reset();
}
```

---

### Issue 2: "Tortuga" (Slow) Voice

**Log Evidence:**
```
[23:11:44] 📤 Sending: "¡Qué bueno escuchar eso! ¿Hay algo más que te gust..." (97 chars)
[23:11:46] 📥 Chunk #7: 374490b
[23:11:46] ▶️ Playing (Duration: 7.80s, Rate: 1x)
```

**Diagnosis:** Chunk is too large (97 chars), causing slow voice

**Root Cause:** `maxCharsPerChunk` too high or not enforced

**Solution:**
```typescript
const PROSODIC_CONFIG_ELEVENLABS = {
    maxCharsPerChunk: 80,  // ✅ Reduce to 80 or lower
    // ...
};
```

**Verify in makeDecision():**
```typescript
// File: services/prosodicBufferManager.ts
if (text.length >= maxCharsPerChunk) {
    return { shouldSend: true, triggerGeneration: true };
}
```

---

### Issue 3: Inconsistent Tone

**Symptoms:**
- Voice changes between sentences
- Sounds robotic or unnatural
- Different "personality" each chunk

**Root Cause:** Not enough context per chunk

**Solution:**
```typescript
const PROSODIC_CONFIG_ELEVENLABS = {
    minCharsBeforeSend: 40,  // ✅ Ensure minimum context
    minSentencesBeforeTrigger: 1,  // ✅ Complete sentences
    // ...
};
```

**Also check ElevenLabs settings:**
```typescript
{
    stability: 0.50,  // Not too high (prevents robotic)
    style: 0.0,       // Neutral (prevents exaggeration)
}
```

---

### Issue 4: Word Concatenation ("Perocon")

**Symptoms:**
- Words merge: "Perocon" instead of "Pero con"
- Missing spaces between words

**Root Cause:** Deltas concatenated without space handling

**Solution:** ProsodicBufferManager handles this automatically in `addDelta()`:

```typescript
// File: services/prosodicBufferManager.ts (lines ~130-150)

public addDelta(delta: string): void {
    if (!delta) return;
    
    // Intelligent space handling
    if (this.state.text.length > 0) {
        const bufferEndsWithSpace = /\s$/.test(this.state.text);
        const deltaStartsWithSpace = /^\s/.test(delta);
        const deltaStartsWithLetter = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(delta);
        
        // Add space if needed
        if (!bufferEndsWithSpace && !deltaStartsWithSpace && deltaStartsWithLetter) {
            const bufferEndsWithLetter = /[a-zA-ZáéíóúñÁÉÍÓÚÑ]$/.test(this.state.text);
            const bufferEndsWithPunctuation = /[.!?,;:]$/.test(this.state.text);
            
            if (bufferEndsWithLetter || bufferEndsWithPunctuation) {
                this.state.text += ' ';  // ✅ Add space
            }
        }
    }
    
    this.state.text += delta;
    this.evaluateAndMaybeSend();
}
```

**Verify:** No manual intervention needed, ProsodicBufferManager handles it

---

### Issue 5: WebSocket Error 1006

**Log Evidence:**
```
[23:11:40] 🔌 Connecting to EL (eleven_turbo_v2_5)...
[23:11:41] ❌ EL WebSocket Error
[23:11:41] 🔌 EL closed: Code 1006
```

**Diagnosis:** Connection rejected by ElevenLabs

**Root Cause:** Malformed WebSocket URL

**Solution:** Verify URL has all parameters correctly interpolated:

```typescript
// ✅ CORRECT:
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_24000&inactivity_timeout=180&optimize_streaming_latency=${latencyOptimization}&auto_mode=true`;

// ❌ WRONG (missing interpolation):
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech//stream-input?model_id=&...`;
```

**Check:**
- `${voiceId}` is not empty
- `${model}` is not empty
- `${latencyOptimization}` is a number (0-4)
- `auto_mode=true` is present

---

### Issue 6: Race Condition (No Audio on First Turn)

**Symptoms:**
- No audio on first conversation
- Console shows deltas arriving but no audio
- Buffer empty at TurnComplete

**Root Cause:** ProsodicBufferManager initialized AFTER Gemini sends first deltas

**Solution:** Initialize ProsodicBufferManager BEFORE connecting to Gemini

```typescript
// ✅ CORRECT ORDER:
// 1. Initialize ProsodicBufferManager
if (isProClone || isInstantClone) {
    prosodicBufferManagerRef.current = new ProsodicBufferManager(...);
}

// 2. Connect to ElevenLabs
const socket = new WebSocket(wsUrl);

// 3. THEN connect to Gemini (in socket.onopen)
socket.onopen = () => {
    ai.live.connect();  // Now ProsodicBuffer is ready
};
```

---

## 🧪 Testing & Verification

### Pre-Test Checklist

Before testing, verify:
- [ ] Servers running (proxy on 3001, frontend on 3000)
- [ ] Browser console open (F12)
- [ ] Correct voice selected (Option 1, 2, or 5)
- [ ] Microphone permissions granted

### Test Procedure

#### Test 1: Single Turn
1. Start conversation
2. Say: "Hola Andrés, ¿cómo estás?"
3. Wait for response

**Expected:**
- ✅ Console shows: `🎯 Prosodic Buffer Manager enabled for [mode]`
- ✅ Console shows: `📤 ProsodicBuffer enviando: ...`
- ✅ Audio plays completely
- ✅ No errors

#### Test 2: Multiple Turns
1. Continue conversation
2. Say: "Cuéntame sobre el Mundial 2026"
3. Wait for response
4. Say: "¿Qué equipos son favoritos?"
5. Wait for response

**Expected:**
- ✅ All turns produce audio
- ✅ No degradation over time
- ✅ Consistent voice quality
- ✅ No cuts or stuttering

#### Test 3: Interruption
1. Start conversation
2. While Andrés is speaking, interrupt
3. Say something new

**Expected:**
- ✅ Audio stops immediately
- ✅ Console shows: `🔄 ProsodicBuffer reset on interruption`
- ✅ New audio starts cleanly
- ✅ No overlap or confusion

#### Test 4: Long Response
1. Ask: "Explícame todo sobre las sedes del Mundial 2026"
2. Wait for long response

**Expected:**
- ✅ Audio plays continuously
- ✅ No "tortuga" (slow) effect
- ✅ Consistent tone throughout
- ✅ No cuts between sentences

---

### Console Log Analysis

#### Healthy Session:
```
[23:11:40] 🔧 Init ProsodicBuffer...
[23:11:40] [ProsodicBuffer] Inicializado V2.26: min=40, flush=1500ms
[23:11:40] 🎯 Prosodic Buffer Manager enabled for Pro (Option 1)
[23:11:40] 🔌 Connecting to EL (eleven_turbo_v2_5)...
[23:11:41] ✅ EL connected
[23:11:43] 📥 Gemini Delta: "¡Ho" (3 chars)
[23:11:43] 📥 Gemini Delta: "la!" (3 chars)
[23:11:44] 📤 Sending: "¡Hola! ¿Cómo estás?" (20 chars, flush:false)
[23:11:44] ⏱️ EL Latency: 475ms
[23:11:44] 📥 Chunk #1: 82756b
[23:11:44] ▶️ Playing (Duration: 1.72s, Rate: 1x)
[23:11:46] 🔄 Turn Complete
[23:11:46] 🔄 ProsodicBuffer reset for next turn
```

**Key indicators:**
- ✅ ProsodicBuffer initialized
- ✅ Deltas received
- ✅ Text sent to ElevenLabs
- ✅ Audio chunks received
- ✅ Audio played
- ✅ Turn completed cleanly
- ✅ Buffer reset for next turn

---

#### Unhealthy Session (Race Condition):
```
[23:11:40] 🔌 Connecting to EL (eleven_turbo_v2_5)...
[23:11:41] ✅ EL connected
[23:11:41] 🔧 Init ProsodicBuffer...  ← TOO LATE!
[23:11:41] 📥 Gemini Delta: "¡Ho" (3 chars)  ← Already arrived
[23:11:43] 📥 Gemini Delta: "la!" (3 chars)
[23:11:46] 🔄 TurnComplete: Buffer = "" (0 chars)  ← Empty!
```

**Problem:** ProsodicBuffer initialized AFTER deltas arrived

**Fix:** Move initialization before WebSocket connection

---

## 📈 Performance Tuning

### Profile 1: Fastest Response (Trade-off: Slight quality loss)

```typescript
const PROSODIC_CONFIG_ELEVENLABS = {
    minSentencesBeforeTrigger: 1,
    maxSentencesBeforeTrigger: 2,
    maxSilenceTimeout: 800,            // Faster timeout
    punctuationGracePeriod: 150,       // Less grace
    optimizeStreamingLatency: 1,       // Slight optimization
    minCharsBeforeSend: 30,            // Lower threshold
    maxCharsPerChunk: 70,              // Smaller chunks
    forceFlushIntervalMs: 1000,        // More frequent flush
    forceFlushAfterChars: 70,
};
```

**Expected latency:** 300-400ms first audio  
**Trade-off:** Slight quality loss, may sound slightly choppy

---

### Profile 2: Best Quality (Trade-off: Slower response)

```typescript
const PROSODIC_CONFIG_ELEVENLABS = {
    minSentencesBeforeTrigger: 2,      // More context
    maxSentencesBeforeTrigger: 3,
    maxSilenceTimeout: 1500,           // More patient
    punctuationGracePeriod: 400,       // More grace
    optimizeStreamingLatency: 0,       // No optimization
    minCharsBeforeSend: 60,            // Higher threshold
    maxCharsPerChunk: 90,              // Larger chunks
    forceFlushIntervalMs: 2000,        // Less frequent flush
    forceFlushAfterChars: 90,
};
```

**Expected latency:** 600-800ms first audio  
**Trade-off:** Slower response, maximum quality

---

### Profile 3: Balanced (Current - Recommended)

```typescript
const PROSODIC_CONFIG_ELEVENLABS = {
    minSentencesBeforeTrigger: 1,
    maxSentencesBeforeTrigger: 2,
    maxSilenceTimeout: 1200,
    punctuationGracePeriod: 300,
    optimizeStreamingLatency: 0,
    minCharsBeforeSend: 40,
    maxCharsPerChunk: 80,
    forceFlushIntervalMs: 1500,
    forceFlushAfterChars: 80,
};
```

**Expected latency:** 400-600ms first audio  
**Trade-off:** Balanced quality and speed

---

## 🎭 How to Create Emotional Voices

### Sad Voice

**ElevenLabs Settings:**
```typescript
{
    stability: 0.60,              // More stable (less variation)
    similarity_boost: 0.75,       // Balanced
    style: 0.3,                   // Slight style for emotion
    use_speaker_boost: false      // Natural volume (softer)
}
```

**ProsodicBuffer Adjustments:**
```typescript
{
    minCharsBeforeSend: 50,       // More context for emotion
    maxSilenceTimeout: 1500,      // Slower pace
    punctuationGracePeriod: 400,  // Longer pauses
}
```

**System Prompt Addition:**
```typescript
"Habla con un tono melancólico y reflexivo. Usa pausas más largas. Expresa tristeza en tu voz."
```

---

### Happy/Excited Voice

**ElevenLabs Settings:**
```typescript
{
    stability: 0.40,              // Less stable (more variation)
    similarity_boost: 0.80,       // High similarity
    style: 0.4,                   // More style for excitement
    use_speaker_boost: true       // Enhanced clarity
}
```

**ProsodicBuffer Adjustments:**
```typescript
{
    minCharsBeforeSend: 35,       // Faster response
    maxSilenceTimeout: 900,       // Quicker pace
    punctuationGracePeriod: 200,  // Shorter pauses
}
```

**System Prompt Addition:**
```typescript
"Habla con entusiasmo y energía. Usa un tono alegre y animado. Expresa emoción en tu voz."
```

---

### Angry Voice

**ElevenLabs Settings:**
```typescript
{
    stability: 0.45,              // Moderate stability
    similarity_boost: 0.85,       // High similarity
    style: 0.5,                   // High style for intensity
    use_speaker_boost: true       // Enhanced clarity
}
```

**ProsodicBuffer Adjustments:**
```typescript
{
    minCharsBeforeSend: 40,       // Normal context
    maxSilenceTimeout: 800,       // Faster pace
    punctuationGracePeriod: 150,  // Short pauses (urgency)
}
```

**System Prompt Addition:**
```typescript
"Habla con un tono firme e intenso. Usa énfasis en palabras clave. Expresa frustración o enojo en tu voz."
```

---

### Calm/Soothing Voice

**ElevenLabs Settings:**
```typescript
{
    stability: 0.70,              // Very stable
    similarity_boost: 0.70,       // Balanced
    style: 0.1,                   // Minimal style
    use_speaker_boost: false      // Natural volume
}
```

**ProsodicBuffer Adjustments:**
```typescript
{
    minCharsBeforeSend: 60,       // More context
    maxSilenceTimeout: 2000,      // Very slow pace
    punctuationGracePeriod: 500,  // Long pauses
}
```

**System Prompt Addition:**
```typescript
"Habla con un tono calmado y relajante. Usa pausas largas. Expresa tranquilidad en tu voz."
```

---

## ✅ Production Checklist

Before deploying to production:

### Code Verification:
- [ ] `auto_mode=true` in WebSocket URL (line ~942)
- [ ] ProsodicBufferManager initialized before connection (line ~945)
- [ ] `reset()` in interrupted handler (line ~1755)
- [ ] `reset()` in turnComplete handler (line ~1895)
- [ ] `PROSODIC_CONFIG_ELEVENLABS` has correct values (line ~164)
- [ ] Pre-buffering enabled (MIN_BUFFER_COUNT = 2)
- [ ] Gapless overlap enabled (GAPLESS_OVERLAP = 0.015)

### Testing:
- [ ] Single turn works
- [ ] Multiple turns work
- [ ] Interruption works
- [ ] Long responses work
- [ ] No "tortuga" effect
- [ ] No tone changes
- [ ] No word concatenation
- [ ] No audio cuts

### Performance:
- [ ] First audio < 600ms (Options 1 & 2)
- [ ] First audio < 1200ms (Option 5)
- [ ] Subsequent audio < 400ms
- [ ] No stuttering or gaps
- [ ] Clean session end

---

## 📚 Related Documentation

- **[ULTRAVOX.md](ULTRAVOX.md)** - Ultravox integration (Option 5)
- **[CARTESIA.md](CARTESIA.md)** - Cartesia integration (Options 6 & 7)
- **[GEMINI.md](GEMINI.md)** - Gemini integration (Option 3)
- **[Troubleshooting](../TROUBLESHOOTING.md)** - General troubleshooting
- **[Quick Start](../QUICK_START.md)** - How to start the app

---

## 📞 Support

If you encounter issues not covered in this guide:

1. **Run diagnostic:** `.\scripts\test-git-worktrees.ps1`
2. **Check console logs:** Look for errors or warnings
3. **Verify configuration:** Double-check all critical requirements
4. **Review related docs:** See links above

---

**Last Updated:** 2025-11-27  
**Version:** V2.27.1  
**Author:** Marcelo Escallón  
**Status:** ✅ Production Ready

**THIS IS THE ONLY ELEVENLABS DOCUMENTATION. ALL OTHER ELEVENLABS DOCS ARE OBSOLETE.**


