# 🛡️ REGLAS DE CALIDAD - vibethink-templates

**Versión:** 1.0.0  
**Propósito:** Evitar contaminar templates con malas prácticas

---

## 🚨 REGLAS CRÍTICAS (NUNCA ROMPER)

### Regla 1: **Zero Hardcoded Paths**

**❌ PROHIBIDO:**
```javascript
const PROJECT_PATH = "C:\\IA Marcelo Labs\\mi-proyecto";
const API_URL = "http://localhost:3001";
```

**✅ OBLIGATORIO:**
```javascript
const PROJECT_PATH = process.cwd();
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';
```

**Validación Automática:**
```powershell
# tools/validate-template.ps1
function Test-NoHardcodedPaths {
    $files = Get-ChildItem -Recurse -Include *.ts,*.js,*.tsx,*.jsx
    foreach ($file in $files) {
        $content = Get-Content $file -Raw
        if ($content -match 'C:\\\\IA Marcelo Labs') {
            throw "❌ HARDCODED PATH in $file"
        }
        if ($content -match 'http://localhost:\d+' -and $content -notmatch 'process\.env') {
            throw "❌ HARDCODED URL in $file"
        }
    }
}
```

---

### Regla 2: **Zero Secrets in Code**

**❌ PROHIBIDO:**
```javascript
const GEMINI_API_KEY = "AIzaSyC...";
const ELEVENLABS_KEY = "sk_...";
```

**✅ OBLIGATORIO:**
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
```

**Validación Automática:**
```powershell
function Test-NoSecretsInCode {
    $files = Get-ChildItem -Recurse -Include *.ts,*.js,*.tsx,*.jsx
    foreach ($file in $files) {
        $content = Get-Content $file -Raw
        # Detectar API keys
        if ($content -match 'AIzaSy[A-Za-z0-9_-]{33}') {
            throw "❌ GOOGLE API KEY EXPOSED in $file"
        }
        if ($content -match 'sk_[a-f0-9]{32}') {
            throw "❌ ELEVENLABS KEY EXPOSED in $file"
        }
        if ($content -match '(api[_-]?key|secret|password)\s*=\s*["\'][^"\']{10,}["\']') {
            throw "❌ POTENTIAL SECRET in $file"
        }
    }
}
```

---

### Regla 3: **Zero Dependencies Sin Justificación**

**❌ PROHIBIDO:**
```json
{
  "dependencies": {
    "lodash": "^4.17.21",        // ¿Para qué?
    "moment": "^2.29.4",          // Usa date-fns
    "jquery": "^3.6.0"            // ¿En React?
  }
}
```

**✅ OBLIGATORIO:**
```json
{
  "dependencies": {
    // SOLO dependencias justificadas
    "react": "^19.2.0",           // Framework core
    "date-fns": "^4.1.0"          // Mejor que moment (tree-shakeable)
  }
}
```

**Validación Automática:**
```powershell
function Test-DependencyJustification {
    $packageJson = Get-Content package.json | ConvertFrom-Json
    
    # Lista negra de dependencias
    $blacklist = @('moment', 'jquery', 'underscore')
    
    foreach ($dep in $packageJson.dependencies.PSObject.Properties) {
        if ($blacklist -contains $dep.Name) {
            throw "❌ BLACKLISTED DEPENDENCY: $($dep.Name)"
        }
    }
    
    # Verificar que hay .dependency-justification.md
    if (-not (Test-Path '.dependency-justification.md')) {
        throw "❌ MISSING .dependency-justification.md"
    }
}
```

**Archivo Obligatorio: `.dependency-justification.md`**
```markdown
# Justificación de Dependencias

## @google/genai (^1.29.0)
**Por qué:** SDK oficial de Google para Gemini API
**Alternativas consideradas:** Ninguna (SDK oficial)
**Tamaño:** ~50KB
**Última revisión:** 2025-12-12

## react (^19.2.0)
**Por qué:** Framework core del proyecto
**Alternativas consideradas:** Vue, Svelte (React elegido por ecosistema)
**Tamaño:** ~130KB
**Última revisión:** 2025-12-12
```

---

### Regla 4: **Zero Código Sin Tests**

**❌ PROHIBIDO:**
```javascript
// Función crítica sin tests
export function processAudioBuffer(buffer: ArrayBuffer) {
    // Lógica compleja sin tests
}
```

**✅ OBLIGATORIO:**
```javascript
// Función crítica CON tests
export function processAudioBuffer(buffer: ArrayBuffer) {
    // Lógica compleja
}

