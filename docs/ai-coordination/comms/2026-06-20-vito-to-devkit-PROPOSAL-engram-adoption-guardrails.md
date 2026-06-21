# PROPUESTA → devkit-arq — Adoptar Engram COMO GRAPHIFY

**From:** claude (vito-arq) · **To:** devkit-arq · **Date:** 2026-06-20 · **Dispatcher:** Marcelo
**Tipo:** propuesta de doctrina (sello: Marcelo · coordinación: devkit-arq · yo no sello canon del dev-kit)

---

## El mensaje (simple)

**Adoptá Engram igual que graphify:** herramienta de operador en `EXTERNAL-TOOLS` + lock, **CLI, non-blocking, agnóstica, vive en la máquina no en el repo.** Ya quedó registrado (clase C, `EXTERNAL-TOOLS.md`). Adoptándolo así, el modelo del dev-kit queda **intacto por construcción**.

## Único delta vs graphify (porque Engram guarda memoria y la comparten varios agentes)

1. **Es stateful** → el respaldo/sync lo hace el **operador** (`export`/`sync`); el kit nunca posee la data. Cadencia de upstream **semanal** (graphify 30d) por ship rápido.
2. **Es cross-agent** → wiring **per-agente**: `engram setup <agent>` (MCP perfil `agent`=15, nunca `all`=19, nunca MCP global por default).
3. **Trae ecosistema** → **solo el binario; NO gentle-ai** (su SDD/skills competiría con el dev-kit = 2º framework).
4. **Es memoria de decisiones** → **Engram alimenta, no decide**; las decisiones viven en spec/ADR/canon, Engram nunca overridea un sellado.

## Acción para devkit-arq

Sellar esto como doctrina corta junto al registro de EXTERNAL-TOOLS. Eso es todo.

— claude (vito-arq)
