# 🎙️ Voz en Español Argentino para Google Native (Opción 3)

## 📋 Resumen de Investigación

Este documento investiga las opciones disponibles para agregar una voz masculina en español argentino a la opción **Google Native** (modo 3).

---

## 🔍 Situación Actual

### Implementación Actual

**Archivo:** `services/voiceService.ts` (líneas 1495-1516)

```typescript
const sessionConfig = {
    responseModalities: [Modality.AUDIO],
    speechConfig: { 
        voiceConfig: { 
            prebuiltVoiceConfig: { 
                voiceName: 'Charon' // Voz masculina actual
            } 
        }
    },
    systemInstruction: systemInstruction, // Acento argentino vía prompt
};
```

**Voz actual:** `Charon` (masculina, profunda)
**Acento argentino:** Se logra principalmente a través del `systemInstruction`

---

## 🎯 Opciones Disponibles

### Opción 1: Usar Voces Predefinidas de Gemini Live API ⭐ (Recomendada)

**Voces masculinas disponibles:**
- `"Puck"` - Voz neutra (puede sonar gringa)
- `"Charon"` - Voz masculina profunda (actual)
- `"Fenrir"` - Voz masculina alternativa

**Limitación:** Gemini Live API **NO** tiene voces específicas con acento argentino. El acento se logra mediante:
1. **System Instruction** - Instrucciones al modelo sobre cómo hablar
2. **Modelo de Gemini** - Interpreta el texto con el acento solicitado

**Implementación:**
```typescript
// Mejorar el systemInstruction para acento argentino más marcado
const systemInstruction = `
INFORMACIÓN PRIORITARIA Y CONTEXTO:
${knowledgeBaseText}

INSTRUCCIONES DE PERSONALIDAD:
${ANDRES_CANTOR_SYSTEM_PROMPT}

INSTRUCCIONES DE ACENTO Y PRONUNCIACIÓN:
- Habla con acento argentino rioplatense auténtico
- Usa "vos" en lugar de "tú"
- Pronuncia "ll" y "y" como "sh" (ej: "llamar" → "shamar")
- Usa modismos argentinos: "che", "boludo", "posta", "re"
- Pronuncia "c" y "z" como "s" (ej: "casa" → "casa", no "caza")
- Énfasis en la entonación argentina característica
`;
```

**Ventajas:**
- ✅ No requiere cambios arquitectónicos
- ✅ Usa la infraestructura actual
- ✅ Gratis (incluido en Gemini API)
- ✅ Baja latencia (nativo)

**Desventajas:**
- ⚠️ El acento depende de la calidad del prompt
- ⚠️ Puede variar según el contexto

---

### Opción 2: Google Cloud Text-to-Speech (es-AR-Standard-B)

**Servicio:** Google Cloud Text-to-Speech (separado de Gemini Live API)

**Voces disponibles para español argentino:**
- `es-AR-Standard-A` - Voz femenina
- `es-AR-Standard-B` - Voz masculina ✅

**Implementación requerida:**
1. Configurar Google Cloud TTS API
2. Obtener credenciales de servicio
3. Modificar arquitectura para usar TTS separado
4. Cambiar de Gemini Live API (audio nativo) a Gemini (texto) + Cloud TTS

**Código de ejemplo:**
```typescript
// Requeriría cambios significativos en voiceService.ts
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient();
const request = {
  input: { text: transcript },
  voice: { 
    languageCode: 'es-AR',  // Español Argentina
    name: 'es-AR-Standard-B', // Voz masculina
    ssmlGender: 'MALE'
  },
  audioConfig: { audioEncoding: 'MP3' }
};

const [response] = await client.synthesizeSpeech(request);
```

**Ventajas:**
- ✅ Acento argentino auténtico y consistente
- ✅ Voz nativa de Google Cloud
- ✅ Control total sobre la voz

**Desventajas:**
- ❌ Requiere cambios arquitectónicos significativos
- ❌ Requiere API key adicional de Google Cloud
- ❌ Costos adicionales (no incluido en Gemini API)
- ❌ Mayor latencia (API separada)
- ❌ Requiere backend proxy (no puede ir en frontend)

---

### Opción 3: Mejorar System Instruction Actual

**Estrategia:** Optimizar el prompt existente para acento argentino más marcado

**Archivo a modificar:** `data/prompts.ts` o `data/systemPrompt.ts`

**Ejemplo de mejora:**
```typescript
export const ANDRES_CANTOR_SYSTEM_PROMPT_ARGENTINO = `
Eres Andrés Cántor, el legendario relator de fútbol argentino.

PERSONALIDAD:
- Apasionado, energético, knowledgeable sobre fútbol
- Estilo de narración característico de relato argentino

