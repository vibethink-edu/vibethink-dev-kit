# 🎙️ ULTRAVOX - Complete Technical Documentation

**THE ONLY SOURCE OF TRUTH FOR ULTRAVOX INTEGRATION**

**Version:** V2.27.1  
**Last Updated:** 2025-11-27  
**Status:** ✅ Production Ready

---

## ⚠️ CRITICAL WARNINGS

### 🚨 WARNING #1: Voice Field MUST Be String UUID

```javascript
// ❌ WRONG → API ERROR: "expected string, got 'dict'"
const payload = {
    voice: {
        elevenLabs: {
            voiceId: "abc123",
            model: "eleven_turbo_v2_5"
        }
    }
};

// ✅ CORRECT → Works perfectly
const payload = {
    voice: "e2c2ad44-b00c-43fe-a2c6-a1dd2d8a83d1"  // UUID string
};
```

**WHY:** Ultravox API expects a simple UUID string, not an object.

**RESULT IF WRONG:** `Failed to parse voice field: expected string, got 'dict'`

**LOCATION:** `server/ultravox-proxy.js` line ~46

---

### 🚨 WARNING #2: maxDuration MUST Be in "Xs" Format

```javascript
// ❌ WRONG → API ERROR: "Duration must end with letter 's'"
const payload = {
    maxDuration: "00:10:00"  // Time format
};

// ✅ CORRECT → Works perfectly
const payload = {
    maxDuration: "600s"  // Seconds with 's' suffix
};
```

**WHY:** Ultravox expects duration in seconds with 's' suffix.

**RESULT IF WRONG:** `Duration must end with letter "s": 00:10:00`

**LOCATION:** `server/ultravox-proxy.js` line ~48

---

### 🚨 WARNING #3: DO NOT Use initialMessages

```javascript
// ❌ WRONG → API ERROR: "Invalid enum value"
const payload = {
    initialMessages: [
        { role: "agent", text: "¡Hola!" }
    ]
};

// ✅ CORRECT → Use firstSpeaker instead
const payload = {
    firstSpeaker: "FIRST_SPEAKER_AGENT"  // Agent speaks first
};
```

**WHY:** `initialMessages` causes enum errors. Use `firstSpeaker` instead.

**RESULT IF WRONG:** `Invalid enum value agent/assistant for MessageRole`

**LOCATION:** `server/ultravox-proxy.js` line ~49

---

### 🚨 WARNING #4: MUST Use Proxy Backend (CORS)

```javascript
// ❌ WRONG → CORS ERROR
fetch('https://api.ultravox.ai/api/calls', {
    headers: { 'X-API-Key': 'your-key' }  // Blocked by CORS!
});

// ✅ CORRECT → Use proxy
fetch('http://localhost:3001/create-call', {
    // No API key needed (proxy handles it)
});
```

**WHY:** Ultravox API doesn't allow CORS from browser. Must use backend proxy.

**RESULT IF WRONG:** `Access to fetch blocked by CORS policy: X-API-Key not allowed`

**LOCATION:** `server/ultravox-proxy.js` (entire file)

---

### 🚨 WARNING #5: For Option 5, ProsodicBuffer is MANDATORY

```typescript
// ❌ WITHOUT ProsodicBuffer → AUDIO CUTS
const isHybridUltravox = false;  // Not detected!

// ✅ WITH ProsodicBuffer → PERFECT AUDIO
const isHybridUltravox = HYBRID_ULTRAVOX_VOICE_IDS.has(voiceId) && 
                         !model.includes('turbo');
```

**WHY:** Option 5 (Ultravox + ElevenLabs) needs ProsodicBufferManager for smooth audio.

**RESULT IF MISSING:** Audio cuts after first sentence (same as ElevenLabs without ProsodicBuffer).

