# spec-kit — agnostic methodology core

Brand-neutral core of the [Spec Kit](https://github.com/github/spec-kit) workflow:
the artifact **templates** and scaffolding **scripts** a consuming repo copies and
runs. Nothing here names a product, tenant, brand, or model vendor (the kit's
neutrality gate enforces that).

## Layout

```
spec-kit/
  templates/            ← artifact templates (agnostic)
  scripts/powershell/   ← scaffolding scripts (agnostic)
  UPSTREAM.md           ← upstream record (§6.1): source, license, last-sync, what's out of scope
```

## How a consumer adopts it

Templates and scripts are **runnables** — inherited by **verbatim copy + parity check**
(ADR-20260524). In your repo:

1. Copy the files you use into your repo (e.g. under `.specify/`).
2. Declare each copy in your `tools/copy-parity.config.json` against this kit as
   `upstreamRoot`, e.g.:

   ```json
   {
     "$schema": "VIBETHINK_COPY_PARITY_V1",
     "upstreamRoot": "../_vibethink-dev-kit",
     "copies": [
       { "local": ".specify/templates/plan-template.md", "upstream": "spec-kit/templates/plan-template.md" }
     ]
   }
   ```

3. Run `node tools/check-copy-parity.mjs <config> --upstream-root ../_vibethink-dev-kit`.
   A file you adapt locally is declared `adapted` (with a reason) — it is reported,
   never silently compared.

## What stays in your repo (not here)

Command bodies, command-set policy and its guardrail, canon/governance routing, and
your reconciliation changelog are **product-specific** (L2/L3). They live in your repo,
not in this neutral core. See [`UPSTREAM.md`](UPSTREAM.md) for the full in/out-of-scope
list.