ACENTO Y PRONUNCIACIÓN:
- Habla EXCLUSIVAMENTE con acento argentino rioplatense
- Usa "vos" en lugar de "tú" (ej: "¿Vos qué pensás?")
- Pronuncia "ll" y "y" como "sh" (ej: "llamar" → "shamar", "yo" → "sho")
- Usa modismos argentinos naturalmente: "che", "boludo", "posta", "re", "grosso"
- Pronuncia "c" y "z" como "s" (ej: "casa" → "casa", no "caza")
- Énfasis en la entonación argentina característica (más marcada en preguntas)
- Usa expresiones argentinas: "dale", "bueno", "mirá", "che"

EJEMPLOS DE PRONUNCIACIÓN:
- "¿Qué pensás?" (no "¿Qué piensas?")
- "Shamame" (no "Llamame")
- "Sho soy" (no "Yo soy")
- "Che, ¿viste el partido?" (no "¿Viste el partido?")
`;
```

**Ventajas:**
- ✅ Implementación inmediata
- ✅ Sin costos adicionales
- ✅ Sin cambios arquitectónicos

**Desventajas:**
- ⚠️ Depende de la calidad del modelo para interpretar el acento

---

## 🎯 Recomendación

### Para Implementación Inmediata: **Opción 3** (Mejorar System Instruction)

**Razones:**
1. No requiere cambios arquitectónicos
2. Implementación rápida (solo modificar prompt)
3. Sin costos adicionales
4. Mantiene la infraestructura actual

**Pasos:**
1. Mejorar `ANDRES_CANTOR_SYSTEM_PROMPT` en `data/prompts.ts`
2. Añadir instrucciones específicas de acento argentino
3. Probar con diferentes voces (`Charon`, `Fenrir`, `Puck`)
4. Ajustar según resultados

### Para Solución Definitiva: **Opción 2** (Google Cloud TTS)

**Razones:**
1. Acento argentino auténtico y garantizado
2. Voz nativa de Google Cloud
3. Control total sobre la calidad

**Consideraciones:**
- Requiere planificación de arquitectura
- Requiere API key adicional
- Requiere backend proxy
- Costos adicionales

---

## 📝 Implementación Recomendada (Opción 3)

### Paso 1: Mejorar System Prompt

**Archivo:** `data/prompts.ts`

```typescript
export const ANDRES_CANTOR_SYSTEM_PROMPT = `
Eres Andrés Cántor, el legendario relator de fútbol argentino.

PERSONALIDAD:
- Apasionado, energético, knowledgeable sobre fútbol
- Estilo de narración característico de relato argentino

ACENTO Y PRONUNCIACIÓN (CRÍTICO):
- Habla EXCLUSIVAMENTE con acento argentino rioplatense auténtico
- Usa "vos" en lugar de "tú" en todas las conversaciones
- Pronuncia "ll" y "y" como "sh" (ej: "llamar" → "shamar", "yo" → "sho")
- Usa modismos argentinos naturalmente: "che", "boludo", "posta", "re", "grosso", "dale"
- Pronuncia "c" y "z" como "s" (ej: "casa" → "casa", no "caza")
- Énfasis en la entonación argentina característica
- Usa expresiones argentinas: "dale", "bueno", "mirá", "che", "viste"

EJEMPLOS DE USO:
- "¿Vos qué pensás del partido?" (no "¿Qué piensas?")
- "Shamame cuando quieras" (no "Llamame")
- "Sho soy Andrés Cántor" (no "Yo soy")
- "Che, ¿viste el gol?" (no "¿Viste el gol?")
- "Dale, contame más" (no "Cuéntame más")
`;
```

### Paso 2: Probar Diferentes Voces

**Archivo:** `services/voiceService.ts` (línea 1510)

```typescript
// Probar estas voces masculinas:
voiceName: 'Charon'  // Actual (profunda)
voiceName: 'Fenrir'  // Alternativa
voiceName: 'Puck'    // Neutra (menos recomendada)
```

### Paso 3: Ajustar Según Resultados

- Si el acento no es suficientemente marcado → Mejorar más el prompt
- Si la voz no suena bien → Probar `Fenrir` en lugar de `Charon`
- Si necesitas más control → Considerar Opción 2 (Google Cloud TTS)

---

## 🔗 Referencias

- [Gemini Live API Documentation](https://ai.google.dev/api/multimodal-live)
- [Google Cloud Text-to-Speech Voices](https://cloud.google.com/text-to-speech/docs/list-voices-and-types)
- [Google Cloud TTS es-AR Voices](https://cloud.google.com/text-to-speech/docs/list-voices-and-types?hl=es-419)

---

## ✅ Checklist de Implementación

- [ ] Mejorar `ANDRES_CANTOR_SYSTEM_PROMPT` con instrucciones de acento argentino
- [ ] Probar con voz `Charon` (actual)
- [ ] Probar con voz `Fenrir` (alternativa)
- [ ] Ajustar prompt según resultados
- [ ] Documentar resultados en este archivo
- [ ] Si no es suficiente, considerar Opción 2 (Google Cloud TTS)

---

**Última actualización:** 2025-12-01
**Autor:** Investigación para voz argentina en Google Native

