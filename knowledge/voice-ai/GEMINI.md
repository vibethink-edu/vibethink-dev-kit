# 🎙️ GEMINI - Complete Technical Documentation

**THE ONLY SOURCE OF TRUTH FOR GEMINI INTEGRATION**

**Version:** V2.27.2  
**Last Updated:** 2025-11-30  
**Status:** ✅ Production Ready

---

## ⚠️ CRITICAL WARNINGS

### 🚨 WARNING #1: Gemini Native TTS (Option 3) Uses Sentence-First Strategy

```typescript
// ✅ CORRECT: Only send complete sentences
if (/[.!?]$/.test(buffer)) {
    sendToGemini(buffer);  // Complete sentence
}

// ❌ WRONG: Send incomplete text
sendToGemini(buffer);  // May not end in punctuation
```

**WHY:** Gemini's native TTS needs complete sentences for natural prosody.

**RESULT IF WRONG:** Audio cuts, unnatural pauses, robotic voice.

**LOCATION:** `services/voiceService.ts` (Gemini text buffering logic)

---

### 🚨 WARNING #2: Gemini is Used by Multiple Options

**Gemini Multimodal Live API is used by:**
- ✅ Option 1 (Pro Cloned Voice) - Gemini conversation + ElevenLabs TTS
- ✅ Option 2 (Instant Cloned Voice) - Gemini conversation + ElevenLabs TTS
- ✅ Option 3 (Google Native) - Gemini conversation + Gemini native TTS
- ✅ Option 6 (Cartesia IVP) - Gemini conversation + Cartesia TTS
- ✅ Option 7 (Cartesia Pro PVP) - Gemini conversation + Cartesia TTS

**NOT used by:**
- ❌ Option 4 (Pure Ultravox) - Ultravox handles everything
- ❌ Option 5 (Ultravox + ElevenLabs) - Ultravox handles conversation

