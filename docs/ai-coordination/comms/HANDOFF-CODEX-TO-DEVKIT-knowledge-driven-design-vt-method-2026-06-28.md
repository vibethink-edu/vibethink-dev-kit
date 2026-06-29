---
from: codex-vito
to_agent: devkit-architect
repo: vibethink-dev-kit
ref_branch: codex/knowledge-driven-design-handoff
tldr: >
  Marcelo quiere elevar a VT-METHOD una disciplina Knowledge-Driven Design / Knowledge-Native
  Development: antes de especificar features complejas, los agentes deben entender negocio,
  producto, normas, vocabulario, decisiones, ejemplos vivos y preguntas abiertas. Graphify y
  Engram deben persistir/recuperar ese conocimiento de forma operativa; DevKit debe definir
  la metodologia, los artefactos, el contrato de Knowledge Memory Adapter y los gates. Este
  handoff deja la propuesta lista para diseñar canon + templates + gate sin meter conocimiento
  de producto en el supra-repo.
action: >
  Proponer PR DevKit con CANON-KNOWLEDGE-DRIVEN-DESIGN-001, templates de Knowledge Pack,
  check-knowledge-pack.mjs, binding en VT-METHOD antes de Specify, y contrato obligatorio
  de Knowledge Memory Adapter declarado por cada repo heredero. Para VibeThink, el binding
  recomendado/default debe ser Markdown versionado + Engram + Graphify, salvo override
  explicito. Incluir un modo
  "Knowledge Reconstruction Sprint": un agente recorre el proyecto completo, reconstruye
  el conocimiento de negocio/producto/normas, lo deja como candidato validable, y despues
  todos los agentes lo consumen como baseline.
---

# Handoff — Knowledge-Driven Design para VT-METHOD

## 0. Decision layer

Marcelo pidio redondear una nueva capa metodologica: que todos los agentes sepan, antes
de buscar o escribir specs de features:

- cual es el negocio,
- cual es el producto,
- cuales son las normas,
- que se busca realmente,
- que decisiones y ejemplos vivos ya existen.

La recomendacion es elevarlo a DevKit como **Knowledge-Native VT-METHOD**:

```text
Research / raw input
  -> Knowledge Candidate
  -> Knowledge Pack
  -> Strategy / Canon / ADR if needed
  -> Feature Specification
  -> Governed execution
  -> Lessons learned back into Knowledge
```

Graphify y Engram son motores de persistencia/recuperacion. VT-METHOD es la autoridad
metodologica. La regla no debe quedar como "documentacion bonita": si el agente no recupera
y cita el conocimiento aceptado, no puede iniciar trabajo product-shaping.

## 0.1 Marcelo clarification — reconstruction first

Marcelo aclaro que el punto mas poderoso no es solo documentar lo que aparezca de ahora
en adelante. El problema real es que muchos proyectos ya tienen conocimiento de negocio
partido en chats, specs, ADRs, findings, README, decisiones y codigo. Aunque todo exista
"de a pedacitos", no esta reconstruido como entendimiento comun.

DevKit deberia definir una rutina explicita:

```text
Knowledge Reconstruction Sprint
  -> agent scans whole project + declared sources
  -> extracts business/product/rules/vocabulary/scenarios/decisions
  -> builds a Candidate Knowledge Pack
  -> human/principal validates, corrects or rejects
  -> pack becomes Accepted Knowledge Baseline
  -> every agent must read/cite it for product-shaping work
```

Esto debe ser un artefacto auditable, no una respuesta en chat. La salida esperada no es
"el agente entendio"; es un pack versionado y validado que responda:

- que negocio estamos operando,
- que producto estamos construyendo,
- cual es el objetivo del producto,
- que reglas y normas no se pueden romper,
- que vocabulario y modelos mentales gobiernan el dominio,
- que casos vivos prueban la intencion,
- que preguntas siguen abiertas y quien las valida.

