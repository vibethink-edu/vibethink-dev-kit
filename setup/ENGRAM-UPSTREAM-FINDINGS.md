# Engram — Findings para upstream (colaborar con el autor)

**Upstream:** [Gentleman-Programming/engram](https://github.com/Gentleman-Programming/engram) (Alan Buscaglia) · MIT · pin `1.17.0`
**Propósito:** log dedicado de hallazgos **dignos de compartir con el autor** (bugs, fricciones, mejoras). Buena ciudadanía: usamos su tool MIT → le devolvemos feedback constructivo. Alimentado por el **review semanal** (`scripts/engram-weekly-review.sh`).
**Cómo se usa:** se acumulan acá como DRAFT; cuando Marcelo da OK, se abren como **issues/PRs** en su repo (acción outward-facing → no se filean sin su luz). Estado por finding: `DRAFT` → `SENT (#issue)` → `RESUELTO`.

---

## F-01 — `setup <agent> --help` EJECUTA el setup en vez de mostrar ayuda · `DRAFT` · bug

**Qué:** `engram setup codex --help` **corrió la instalación** (`✓ Installed codex plugin (3 files)`) en vez de imprimir ayuda.
**Repro:** `engram setup codex --help` → instala, no muestra help.
**Impacto:** un usuario que pide ayuda termina ejecutando un cambio de config no intencionado.
**Sugerencia:** reconocer `--help`/`-h` en subcomandos (`setup`, etc.) y cortar antes de ejecutar; o al menos un `--dry-run`.

## F-02 — Update-check en CADA invocación: ruidoso + rate-limited · `DRAFT` · UX

**Qué:** casi todo comando imprime `Could not check for updates: GitHub API returned 403 Forbidden. Set GH_TOKEN...`.
**Repro:** `engram stats` (o cualquiera) sin `GH_TOKEN` → la línea 403 en cada corrida.
**Impacto:** ruido constante en stdout/stderr (rompe parsing de scripts), llamada de red por invocación, y choca con rate-limit anónimo de GitHub.
**Sugerencia:** (a) cachear el check (1×/día), (b) opt-out por env (`ENGRAM_NO_UPDATE_CHECK=1`), (c) **no** imprimir nada salvo que haya versión nueva real; el fallo del check nunca debería ser visible en operación normal.

## F-03 — `session_project_directory_mismatch` avisa aunque el alias sea intencional · `DRAFT` · mejora

**Qué:** al usar deliberadamente un alias corto (`--project vito`) distinto del nombre inferido por git-remote (`vibethink-orchestrator-main`), `engram doctor` marca un **warning permanente**.
**Repro:** guardar con `--project vito` en un repo cuyo remote infiere otro nombre → `doctor` → warning eterno.
**Impacto:** no se distingue "deriva accidental" (lo que el check quiere cazar) de "alias declarado a propósito" → el warning pierde valor (cry-wolf).
**Sugerencia:** permitir **declarar el proyecto canónico por directorio** (un `.engram-project` o entrada de config / alias-map). Si el alias está declarado, no es drift → no warning. Así el check sigue cazando deriva real y respeta el override intencional (que la propia salida de `doctor` recomienda).

## F-04 — FTS literal: sin cross-idioma / stemming · `DRAFT` · feature (baja prioridad)

**Qué:** la búsqueda (SQLite FTS5) es literal: query EN no halla contenido ES; `recommendation` ≠ `recommend`.
**Impacto:** recall débil para equipos bilingües / memoria multi-idioma.
**Nota:** es inherente a FTS5 sin configuración; no es bug. **Sugerencia (opcional):** FTS con `unicode61 remove_diacritics` + permitir configurar tokenizer/idioma, o un modo "expandir variantes". Baja prioridad; lo anotamos para usuarios multilingües.

---

*Verificados en `engram 1.17.0`, Windows, modo CLI + MCP (Codex). Si un finding ya está resuelto en una versión nueva durante el review semanal, marcarlo `RESUELTO` con la versión.*
