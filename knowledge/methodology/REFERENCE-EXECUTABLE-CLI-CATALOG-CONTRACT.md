# REFERENCE-EXECUTABLE-CLI-CATALOG-CONTRACT — portable executable command inventory

**Status:** **PROPOSED 2026-07-09** — the contract and gate are intended as an adoptable kit instrument; seal occurs through the normal authority + PR path.
**Date:** 2026-07-09
**Scope:** Any repo that exposes repeatable executable commands to humans, agents, local automation, or orchestration surfaces.
**Home:** the dev-kit (supra-repo). Inherited by consuming repos as upstream contract -> local binding.
**Companion:** `REFERENCE-OPERATOR-COMMAND-CATALOG` covers human prompt triggers; this reference covers executable commands that a repo can actually run.

---

## §0 — What this is (and is not)

An **executable CLI catalog** is a machine-readable inventory of commands a repo deliberately exposes: command id, group, script entrypoint, package script, local documentation, safety label, tags, and default arguments.

It is **not** an execution authority. A catalog entry says "this command exists and this is its contract"; the caller still obeys the repo's normal security, review, permission, environment, and human-approval rules.

It is **not** the operator command catalog. Operator commands are short human prompts that ask an agent to perform a repeatable task. Executable CLI catalog entries are concrete runnable commands, usually wrapping scripts already present in the repo.

---

## §1 — Authority order

1. The repo's local implementation owns the actual behavior.
2. The exported catalog owns the portable discovery contract.
3. The dev-kit schema and checker own the minimal shape that makes the export consumable by other tools.
4. A generated adapter, UI menu, or agent surface never outranks the catalog.

If a script changes behavior, the local docs and catalog entry change with it. A stale catalog is worse than no catalog because it invites automation to trust a false map.

---

## §2 — Portable contract

The portable JSON export MUST carry:

```json
{
  "schemaVersion": "cli-catalog.schema:v1",
  "schema": "./path/to/cli-catalog.schema.json",
  "catalogVersion": "2026.07.09",
  "project": "consumer-repo",
  "commands": [
    {
      "id": "repo:health",
      "group": "repo",
      "script": "tools/repo-health.mjs",
      "packageScript": "repo:health",
      "docPath": "docs/cli/repo-health.md",
      "description": "Run a read-only repository health diagnostic.",
      "safety": "read-only",
      "tags": ["repo", "diagnostic"],
      "defaultArgs": []
    }
  ]
}
```

Field rules:

- `id` is stable and machine-facing. Use lowercase ASCII ids with `:` or `-` separators.
- `group` is a short routing bucket for menus and UIs.
- `script` is the canonical entrypoint the repo owns.
- `packageScript` is the package-manager alias when one exists; use `null` when none exists.
- `docPath` points to local human documentation for the command.
- `description` is short, factual, and free of product-specific secrets.
- `safety` is an explicit label. The vocabulary is L3, but the field is mandatory.
- `tags` are discovery hints, not authorization.
- `defaultArgs` are the arguments a wrapper would pass when the operator gives none.

The schema lives at `setup/templates/cli-catalog/cli-catalog.schema.json`.

---

## §3 — Consumer responsibilities

A consuming repo that adopts this contract SHOULD provide:

1. A local wrapper or export command that emits the portable JSON contract.
2. A gate that validates the exported JSON against the dev-kit contract.
3. A drift check tying local scripts/package scripts/docs to the catalog.
4. Local documentation for every command entry.
5. A visible safety vocabulary that tells the operator whether the command is read-only, local-write, networked, privileged, or otherwise governed.

The kit does not prescribe the package manager, the command runner, the command ids, or the safety vocabulary. Those are local bindings.

---

## §4 — Relationship to operator commands

Use both catalogs together, but keep them separate:

| Surface | Reusable object | Typical consumer | Authority |
|---|---|---|---|
| Operator command catalog | prompt trigger + output contract | human operator -> agent | methodology prompt contract |
| Executable CLI catalog | runnable command metadata | agent/UI/orchestrator -> repo command | local repo command contract |

An operator command may recommend an executable command by id. It must still report evidence honestly: "the catalog declares command X" is not the same as "command X ran".

---

## §5 — Gate behavior

The reference checker (`tools/check-cli-catalog-contract.mjs`) validates a catalog exported as JSON. It can read either:

- a `catalog` file path; or
- a `catalogCommand` argv array whose stdout is the catalog JSON.

The checker is intentionally limited to the portable contract:

- required top-level fields exist;
- command ids are unique and match the stable id pattern;
- each command carries all required fields with the expected primitive types;
- optional `requireDocPaths` verifies that every `docPath` resolves to an existing local file.

It does not run the listed commands and does not decide whether the commands are safe to execute.

---

## §6 — L1 / L3 line

- **L1 (this reference):** the existence of a portable executable CLI catalog contract, the required fields, the schema template, and the reference checker behavior.
- **L3 (consuming repo):** actual command ids, scripts, package-manager aliases, docs, safety vocabulary, local wrapper UX, and which gates are required in CI.

If concrete product commands leak into this reference, the fire-test fails.

---

## §7 — Provenance

Forced by a real consumer sequence: a local command wrapper became useful only after it shipped a central catalog, a drift gate, a portable export, a human-readable explain command, and a schema correction that made `docPath` mandatory in the same place it was emitted. The reusable lesson is not the consumer's commands; it is the contract that lets other surfaces discover and explain executable commands without re-parsing package scripts or reading local code.

**Fire-test:** names no product, tenant, person, provider, package manager, command runner, or concrete consumer path. PASS.