Graphify puede ayudar a reconstruir relaciones y comunidades de conocimiento. Engram puede
ayudar a recordar hallazgos/facts cross-session. Pero el sello metodologico debe ser:
**no hay conocimiento aceptado hasta que queda en un Knowledge Pack revisable y validado**.

## 0.2 Marcelo correction — persistence is not optional

Marcelo corrigio una lectura debil: no basta con decir que DevKit no depende de Graphify
o Engram. Si el conocimiento queda solo escrito y el agente no lo carga, el metodo falla.

Recomendacion ajustada:

```text
DevKit defines the Knowledge Memory Adapter contract.
VibeThink binds that contract to:
  - Markdown/ADR/Canon/Knowledge Pack as auditable source of truth,
  - Engram for cross-session recall and project facts,
  - Graphify for semantic graph, relationships and context navigation.
```

La neutralidad correcta no es "los motores son irrelevantes". Es:

- L1/L2 no hardcodean un binario como unica implementacion mundial.
- Cada repo heredero declara su adapter concreto.
- En proyectos VibeThink, Engram + Graphify son el default recomendado salvo override explicito.
- Un agente debe recuperar y citar el Accepted Knowledge Baseline antes de diseñar o ejecutar
  trabajo product-shaping.
- Si el adapter esta ausente/stale, el agente debe reportarlo y degradar a lectura directa del
  Markdown versionado; no puede fingir que "ya sabe".

Regla propuesta:

```text
Product-shaping work may not start until the agent has retrieved and cited the
Accepted Knowledge Baseline through the declared Knowledge Memory Adapter, or has
declared the adapter unavailable and read the auditable source files directly.
```

## 0.3 Identity language — VibeThink is knowledge-native and friendship-native

Busqueda local en DevKit/Workbench/Campus + memoria Engram + web quick-scan:

- DevKit ya tiene `repo is the only persistent memory` como regla sellada.
- DevKit ya tiene disposicion para decisiones indexables por grafo.
- WorkBench ya define Graphify como memoria semantica operativa, no adorno.
- WorkBench tambien tiene una frontera fuerte: no aplicar el modelo Friendship/ViTo a
  WorkBench cuando se evalua su identidad de producto.
- "relationship-first" existe como lenguaje externo. "friendship-native" no aparece como
  categoria estable; eso permite que VibeThink lo acuñe, pero debe definirse.

Propuesta de frase house-layer:

```text
VibeThink is not AI-first. VibeThink is knowledge-native and friendship-native.
```

Definiciones:

- **Knowledge-native** gobierna que deben saber los agentes antes de decidir o actuar:
  conocimiento aceptado, reglas, vocabulario, decisiones, escenarios, preguntas abiertas.
- **Friendship-native** gobierna como se relacionan los agentes con personas y organizaciones:
  continuidad, confianza, memoria responsable, permiso antes de actuar, cuidado del contexto
  y coordinacion alrededor del trabajo real.

Guardrail de capa:

```text
Knowledge-native belongs in VT-METHOD as house methodology.
Friendship-native belongs as VibeThink identity / relation principle.
Product-specific Friendship Model, Heartbeat, XMS and anti-CRM vocabulary stay in ViTo L3
unless Marcelo explicitly seals a house-level abstraction.
WorkBench must not be re-framed as ViTo/Friendship product; it remains an internal
coordination/evidence plane that can consume the method.
```

## 1. Why now

El caso piloto salio en Campus, durante el diseno de **Ficha / Centro de Control del
estudiante + ViTo Assistant contextual**.

Marcelo no estaba pidiendo una feature puntual. Estaba explicando como opera el colegio:

- Matriculas/Ficha es el hub operativo del estudiante, no solo un frente academico.
- Transporte, Restaurante, Informes, Asistencia, Comunicaciones y Rectoria orbitan la misma ficha.
- Cada actor puede actuar solo en su frente por permiso.
- ViTo Assistant debe entender contexto antes de actuar.
- Casos vivos: Balam, padre que recoge por violin, informe que no llego, rector buscando senales,
  restaurante con pagos/escaneos/olvido recurrente de carnet/temporal.