// processAudioBuffer.test.ts
describe('processAudioBuffer', () => {
    it('should process valid buffer', () => {
        // Test
    });
});
```

**Validación Automática:**
```powershell
function Test-CriticalFunctionsHaveTests {
    # Funciones críticas que DEBEN tener tests
    $criticalPatterns = @(
        'processAudio',
        'handlePayment',
        'validateUser',
        'encryptData'
    )
    
    foreach ($pattern in $criticalPatterns) {
        $codeFiles = Get-ChildItem -Recurse -Include *.ts,*.tsx | 
                     Select-String -Pattern "function $pattern"
        
        foreach ($file in $codeFiles) {
            $testFile = $file.Path -replace '\.tsx?$', '.test.ts'
            if (-not (Test-Path $testFile)) {
                throw "❌ MISSING TEST for critical function in $($file.Path)"
            }
        }
    }
}
```

---

### Regla 5: **Zero Código Duplicado Entre Templates**

**❌ PROHIBIDO:**
```
templates/voice-agent-base/src/utils/formatDate.ts
templates/payloadcms-portal/src/utils/formatDate.ts  # DUPLICADO!
```

**✅ OBLIGATORIO:**
```
shared/utils/formatDate.ts  # Una sola fuente de verdad
templates/voice-agent-base/package.json:
{
  "dependencies": {
    "@vibethink/shared-utils": "^1.0.0"  # Importar desde shared
  }
}
```

**Validación Automática:**
```powershell
function Test-NoDuplicateCode {
    $allFiles = Get-ChildItem templates -Recurse -Include *.ts,*.tsx,*.js,*.jsx
    $hashes = @{}
    
    foreach ($file in $allFiles) {
        $content = Get-Content $file -Raw
        $hash = Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($content)))
        
        if ($hashes.ContainsKey($hash.Hash)) {
            throw "❌ DUPLICATE CODE: $file is identical to $($hashes[$hash.Hash])"
        }
        $hashes[$hash.Hash] = $file.FullName
    }
}
```

---

### Regla 6: **Zero Comentarios Obsoletos**

**❌ PROHIBIDO:**
```javascript
// TODO: Fix this later
// HACK: Temporary solution
// @deprecated Use newFunction instead
function oldFunction() { ... }  // Pero sigue en uso!
```

**✅ OBLIGATORIO:**
```javascript
// Comentarios actualizados o código eliminado
function currentFunction() { ... }
```

**Validación Automática:**
```powershell
function Test-NoObsoleteComments {
    $files = Get-ChildItem -Recurse -Include *.ts,*.js,*.tsx,*.jsx
    foreach ($file in $files) {
        $content = Get-Content $file
        $lineNum = 0
        foreach ($line in $content) {
            $lineNum++
            if ($line -match '//\s*(TODO|FIXME|HACK|XXX)') {
                throw "❌ OBSOLETE COMMENT in $file:$lineNum - $line"
            }
            if ($line -match '@deprecated' -and $lineNum -lt ($content.Count - 5)) {
                # Si hay @deprecated, la función debe estar eliminada en 5 líneas
                $nextLines = $content[$lineNum..($lineNum+5)] -join "`n"
                if ($nextLines -match 'function|const|export') {
                    throw "❌ DEPRECATED CODE STILL IN USE in $file:$lineNum"
                }
            }
        }
    }
}
```

---

### Regla 7: **Zero Configuración Sin Documentación**

**❌ PROHIBIDO:**
```javascript
// vite.config.ts
export default {
    server: {
        port: 3005,  // ¿Por qué 3005?
        proxy: {
            '/api': 'http://localhost:3001'  // ¿Por qué?
        }
    }
}
```

**✅ OBLIGATORIO:**
```javascript
// vite.config.ts
export default {
    server: {
        // Puerto 3005: Evita conflicto con otros proyectos (3000-3004)
        // Ver: docs/PORT_CONVENTIONS.md
        port: 3005,
        
        proxy: {
            // Proxy a API Gateway en puerto 3001
            // Ver: docs/ARCHITECTURE.md#api-gateway
            '/api': 'http://localhost:3001'
        }
    }
}
```

**Archivo Obligatorio: `docs/CONFIGURATION.md`**
```markdown
# Configuración del Proyecto

## Puertos

- **3005:** Frontend (Vite dev server)
- **3001:** API Gateway (Express)

**Razón:** Evitar conflictos con otros proyectos VibeThink.

## Proxy Configuration

El frontend hace proxy de `/api/*` al API Gateway.