**LOCATION:** `services/voiceService.ts` line ~936

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Options Using Ultravox](#options-using-ultravox)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Implementation Guide](#implementation-guide)
6. [How to Change Voice](#how-to-change-voice)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Testing & Verification](#testing--verification)
9. [Ultravox API Reference](#ultravox-api-reference)

---

## 🎯 Overview

### What is Ultravox?

Ultravox is a **real-time voice AI platform** that provides:
- ✅ Conversation management
- ✅ Speech-to-text
- ✅ AI reasoning
- ✅ Text-to-speech
- ✅ WebSocket streaming
- ✅ ElevenLabs integration

**Official Docs:** https://docs.ultravox.ai/

---

### Why Ultravox in This Project?

We use Ultravox for **2 voice options** in the Andrés Cántor Voice Agent:

| Option | Name | Voice Provider | Use Case |
|--------|------|----------------|----------|
| 4 | Pure Ultravox | Ultravox native | All-in-one (STT + AI + TTS) |
| 5 | Ultravox + ElevenLabs | ElevenLabs | Hybrid (Ultravox conversation + ElevenLabs TTS) |

---

## 🎙️ Options Using Ultravox

### Option 4: Pure Ultravox

**What it does:**
- Ultravox handles everything (STT + AI + TTS)
- Simplest integration
- Good quality, fast

**Voice ID:** `e2c2ad44-b00c-43fe-a2c6-a1dd2d8a83d1` (Ultravox UUID)  
**Latency:** 300-500ms first audio  
**Model:** Ultravox native voices

**When to use:**
- ✅ Want simplest integration
- ✅ Built-in voices are sufficient
- ✅ Need fast setup
- ✅ Cost is a concern (single provider)

**When NOT to use:**
- ❌ Need specific cloned voices
- ❌ Need maximum voice quality
- ❌ Need ProsodicBuffer features

---

### Option 5: Ultravox + ElevenLabs

**What it does:**
- Ultravox handles conversation (STT + AI)
- ElevenLabs handles TTS (higher quality)
- ProsodicBufferManager ensures smooth audio
- Hybrid approach

**Voice ID:** `UltTvqUHgs6EfVePtvr4` (ElevenLabs IVP - Instant Voice Cloning)  
**Model:** `eleven_multilingual_v2` (NOT turbo)  
**Latency:** 800-1200ms first audio

**⚠️ IMPORTANTE:** Este Voice ID es un **ElevenLabs IVP (Instant Voice Cloning)** que se usa en:
- **Opción 2**: Gemini + ElevenLabs IVP con `eleven_turbo_v2_5`
- **Opción 5**: Ultravox + ElevenLabs IVP con `eleven_multilingual_v2`

La diferenciación se hace por el **modelo**, no por el Voice ID.

**When to use:**
- ✅ Need maximum voice quality
- ✅ Want robust conversation handling
- ✅ Need Spanish/multilingual support
- ✅ Can tolerate slightly higher latency

**When NOT to use:**
- ❌ Need lowest possible latency
- ❌ Want simplest setup
- ❌ Budget constraints (two providers)

---

## 🏗️ Architecture

### Option 4: Pure Ultravox Flow

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
    ├─ Text-to-Speech (Ultravox native)
    └─ Sends audio chunks
    ↓
Audio Output
    └─ Direct playback
    ↓
Speaker
```

---

### Option 5: Ultravox + ElevenLabs Flow

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

**Key Difference:** Text from Ultravox is routed to ElevenLabs via ProsodicBufferManager.

---

### Key Components

#### 1. Ultravox Proxy (`server/ultravox-proxy.js`)
- **Purpose:** Secure API key handling
- **Port:** 3001
- **Endpoints:**
  - `POST /create-call` - Create new Ultravox call
  - `GET /health` - Health check
- **Critical:** MUST be running for Ultravox to work

#### 2. Ultravox Client (`services/useUltravoxConversation.ts`)
- **Purpose:** WebSocket connection management
- **Responsibility:** Send audio, receive responses
- **SDK:** `ultravox-client` (v0.4.2+)

#### 3. Voice Service (`services/voiceService.ts`)
- **Purpose:** Coordinate all voice providers
- **Responsibility:** Route text to appropriate TTS (Option 5 only)
- **Critical:** Detects Option 5 and enables ProsodicBufferManager

---

## ⚙️ Configuration

### Ultravox Proxy Configuration

**File:** `server/ultravox-proxy.js`

```javascript
// Line ~46: Voice UUID
const ultravoxVoiceUUID = '44937ed0-c102-42e8-805a-d388a8563bbf';

// Line ~40-50: Payload
const payload = {
    systemPrompt: systemPrompt || 'You are a helpful assistant.',
    temperature: 0.8,
    voice: ultravoxVoiceUUID,  // ✅ String UUID
    maxDuration: '600s',        // ✅ Format: "Xs"
    firstSpeaker: 'FIRST_SPEAKER_AGENT'  // ✅ Agent speaks first
};

// ❌ DO NOT INCLUDE:
// initialMessages: [...]  // Causes enum errors
```

---

### Ultravox Parameters

#### `systemPrompt` (string)
- **Purpose:** Define AI personality and behavior
- **Example:** "You are Andrés Cántor, the legendary sports commentator..."
- **Location:** `data/systemPrompt.ts`

**Recommended:** Use detailed, specific prompts for best results.

---

#### `temperature` (0.0 - 1.0)
- **Purpose:** Control AI creativity
- **0.0:** Very consistent, predictable
- **0.7:** Balanced (recommended)
- **1.0:** Very creative, varied

**Recommended:** `0.7-0.8` (natural conversation)

---

#### `voice` (string UUID)
- **Purpose:** Voice identifier
- **Format:** UUID string (NOT object)
- **Examples:**
  - Ultravox voice: `"e2c2ad44-b00c-43fe-a2c6-a1dd2d8a83d1"`
  - ElevenLabs voice: `"UltTvqUHgs6EfVePtvr4"` (for Option 5)

**How to get UUID:**
1. Go to https://app.ultravox.ai/voices
2. Select/create voice
3. Copy UUID from preview URL: `/api/voices/{UUID}/preview`

---

#### `maxDuration` (string)
- **Purpose:** Maximum call duration
- **Format:** `"Xs"` where X is seconds
- **Example:** `"600s"` = 10 minutes

**Recommended:** `"600s"` (10 minutes)

**⚠️ Warning:** MUST include 's' suffix!

---

#### `firstSpeaker` (enum)
- **Purpose:** Who speaks first
- **Options:**
  - `"FIRST_SPEAKER_AGENT"` - Agent speaks first (recommended)
  - `"FIRST_SPEAKER_USER"` - User speaks first

**Recommended:** `"FIRST_SPEAKER_AGENT"` (greeting)

**⚠️ Warning:** Do NOT use `initialMessages` instead!

---

### Option 5: ElevenLabs Settings

**Only applies to Option 5 (Ultravox + ElevenLabs)**

```typescript
{
    voice_id: "UltTvqUHgs6EfVePtvr4",
    model_id: "eleven_multilingual_v2",  // NOT turbo!
    
    // Voice settings
    stability: 0.55,              // Slightly more stable for multilingual
    similarity_boost: 0.65,       // Balanced for multilingual
    style: 0.2,                   // Slight expressiveness
    use_speaker_boost: true       // Enhanced clarity
}
```

**Why `eleven_multilingual_v2`:**
- Better for Spanish
- More natural prosody for non-English
- Supports multiple languages natively

**See [ELEVENLABS.md](ELEVENLABS.md) for complete ElevenLabs configuration details.**

---

## 🛠️ Implementation Guide

### Step 1: Setup Ultravox Proxy

**File:** `server/ultravox-proxy.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// ✅ CRITICAL: Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ultravox-proxy' });
});

// Create call endpoint
app.post('/create-call', async (req, res) => {
    const { systemPrompt } = req.body;
    
    // ✅ Voice UUID (change this to change voice)
    const ultravoxVoiceUUID = '44937ed0-c102-42e8-805a-d388a8563bbf';
    
    // ✅ Payload with correct format
    const payload = {
        systemPrompt: systemPrompt || 'You are a helpful assistant.',
        temperature: 0.8,
        voice: ultravoxVoiceUUID,  // String UUID
        maxDuration: '600s',        // "Xs" format
        firstSpeaker: 'FIRST_SPEAKER_AGENT'
    };
    
    try {
        const response = await fetch('https://api.ultravox.ai/api/calls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.VITE_ULTRAVOX_API_KEY
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ultravox API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error creating Ultravox call:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Ultravox Proxy running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for http://localhost:3000`);
});
```

**Critical points:**
- CORS enabled for `localhost:3000`
- API key from `.env.local`
- Voice UUID as string (NOT object)
- `maxDuration` in `"Xs"` format
- NO `initialMessages`

---

### Step 2: Start Proxy

```powershell
# Terminal 1
cd "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"
node server/ultravox-proxy.js
```

**Expected output:**
```
🚀 Ultravox Proxy running on http://localhost:3001
✅ CORS enabled for http://localhost:3000
```

**Verify:**
```powershell
# In another terminal
curl http://localhost:3001/health
# Should return: {"status":"ok","service":"ultravox-proxy"}
```

---

### Step 3: Frontend Integration (Option 4)

**File:** `services/useUltravoxConversation.ts`

```typescript
import { UltravoxSession } from 'ultravox-client';

export const useUltravoxConversation = () => {
    const sessionRef = useRef<UltravoxSession | null>(null);
    
    const startSession = async () => {
        // Create call via proxy
        const response = await fetch('http://localhost:3001/create-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt: 'You are Andrés Cántor...' })
        });
        
        const { joinUrl } = await response.json();
        
        // Join call via WebSocket
        const session = new UltravoxSession();
        session.joinCall(joinUrl);
        
        // Event listeners
        session.addEventListener('status', () => {
            console.log('Status:', session.status);
        });
        
        session.addEventListener('transcripts', () => {
            const transcripts = session.transcripts;
            console.log('Transcripts:', transcripts);
        });
        
        sessionRef.current = session;
    };
    
    const stopSession = () => {
        if (sessionRef.current) {
            sessionRef.current.leaveCall();
            sessionRef.current = null;
        }
    };
    
    return { startSession, stopSession };
};
```

---

### Step 4: Frontend Integration (Option 5)

**Option 5 requires additional ElevenLabs integration.**

**File:** `services/voiceService.ts`

```typescript
// Detect Option 5 (Ultravox + ElevenLabs)
const HYBRID_ULTRAVOX_VOICE_IDS = new Set(['UltTvqUHgs6EfVePtvr4']);

const isHybridUltravox = HYBRID_ULTRAVOX_VOICE_IDS.has(voiceId) && 
                         !model.includes('turbo');

// Initialize ProsodicBufferManager for Option 5
if (isProClone || isInstantClone || isHybridUltravox) {
    onLog('🔧 Init ProsodicBuffer...', 'info');
    prosodicBufferManagerRef.current = new ProsodicBufferManager(
        PROSODIC_CONFIG_ELEVENLABS,
        (text, trigger) => {
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
    const modeName = isHybridUltravox ? 'Ultravox+EL (Option 5)' : 
                     isProClone ? 'Pro (Option 1)' : 
                     'Instant (Option 2)';
    onLog(`🎯 Prosodic Buffer Manager enabled for ${modeName}`, 'success');
}

// Route Ultravox text to ProsodicBuffer
if (serverContent?.outputTranscription) {
    const incomingDelta = serverContent.outputTranscription;
    
    if (intentionToUseElevenLabs && prosodicBufferManagerRef.current) {
        // ✅ Route to ProsodicBufferManager (Option 5)
        prosodicBufferManagerRef.current.addDelta(incomingDelta);
    }
}
```

**See [ELEVENLABS.md](ELEVENLABS.md) for complete ProsodicBufferManager implementation.**

---

## 🔄 How to Change Voice

### For Option 4 (Pure Ultravox)

**Step 1: Get Voice UUID from Ultravox Dashboard**

1. Go to: https://app.ultravox.ai/voices
2. Select the voice you want to use
3. Click on the voice name to see details
4. Copy the UUID from the preview URL:
   ```
   https://app.ultravox.ai/api/voices/[UUID-HERE]/preview
   ```

**Example:**
```
URL: https://app.ultravox.ai/api/voices/a1b2c3d4-e5f6-7890-abcd-ef1234567890/preview
UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

**Step 2: Edit Proxy**

Open `server/ultravox-proxy.js` and find line ~46:

```javascript
// BEFORE (current voice)
const ultravoxVoiceUUID = 'e2c2ad44-b00c-43fe-a2c6-a1dd2d8a83d1';

// AFTER (your new voice)
const ultravoxVoiceUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';  // ← Paste your UUID
```

---

**Step 3: Restart Proxy**

```powershell
# Stop current proxy
taskkill /F /IM node.exe

# Start proxy
cd "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"
node server/ultravox-proxy.js
```

---

**Step 4: Test**

1. Go to http://localhost:3000
2. Select **"4 - Voz Ultravox Original"**
3. Click microphone
4. Hear the new voice

---

### For Option 5 (Ultravox + ElevenLabs)

**Option 5 uses ElevenLabs IVP (Instant Voice Cloning), not Ultravox voices.**

**Current Configuration:**
- Voice ID: `UltTvqUHgs6EfVePtvr4` (ElevenLabs IVP)
- Model: `eleven_multilingual_v2` (required for Spanish)
- Same voice as Option 2, but different model

**To change voice for Option 5:**
1. Get ElevenLabs IVP voice ID from https://elevenlabs.io/voice-lab
2. Update `HYBRID_ULTRAVOX_VOICE_IDS` in `services/voiceService.ts` (line ~27)
3. Ensure model is `eleven_multilingual_v2` (NOT turbo)
4. Configure voice settings in ElevenLabs settings

**⚠️ CRITICAL:** If you use the same Voice ID for Options 2 and 5:
- Option 2 will use `eleven_turbo_v2_5` (faster, lower quality)
- Option 5 will use `eleven_multilingual_v2` (slower, higher quality)
- Detection is automatic based on model

**See [ELEVENLABS.md](ELEVENLABS.md) for complete instructions.**

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error

**Symptoms:**
```
Access to fetch blocked by CORS policy: X-API-Key not allowed
```

**Diagnosis:** Trying to call Ultravox API directly from browser

**Root Cause:** Ultravox API doesn't allow CORS from browser

**Solution:** Use proxy backend (already implemented)

```javascript
// ❌ WRONG: Direct API call from browser
fetch('https://api.ultravox.ai/api/calls', {
    headers: { 'X-API-Key': 'your-key' }  // Blocked!
});

// ✅ CORRECT: Use proxy
fetch('http://localhost:3001/create-call', {
    // No API key needed
});
```

---

### Issue 2: Duration Format Error

**Symptoms:**
```
Duration must end with letter "s": 00:10:00
```

**Diagnosis:** `maxDuration` in wrong format

**Root Cause:** Using time format instead of seconds

**Solution:**
```javascript
// ❌ WRONG
maxDuration: "00:10:00"

// ✅ CORRECT
maxDuration: "600s"  // 10 minutes = 600 seconds
```

---

### Issue 3: Voice Field Type Error

**Symptoms:**
```
Failed to parse voice field: expected string, got 'dict'
```

**Diagnosis:** Voice field is an object, not a string

**Root Cause:** Passing object instead of UUID string

**Solution:**
```javascript
// ❌ WRONG
voice: {
    elevenLabs: {
        voiceId: "abc123",
        model: "eleven_turbo_v2_5"
    }
}

// ✅ CORRECT
voice: "e2c2ad44-b00c-43fe-a2c6-a1dd2d8a83d1"  // UUID string
```

---

### Issue 4: Invalid MessageRole Enum

**Symptoms:**
```
Invalid enum value agent/assistant for MessageRole
```

**Diagnosis:** Using `initialMessages` field

**Root Cause:** `initialMessages` causes enum errors

**Solution:**
```javascript
// ❌ WRONG
const payload = {
    initialMessages: [
        { role: "agent", text: "¡Hola!" }
    ]
};

// ✅ CORRECT
const payload = {
    firstSpeaker: "FIRST_SPEAKER_AGENT"  // Agent speaks first
};
```

---

### Issue 5: Proxy Not Running

**Symptoms:**
- Frontend shows "Error creating Ultravox call"
- Console: `Failed to fetch`

**Diagnosis:** Proxy not running on port 3001

**Root Cause:** Forgot to start proxy

**Solution:**
```powershell
# Start proxy
node server/ultravox-proxy.js

# Verify
curl http://localhost:3001/health
```

---

### Issue 6: Audio Cuts in Option 5

**Symptoms:**
- First sentence plays
- Subsequent sentences don't play
- Console: `🔄 TurnComplete: Buffer = "" (0 chars)`

**Diagnosis:** ProsodicBufferManager not enabled

**Root Cause:** Voice ID not in `HYBRID_ULTRAVOX_VOICE_IDS` or model is turbo

**Solution:**
```typescript
// File: services/voiceService.ts (line ~27)

// Verify voice ID is in set
const HYBRID_ULTRAVOX_VOICE_IDS = new Set(['UltTvqUHgs6EfVePtvr4']);

// Verify detection logic (line ~940)
const isHybridUltravox = HYBRID_ULTRAVOX_VOICE_IDS.has(voiceId) && 
                         !model.includes('turbo');  // Must NOT be turbo
```

**Expected Console Output (if working correctly):**
```
[23:11:40] 🔧 Init ProsodicBuffer...
[23:11:40] 🎯 Prosodic Buffer Manager enabled for Ultravox+EL (Option 5)
[23:11:40] 📊 Ultravox Config: Profile="Ultravox/Buffered", minChunk=70, debounce=260ms
[23:11:40] 🎙️ Voice: UltTvqUHgs6EfVePtvr4 (ElevenLabs IVP), Model: eleven_multilingual_v2
[23:11:40] ⚡ Latency: 0 (0=max quality), auto_mode=true
```

**See [ELEVENLABS.md](ELEVENLABS.md) for complete ProsodicBuffer troubleshooting.**

---

## 🧪 Testing & Verification

### Pre-Test Checklist

Before testing, verify:
- [ ] Ultravox proxy running (port 3001)
- [ ] Frontend running (port 3000)
- [ ] Ultravox API key configured in `.env.local`
- [ ] Browser console open (F12)

---

### Test Option 4 (Pure Ultravox)

**Procedure:**
1. Open browser: `http://localhost:3000`
2. Select "4 - Voz Ultravox Original"
3. Click "Habla con Andrés Cántor"
4. Say: "Hola Andrés, ¿cómo estás?"
5. Wait for response

**Expected Console Output:**
```
[23:11:40] 🎙️ [Ultravox] Iniciando sesión...
[23:11:40] 🎙️ [Ultravox] Creando llamada...
[23:11:41] 🎙️ [Ultravox] Call ID: abc123...
[23:11:41] 🎙️ [Ultravox] Status: connecting
[23:11:42] 🎙️ [Ultravox] Status: listening
[23:11:45] 💬 [AGENT]: "¡Qué tal, futbolero! ..."
```

**Expected Audio:**
- ✅ Audio plays immediately
- ✅ Natural voice
- ✅ No cuts or stuttering

---

### Test Option 5 (Ultravox + ElevenLabs)

**Procedure:**
1. Open browser: `http://localhost:3000`
2. Select "5 - Ultravox + ElevenLabs"
3. Click "Habla con Andrés Cántor"
4. Say: "Hola Andrés, cuéntame sobre el Mundial 2026"
5. Wait for response

**Expected Console Output:**
```
[23:11:40] 🔧 Init ProsodicBuffer...
[23:11:40] 🎯 Prosodic Buffer Manager enabled for Ultravox+EL (Option 5)
[23:11:40] 🔌 Connecting to EL (eleven_multilingual_v2)...
[23:11:41] ✅ EL connected
[23:11:43] 📥 Gemini Delta: "¡Qu" (3 chars)
[23:11:44] 📤 Sending: "¡Qué bueno escuchar eso!..." (97 chars)
[23:11:46] 📥 Chunk #7: 374490b
[23:11:46] ▶️ Playing (Duration: 7.80s, Rate: 1x)
[23:11:49] 🔄 Turn Complete
```

**Expected Audio:**
- ✅ Audio plays completely
- ✅ No cuts or stuttering
- ✅ Natural prosody
- ✅ Consistent tone

**Key indicators:**
- ✅ ProsodicBuffer initialized
- ✅ ElevenLabs connected
- ✅ Deltas received
- ✅ Text sent to ElevenLabs
- ✅ Audio chunks received and played

---

## 📊 Ultravox API Reference

### Official Documentation

- **Main Docs:** https://docs.ultravox.ai/
- **Getting Started:** https://docs.ultravox.ai/getting-started
- **API Reference:** https://docs.ultravox.ai/api-reference
- **Voice Configuration:** https://docs.ultravox.ai/guides/voice-configuration
- **ElevenLabs Integration:** https://docs.ultravox.ai/integrations/elevenlabs
- **Best Practices:** https://docs.ultravox.ai/guides/best-practices
- **WebSocket Protocol:** https://docs.ultravox.ai/guides/websocket-protocol

---

### Key Endpoints

#### Create Call
```
POST https://api.ultravox.ai/api/calls
```

**Headers:**
```json
{
    "Content-Type": "application/json",
    "X-API-Key": "your-ultravox-api-key"
}
```

**Request Body:**
```json
{
    "systemPrompt": "You are Andrés Cántor...",
    "temperature": 0.8,
    "voice": "e2c2ad44-b00c-43fe-a2c6-a1dd2d8a83d1",
    "maxDuration": "600s",
    "firstSpeaker": "FIRST_SPEAKER_AGENT"
}
```

**Response:**
```json
{
    "callId": "abc123...",
    "joinUrl": "wss://api.ultravox.ai/api/calls/abc123..."
}
```

---

#### WebSocket Connection
```
wss://api.ultravox.ai/api/calls/{callId}
```

**Sending Audio:**
```json
{
    "type": "audio",
    "data": "base64-encoded-pcm-audio"
}
```

**Receiving Text:**
```json
{
    "type": "transcript",
    "text": "¡Hola! ¿Cómo estás?",
    "final": true,
    "speaker": "agent"
}
```

**Receiving Audio (Option 4 only):**
```json
{
    "type": "audio",
    "data": "base64-encoded-pcm-audio"
}
```

---

### Status Events

| Status | Description |
|--------|-------------|
| `disconnected` | Not connected |
| `connecting` | Establishing connection |
| `idle` | Connected, waiting |
| `listening` | Listening to user |
| `thinking` | Processing (AI reasoning) |
| `speaking` | Agent speaking |

---

## ✅ Production Checklist

### Option 4 (Pure Ultravox):
- [ ] Proxy running on port 3001
- [ ] Ultravox API key configured
- [ ] Voice UUID correct (string)
- [ ] `maxDuration` in `"Xs"` format
- [ ] `firstSpeaker` configured
- [ ] NO `initialMessages`
- [ ] CORS enabled for frontend
- [ ] Health check endpoint works

### Option 5 (Ultravox + ElevenLabs):
- [ ] All Option 4 requirements
- [ ] ElevenLabs API key configured
- [ ] Voice ID in `HYBRID_ULTRAVOX_VOICE_IDS`
- [ ] Model is `eleven_multilingual_v2` (NOT turbo)
- [ ] ProsodicBufferManager enabled
- [ ] `auto_mode=true` in ElevenLabs URL
- [ ] Pre-buffering enabled
- [ ] Gapless playback enabled

---

## 📚 Related Documentation

- **[ELEVENLABS.md](ELEVENLABS.md)** - Complete ElevenLabs guide (for Option 5)
- **[CARTESIA.md](CARTESIA.md)** - Cartesia integration (Options 6 & 7)
- **[GEMINI.md](GEMINI.md)** - Gemini integration (Option 3)
- **[Troubleshooting](../TROUBLESHOOTING.md)** - General troubleshooting
- **[Quick Start](../QUICK_START.md)** - How to start the app

---

## 📞 Support

If you encounter issues not covered in this guide:

1. **Verify proxy is running:** `curl http://localhost:3001/health`
2. **Check console logs:** Look for errors or warnings
3. **Verify configuration:** Double-check all critical requirements
4. **Review related docs:** See links above

---

**Last Updated:** 2025-11-27  
**Version:** V2.27.1  
**Author:** Marcelo Escallón  
**Status:** ✅ Production Ready

**THIS IS THE ONLY ULTRAVOX DOCUMENTATION. ALL OTHER ULTRAVOX DOCS ARE OBSOLETE.**