Ese material no es todavia "feature spec"; es **conocimiento de producto/negocio**. Si queda
solo en chat, el siguiente agente vuelve a preguntar o construye una feature correcta en codigo
pero equivocada en intencion.

## 2. Prior art signal

La linea de investigacion revisada apunta a un patron consistente:

- Knowledge-Driven Design captura conocimiento util de resolucion de problemas, reflexion
  y checklists para que futuros proyectos no repitan fallas.
- Frameworks de Knowledge-Driven Design formalizan guias y reglas para integrarlas en
  herramientas de diseno, no dejarlas como PDFs muertos.
- Context engineering para agentes converge en escribir, seleccionar, comprimir e aislar
  el contexto correcto; mas contexto no es mejor.
- Agentes de software necesitan archivos/versionado de contexto para alinearse con
  estandares, politicas y workflows del proyecto.

Referencias usadas en la conversacion:

- Springer, "A3 thinking approach to support knowledge-driven design" (2013).
- Cambridge Core, "Knowledge-driven design for additive manufacturing" (2023).
- LangChain, "Context Engineering" (write/select/compress/isolate).
- arXiv, "Context Engineering for AI Agents in Open-Source Software".
- CoLab, "AI for Engineering: How to Capture Design Intent with Knowledge Bases".

## 3. Current DevKit fit

DevKit ya tiene piezas compatibles:

- `VT-METHOD.md`: slice -> decision gate -> specify -> execute -> trail -> findings.
- `CANON-DEVELOPMENT-PROCESS.md`: `Canon > Specs > Strategy > Research`.
- `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`: decisiones indexables en ADR/Markdown.
- `CANON-CONTEXT-HYGIENE.md`: contexto como recurso finito; escribir fuera del contexto.
- `setup/templates/feature-docs/`: artefactos y gate para features.
- `check-agent-context`: asegura que los agentes cargan reglas, no que entienden el producto.

Brecha: no hay un instrumento explicito para **conocimiento de negocio/producto previo a la feature**.

## 4. Proposed concept

### Name

Opciones:

- **Knowledge-Native VT-METHOD** (recomendado para la postura general).
- **Knowledge-Driven Design in VT-METHOD** (mas academico).
- **Knowledge Baseline Gate** (nombre del gate operativo).

### Root principle

> A complex feature cannot be specified until the agent has declared the knowledge baseline
> it is designing from.

### Knowledge Pack

Un Knowledge Pack no dice "que vamos a construir". Dice "que debe entender un agente
antes de proponer o construir".

Minimo:

```text
Knowledge Pack
  BUSINESS-CONTEXT.md       why the domain matters / business problem
  PRODUCT-CONTEXT.md        product identity, north star, user promise
  DOMAIN-VOCABULARY.md      terms, translations, forbidden names
  OPERATING-RULES.md        laws, constraints, permissions, non-negotiables
  DECISION-LINKS.md         ADR/canon/spec references and why they apply
  WORKED-SCENARIOS.md       real examples, happy/exception/edge
  ANTI-EXAMPLES.md          what a wrong implementation would do
  OPEN-QUESTIONS.md         unresolved questions, owner, due/trigger
  SOURCES.md                evidence/provenance: chat, comm, PR, doc, research
```

Repo L3 can bind filenames, but DevKit should define roles.

## 5. Proposed DevKit artifacts

### 5.1 New canon

`knowledge/methodology/CANON-KNOWLEDGE-DRIVEN-DESIGN-001.md`

Sections:

1. Root principle.
2. When it triggers.
3. Knowledge lifecycle states:
   - Raw input
   - Knowledge candidate
   - Accepted product knowledge
   - Decision
   - Canon
   - Feature spec
