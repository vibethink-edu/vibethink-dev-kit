# Executable CLI Catalog Template

Use this template when a repo exposes commands through a local wrapper, agent surface, UI menu, or orchestration layer.

The dev-kit owns the portable contract. The consuming repo owns the commands.

## Files

- `cli-catalog.schema.json` — JSON schema for the portable export.

## Adoption

1. Expose an export that prints JSON matching `cli-catalog.schema:v1`.
2. Keep every command entry tied to a local doc path.
3. Add a local gate that runs:

```bash
node path/to/dev-kit/tools/check-cli-catalog-contract.mjs tools/cli-catalog-contract.config.json
```

4. Use either a catalog file:

```json
{
  "_schema": "EXECUTABLE_CLI_CATALOG_CONTRACT_GATE_V1",
  "catalog": "tools/cli-catalog.json",
  "requireDocPaths": true
}
```

5. Or use a command that prints the catalog to stdout:

```json
{
  "_schema": "EXECUTABLE_CLI_CATALOG_CONTRACT_GATE_V1",
  "catalogCommand": ["node", "tools/cli.mjs", "export", "--project", "local"],
  "requireDocPaths": true
}
```

The checker executes `catalogCommand` without a shell. Keep it to a repo-owned command that only prints catalog JSON.

## Non-goals

- This template does not define the repo's command ids.
- This template does not authorize command execution.
- This template does not replace local security, review, or approval rules.
