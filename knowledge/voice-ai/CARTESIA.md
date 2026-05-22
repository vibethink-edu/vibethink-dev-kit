### Cartesia Voiceprint Inventory (V2 Pro Training)

| Alias | Descripción                                   | Voice ID                                   |
|-------|-----------------------------------------------|--------------------------------------------|
| VP2-0 | Cartesia Pro V2 (Versión 0)                   | `3cf65123-1771-4617-8ebd-d1928308b3c2`     |
| VP2-1 | Cartesia Pro V1                               | `c0074be1-9e88-402e-9e4e-53985fb1637a`     |
| VP2-2 | Cartesia V2 Pro Entrenamiento (Versión 2)     | `fe534456-f869-4fbc-be0a-79399a507e71`     |
| VP2-3 | Cartesia V2 Pro Entrenamiento (Versión 3)     | `ffcd7d96-c3ed-4539-95d0-468863034201`     |
# 🎙️ CARTESIA - Complete Technical Documentation

**THE ONLY SOURCE OF TRUTH FOR CARTESIA INTEGRATION**

**Version:** V2.27.1  
**Last Updated:** 2025-11-27  
**Status:** ✅ Production Ready

---

## ⚠️ CRITICAL WARNINGS

### 🚨 WARNING #1: NEVER Use `emotion: excited` or `emotion: happy`

```typescript
// ❌ WRONG → OVERACTING, UNNATURAL VOICE
const generationConfig = {
    emotion: "excited"  // Causes overacting!
};

// ✅ CORRECT → NATURAL, NEUTRAL VOICE
const generationConfig = {
    emotion: "neutral"  // Lets model infer emotion from text
};
```

**WHY:** Cartesia's `sonic-3` model can infer emotion from text context (exclamation marks, question marks, etc.). Forcing `excited` or `happy` causes overacting and unnatural "muletillas" (filler words).

**RESULT IF WRONG:** Voice sounds fake, overacted, with unwanted filler phrases like "Dale", "Contame", "Sin miedo".

**LOCATION:** `services/cartesiaService.ts` or wherever generation config is set

---

### 🚨 WARNING #2: `speed` MUST Be 1.0 (NOT 1.2, 1.4, or higher)

```typescript
// ❌ WRONG → UNNATURALLY FAST VOICE
const generationConfig = {
    speed: 1.4  // Too fast!
};

// ✅ CORRECT → NATURAL SPEED
const generationConfig = {
    speed: 1.0  // Natural 1x speed
};
```

**WHY:** Speeds > 1.0 make voice sound rushed and unnatural. Natural speech is 1.0x.

**RESULT IF WRONG:** Voice sounds hurried, loses naturalness, hard to understand.

**LOCATION:** `services/cartesiaService.ts` or wherever generation config is set

---

### 🚨 WARNING #3: Settings MUST Be Isolated Per Mode

```typescript
// ❌ WRONG → SHARED SETTINGS BETWEEN MODES
localStorage.setItem('cartesiaSettings', JSON.stringify(settings));  // Shared!

// ✅ CORRECT → ISOLATED SETTINGS PER MODE
localStorage.setItem('cartesiaSettings_cartesia', JSON.stringify(settings));  // Option 6
localStorage.setItem('cartesiaSettings_cartesia_pro', JSON.stringify(settings));  // Option 7
```

**WHY:** Options 6 and 7 must have independent settings. Sharing settings causes configuration conflicts.

**RESULT IF WRONG:** Changing settings in Option 6 affects Option 7, and vice versa.

**LOCATION:** `components/HeroSection.tsx` or wherever settings are saved/loaded

---

### 🚨 WARNING #4: Auto-Correction of Old Settings is MANDATORY

```typescript
// ✅ CORRECT → Auto-correct old settings on load
const loadedSettings = JSON.parse(localStorage.getItem('cartesiaSettings_cartesia'));

if (loadedSettings.speed !== 1.0 || loadedSettings.emotion !== 'neutral') {
    // Override with golden standard
    loadedSettings.speed = 1.0;
    loadedSettings.volume = 1.1;
    loadedSettings.emotion = 'neutral';
    localStorage.setItem('cartesiaSettings_cartesia', JSON.stringify(loadedSettings));
}
```