4. Knowledge Pack role definitions.
5. Promotion path:
   - conversation -> comm/finding -> pack -> ADR/canon/spec
6. Engine boundary:
   - DevKit defines a Knowledge Memory Adapter contract.
   - Markdown/ADR/Canon/Knowledge Pack remain the auditable source of truth.
   - Graphify/Engram are the VibeThink default binding unless an L3 repo overrides.
7. Freshness:
   - stale packs must be marked and superseded.
   - stale memory/index adapters must be reported before use.
8. Anti-patterns:
   - chat-only product knowledge,
   - feature spec without business/product baseline,
   - product-shaping work that does not retrieve/cite the accepted baseline,
   - embedding raw domain data without governance,
   - dumping everything into context instead of selecting.

### 5.2 Template instrument

`setup/templates/knowledge-pack/`

Suggested files:

- `README.md`
- `BUSINESS-CONTEXT.template.md`
- `PRODUCT-CONTEXT.template.md`
- `DOMAIN-VOCABULARY.template.md`
- `OPERATING-RULES.template.md`
- `DECISION-LINKS.template.md`
- `WORKED-SCENARIOS.template.md`
- `ANTI-EXAMPLES.template.md`
- `OPEN-QUESTIONS.template.md`
- `SOURCES.template.md`

### 5.3 Gate

`tools/check-knowledge-pack.mjs`

Config:

```json
{
  "knowledgeRoot": "docs/knowledge",
  "featureRoots": ["docs/features", "specs"],
  "requiredPackArtifacts": [
    "BUSINESS-CONTEXT.md",
    "PRODUCT-CONTEXT.md",
    "DOMAIN-VOCABULARY.md",
    "OPERATING-RULES.md",
    "WORKED-SCENARIOS.md",
    "SOURCES.md"
  ],
  "featureKnowledgeBaseline": {
    "requiredFor": ["complex", "ai-assisted", "product-identity", "cross-boundary"],
    "sectionName": "Knowledge Baseline"
  },
  "engines": {
    "graphify": { "optional": true },
    "engram": { "optional": true }
  }
}
```

Gate checks:

- declared packs exist and are non-empty,
- complex feature docs/specs declare a `Knowledge Baseline`,
- `Knowledge Baseline` includes retrieval evidence:
  - pack path,
  - status (`candidate` / `accepted` / `superseded`),
  - adapter used (`markdown-direct`, `engram`, `graphify`, `workbench-context`, other L3 binding),
  - timestamp or command/reference proving recall/index was checked,
- references point to existing pack files or ADR/canon/spec paths,
- open questions include owner/status,
- memory/index adapter stale/missing states are declared rather than hidden,
- no required pack is silently missing.

Gate should **not** judge semantic quality; it guarantees the artifact exists and is
attached to the unit.

### 5.4 VT-METHOD amendment

Current:

```text
slice -> decision gate -> specify -> execute -> leave trail -> findings
```

Proposed:

```text
slice -> decision gate -> knowledge baseline -> specify -> execute -> leave trail -> findings / learning
```

With scaling:

- trivial fix: no pack required,
- local implementation: reference existing pack if relevant,
- complex / product-shaping / AI-assisted behavior: knowledge baseline required,
- new domain or major product direction: pack first, spec second.

## 6. Engine boundary: Knowledge Memory Adapter, Graphify and Engram

DevKit should be **engine-abstract**, not **memory-optional**:

> Every Knowledge Pack must be retrievable through a declared Knowledge Memory Adapter.
> The source of truth is auditable Markdown/ADR/Canon/Knowledge Pack. The adapter makes
> retrieval operational. The concrete engine is an L3 binding unless VibeThink L2 declares
> a house default.

Recommended bindings:

- **Markdown direct**: always available fallback and auditable source.
- **Graphify**: structural/semantic graph over Markdown, ADRs, specs, comms, examples.
- **Engram**: queryable memory of findings, project facts, cross-session traces, recall.