**CRITICAL:** Changes to Gemini integration affect 5 out of 7 options!

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Options Using Gemini](#options-using-gemini)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Implementation Guide](#implementation-guide)
6. [Sentence-First Strategy](#sentence-first-strategy)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Testing & Verification](#testing--verification)

---

## 🎯 Overview

### What is Gemini?

Gemini is Google's **Multimodal Live API** that provides:
- ✅ Speech-to-text (STT)
- ✅ AI reasoning and conversation
- ✅ Text-to-speech (TTS) - native
- ✅ Real-time streaming
- ✅ Multimodal input (audio, text, images)

**Official Docs:** https://ai.google.dev/api/multimodal-live

---

### Why Gemini in This Project?

Gemini is used for **conversation management** in 5 out of 7 voice options:

| Option | Gemini Role | TTS Provider |
|--------|-------------|--------------|
| 1 | Conversation (STT + AI) | ElevenLabs |
| 2 | Conversation (STT + AI) | ElevenLabs |
| 3 | Conversation + TTS | Gemini native |
| 6 | Conversation (STT + AI) | Cartesia |
| 7 | Conversation (STT + AI) | Cartesia |

**Options NOT using Gemini:**
- Option 4 (Pure Ultravox) - Ultravox handles everything
- Option 5 (Ultravox + ElevenLabs) - Ultravox handles conversation

---

## 🎙️ Options Using Gemini

### Option 1: Pro Cloned Voice (Gemini + ElevenLabs)

**Gemini Role:** Conversation management (STT + AI)  
**TTS:** ElevenLabs Pro Clone  
**Strategy:** ProsodicBufferManager

**See [ELEVENLABS.md](ELEVENLABS.md) for complete details.**

---

### Option 2: Instant Cloned Voice (Gemini + ElevenLabs)

**Gemini Role:** Conversation management (STT + AI)  
**TTS:** ElevenLabs Instant Clone  
**Strategy:** ProsodicBufferManager

**See [ELEVENLABS.md](ELEVENLABS.md) for complete details.**

---

### Option 3: Google Native (Gemini + Gemini TTS)

**Gemini Role:** Conversation + TTS (all-in-one)  
**TTS:** Gemini native voices  
**Strategy:** Sentence-First (only send complete sentences)

**This is the ONLY option using Gemini's native TTS.**

---

### Option 6: Cartesia IVP (Gemini + Cartesia)

**Gemini Role:** Conversation management (STT + AI)  
**TTS:** Cartesia Instant Voice Print  
**Strategy:** Sentence-First

**See [CARTESIA.md](CARTESIA.md) for complete details.**

---

### Option 7: Cartesia Pro PVP (Gemini + Cartesia)

**Gemini Role:** Conversation management (STT + AI)  
**TTS:** Cartesia Professional Voice Print  
**Strategy:** Sentence-First

**See [CARTESIA.md](CARTESIA.md) for complete details.**

---

## 🏗️ Architecture

### Gemini Multimodal Live API Flow

```
User Speech
    ↓
Microphone (Web Audio API)
    ↓
Audio Encoding (PCM → Base64)
    ↓
Gemini Multimodal Live API (WebSocket)
    ├─ Speech-to-Text
    ├─ AI Reasoning
    └─ Text Generation (streaming deltas)
    ↓
[OPTION 1 & 2]        [OPTION 3]         [OPTION 6 & 7]
ProsodicBuffer        Sentence-First      Sentence-First
    ↓                     ↓                   ↓
ElevenLabs            Gemini TTS          Cartesia
    ↓                     ↓                   ↓
Audio Output          Audio Output        Audio Output
```

---

### Key Components

#### 1. Gemini WebSocket Bridge (`server/routes/gemini.js`) ⚠️ **CRITICAL**
- **Purpose:** Server-side proxy for Gemini WebSocket connections
- **Responsibility:** Bidirectional streaming between client and Google Gemini Live API
- **Endpoint:** `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`
- **Features:**
  - ✅ Hides API key from browser (security)
  - ✅ Buffer de mensajes pendientes mientras se conecta upstream
  - ✅ Manejo de errores y reconexión automática
  - ✅ Soporte para subprotocols de Google
- **Dependencies:** Requiere `ws@^8.18.3` (WebSocket library)
- **Critical:** Sin este bridge, las API keys estarían expuestas en el browser

#### 2. Gemini Connection (`services/voiceService.ts`)
- **Purpose:** Client-side WebSocket connection to Gemini (via proxy)
- **Responsibility:** Send audio, receive text deltas
- **Critical:** Handles conversation for 5 options
- **Connection:** `ws://localhost:3001/api/gemini/live` (dev) o `wss://api.futboldeprimera.com/api/gemini/live` (prod)

#### 3. Text Routing Logic (`services/voiceService.ts`)
- **Purpose:** Route text to appropriate TTS provider
- **Responsibility:** Detect option and route accordingly
- **Critical:** Different strategies per option

#### 4. Audio Input (`services/voiceService.ts`)
- **Purpose:** Capture and encode microphone audio
- **Responsibility:** Send PCM audio to Gemini
- **Critical:** Proper encoding for Gemini

---

## 🔌 Gemini WebSocket Bridge (Server-Side Proxy)

### Overview

El **Gemini WebSocket Bridge** (`server/routes/gemini.js`) es un proxy crítico que:

1. **Oculta la API key del browser** - La key nunca llega al cliente
2. **Maneja conexiones bidireccionales** - Streaming en tiempo real entre cliente y Google
3. **Buffer inteligente** - Acumula mensajes mientras se conecta upstream
4. **Manejo robusto de errores** - Reconexión y limpieza automática

### Architecture

```
Browser (Client)
    ↓ WebSocket
    ws://localhost:3001/api/gemini/live
    ↓
[Gemini WebSocket Bridge] ← server/routes/gemini.js
    ↓ WebSocket (con API key)
    wss://generativelanguage.googleapis.com/ws/.../BidiGenerateContent?key=XXX
    ↓
Google Gemini Live API
```

### Implementation Details

**File:** `server/routes/gemini.js`

**Key Features:**
- ✅ **Endpoint v1beta**: Usa `v1beta.GenerativeService.BidiGenerateContent` (estable)
- ✅ **Buffer de mensajes**: Acumula mensajes del cliente mientras se conecta upstream
- ✅ **Subprotocol support**: Respeta los subprotocols que Google requiere
- ✅ **Error handling**: Cierra conexiones limpiamente en caso de error
- ✅ **Binary support**: Maneja tanto texto como datos binarios

**Dependencies:**
- `ws@^8.18.3` - WebSocket library (requerido)
- `express@4.21.2` - Server framework (versión fijada)

### Configuration

El bridge se activa automáticamente cuando:
1. El servidor Express inicia
2. `attachGeminiWss(server)` se llama desde `server/api-gateway.js`
3. `GEMINI_API_KEY` está presente en `.env.local` o `.env.production`

**Endpoints soportados:**
- `/api/gemini/live` - Endpoint explícito
- `/api/gemini/ws/google.ai.generativelanguage...` - Paths del SDK

### Security

⚠️ **CRITICAL:** La API key de Gemini **NUNCA** debe estar en el frontend.

**Correcto:**
```javascript
// Frontend: Sin API key
const ws = new WebSocket('ws://localhost:3001/api/gemini/live');
```

**Incorrecto:**
```javascript
// ❌ NUNCA hacer esto
const ws = new WebSocket(`wss://generativelanguage.googleapis.com/ws/...?key=${API_KEY}`);
```

### Troubleshooting

**Error: "Missing API Key on server"**
- Verificar que `GEMINI_API_KEY` esté en `.env.local` (dev) o `.env.production` (prod)
- Reiniciar el servidor después de agregar la key

**Error: "Upstream connection failed"**
- Verificar que la API key sea válida
- Verificar conectividad a `generativelanguage.googleapis.com`
- Revisar logs del servidor para detalles

**Error: "Client sent message before upstream ready"**
- Normal: Los mensajes se acumulan en buffer hasta que upstream esté listo
- No es un error crítico, el bridge maneja esto automáticamente

---

## ⚙️ Configuration

### Gemini API Configuration

```typescript
{
    model: "gemini-2.0-flash-exp",  // Latest Gemini model
    generationConfig: {
        responseModalities: "audio",  // For Option 3 (native TTS)
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: "Aoede"  // Gemini voice name
                }
            }
        }
    }
}
```

---

### Parameter Explanations

#### `model` (string)
- **Purpose:** Gemini model selection
- **Options:**
  - `"gemini-2.0-flash-exp"` - Latest experimental (recommended)
  - `"gemini-1.5-pro"` - Stable production model
- **Recommended:** `"gemini-2.0-flash-exp"`

---

#### `responseModalities` (string)
- **Purpose:** Response format from Gemini
- **Options:**
  - `"audio"` - Gemini generates audio (Option 3)
  - `"text"` - Gemini generates text only (Options 1, 2, 6, 7)
- **For Option 3:** `"audio"`
- **For Others:** `"text"` (or omit)

---

#### `voiceName` (string - Option 3 only)
- **Purpose:** Gemini native voice selection
- **Available voices:**
  - `"Puck"` - Male voice
  - `"Charon"` - Male voice
  - `"Kore"` - Female voice
  - `"Fenrir"` - Male voice
  - `"Aoede"` - Female voice (recommended for Spanish)

**For Andrés Cántor (Option 3):** `"Aoede"` or `"Puck"`

---

## 🛠️ Implementation Guide

### Step 1: Initialize Gemini Connection

**File:** `services/voiceService.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// Create model
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
        responseModalities: isGoogleNative ? 'audio' : 'text',
        speechConfig: isGoogleNative ? {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: 'Aoede'
                }
            }
        } : undefined
    }
});

