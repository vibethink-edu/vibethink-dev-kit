# 📦 vibethink-templates - Estructura REALISTA

**Versión:** 2.0.0 (Revisada)  
**Principio:** **Simple > Complejo**

---

## 🎯 Estructura Minimalista (Lo que REALMENTE Funciona)

```
vibethink-templates/
├── README.md                    # Overview + Quick Start
├── CHANGELOG.md                 # Cambios del PROYECTO COMPLETO
├── CONTRIBUTING.md              # Reglas de contribución
├── QUALITY_RULES.md             # Reglas de calidad (OBLIGATORIAS)
│
├── templates/
│   ├── voice-agent-base/
│   │   ├── README.md            # TODO en UN archivo
│   │   ├── package.json
│   │   ├── src/
│   │   ├── server/
│   │   └── tests/               # Tests = Ejemplos
│   │
│   ├── payloadcms-portal/
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src/
│   │   └── tests/
│   │
│   └── react-vite-express/
│       ├── README.md
│       ├── package.json
│       ├── src/
│       └── tests/
│
├── scripts/
│   ├── powershell/
│   │   ├── worktree-management/
│   │   ├── server-management/
│   │   └── git-automation/
│   └── bash/
│
├── configs/
│   ├── .cursorrules.template
│   ├── .gitignore.template
│   └── tsconfig.json.template
│
└── tools/
    ├── init-project.ps1
    ├── validate-template.ps1
    └── update-project.ps1
```

---

## 📋 Reglas de Simplicidad

### Regla 1: **Un README por Template (Máximo 200 líneas)**

```markdown
# voice-agent-base

## Quick Start (5 minutos)
\`\`\`powershell
npm install
npm run dev
\`\`\`

## Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_GEMINI_API_KEY | - | Google Gemini API key |

## Deployment
\`\`\`powershell
docker build -t my-agent .
docker run -p 3000:3000 my-agent
\`\`\`

## Troubleshooting
**Problem:** Audio cuts  
**Solution:** Check buffer size in config

## Stack
- React 19 + Vite 6 + TypeScript 5.8
- Express 4.21
- Gemini + ElevenLabs + Cartesia + Ultravox
```

**Si necesitas más de 200 líneas → el template es muy complejo.**

---

### Regla 2: **Tests = Ejemplos**

```typescript
// tests/integration/basic-usage.test.ts
describe('Basic Voice Agent', () => {
    it('should initialize and connect to Gemini', async () => {
        const agent = new VoiceAgent({
            apiKey: process.env.GEMINI_API_KEY,
            voice: 'Aoede'
        });
        
        await agent.connect();
        expect(agent.isConnected).toBe(true);
    });
});

// Este test ES el ejemplo básico
// Si pasa → el ejemplo funciona
// Si falla → el template está roto
```

**Beneficios:**
- ✅ Ejemplos siempre actualizados (si no, tests fallan)
- ✅ Ejemplos siempre funcionan (si no, tests fallan)
- ✅ No duplicación (tests + ejemplos separados)

---

### Regla 3: **Versionado Unificado**

```json
// package.json (root)
{
  "name": "vibethink-templates",
  "version": "1.0.0",  // TODO el proyecto
  "workspaces": [
    "templates/*"
  ]
}

// templates/voice-agent-base/package.json
{
  "name": "@vibethink/voice-agent-base",
  "version": "1.0.0",  // Mismo que root
  "dependencies": {
    "@vibethink/shared-scripts": "1.0.0"  // Mismo que root
  }
}
```

**Cuando actualizas:**
```powershell
# Actualiza TODO junto
npm version minor  # 1.0.0 → 1.1.0
# Actualiza root + todos los templates + scripts
```

---

### Regla 4: **Shared Code en Monorepo**