**Razón:** Evitar CORS en desarrollo.
```

---

### Regla 8: **Zero Breaking Changes Sin Migración**

**❌ PROHIBIDO:**
```json
// v1.0.0
{
  "voiceConfig": { "provider": "elevenlabs" }
}

// v2.0.0 (BREAKING!)
{
  "voice": { "api": "elevenlabs" }  // Cambió estructura sin guía
}
```

**✅ OBLIGATORIO:**
```markdown
# MIGRATION_v1_to_v2.md

## Breaking Changes

### voiceConfig → voice

**Before (v1.0.0):**
\`\`\`json
{ "voiceConfig": { "provider": "elevenlabs" } }
\`\`\`

**After (v2.0.0):**
\`\`\`json
{ "voice": { "api": "elevenlabs" } }
\`\`\`

**Migration Script:**
\`\`\`powershell
.\tools\migrate-v1-to-v2.ps1
\`\`\`
```

---

## 🔒 PROCESO DE VALIDACIÓN OBLIGATORIO

### Antes de Agregar Código a Templates:

```powershell
# 1. Validar calidad
.\tools\validate-template.ps1 -Template "voice-agent-base"

# Ejecuta:
# ✅ Test-NoHardcodedPaths
# ✅ Test-NoSecretsInCode
# ✅ Test-DependencyJustification
# ✅ Test-CriticalFunctionsHaveTests
# ✅ Test-NoDuplicateCode
# ✅ Test-NoObsoleteComments
# ✅ Test-ConfigurationDocumented

# 2. Si pasa, entonces commit
git add .
git commit -m "feat: add feature X"

# 3. CI/CD valida automáticamente
# (GitHub Actions ejecuta validate-template.ps1)
```

---

## 📋 CHECKLIST DE CALIDAD

Antes de agregar código de un proyecto a templates:

- [ ] ✅ No tiene paths hardcoded
- [ ] ✅ No tiene secrets expuestos
- [ ] ✅ Todas las dependencias están justificadas
- [ ] ✅ Funciones críticas tienen tests
- [ ] ✅ No hay código duplicado
- [ ] ✅ No hay comentarios obsoletos (TODO, HACK, etc.)
- [ ] ✅ Toda configuración está documentada
- [ ] ✅ Breaking changes tienen guía de migración
- [ ] ✅ Pasa validación automática
- [ ] ✅ Ejemplos funcionan

---

## 🚫 LISTA NEGRA DE CÓDIGO

### Nunca Copiar de Proyectos:

**1. Código con TODOs/FIXMEs**
```javascript
// ❌ NO COPIAR
// TODO: Fix this hack
function hackyFunction() { ... }
```

**2. Código experimental**
```javascript
// ❌ NO COPIAR
// EXPERIMENTAL: May not work
function experimentalFeature() { ... }
```

**3. Código específico de proyecto**
```javascript
// ❌ NO COPIAR
const ANDRES_CANTOR_VOICE_ID = "abc123";  // Específico de un proyecto
```

**4. Código sin tests**
```javascript
// ❌ NO COPIAR (si es crítico)
function criticalPaymentLogic() { ... }  // Sin tests
```

---

## ✅ LISTA BLANCA DE CÓDIGO

### Seguro para Copiar:

**1. Utilidades genéricas con tests**
```javascript
// ✅ COPIAR
export function formatDate(date: Date): string {
    return date.toISOString();
}
// + formatDate.test.ts existe
```

**2. Configuraciones documentadas**
```javascript
// ✅ COPIAR
// vite.config.ts con comentarios explicativos
```

**3. Componentes UI genéricos**
```javascript
// ✅ COPIAR
export function Button({ children, onClick }: ButtonProps) { ... }
// + Button.test.tsx existe
```

---

## 🔄 PROCESO DE REVISIÓN

### Antes de Merge a Templates:

1. **Code Review Automático:**
   ```powershell
   .\tools\validate-template.ps1 -Strict
   ```

2. **Code Review Manual:**
   - ¿El código es genérico (no específico de proyecto)?
   - ¿Está bien documentado?
   - ¿Tiene tests?
   - ¿Sigue las reglas de calidad?

3. **Aprobación:**
   - Solo si pasa TODAS las validaciones
   - Solo si tiene al menos 1 reviewer aprobación

---

**Última actualización:** 2025-12-12  
**Versión:** 1.0.0  
**Mantenido por:** VibeThink Team

**ESTAS REGLAS SON OBLIGATORIAS. NO HAY EXCEPCIONES.**