// Connect to live API
const session = model.startLiveSession();
```

**Critical points:**
- `responseModalities: 'audio'` only for Option 3
- `speechConfig` only for Option 3
- Other options use text output

---

### Step 2: Send Audio to Gemini

**Files:** `public/audio-processor.js` (AudioWorklet) + `services/voiceService.ts`

```javascript
// public/audio-processor.js
class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this._buffer = new Float32Array(this.bufferSize);
    this._bytesWritten = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this._buffer[this._bytesWritten++] = channelData[i];
        if (this._bytesWritten >= this.bufferSize) {
          this.port.postMessage(this._buffer.slice(0, this.bufferSize)); // Float32 chunk
          this._bytesWritten = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor("audio-recorder-processor", AudioRecorderProcessor);
```

```typescript
// services/voiceService.ts (capture + send)
await audioContext.audioWorklet.addModule('/audio-processor.js');
const source = audioContext.createMediaStreamSource(stream);
const workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');

workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
  // Convert Float32 -> Int16 PCM + base64 (createBlob handles encoding)
  const pcmBlob = createBlob(event.data);
  session.sendRealtimeInput({ media: pcmBlob });
};

source.connect(workletNode);
workletNode.connect(audioContext.destination); // keep graph alive
```

**Critical points:**
- Sample rate 16kHz; buffer 2048 samples in the worklet (Float32 out).
- Convert Float32 to Int16 PCM in main thread (reuses `createBlob`), base64-encode payload, `mimeType: audio/pcm;rate=16000`.
- AudioWorklet keeps audio off the main thread; do not reintroduce ScriptProcessor.

---

### Step 3: Receive Text Deltas from Gemini

**File:** `services/voiceService.ts`

```typescript
session.on('message', (message) => {
    const serverContent = message.serverContent;
    
    // Text delta (for Options 1, 2, 6, 7)
    if (serverContent?.outputTranscription) {
        const delta = serverContent.outputTranscription;
        
        // Route to appropriate TTS provider
        if (intentionToUseElevenLabs && prosodicBufferManagerRef.current) {
            // Options 1 & 2: Route to ProsodicBufferManager
            prosodicBufferManagerRef.current.addDelta(delta);
        } else if (isCartesiaModeActive) {
            // Options 6 & 7: Route to Cartesia buffer
            cartesiaTextBufferRef.current += delta;
            scheduleCartesiaFlush();
        }
    }
    
    // Audio chunk (for Option 3)
    if (serverContent?.audioChunk) {
        const audioData = serverContent.audioChunk.data;
        // Play audio directly
        playGeminiAudio(audioData);
    }
});
```

**Critical points:**
- Text deltas for Options 1, 2, 6, 7
- Audio chunks for Option 3
- Route to appropriate handler

---

## 📖 Sentence-First Strategy

### What is "Sentence-First"?

**Sentence-First** is a buffering strategy that:
- ✅ Only sends text that ends in strong punctuation (`.!?`)
- ✅ Waits for complete sentences before sending
- ✅ Adds artificial period if timeout without punctuation
- ✅ Eliminates audio cuts and unnatural pauses

**Used by:**
- Option 3 (Google Native)
- Option 6 (Cartesia IVP)
- Option 7 (Cartesia Pro PVP)

**NOT used by:**
- Options 1 & 2 (use ProsodicBufferManager instead)

---

### How It Works

#### Phase 1: Accumulation

```typescript
// Accumulate text deltas
let buffer = "";