**WHY:** Users may have old settings (e.g., `speed: 1.4`, `emotion: excited`) saved in browser. Auto-correction ensures everyone uses golden standard.

**RESULT IF MISSING:** Users continue using old, problematic settings.

**LOCATION:** `components/HeroSection.tsx` on component mount

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Options Using Cartesia](#options-using-cartesia)
3. [Golden Standard Configuration](#golden-standard-configuration)
4. [Architecture](#architecture)
5. [Implementation Guide](#implementation-guide)
6. [How to Create Emotional Voices](#how-to-create-emotional-voices)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Testing & Verification](#testing--verification)

---

## 🎯 Overview

### What is Cartesia?

Cartesia is a **Text-to-Speech (TTS) API** that provides:
- ✅ Real-time streaming audio
- ✅ Voice cloning
- ✅ Emotion control
- ✅ Speed and volume control
- ✅ `sonic-3` model (latest and most stable)

**Official Docs:** https://docs.cartesia.ai/

---

### Why Cartesia in This Project?

We use Cartesia for **2 voice options** in the Andrés Cántor Voice Agent:

| Option | Name | Voice Type | Use Case |
|--------|------|------------|----------|
| 6 | Cartesia (IVP) | Instant Voice Print | Fast cloning, good quality |
| 7 | Cartesia Pro (PVP) | Professional Voice Print | High-quality professional clone |

---

## 🎙️ Options Using Cartesia

### Option 6: Cartesia (IVP)

**What it does:**
- Gemini handles conversation (STT + AI)
- Cartesia handles TTS with Instant Voice Print
- Sentence-First strategy ensures smooth audio

**Voice Type:** Instant Voice Print (IVP)  
**Model:** `sonic-3`  
**Latency:** 300-500ms first audio

**When to use:**
- ✅ Need fast voice cloning
- ✅ Want good quality without long training
- ✅ Testing or development

---

### Option 7: Cartesia Pro (PVP)

**What it does:**
- Gemini handles conversation (STT + AI)
- Cartesia handles TTS with Professional Voice Print
- Sentence-First strategy ensures smooth audio

**Voice Type:** Professional Voice Print (PVP)  
**Model:** `sonic-3`  
**Latency:** 300-500ms first audio

**When to use:**
- ✅ Need highest quality cloned voice
- ✅ Professional use case
- ✅ Have time for voice training

---

## 🏆 Golden Standard Configuration

### What is the "Golden Standard"?

The **Golden Standard** is the proven configuration that eliminates:
- ❌ Overacting
- ❌ Unnatural voice
- ❌ Audio artifacts
- ❌ Filler words ("muletillas")

**This configuration is MANDATORY for both Options 6 and 7.**

---

### Base Parameters

```typescript
{
    model_id: "sonic-3",          // Latest and most stable model
    language: "es",                // Spanish
    output_format: {
        container: "wav",          // Standard, no header issues
        encoding: "pcm_f32le",     // 32-bit Float Little Endian (max fidelity)
        sample_rate: 44100         // CD quality
    }
}
```

---

### Generation Config (Style Control)

```typescript
{
    speed: 1.0,                    // Natural 1x speed
    volume: 1.1,                   // Slightly elevated for presence
    emotion: "neutral"             // Neutral emotion (model infers from text)
}
```

**Why These Values:**

#### `speed: 1.0`
- **Why:** Natural speech speed
- **Don't use:** 1.2, 1.4, or higher (sounds rushed)
- **Effect:** Comfortable, natural pace

#### `volume: 1.1`
- **Why:** Slightly elevated for presence without saturation
- **Don't use:** > 1.3 (causes distortion)
- **Effect:** Clear, present voice

#### `emotion: "neutral"`
- **Why:** `sonic-3` model infers emotion from text (exclamation marks, context)
- **Don't use:** `excited`, `happy`, `sad` (causes overacting)
- **Effect:** Natural, context-appropriate emotion

---

## Muletillas y Pausas Suaves (Experimento)

- Muletillas ligeras opcionales: permitir que el prompt use "mmm", "eh", "a ver" con baja frecuencia (1 de cada 6-8 respuestas), idealmente al inicio de respuestas largas. No usar más de una por respuesta ni en CTAs/datos.
- Pausa opcional vía `<break>`: si se usa SSML/XML, tras la muletilla se puede insertar un único `<break time="150ms"/>` en respuestas largas para dar aire. No encadenar múltiples breaks ni alterar `speed: 1.0` o `emotion: neutral`.
- Mantener Golden Standard: `model_id: sonic-3`, `language: es`, `speed: 1.0`, `volume: 1.1`, `emotion: neutral`. No forzar emociones (`excited`, `happy`) para evitar sobre-actuación.

## Estado actual de Transcripcion (USER)

- Deltas simplificados: se concatena tal cual llega, sin heuristicas de espacios, para evitar cortes como "fut-bol".
- Al cerrar turno, se aplica un reflow ligero (separa mayusculas pegadas, elimina duplicados y colapsa espacios) antes de mostrar la transcripcion final.
- Captura de audio: ahora en AudioWorklet (buffer 2048 @16k); el procesador emite Float32 y se convierte a Int16 PCM en el hilo principal antes de enviarlo al socket, manteniendo la logica de `createBlob`.

## 🏗️ Architecture

### Complete Flow (Options 6 & 7)

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
Cartesia Buffer (Sentence-First Strategy)
    ├─ Accumulate text deltas
    ├─ Detect sentence boundaries (.!?)
    ├─ Wait for complete sentence
    └─ Send only complete sentences
    ↓
Cartesia WebSocket API
    ├─ Receives complete sentences
    ├─ Generates audio (streaming)
    └─ Sends WAV audio chunks
    ↓
Audio Output Buffer
    ├─ Pre-buffers chunks
    └─ Schedules playback
    ↓
Speaker (Smooth Audio)
```

**Key Difference from ElevenLabs:** Sentence-First strategy (only send complete sentences).

---

### Key Components

#### 1. Cartesia Service (`services/cartesiaService.ts`)
- **Purpose:** Cartesia API integration
- **Responsibility:** WebSocket connection, audio generation
- **Critical:** Sentence-First buffering logic

#### 2. Voice Service (`services/voiceService.ts`)
- **Purpose:** Coordinate all voice providers
- **Responsibility:** Route text to Cartesia, manage audio playback
- **Critical:** Sentence detection and buffering

#### 3. Hero Section (`components/HeroSection.tsx`)
- **Purpose:** UI and settings management
- **Responsibility:** Load/save settings, auto-correct old settings
- **Critical:** Settings isolation per mode

---

## ⚙️ Configuration

### Cartesia Settings

**Recommended for Options 6 & 7:**

```typescript
{
    model_id: "sonic-3",
    language: "es",
    output_format: {
        container: "wav",
        encoding: "pcm_f32le",
        sample_rate: 44100
    },
    generation_config: {
        speed: 1.0,
        volume: 1.1,
        emotion: "neutral"
    }
}
```

---

### Parameter Explanations

#### `model_id` (string)
- **Purpose:** Cartesia model selection
- **Options:**
  - `"sonic-3"` - Latest and most stable (recommended)
  - `"sonic-2"` - Older model
- **Recommended:** `"sonic-3"`

---

#### `language` (string)
- **Purpose:** Language code for speech
- **Options:** `"es"`, `"en"`, `"pt"`, `"fr"`, etc.
- **For Andrés Cántor:** `"es"` (Spanish)

---

#### `output_format` (object)

##### `container` (string)
- **Purpose:** Audio container format
- **Options:** `"wav"`, `"mp3"`, `"raw"`
- **Recommended:** `"wav"` (no header issues)

##### `encoding` (string)
- **Purpose:** Audio encoding
- **Options:**
  - `"pcm_f32le"` - 32-bit float (max fidelity) ✅ Recommended
  - `"pcm_s16le"` - 16-bit signed (smaller size)
  - `"pcm_mulaw"` - μ-law (telephony)
- **Recommended:** `"pcm_f32le"` (CD quality)

##### `sample_rate` (number)
- **Purpose:** Audio sample rate
- **Options:** `8000`, `16000`, `22050`, `44100`, `48000`
- **Recommended:** `44100` (CD quality)

---

#### `generation_config` (object)

##### `speed` (number)
- **Purpose:** Speech speed multiplier
- **Range:** `0.5` - `2.0`
- **Recommended:** `1.0` (natural speed)
- **⚠️ Warning:** > 1.0 sounds rushed and unnatural

##### `volume` (number)
- **Purpose:** Audio volume multiplier
- **Range:** `0.5` - `2.0`
- **Recommended:** `1.1` (slightly elevated for presence)
- **⚠️ Warning:** > 1.3 may cause distortion

##### `emotion` (string)
- **Purpose:** Emotion control
- **Options:** `"neutral"`, `"happy"`, `"sad"`, `"angry"`, `"excited"`, `"calm"`
- **Recommended:** `"neutral"` (model infers from text)
- **⚠️ Warning:** `excited` or `happy` causes overacting

---

## 🛠️ Implementation Guide

### Step 1: Settings Isolation

**File:** `components/HeroSection.tsx`

```typescript
// ✅ CORRECT: Isolated settings per mode
const loadCartesiaSettings = (mode: 'cartesia' | 'cartesia_pro') => {
    const key = `cartesiaSettings_${mode}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
        const settings = JSON.parse(saved);
        
        // ✅ Auto-correct old settings
        if (settings.speed !== 1.0 || settings.emotion !== 'neutral') {
            settings.speed = 1.0;
            settings.volume = 1.1;
            settings.emotion = 'neutral';
            localStorage.setItem(key, JSON.stringify(settings));
        }
        
        return settings;
    }
    
    // Default golden standard
    return {
        speed: 1.0,
        volume: 1.1,
        emotion: 'neutral'
    };
};

// Load settings for Option 6
const cartesiaSettings = loadCartesiaSettings('cartesia');

// Load settings for Option 7
const cartesiaProSettings = loadCartesiaSettings('cartesia_pro');
```

**Critical points:**
- Separate `localStorage` keys per mode
- Auto-correct old settings on load
- Default to golden standard

---

### Step 2: Sentence-First Buffering

**File:** `services/voiceService.ts`

```typescript
// Constants for Cartesia
const CARTESIA_STRONG_THRESHOLD = 35;  // Min chars for strong punctuation
const CARTESIA_COMMA_THRESHOLD = 55;   // Min chars for commas
const CARTESIA_MIN_CHARS = 28;          // Absolute minimum
const CARTESIA_IDLE_FLUSH_MS = 650;     // Timeout
const CARTESIA_FALLBACK_THRESHOLD = 70; // Fallback only if very long

// Flush Cartesia chunk
const flushCartesiaChunk = useCallback(
    (trigger: string, forceAll: boolean = false) => {
        const buffer = cartesiaTextBufferRef.current;
        
        if (buffer.length < CARTESIA_MIN_CHARS && !forceAll) {
            return;  // Too small, wait
        }
        
        let cutIndex = -1;
        
        if (!forceAll) {
            // 1. Look for strong punctuation first (.!?)
            cutIndex = evaluateCut(/[.!?]/g, CARTESIA_STRONG_THRESHOLD);
            
            // 2. If not found, look for commas (only if long enough)
            if (cutIndex === -1) {
                cutIndex = evaluateCut(/[,;]/g, CARTESIA_COMMA_THRESHOLD);
            }
            
            // 3. Fallback by space ONLY if very long
            if (cutIndex === -1 && buffer.length >= CARTESIA_FALLBACK_THRESHOLD) {
                cutIndex = buffer.lastIndexOf(' ');
            }
        } else {
            cutIndex = buffer.length;
        }
        
        if (cutIndex === -1) {
            return;  // No valid cut point, wait
        }
        
        // Extract chunk
        const chunk = buffer.substring(0, cutIndex + 1).trim();
        cartesiaTextBufferRef.current = buffer.substring(cutIndex + 1).trim();
        
        // Finalize chunk (add period if needed)
        const preparedChunk = finalizeCartesiaChunk(chunk, forceAll);
        
        // Send to Cartesia
        queueCartesiaSynthesis(preparedChunk, chunk);
    },
    [isCartesiaModeActive, queueCartesiaSynthesis]
);

// Finalize chunk (add period if needed)
const finalizeCartesiaChunk = (chunk: string, forceAll: boolean): string => {
    const trimmed = chunk.trim();
    
    // If forced and no punctuation, add period
    if (forceAll && !/[.!?,;:]$/.test(trimmed)) {
        return trimmed + '.';
    }
    
    return trimmed;
};
```

**Critical points:**
- Only send complete sentences (ending in `.!?`)
- Commas only if text is long enough
- Fallback by space only if very long
- Add period artificially if timeout without punctuation

---

### Step 3: Visual Synchronization

**File:** `services/voiceService.ts`

```typescript
// Enqueue Cartesia audio with visual text
const enqueueCartesiaAudio = useCallback(
    (base64Audio: string, visualText: string) => {
        audioProcessingQueueRef.current = audioProcessingQueueRef.current.then(async () => {
            // Decode audio
            const audioBuffer = await decodeAudioData(base64Audio);
            
            // ✅ Update UI with visual text BEFORE playing audio
            updateConversation('andres', visualText);
            
            // Play audio
            await playAudioBuffer(audioBuffer);
        });
    },
    [playAudioBuffer, updateConversation]
);
```

**Critical points:**
- Update UI with text BEFORE playing audio
- This creates typewriter effect
- Hides latency from user

---

## 🎭 How to Create Emotional Voices

### Sad Voice

**Settings:**
```typescript
{
    speed: 0.9,                    // Slightly slower
    volume: 1.0,                   // Normal volume (softer)
    emotion: "sad"                 // Sad emotion
}
```

**System Prompt Addition:**
```typescript
"Habla con un tono melancólico y reflexivo. Usa pausas más largas. Expresa tristeza en tu voz."
```

---

### Happy/Excited Voice

**Settings:**
```typescript
{
    speed: 1.1,                    // Slightly faster
    volume: 1.2,                   // Elevated volume
    emotion: "happy"               // Happy emotion
}
```

**System Prompt Addition:**
```typescript
"Habla con entusiasmo y energía. Usa un tono alegre y animado. Expresa emoción en tu voz."
```

**⚠️ Warning:** Use with caution. `happy` can cause overacting. Test thoroughly.

---

### Angry Voice

**Settings:**
```typescript
{
    speed: 1.0,                    // Normal speed
    volume: 1.3,                   // Higher volume
    emotion: "angry"               // Angry emotion
}
```

**System Prompt Addition:**
```typescript
"Habla con un tono firme e intenso. Usa énfasis en palabras clave. Expresa frustración o enojo en tu voz."
```

---

### Calm/Soothing Voice

**Settings:**
```typescript
{
    speed: 0.85,                   // Slower speed
    volume: 1.0,                   // Normal volume
    emotion: "calm"                // Calm emotion
}
```

**System Prompt Addition:**
```typescript
"Habla con un tono calmado y relajante. Usa pausas largas. Expresa tranquilidad en tu voz."
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Overacting Voice

**Symptoms:**
- Voice sounds fake or exaggerated
- Unwanted filler words ("Dale", "Contame", "Sin miedo")
- Unnatural intonation

**Root Cause:** `emotion: "excited"` or `emotion: "happy"`

**Solution:**
```typescript
// ✅ Use neutral emotion
const generationConfig = {
    emotion: "neutral"  // Model infers from text
};
```

---

### Issue 2: Voice Too Fast

**Symptoms:**
- Voice sounds rushed
- Hard to understand
- Unnatural pace

**Root Cause:** `speed > 1.0`

**Solution:**
```typescript
// ✅ Use natural speed
const generationConfig = {
    speed: 1.0  // Natural 1x speed
};
```

---

### Issue 3: Settings Not Persisting

**Symptoms:**
- Settings reset after refresh
- Changes in Option 6 affect Option 7

**Root Cause:** Settings not isolated per mode

**Solution:**
```typescript
// ✅ Use isolated keys
localStorage.setItem('cartesiaSettings_cartesia', JSON.stringify(settings));  // Option 6
localStorage.setItem('cartesiaSettings_cartesia_pro', JSON.stringify(settings));  // Option 7
```

---

### Issue 4: Old Settings Causing Problems

**Symptoms:**
- User has old settings (e.g., `speed: 1.4`)
- Voice sounds wrong despite "correct" defaults

**Root Cause:** Old settings saved in browser

**Solution:**
```typescript
// ✅ Auto-correct on load
const loadedSettings = JSON.parse(localStorage.getItem('cartesiaSettings_cartesia'));

if (loadedSettings.speed !== 1.0 || loadedSettings.emotion !== 'neutral') {
    loadedSettings.speed = 1.0;
    loadedSettings.volume = 1.1;
    loadedSettings.emotion = 'neutral';
    localStorage.setItem('cartesiaSettings_cartesia', JSON.stringify(loadedSettings));
}
```

---

## 🧪 Testing & Verification

### Pre-Test Checklist

Before testing, verify:
- [ ] Servers running (frontend on 3000)
- [ ] Browser console open (F12)
- [ ] Correct voice selected (Option 6 or 7)
- [ ] Settings are golden standard (speed: 1.0, volume: 1.1, emotion: neutral)

---

### Test Procedure

#### Test 1: Single Turn
1. Start conversation
2. Say: "Hola Andrés, ¿cómo estás?"
3. Wait for response

**Expected:**
- ✅ Audio plays completely
- ✅ Natural voice (not overacted)
- ✅ Natural speed (not rushed)
- ✅ No cuts or stuttering

#### Test 2: Multiple Turns
1. Continue conversation
2. Say: "Cuéntame sobre el Mundial 2026"
3. Wait for response
4. Say: "¿Qué equipos son favoritos?"
5. Wait for response

**Expected:**
- ✅ All turns produce audio
- ✅ Consistent voice quality
- ✅ No degradation over time

#### Test 3: Settings Isolation
1. Open Option 6 settings
2. Change speed to 1.2
3. Switch to Option 7
4. Verify Option 7 still has speed 1.0

**Expected:**
- ✅ Option 7 unaffected by Option 6 changes

---

## ✅ Production Checklist

### Configuration:
- [ ] Model: `sonic-3`
- [ ] Language: `es`
- [ ] Output format: `wav`, `pcm_f32le`, `44100`
- [ ] Speed: `1.0`
- [ ] Volume: `1.1`
- [ ] Emotion: `neutral`

### Settings Management:
- [ ] Settings isolated per mode
- [ ] Auto-correction on load
- [ ] Default to golden standard

### Testing:
- [ ] Single turn works
- [ ] Multiple turns work
- [ ] Voice sounds natural (not overacted)
- [ ] Voice speed is natural (not rushed)
- [ ] Settings isolation works

---

## 📚 Related Documentation

- **[ELEVENLABS.md](ELEVENLABS.md)** - ElevenLabs integration (Options 1, 2, 5)
- **[ULTRAVOX.md](ULTRAVOX.md)** - Ultravox integration (Options 4 & 5)
- **[GEMINI.md](GEMINI.md)** - Gemini integration (Option 3)
- **[Troubleshooting](../TROUBLESHOOTING.md)** - General troubleshooting
- **[Quick Start](../QUICK_START.md)** - How to start the app

---

## 📞 Support

If you encounter issues not covered in this guide:

1. **Verify settings:** Check speed, volume, emotion
2. **Check console logs:** Look for errors or warnings
3. **Verify configuration:** Double-check golden standard
4. **Review related docs:** See links above

---

**Last Updated:** 2025-11-27  
**Version:** V2.27.1  
**Author:** Marcelo Escallón  
**Status:** ✅ Production Ready

**THIS IS THE ONLY CARTESIA DOCUMENTATION. ALL OTHER CARTESIA DOCS ARE OBSOLETE.**