Do not make L1 require a single binary globally. Do make the repo declare its adapter and
make the agent prove retrieval before product-shaping work. Provide config and health hooks:

```json
{
  "knowledgeMemoryAdapters": [
    {
      "id": "markdown-direct",
      "kind": "source",
      "required": true
    },
    {
      "id": "graphify",
      "kind": "graph",
      "path": "graphify-out",
      "required": "vibethink-default"
    },
    {
      "id": "engram",
      "kind": "memory",
      "project": "vito",
      "required": "vibethink-default"
    }
  ]
}
```

Operational states:

- `ready`: adapter present and fresh enough.
- `stale`: adapter present but must be refreshed or explicitly degraded.
- `missing`: adapter not available; agent must read source files directly and report missing adapter.
- `not-adopted`: repo L3 has consciously opted out or chosen another adapter.

This matches existing DevKit/Workbench direction:

- DevKit already says agent/vendor memory is volatile and repo Markdown is the durable truth.
- DevKit already has graph-indexable decision disposition.
- WorkBench already treats Graphify as workspace semantic memory and tracks freshness.
- Existing external-tool health code already distinguishes Graphify missing/stale and Engram missing/stale.

## 7. WorkBench follow-up

Workbench should operationalize the same method:

- First-class `KnowledgePack` entity or plugin-backed object.
- Link packs to workspace/project/goal/card/issue.
- `heartbeat-context` should include relevant knowledge packs before comments when work is product-shaping.
- Graphify index metadata should cover packs, not only execution evidence.
- Engram recall should be represented in the context pack as evidence, not as invisible agent intuition.
- Card/task readiness should warn when the accepted baseline was not retrieved.
- Agent context pack should answer:
  - what business/product knowledge applies?
  - which rules and decisions bind this task?
  - which examples should the agent read?
  - which adapter returned this context, and how fresh is it?

This belongs in WorkBench as a consumer/operator of DevKit methodology, not as the source of methodology.

## 8. Pilot recommendation

Pilot in Campus:

`docs/knowledge/student-control-center/`

Seed content:

- Campus as operational center around the student.
- Ficha/Matriculas as hub, not academic-only.
- ViTo Assistant contextual.
- Role-scoped fronts: Transporte, Restaurante, Informes, Asistencia, Comunicaciones, Academico.
- Worked scenarios:
  - Balam: rector cita padres.
  - Balam: violin, papa recoge, novedad transporte.
  - Maria Elena: reenviar informe si pago/requisito/asistencia validan.
  - Rector: lectura longitudinal con evidencia.
  - Restaurante: pago sin consumo, olvido recurrente de carnet, temporal.

Then require future `ficha-centro-control` specs to cite this pack in `Knowledge Baseline`.

## 9. First PR shape

Recommended PR title:

`feat(methodology): add knowledge-driven design instrument`

Recommended steps:

1. Add draft/accepted canon file.
2. Add templates.
3. Add config example.
4. Add lightweight check.
5. Wire to `devkit-doctor`.
6. Update `VT-METHOD.md` with the new step.
7. Add a sample fixture under test assets, not product-specific.

## 10. Acceptance

- A fresh agent can answer "what should I understand before specifying this feature?"
  without reading the whole repo.
- A complex feature can be mechanically checked for an attached knowledge baseline.
- The agent's task artifact proves it retrieved/cited the accepted baseline through the declared adapter,
  or declared adapter failure and read the source Markdown directly.
- Graphify/Engram can index and retrieve the pack as the VibeThink default binding, while DevKit keeps
  the abstract adapter contract reusable by non-VibeThink heirs.
- Product knowledge no longer lives only in chat or scattered comms.
- Lessons learned can promote back into product knowledge deliberately.

## 11. Anti-goal

Do not turn DevKit into a domain knowledge base. DevKit defines the method and instruments.
Product knowledge stays in each product repo L3.
