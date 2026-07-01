# Multi-Model Agent Routing — L3 Adoption Example

> Bind this to `CANON-MULTI-AGENT-ORCHESTRATION` §3.2.
> This is a consumer-side adapter shape for launching subagents with different
> model/runtime choices while keeping governance identity and gates intact.

## Rule

Do not route by model alone. A launch route separates:

- `role`
- `adapter`
- `model`
- `auth_mode`
- `capability`
- `gates`
- `evidence`
- `review_policy`
- `human_approval`

## Minimum Launch Card

```text
ROUTE: role=<role>; adapter=<adapter>; model=<model-or-tier>; auth=<auth_mode>; capability=<capability>
GATES: <decision/versioning/safety/review gates>
EVIDENCE: <config/eval/human instruction>
REVIEW: <review policy>; HUMAN_APPROVAL=<required|not-required + reason>
```

## Example Config Shape

```json
{
  "inherits": "CANON-MULTI-AGENT-ORCHESTRATION#3.2",
  "routes": [
    {
      "role": "coder",
      "adapter": "default-coder-adapter",
      "model": "default-code-model",
      "auth_mode": "bot-propose-only",
      "capability": "bounded-code-edit",
      "gates": ["decision-gate", "versioning-impact", "safe-identity", "external-tools-health"],
      "evidence": ["tools/multi-model-routing.config.json", "evals/code-edit.md"],
      "review_policy": "human-review-before-merge",
      "human_approval": "not-required: route is pre-approved for non-boundary code edits"
    },
    {
      "role": "advisor",
      "adapter": "fresh-context-advisor-adapter",
      "model": "large-context-review-model",
      "auth_mode": "read-only",
      "capability": "fresh-context-architecture-review",
      "gates": ["decision-gate", "review-readiness", "no-write"],
      "evidence": ["evals/review-quality.md"],
      "review_policy": "findings-only; human authority decides",
      "human_approval": "required: fresh-context review requested at judgment gate"
    }
  ],
  "conflict_policy": "block"
}
```

## Minimum Agent Checklist

- Do not rename the agent role after the model/runtime.
- Verify the adapter loads the repo rulebook and L3 bindings.
- Verify the auth mode before any push or external mutation.
- Name the capability that justifies the model choice.
- Carry decision, versioning, safety, tool-health, and review gates into the launch.
- Link evidence: config, eval, prior accepted pattern, or human instruction.
- State review policy and whether human approval is required before launch.
- Stop if any axis conflicts; do not infer the route silently.