session.on('message', (message) => {
    const delta = message.serverContent?.outputTranscription;
    if (delta) {
        buffer += delta;
        evaluateBuffer();
    }
});
```

---

#### Phase 2: Evaluation

```typescript
const evaluateBuffer = () => {
    // Rule 1: Too small → Wait
    if (buffer.length < MIN_CHARS) {
        return;
    }
    
    // Rule 2: Has strong punctuation → Send
    if (/[.!?]$/.test(buffer)) {
        sendToTTS(buffer);
        buffer = "";
        return;
    }
    
    // Rule 3: Timeout without punctuation → Add period and send
    if (timeSinceLastDelta > TIMEOUT_MS) {
        sendToTTS(buffer + '.');
        buffer = "";
        return;
    }
    
    // Rule 4: Very long without punctuation → Add period and send
    if (buffer.length > MAX_CHARS) {
        sendToTTS(buffer + '.');
        buffer = "";
        return;
    }
};
```

---

#### Phase 3: Sending

```typescript
const sendToTTS = (text: string) => {
    if (isGoogleNative) {
        // Option 3: Already have audio from Gemini
        // (Gemini generates audio directly)
    } else if (isCartesiaModeActive) {
        // Options 6 & 7: Send to Cartesia
        queueCartesiaSynthesis(text);
    }
};
```

---

### Constants for Sentence-First

```typescript
// For Gemini Native (Option 3)
const GEMINI_MIN_CHARS = 25;          // Minimum chars before sending
const GEMINI_TIMEOUT_MS = 800;        // Timeout before forcing send
const GEMINI_MAX_CHARS = 100;         // Maximum chars before forcing send

