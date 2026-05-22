# 🗂️ Organización: ¿Aislar o Mezclar el Kit?

**Versión:** 1.0.0
**Fecha:** 2025-12-12
**Pregunta:** ¿Mantener el kit en carpeta separada o mezclarlo con el proyecto?

---

## 🎯 OPCIONES DE ORGANIZACIÓN

### **Opción 1: Aislado (Carpeta Dedicada)** 🏛️

```
mi-proyecto/
├── src/                          ← Código del usuario
├── package.json                  ← Proyecto del usuario
├── README.md                     ← Proyecto del usuario
│
└── 📂 .vibethink/                ← Carpeta dedicada del kit
    ├── scripts/
    │   ├── setup-project.ps1
    │   ├── vibe-doctor.ps1
    │   └── ...
    ├── rules/
    │   └── conflicts.json
    ├── docs/
    │   ├── MULTI_IA_GUIDE.md
    │   └── ...
    ├── knowledge/
    │   └── methodologies/
    ├── AGENTS.md                 ← Generado aquí
    └── .vibethink.config.json    ← Generado aquí
```

**Ventajas:**
- ✅ Separación clara (kit vs proyecto)
- ✅ No "contamina" la raíz del proyecto
- ✅ Fácil de eliminar (solo borrar `.vibethink/`)
- ✅ Estructura más "limpia" para el usuario
- ✅ No interfiere con estructura del proyecto

**Desventajas:**
- ❌ Rutas más profundas (`.\vibethink\scripts\vibe-doctor.ps1`)
- ⚠️ El agente puede no ver los archivos tan fácilmente
- ⚠️ AGENTS.md no está en raíz (algunos IAs lo esperan ahí)
- ⚠️ Más difícil de descubrir por casualidad

---

### **Opción 2: Mezclado (Estructura Actual)** 🌐

```
mi-proyecto/
├── src/                          ← Código del usuario
├── package.json                  ← Proyecto del usuario
├── README.md                     ← Proyecto del usuario
│
├── ✨ AGENTS.md                  ← Generado en raíz
├── ✨ .vibethink.config.json     ← Generado en raíz
│
├── 📂 scripts/                   ← Mezclado (kit + usuario)
│   ├── setup-project.ps1         ← Del kit
│   ├── vibe-doctor.ps1           ← Del kit
│   └── deploy.sh                 ← Del usuario (puede agregar)
│
├── 📂 rules/                     ← Del kit
│   └── conflicts.json
│
├── 📂 docs/                      ← Mezclado (kit + usuario)
│   ├── MULTI_IA_GUIDE.md         ← Del kit
│   └── API.md                    ← Del usuario
│
└── 📂 knowledge/                 ← Del kit (opcional)
    └── methodologies/
```

**Ventajas:**
- ✅ Rutas simples (`.\scripts\vibe-doctor.ps1`)
- ✅ AGENTS.md en raíz (estándar para IAs)
- ✅ El agente ve todo el contexto junto
- ✅ Fácil de descubrir
- ✅ Estructura "natural" (como otros tools)
- ✅ Mejor para agentes de IA (contexto completo visible)

**Desventajas:**
- ⚠️ Mezcla archivos del kit con el proyecto
- ⚠️ Puede parecer que "contamina" el proyecto
- ⚠️ Más difícil separar qué es del kit y qué es del usuario

---

### **Opción 3: Híbrida (Configurable)** ⚖️

```
mi-proyecto/
├── src/
├── package.json
│
├── ✨ AGENTS.md                  ← Siempre en raíz (estándar IA)
├── ✨ .vibethink.config.json     ← En raíz o en .vibethink/
│
├── 📂 scripts/                   ← Del usuario (puede tener los del kit)
└── 📂 .vibethink/                ← Kit completo aquí
    ├── scripts/                  ← Scripts del kit
    ├── rules/
    ├── docs/
    └── knowledge/
```

**Configuración:**
```json
// .vibethink.config.json
{
  "organization": {
    "style": "isolated",  // o "mixed"
    "rootFiles": ["AGENTS.md", ".vibethink.config.json"],
    "kitFolder": ".vibethink"
  }
}
```

**Ventajas:**
- ✅ Flexible (elegir según proyecto)
- ✅ AGENTS.md siempre en raíz (estándar)
- ✅ Puedes elegir según tu preferencia

**Desventajas:**
- ⚠️ Más complejo de implementar
- ⚠️ Puede confundir si no está bien documentado

---

