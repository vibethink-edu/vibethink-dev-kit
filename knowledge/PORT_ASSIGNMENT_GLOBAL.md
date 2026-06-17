# Política Global de Puertos — VibeThink (binding L2 house)

> ⬆️ **El PRINCIPIO agnóstico vive ahora en `knowledge/methodology/CANON-PORT-ASSIGNMENT-001.md` (L1):**
> *la instancia declara sus puertos canónicamente; el kit exige QUE los declares, nunca CUÁLES;
> sin declaración canónica, el deploy se rehúsa (gate fail-closed `check-ports`).* **Este archivo
> es el binding L2 house de VibeThink** — únicamente los rangos/números concretos del ecosistema
> (ViTo / WorkBench / Campus). NO es agnóstico y el canon L1 no lo conoce. *(Reubicación física
> fuera del kit = decisión a/b de Marcelo; vive acá como L2 house hasta entonces.)*
>
> **Versión:** 4.0 — DRAFT, awaiting Marcelo canon approval (Rule #4)
> **Última actualización:** 2026-06-17
> **Propósito:** Fijar los **rangos concretos** que usan los sistemas VibeThink co-residentes.
> **Alcance:** binding L2 house. El **esquema y las reglas** (agnósticos) son del canon L1
> de arriba; **este doc aporta solo los números** del ecosistema. **v4.0** agrega el caso
> **co-residente** (varios sistemas en una misma workstation) → bandas cross-sistema deterministas y sin solape.

---

## 🎯 Principio

> **El kit define el sistema; cada repo registra los suyos.**

Esta política fija los **rangos** y las **reglas**. **Cada repo consumidor mantiene su
propio registro de puertos** como única fuente de verdad (p. ej. un `ports.json` en su
raíz) y asigna sus apps **dentro** de estos rangos. El kit **no** dicta qué app va en
qué puerto — eso es contenido de cada producto (level 3), no del supra-repo.

**Nunca** se hardcodea un puerto sin registrarlo primero en el registro del repo.

---

## 🖥️ Co-residencia en una workstation (v4.0 — supersede "cada repo dueño de su espacio" cuando aplica)

El principio "dos repos pueden usar el mismo número" (ver §"Cómo lo interpreta un repo
consumidor" punto 5) vale SÓLO cuando los sistemas corren **aislados**. En la workstation
de desarrollo VibeThink **varios sistemas co-corren a la vez** (Campus, WorkBench, ViTo y
sus DBs) → el espacio de puertos es **compartido a nivel de máquina** y las asignaciones
DEBEN ser deterministas y **no solaparse** entre sistemas. **Este artículo prevalece** sobre
el §"asignaciones concretas son tuyas" en el caso co-residente.

### Registro de bandas cross-sistema (machine-global, determinista)

| Sistema | HTTP | DB / sandbox local | Review (`prod+2000`) |
|---|---|---|---|
| **ViTo / orchestrator** | 3000–3099 | 54321–54329 | 50xx |
| **WorkBench** | 3100–3109 | 54330–54339 | 51xx |
| **Campus** | 3400–3409 | 55321–55329 (Supabase local) | 54xx |
| **dev-kit** | — sin runtime — | — | — |

Para los sistemas co-residentes, **este registro es la autoridad**: ningún sistema bindea
fuera de su banda. (El esquema genérico de abajo sigue describiendo los *tipos* de rango;
la asignación concreta por-sistema vive acá y en el `ports.json` de cada repo.)

### Regla: NINGÚN default compartido

Ningún sistema hereda el default de una herramienta que otro ya use — p. ej. **Vite 5173**
o **Postgres embebido 54329**. Cada servidor Vite / DB se **pinea explícitamente dentro de
la banda de SU sistema**. Heredar el default ciego es exactamente el choque que hizo que el
preview de Campus mostrara WorkBench (2026-06-16): ambos heredaban Vite :5173.

---

## 📋 Esquema de rangos (el estándar org)

| Rango | Propósito |
|-------|-----------|
| **3000–3049** | Aplicaciones principales (producción / canonical) |
| **3050–3099** | Referencias y demos externas |
| **3100–3399** | Testing y desarrollo temporal / ad-hoc |
| **4000–4999** | Documentación y servicios auxiliares (p. ej. Starlight 4321) |
| **5000–5999** | Review / Worktree / Branch lane (ver split más abajo) |
| **8000+** | Backends y servicios GPU (p. ej. Whisper WS) |
| **54321–54329** | Sandboxes locales de DB (p. ej. Supabase local) |

Cada proyecto **reclama un bloque** (típicamente de 10) dentro del rango que le
corresponde y lo documenta en su propio registro.

## 🔀 Regla de split Producción / Review (v2.0+)

| Rango | Propósito |
|-------|-----------|
| `< 5000` | **Producción / Canonical** — puertos estables del repo en `main` |
| `>= 5000` | **Review / Dev / Branch** — worktrees y branches de revisión |

- **Patrón:** `review_port = prod_port + 2000` cuando aplica (ej. prod 3005 → review 5005).
- **NUNCA** usar puertos `>= 5000` para la app canónica en `main`. Solo worktrees/branches.

## 🔒 Puertos SAGRADOS

Un repo puede marcar puertos canónicos como **SAGRADO / NEVER CHANGE** en su registro
(p. ej. el dashboard principal). Cambiarlos rompe enlaces, fixtures y bookmarks — el
registro del repo es quien los declara, y esta política solo establece que el concepto
existe.

---

## 🧭 Cómo lo interpreta un repo consumidor (cualquiera, no solo uno)

Cuando un repo hereda esta política — **sea cual sea** — la aplica así:

1. **Reclama tu bloque** dentro de los rangos de arriba (apps en `3000–3049`,
   referencias en `3050–3099`, etc.).
2. **Registra tus puertos en TU repo**, en una única fuente de verdad. El esquema
   recomendado es un `ports.json` en la raíz (ver el ejemplo vivo abajo): cada puerto
   con `app`, `name`, `status`, `package`, y `sacred: true` si es intocable.
3. **Aplica el split:** producción `< 5000`, review `>= 5000` (`prod + 2000`).
4. **No hardcodees** un puerto sin registrarlo; idealmente tu CI valida los scripts de
   `package.json` contra tu `ports.json`.
5. **Las asignaciones concretas son tuyas (level 3), no del kit.** Dos repos distintos
   pueden usar el mismo número para apps distintas — cada uno es dueño de su espacio de
   puertos; esta política solo garantiza que ambos hablan el mismo *esquema* (rangos +
   split), no que compartan asignaciones.

> **Ejemplo vivo:** el registro de VibeThink Orchestrator (ViTo) —
> `ports.json` con `"$schema": "VIBETHINK_PORT_REGISTRY_V2"` — es la implementación de
> referencia de esta política: declara su split rule, sus rangos y sus apps (Dashboard
> 3005 `sacred`, etc.). Otro repo haría su propio `ports.json` igual, con sus apps.

---

## 📝 Convenciones de nomenclatura

- **Variables de entorno:** `PORT_{PRODUCTO}` (p. ej. `PORT_DASHBOARD=3005`).
- **Scripts de referencia (en el repo consumidor):** `start-{nombre}-reference.ps1`,
  con el puerto en una variable `$PORT` al inicio. (Convención para proyectos; estos
  scripts viven en cada repo, no en el supra-repo.)

## ✅ Checklist — al crear un proyecto / agregar una referencia

- [ ] Reclamar un bloque dentro del rango correcto.
- [ ] Registrarlo en el `ports.json` (o equivalente) del repo.
- [ ] Aplicar el split prod/review.
- [ ] Marcar `sacred` los canónicos intocables.
- [ ] Verificar que no hay conflicto **dentro de tu repo**.

## 🛠️ Verificar puertos en uso (Windows)

```powershell
Get-NetTCPConnection -State Listen |
    Where-Object { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3100 } |
    Select-Object LocalPort, @{Name='Process';Expression={(Get-Process -Id $_.OwningProcess).ProcessName}}, State |
    Format-Table -AutoSize
```

---

## 🔗 Referencias

- **Methodology layer:** `knowledge/ai-agents/AGENTS_METHODOLOGY_VIBETHINK.md` §2 — cita esta política como capa org (level 2).
- **AI Agents:** `knowledge/ai-agents/AGENTS_UNIVERSAL.md` — el principio agnóstico ("los puertos vienen de un registro, nunca se adivinan").

---

**Mantenedor:** the dev-kit (supra-repo upstream).
**Cambios v4.0 (2026-06-16, DRAFT awaiting Marcelo):** agrega la sección **co-residencia**
— cuando varios sistemas corren en la misma workstation, las bandas son machine-global,
deterministas y sin solape (registro cross-sistema: ViTo 3000–3099 · WorkBench 3100–3109 ·
Campus 3400–3409). Regla "ningún default compartido" (Vite 5173 / PG embebido 54329). Esto
**supersede** el clause "dos repos pueden usar el mismo número" para sistemas co-residentes
(antes lo permitía; co-residir lo invalida). Disparador: el preview de Campus mostró WorkBench
por compartir Vite :5173.
**Cambios v3.0 (2026-05-23):** la política pasó de "mapa de puertos de ViTo" (level-3
duplicado de su `ports.json`) a **esquema + reglas agnósticos** (level 2). Las
asignaciones por-app de cada producto viven en el `ports.json` de ese repo, no acá.
Removidas las refs muertas al PortManager v1 y a scripts inexistentes.