// For Cartesia (Options 6 & 7)
const CARTESIA_STRONG_THRESHOLD = 35;  // Min chars for strong punctuation
const CARTESIA_COMMA_THRESHOLD = 55;   // Min chars for commas
const CARTESIA_MIN_CHARS = 28;          // Absolute minimum
const CARTESIA_IDLE_FLUSH_MS = 650;     // Timeout
const CARTESIA_FALLBACK_THRESHOLD = 70; // Fallback only if very long
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Audio Cuts in Option 3

**Symptoms:**
- First sentence plays
- Subsequent sentences don't play
- Unnatural pauses

**Root Cause:** Not using Sentence-First strategy

**Solution:**
```typescript
// ✅ Only send complete sentences
if (/[.!?]$/.test(buffer)) {
    sendToGemini(buffer);
}

// Add period if timeout
if (timeSinceLastDelta > TIMEOUT_MS) {
    sendToGemini(buffer + '.');
}
```

---

### Issue 2: Gemini Connection Fails

**Symptoms:**
- Console: `Failed to connect to Gemini`
- No response from AI

**Root Cause:** Invalid API key or network issue

**Solution:**
```typescript
// Verify API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('API Key:', apiKey ? 'Present' : 'Missing');

// Check network
fetch('https://generativelanguage.googleapis.com/v1beta/models')
    .then(res => console.log('Network OK'))
    .catch(err => console.error('Network Error:', err));
```

---

### Issue 3: Audio Not Playing (Option 3)

**Symptoms:**
- Text appears in UI
- No audio plays
- Console: No errors

**Root Cause:** `responseModalities` not set to `"audio"`

**Solution:**
```typescript
// ✅ For Option 3, set responseModalities to "audio"
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
        responseModalities: 'audio',  // ✅ CRITICAL for Option 3
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: 'Aoede'
                }
            }
        }
    }
});
```

---

### Issue 4: Wrong Voice (Option 3)

**Symptoms:**
- Audio plays but wrong voice
- Not the expected voice

**Root Cause:** Wrong `voiceName` in config

**Solution:**
```typescript
// ✅ Use correct voice name
speechConfig: {
    voiceConfig: {
        prebuiltVoiceConfig: {
            voiceName: 'Aoede'  // Or 'Puck', 'Charon', etc.
        }
    }
}
```

**Available voices:** Puck, Charon, Kore, Fenrir, Aoede

---

## 🧪 Testing & Verification

### Pre-Test Checklist

Before testing, verify:
- [ ] Gemini API key configured in `.env.local`
- [ ] Servers running (frontend on 3000)
- [ ] Browser console open (F12)
- [ ] Microphone permissions granted

---

### Test Option 3 (Google Native)