## 🤖 ANÁLISIS: ¿Qué es Mejor para Agentes de IA?

### **Cómo Funcionan los Agentes:**

1. **Cursor/Claude/ChatGPT:**
   - ✅ Leen archivos de la raíz primero
   - ✅ `AGENTS.md` en raíz es estándar (OpenAI standard)
   - ✅ Contexto completo visible = mejor comprensión
   - ✅ Buscan en toda la estructura

2. **Context Window:**
   - ✅ Archivos visibles juntos = mejor contexto
   - ⚠️ Archivos aislados = pueden no incluirse en contexto

3. **Estándares de la Industria:**
   - ✅ `.github/` para GitHub Actions (aislado)
   - ✅ `.vscode/` para VS Code (aislado)
   - ✅ `.cursor/` para Cursor (aislado)
   - ✅ `AGENTS.md` en raíz (estándar OpenAI)
   - ✅ `.cursorrules` en raíz (estándar Cursor)

---

## 📊 COMPARACIÓN DETALLADA

| Aspecto | Aislado (.vibethink/) | Mezclado (Actual) | Híbrida |
|---------|----------------------|-------------------|---------|
| **Separación clara** | ✅ Excelente | ❌ Mezclado | ⚠️ Parcial |
| **Rutas simples** | ❌ Más profundas | ✅ Simples | ⚠️ Depende |
| **AGENTS.md en raíz** | ❌ No | ✅ Sí | ✅ Sí |
| **Visibilidad para IA** | ⚠️ Puede no ver | ✅ Ve todo | ⚠️ Depende |
| **Contexto completo** | ⚠️ Menor | ✅ Completo | ⚠️ Depende |
| **Fácil de eliminar** | ✅ Sí | ❌ Manual | ✅ Sí |
| **Estándar industria** | ⚠️ Como .github/ | ✅ Como tools normales | ⚠️ Nuevo |
| **Mezcla con código** | ✅ No | ❌ Sí | ✅ Opcional |

---

## 🎯 RECOMENDACIÓN: Opción Híbrida (Mejor de Ambos Mundos)

### **Estructura Recomendada:**

```
mi-proyecto/
│
├── 📄 AGENTS.md                   ← SIEMPRE en raíz (estándar IA)
├── 📄 .vibethink.config.json      ← En raíz o en .vibethink/
├── 📄 README.md                   ← Proyecto del usuario
├── 📄 package.json                ← Proyecto del usuario
│
├── 📂 src/                        ← Código del usuario
│
├── 📂 .vibethink/                 ← Carpeta dedicada para el kit
│   ├── scripts/                   ← Scripts del kit
│   │   ├── setup-project.ps1
│   │   ├── vibe-doctor.ps1
│   │   └── ...
│   ├── rules/
│   │   └── conflicts.json
│   ├── docs/
│   │   ├── MULTI_IA_GUIDE.md
│   │   └── WHEN_TO_USE.md
│   ├── knowledge/
│   │   └── methodologies/
│   └── tools/
│
└── 📂 scripts/                    ← Opcional: symlinks o shortcuts
    └── vibe-doctor.ps1            ← Link a .vibethink/scripts/vibe-doctor.ps1
```

**Ventajas:**
- ✅ AGENTS.md en raíz (estándar)
- ✅ Kit aislado en `.vibethink/` (no contamina)
- ✅ Rutas simples con symlinks (opcional)
- ✅ El agente ve AGENTS.md + puede acceder a .vibethink/
- ✅ Fácil de eliminar (borrar `.vibethink/`)

---

## 💡 IMPLEMENTACIÓN: Opción Híbrida Mejorada

### **Estructura Final Recomendada:**

```
mi-proyecto/
│
├── 📄 AGENTS.md                   ← RAÍZ (referencia a .vibethink/)
├── 📄 .vibethink.config.json      ← RAÍZ (config del proyecto)
│
├── 📂 src/                        ← Tu código
│
├── 📂 .vibethink/                 ← Kit completo (aislado)
│   ├── scripts/
│   ├── rules/
│   ├── docs/
│   ├── knowledge/
│   └── tools/
│
└── 📄 .vibethink-ignore           ← Opcional: ignorar en git si quieres
```

**AGENTS.md (en raíz) contendría:**
```markdown
# Project Constitution

**Kit Location:** `.vibethink/`
**Config:** `.vibethink.config.json`

## Quick Access
- Health Check: `.\vibethink\scripts\vibe-doctor.ps1`
- Sync: `.\vibethink\scripts\sync-from-kit.ps1`

[Resto del contenido del AGENTS.md]
```