```
vibethink-templates/
├── packages/
│   ├── shared-utils/          # Código compartido
│   │   ├── src/
│   │   │   ├── formatDate.ts
│   │   │   └── validateEmail.ts
│   │   └── tests/
│   │
│   └── shared-types/          # Types compartidos
│       └── src/
│           └── index.ts
│
└── templates/
    ├── voice-agent-base/
    │   └── package.json:
    │       "dependencies": {
    │         "@vibethink/shared-utils": "workspace:*"
    │       }
    │
    └── payloadcms-portal/
        └── package.json:
            "dependencies": {
              "@vibethink/shared-utils": "workspace:*"
            }
```

**Beneficios:**
- ✅ Código compartido en UN lugar
- ✅ Actualización automática en todos los templates
- ✅ No duplicación

---

### Regla 5: **Validación Automática en CI/CD**

```yaml
# .github/workflows/validate.yml
name: Validate Templates

on: [push, pull_request]

jobs:
  validate:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Quality Rules
        run: |
          .\tools\validate-template.ps1 -All -Strict
      
      - name: Test All Templates
        run: |
          cd templates/voice-agent-base
          npm install
          npm test
          
          cd ../payloadcms-portal
          npm install
          npm test
      
      - name: Build All Templates
        run: |
          cd templates/voice-agent-base
          npm run build
          
          cd ../payloadcms-portal
          npm run build
```

**Si algo falla → no se puede hacer merge.**

---

## 🔒 Proceso de Agregar Código

### Antes de Copiar de un Proyecto:

```powershell
# 1. Extraer código
$code = Get-Content "C:\IA Marcelo Labs\mi-proyecto\src\utils\helper.ts"

# 2. Validar calidad
.\tools\validate-code.ps1 -Code $code

# Valida:
# ✅ No hardcoded paths
# ✅ No secrets
# ✅ No TODOs/FIXMEs
# ✅ Tiene tests
# ✅ Está documentado

# 3. Si pasa, agregar a shared-utils
Copy-Item "..." "packages/shared-utils/src/helper.ts"

# 4. Agregar tests
Copy-Item "..." "packages/shared-utils/tests/helper.test.ts"

# 5. Validar que tests pasan
cd packages/shared-utils
npm test

# 6. Si pasa, commit
git add .
git commit -m "feat(shared-utils): add helper function"
```

---

## 📊 Comparación: Propuesta Original vs Realista

| Aspecto | Propuesta Original | Propuesta Realista |
|---------|-------------------|-------------------|
| **Docs por template** | 10+ archivos | 1 README (max 200 líneas) |
| **Ejemplos** | Separados | Tests = Ejemplos |
| **Versionado** | Independiente | Unificado |
| **Código compartido** | Duplicado | Monorepo (packages/) |
| **Validación** | Manual | Automática (CI/CD) |
| **Mantenimiento** | Difícil | Fácil |
| **Complejidad** | Alta | Baja |

---

## ✅ Beneficios de la Propuesta Realista

1. **Menos archivos = Menos mantenimiento**
   - 1 README vs 10+ docs
   - Tests como ejemplos (no duplicación)

2. **Versionado unificado = Sin incompatibilidades**
   - Todo se actualiza junto
   - No hay "template v1.0 con scripts v2.0"

3. **Monorepo = Código compartido real**
   - `@vibethink/shared-utils` usado por todos
   - Actualización automática

4. **Validación automática = Calidad garantizada**
   - CI/CD valida TODO
   - No se puede hacer merge si falla

5. **Simple = Sostenible**
   - Fácil de mantener
   - Fácil de entender
   - Fácil de contribuir

---

## 🚀 Implementación

¿Quieres que implemente la **Propuesta Realista** en lugar de la original?

**Ventajas:**
- ✅ Más simple
- ✅ Más sostenible
- ✅ Más fácil de mantener
- ✅ Validación automática
- ✅ Código compartido real

**Desventajas:**
- ⚠️ Menos "documentación rica" (pero más realista)
- ⚠️ Menos "ejemplos separados" (pero tests son mejores ejemplos)

---

**Última actualización:** 2025-12-12  
**Versión:** 2.0.0 (Realista)