**Procedure:**
1. Open browser: `http://localhost:3000`
2. Select "3 - Google Native"
3. Click "Habla con Andrés Cántor"
4. Say: "Hola Andrés, ¿cómo estás?"
5. Wait for response

**Expected Console Output:**
```
[23:11:40] 🔧 Configurando modelo: gemini-2.0-flash-exp
[23:11:40] Starting with Google Native...
[23:11:41] Gemini opened
[23:11:43] 📥 Gemini Delta: "¡Ho" (3 chars)
[23:11:43] 📥 Gemini Delta: "la!" (3 chars)
[23:11:44] 📤 Sending to Gemini: "¡Hola! ¿Cómo estás?" (20 chars)
[23:11:44] ▶️ Playing Gemini audio
```

**Expected Audio:**
- ✅ Audio plays completely
- ✅ Natural voice
- ✅ No cuts or stuttering

---

### Test Options 1, 2, 6, 7 (Gemini Conversation Only)

**Procedure:**
1. Select any of these options
2. Start conversation
3. Verify Gemini text deltas arrive

**Expected Console Output:**
```
[23:11:40] 🔧 Configurando modelo: gemini-2.0-flash-exp
[23:11:41] Gemini opened
[23:11:43] 📥 Gemini Delta: "¡Ho" (3 chars)
[23:11:43] 📥 Gemini Delta: "la!" (3 chars)
[23:11:44] 📤 Sending to [TTS Provider]: "¡Hola!..." (varies by option)
```

**Expected:**
- ✅ Gemini deltas arrive
- ✅ Text routed to appropriate TTS provider
- ✅ Audio plays (from TTS provider, not Gemini)

---

## ✅ Production Checklist

### Configuration:
- [ ] Gemini API key configured
- [ ] Model: `gemini-2.0-flash-exp`
- [ ] `responseModalities: 'audio'` for Option 3
- [ ] `speechConfig` configured for Option 3
- [ ] Text routing logic correct for all options

### Testing:
- [ ] Option 3 works (Gemini native TTS)
- [ ] Options 1 & 2 work (Gemini + ElevenLabs)
- [ ] Options 6 & 7 work (Gemini + Cartesia)
- [ ] Audio plays completely (no cuts)
- [ ] Natural voice and prosody

---

## 📚 Related Documentation

- **[ELEVENLABS.md](ELEVENLABS.md)** - ElevenLabs integration (Options 1, 2, 5)
- **[ULTRAVOX.md](ULTRAVOX.md)** - Ultravox integration (Options 4 & 5)
- **[CARTESIA.md](CARTESIA.md)** - Cartesia integration (Options 6 & 7)
- **[Troubleshooting](../TROUBLESHOOTING.md)** - General troubleshooting
- **[Quick Start](../QUICK_START.md)** - How to start the app

---

## 📞 Support

If you encounter issues not covered in this guide:

1. **Verify API key:** Check `.env.local`
2. **Check console logs:** Look for errors or warnings
3. **Verify configuration:** Double-check model and responseModalities
4. **Review related docs:** See links above

---

**Last Updated:** 2025-11-30  
**Version:** V2.27.2

---

## 📝 Changelog

### v2.27.2 (2025-11-30)
- ✅ **Gemini WebSocket Bridge documentado**: Sección completa sobre el proxy server-side (`server/routes/gemini.js`)
- ✅ **Dependencias fijadas**: Documentación sobre versiones exactas (express@4.21.2, express-rate-limit@6.11.2, ws@^8.18.3)
- ✅ **Security best practices**: Guía sobre cómo mantener API keys seguras (nunca en frontend)
- ✅ **Troubleshooting mejorado**: Sección específica para problemas del WebSocket Bridge

### v2.27.1 (2025-11-27)
- Versión base estable  
**Author:** Marcelo Escallón  
**Status:** ✅ Production Ready

**THIS IS THE ONLY GEMINI DOCUMENTATION. ALL OTHER GEMINI DOCS ARE OBSOLETE.**


