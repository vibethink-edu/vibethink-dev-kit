# Engram — Findings para upstream (colaborar con el autor)

**Upstream:** [Gentleman-Programming/engram](https://github.com/Gentleman-Programming/engram) (Alan Buscaglia) · MIT · pin `1.17.0`
**Propósito:** log dedicado de hallazgos **dignos de compartir con el autor** (bugs, fricciones, mejoras). Buena ciudadanía: usamos su tool MIT → le devolvemos feedback constructivo. Alimentado por el **review semanal** (`scripts/engram-weekly-review.sh`).
**Cómo se usa:** se acumulan acá como DRAFT; cuando Marcelo da OK, se abren como **issues/PRs** en su repo (acción outward-facing → no se filean sin su luz). Estado por finding: `DRAFT` → `SENT (#issue)` → `RESUELTO`/`WITHDRAWN`.

> ## 🛑 LECCIÓN (2026-06-21) — verificar a fondo ANTES de filear upstream
> Filamos **#528 y #529** demasiado rápido y resultaron **error nuestro** (no bugs) — hubo que cerrarlos con disculpa al autor. Filear en el repo público de otra persona es outward-facing y queda indexado.
> **Regla:** antes de marcar algo `SENT`, (1) leer el mensaje/`--help`/README del propio tool (F-02 te decía "set GH_TOKEN" y lo arreglaba), (2) asumir **error propio primero**, (3) reproducir en limpio, (4) solo entonces, con OK de Marcelo. **Default: NO filear; convertir en nota operativa nuestra.** El entusiasmo de "colaborar" no justifica ruido en el repo ajeno.

---

## F-01 — `setup <agent> --help` EJECUTA el setup en vez de mostrar ayuda · `WITHDRAWN` (#529 cerrado) · NO era bug

> **Retirado 2026-06-21:** parsing-laxo de flags, no un bug; le agregamos `--help` a un comando documentado y procedió. Filado a la ligera. Lección arriba.

**Qué:** `engram setup codex --help` **corrió la instalación** (`✓ Installed codex plugin (3 files)`) en vez de imprimir ayuda.
**Repro:** `engram setup codex --help` → instala, no muestra help.
**Impacto:** un usuario que pide ayuda termina ejecutando un cambio de config no intencionado.
**Sugerencia:** reconocer `--help`/`-h` en subcomandos (`setup`, etc.) y cortar antes de ejecutar; o al menos un `--dry-run`.

## F-02 — Update-check en CADA invocación: ruidoso + rate-limited · `WITHDRAWN` (#528 cerrado) · NO era bug

> **Retirado 2026-06-21 — ERROR NUESTRO:** el 403 aparece solo porque no teníamos `GH_TOKEN`/`GITHUB_TOKEN` (¡el mensaje lo decía!). **Verificado:** `GH_TOKEN="$(gh auth token)" engram stats` → el 403 desaparece. Working-as-documented. **Nota operativa nuestra:** exportar `GH_TOKEN` en el entorno (o en `engram-weekly-review.sh`) y listo.

**Qué:** casi todo comando imprime `Could not check for updates: GitHub API returned 403 Forbidden. Set GH_TOKEN...`.
**Repro:** `engram stats` (o cualquiera) sin `GH_TOKEN` → la línea 403 en cada corrida.
**Impacto:** ruido constante en stdout/stderr (rompe parsing de scripts), llamada de red por invocación, y choca con rate-limit anónimo de GitHub.
**Sugerencia:** (a) cachear el check (1×/día), (b) opt-out por env (`ENGRAM_NO_UPDATE_CHECK=1`), (c) **no** imprimir nada salvo que haya versión nueva real; el fallo del check nunca debería ser visible en operación normal.

## F-03 — `session_project_directory_mismatch` avisa aunque el alias sea intencional · `DRAFT (NO filear aún)` · probablemente working-as-intended

> **Re-verificar antes de cualquier cosa (lección F-01/F-02):** la propia salida de `doctor` dice *"use explicit --project/MCP overrides until project naming is consolidated"* → el warning **es guía intencional**, no un flaw. Probablemente NO es finding upstream sino comportamiento correcto que nosotros disparamos. A lo sumo un enhancement opcional, y solo tras confirmar con uso real. Default: nota operativa nuestra, no issue.

**Qué:** al usar deliberadamente un alias corto (`--project <alias>`) distinto del nombre inferido por git-remote (`<repo-name>`), `engram doctor` marca un **warning permanente**.
**Repro:** guardar con `--project <alias>` en un repo cuyo remote infiere otro nombre → `doctor` → warning eterno.
**Impacto:** no se distingue "deriva accidental" (lo que el check quiere cazar) de "alias declarado a propósito" → el warning pierde valor (cry-wolf).
**Sugerencia:** permitir **declarar el proyecto canónico por directorio** (un `.engram-project` o entrada de config / alias-map). Si el alias está declarado, no es drift → no warning. Así el check sigue cazando deriva real y respeta el override intencional (que la propia salida de `doctor` recomienda).

## F-04 — FTS literal: sin cross-idioma / stemming · `DRAFT` · feature (baja prioridad)

**Qué:** la búsqueda (SQLite FTS5) es literal: query EN no halla contenido ES; `recommendation` ≠ `recommend`.
**Impacto:** recall débil para equipos bilingües / memoria multi-idioma.
**Nota:** es inherente a FTS5 sin configuración; no es bug. **Sugerencia (opcional):** FTS con `unicode61 remove_diacritics` + permitir configurar tokenizer/idioma, o un modo "expandir variantes". Baja prioridad; lo anotamos para usuarios multilingües.

---

*Verificados en `engram 1.17.0`, Windows, modo CLI + MCP (Codex). Si un finding ya está resuelto en una versión nueva durante el review semanal, marcarlo `RESUELTO` con la versión.*
