# AI Agent Compatibility Matrix - VThink 1.0

> **Qué archivos lee cada herramienta de IA**

## 📋 Matriz de Compatibilidad

| Herramienta | Archivo | ¿Lo lee? | Notas |
|-------------|---------|----------|-------|
| **Cursor** | `.cursorrules` | ✅ Confirmado | Raíz del proyecto |
| **Cursor** | `AGENTS.md` | ⚠️ Via rules | Debe referenciarse en .cursorrules |
| **Claude Code** | `AGENTS.md` | ✅ Confirmado | [agents.md standard](https://agents.md) |
| **Claude Code** | `CLAUDE.md` | ✅ Confirmado | Anthropic standard |
| **OpenAI Codex** | `CODEX.md` | ⚠️ No confirmado | Creado por consistencia |
| **OpenAI Codex** | `.rules` | ✅ Confirmado | En `~/.codex/rules/` (global) |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ Confirmado | GitHub standard |
| **Windsurf** | `.windsurfrules` | ✅ Confirmado | Codeium standard |

## 🔧 Archivos Recomendados por Proyecto

Para máxima compatibilidad, un proyecto VibeThink debe tener:

```
project-root/
├── .cursorrules              # Cursor IDE
├── AGENTS.md                 # Claude Code + Standard
├── CLAUDE.md                 # Claude Code (opcional, puede ser symlink)
├── CODEX.md                  # OpenAI Codex (por consistencia)
├── .windsurfrules            # Windsurf (opcional)
└── .github/
    └── copilot-instructions.md  # GitHub Copilot
```

## 🎯 Estrategia de Herencia

### Nivel 1: Dev-Kit (Genérico)
```
_vibethink-dev-kit/knowledge/ai-agents/
├── AGENTS_UNIVERSAL.md                  # Autoridad única (reglas universales)
├── CANON-CROSS-AGENT-CONTEXT-LAYERING.md # Canon de layering (companion)
├── CLAUDE.md                            # Adapter Claude (puntero)
├── CODEX.md                             # Adapter Codex (puntero)
└── AI_AGENT_COMPATIBILITY.md            # Este archivo
```

### Nivel 2: Proyecto (Específico)
```
project-root/
├── .cursorrules              # Hereda + Customiza
├── AGENTS.md                 # Hereda + Quick Operations
└── [otros archivos según necesidad]
```

## 📝 Contenido Mínimo por Archivo

### `.cursorrules` (Cursor)
```xml
<mandatory_first_actions>
- List scripts/ directory
- Read AGENTS.md
- Report available commands
</mandatory_first_actions>

<project_rules>
- Quick Operations table
- Tech stack
- Prohibitions
</project_rules>
```

### `AGENTS.md` (Claude Code + Standard)
```markdown
## 🔥 LEVEL 1: CRITICAL
- Quick Operations table
- Project mission
- Tech stack
- Prohibitions

## 📋 LEVEL 2: WORKFLOW
- Development workflow
- Pre-commit checklist

## 📚 LEVEL 3: REFERENCE
- Directory structure
- Documentation map
```

### `CLAUDE.md` (Claude Code)
```markdown
# Project Instructions
- Inherit from AGENTS.md
- Claude-specific behaviors
```

### `CODEX.md` (OpenAI Codex)
```markdown
# Codex Instructions
- Inherit from AGENTS.md
- Codex-specific behaviors
```

### `.github/copilot-instructions.md` (GitHub Copilot)
```markdown
# Copilot Instructions
- Project context
- Coding standards
```

## ⚠️ Limitaciones Conocidas

1. **Leer ≠ Ejecutar**: Los agentes leen los archivos pero no "ejecutan" las instrucciones automáticamente
2. **Prioridad variable**: Cada herramienta prioriza diferente las instrucciones
3. **Contexto limitado**: Archivos muy largos pueden ser truncados
4. **Sin garantías**: No hay enforcement real, solo sugerencias fuertes

## 🛡️ Maximizar Cumplimiento

1. **Redundancia**: Poner reglas críticas en múltiples archivos
2. **Brevedad**: Mantener instrucciones críticas al inicio
3. **Tablas**: Usar formato tabular para comandos (fácil de parsear)
4. **User Rules**: Configurar reglas a nivel de usuario en cada IDE

### Cursor User Rules (Settings → Rules for AI)
```
BEFORE any task:
1. List scripts/ directory
2. Read AGENTS.md
3. Report available commands
NEVER start coding without checking project scripts.
```

---

**Last Updated:** 2025-12-16
**Maintained by:** VibeThink Dev-Kit