---

## 🔧 CONFIGURACIÓN EN setup-project.ps1

Agregar opción de organización:

```powershell
# En setup-project.ps1
$organizationStyle = Read-Host "¿Cómo organizar el kit? (1) Aislado .vibethink/ (2) Mezclado (3) Híbrida"

switch ($organizationStyle) {
    "1" {
        # Aislado: todo en .vibethink/
        $kitPath = ".vibethink"
        # Copiar todo a .vibethink/
        # AGENTS.md en raíz apunta a .vibethink/
    }
    "2" {
        # Mezclado: estructura actual
        # Copiar a raíz y carpetas comunes
    }
    "3" {
        # Híbrida: kit en .vibethink/, AGENTS.md en raíz
        $kitPath = ".vibethink"
        # Copiar kit a .vibethink/
        # Generar AGENTS.md en raíz
    }
}
```

---

## 📋 TABLA DE DECISIÓN

| Necesidad | Opción Recomendada | Razón |
|-----------|-------------------|-------|
| **Proyecto limpio** | Aislado (.vibethink/) | Separación clara |
| **Mejor para IAs** | Híbrida | AGENTS.md en raíz + kit aislado |
| **Simplicidad** | Mezclado | Rutas simples |
| **Estándares IA** | Híbrida | AGENTS.md en raíz (OpenAI standard) |
| **Fácil remover** | Aislado | Solo borrar .vibethink/ |

---

## 🎯 RECOMENDACIÓN FINAL

### **Opción Híbrida con `.vibethink/` (Recomendada)**

**Estructura:**
```
mi-proyecto/
├── AGENTS.md              ← Raíz (estándar IA)
├── .vibethink.config.json ← Raíz (config)
└── .vibethink/            ← Kit completo (aislado)
```

**Razones:**
1. ✅ **AGENTS.md en raíz** → Estándar OpenAI, agentes lo encuentran fácilmente
2. ✅ **Kit aislado** → No contamina el proyecto, fácil de eliminar
3. ✅ **Config en raíz** → Fácil de acceder y versionar
4. ✅ **Mejor contexto para IAs** → Ven AGENTS.md y pueden acceder a .vibethink/
5. ✅ **Estándar industria** → Similar a `.github/`, `.vscode/`, `.cursor/`

**AGENTS.md mencionaría:**
```markdown
# Project Constitution

**Kit ubicado en:** `.vibethink/`
**Scripts disponibles en:** `.vibethink/scripts/`
**Reglas en:** `.vibethink/rules/conflicts.json`

Para ejecutar comandos:
```powershell
.\vibethink\scripts\vibe-doctor.ps1
```
```

---

## 🚀 IMPLEMENTACIÓN PRÁCTICA

### **Script de Copia con Opción de Organización:**

```powershell
# setup-with-organization.ps1
param(
    [ValidateSet("isolated", "mixed", "hybrid")]
    [string]$Organization = "hybrid"
)

switch ($Organization) {
    "isolated" {
        # Todo en .vibethink/
        New-Item -ItemType Directory -Path ".vibethink" -Force
        Copy-Item "..\_vibethink-dev-kit\*" ".vibethink\" -Recurse
        # Generar AGENTS.md en raíz que referencia .vibethink/
    }
    "mixed" {
        # Estructura actual (mezclado)
        Copy-Item "..\_vibethink-dev-kit\*" . -Recurse
    }
    "hybrid" {
        # Kit en .vibethink/, AGENTS.md en raíz
        New-Item -ItemType Directory -Path ".vibethink" -Force
        Copy-Item "..\_vibethink-dev-kit\scripts" ".vibethink\" -Recurse
        Copy-Item "..\_vibethink-dev-kit\rules" ".vibethink\" -Recurse
        Copy-Item "..\_vibethink-dev-kit\docs" ".vibethink\" -Recurse
        # Generar AGENTS.md en raíz
        # Generar .vibethink.config.json en raíz
    }
}
```

---

## ✅ CONCLUSIÓN

**Recomendación:** **Opción Híbrida con `.vibethink/`**

- ✅ AGENTS.md en raíz (estándar)
- ✅ Kit aislado en `.vibethink/` (no contamina)
- ✅ Config en raíz (accesible)
- ✅ Mejor para agentes de IA
- ✅ Fácil de eliminar
- ✅ Estándar industria

**¿Debería implementar esta estructura?**

---

**Última actualización:** 2025-12-12


