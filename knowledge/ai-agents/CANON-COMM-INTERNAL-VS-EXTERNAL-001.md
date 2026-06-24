# CANON-COMM-INTERNAL-VS-EXTERNAL-001 — el eje interno/externo de la comunicación de agentes

> **Status:** DRAFT (pending Principal Architect seal)
> **Layer:** agnostic spine — el PRINCIPIO y los gates son L1; el repo consumidor liga los vehículos concretos en L3.
> **Family:** comunicación cross-agente. Compañeros: el canon del comms lane interno (el vehículo del lado interno) y la disciplina de adopción/cara-afuera (la del lado externo).

---

## §1 — Principio

Toda comunicación que un agente emite cae en **uno de dos lados**, y el lado determina el **gate** que aplica. Nombrar el eje convierte *"¿dónde va esto?"* en una decisión de **una palabra**.

| | **INTERNO** | **EXTERNO** |
|---|---|---|
| **Audiencia** | el equipo / la org, dentro de nuestros propios repos | afuera: repos de terceros, registros públicos, personas externas |
| **Vehículo** | el **comms lane interno** (+ inbox) | issues/PRs en repos ajenos, mensajes a externos, cualquier cosa cara-afuera |
| **Gate** | **LIGERO**: create-only, sin secretos, commit+push; no requiere aprobación especial (es coordinación) | **PESADO**: **OK explícito del owner humano** + **verificar/reproducir** antes + atribución consciente |
| **Reversibilidad** | **alta** — vive en git, lo controla el equipo | **baja** — público e indexado; "borrar" no lo deshace |

## §2 — La regla de ruteo (una línea)

**¿Es para adentro o para afuera?** → INTERNO = hacelo (comms lane). → EXTERNO = **OK del owner + verificá primero**.

## §3 — Por qué existe (el agujero que cierra)

Sin el eje nombrado, un agente puede tratar un comm **externo** (público, indexado, irreversible) con la **ligereza** de uno interno: emitir cara-afuera sin verificar ni pedir OK. **Caso vivido:** un agente abrió issues públicos en el repo de un tercero que resultaron **error propio** (no bugs) — hubo que cerrarlos con disculpa. El eje + el gate pesado del lado externo previenen esa clase de error.

## §4 — El gate externo (mínimo)

Antes de emitir un comm **externo** (publicar cara-afuera):
1. **Asumí error propio primero** — leé el `--help`/README/mensaje del propio target (muchas veces "el bug" es RTFM).
2. **Reproducí en limpio.**
3. **OK explícito del owner humano** + atribución consciente (de quién sale, cómo se encontró).

El comm **interno** NO tiene este gate — es coordinación, vive en git, reversible. Su única disciplina es la del comms lane (sin secretos, create-only, commit+push).

## §5 — Binding (L3)

El repo consumidor nombra los vehículos concretos: la ruta de su comms lane interno, quién aprueba un comm externo, y su checklist de verificación. Un **setting de notificación** (p. ej. `notify: internal | external`) es la **aplicación operativa** de este eje: `internal` = comm interno (default); `external` = pasa por el gate pesado.

## §6 — Approval

Canon approved/promoted **only by the Principal Architect**.

## Fire-test

No nombra producto, vendor ni persona. Los vehículos concretos son L3.
