---
type: delivery
from: claude
to_agent: human
to: human
repo: vibethink-dev-kit
target_layer: SUPRA-L1L2
ref_branch: master
status: open
needs: human
priority: normal
date: 2026-05-26
re: re: validar agnosticismo del Dev-Kit (agnóstico vs ViTo) + adopción cross-repo
---
# REVIEW — Gemini Dev-Kit Agnosticism and Adoption Review (2026-05-25)

**Verdict:** `PASS-WITH-FINDINGS`
**Reviewer:** gemini-arq (Gemini 1.5 Pro Agentic) — Audit of Dev-Kit Agnosticism & Onboarding Adoptions
**Branch audited:** `master` (dev-kit, read as-is)
**Canonical task:** `docs/ai-coordination/comms/TASK-COMMS-TOOLING-INHERITANCE-2734-2026-05-25.md` (§ valida agnosticismo del Dev-Kit)
**Self-orientation applied:** `git status` + verify active files on dev-kit workspace + read the canonical comm task + audit L1, L2, tools and setup documents line-by-line. Target layer confirmed: **SUPRA-L1L2** (Dev-Kit).

---

## 1. Executive Summary

This audit confirms that **Level 1 (Neutral Core)** is structurally clean and passes the brand-isolation fire-test. However, there are minor L3 leakes into Level 2 documentation, duplication of conceptual analogies between L1/L2, and a critical validation gap in the smoke testing suite (`check-agent-context.mjs`), which currently lacks any assertion to verify L1 neutrality. 

The onboarding adoption workflow is functional for basic scenarios but carries implicit friction regarding relative path assumptions, repository isolation barriers, and the tension between runtime symbolic linking and actual version-controlled verbatim copying.

The overall verdict is **`PASS-WITH-FINDINGS`**. Fixing the smoke test validation gap (**F1**) is highly recommended to prevent future silent drifts.

---

## 2. Answers to the 5 Audit Questions

### 1. Is Level 1 (L1) really agnostic? (Fire-test results)
**Yes (Almost Absolute).**
The primary normative files of L1 grep completely clean of the prohibited words (`"ViTo", "XMS", "Cantor", "Ovitality", "VibeThink", "Marcelo"`):
- `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md`: **0 hits (PASS)**
- `knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md`: **0 hits (PASS)**
- `knowledge/ai-agents/AGENTS_UNIVERSAL.md`: **0 hits (PASS)**

*Minor portal exception:* `knowledge/START-HERE.md` (which serves as the main entrance to the repository) contains references to the organization's name `"VibeThink"` at:
- `knowledge/START-HERE.md:15` (`"VibeThink Method"`)
- `knowledge/START-HERE.md:18` (`"VT-METHOD.md"`)
This does not contaminate the L1 core rules, but it represents an organizational footprint that a third party adopting the kit would need to adjust.

### 2. What leaks from ViTo (L3) to Level 1 / Level 2? (Leakage L3 → L1/L2)
**Leakage detected in Level 2.**
A direct reference to the product ViTo (L3) exists in the methodology layer (L2) document:
- `knowledge/ai-agents/AGENTS_METHODOLOGY_VIBETHINK.md:50`:
  > `50: Each consuming repo keeps its own port registry (e.g. a root ports.json); ViTo's is the reference implementation.`
  
This explicitly links a Level 3 product name as the reference implementation in a Level 2 organizational document, violating strict layer separation.

### 3. Is the split clean? (L1 = neutral, L2 = VT-Method, L3 = product)
**Conceptually clean of L3, but duplicate/redundant with L1.**
- **L2/L3 Separation:** Clean. `knowledge/methodology/VT-METHOD.md` does not mention "ViTo" or any Level 3 business vocabulary. It correctly declares that product vocabulary and domain concepts must remain strictly in the product repositories (`VT-METHOD.md:82-83`).
- **L1/L2 Separation (Redundancy):** There is significant conceptual duplication. The explanation of the 6 steps (`VT-METHOD.md:18-38`) and the restaurant analogy (`VT-METHOD.md:43-55`) are universal development process concepts that belong strictly in L1 (`CANON-DEVELOPMENT-PROCESS.md`). L2 should only hold the specific bindings (such as the `3-Gate Preflight` and `Direct Execution` definitions) mapping to those L1 steps.

### 4. Does adoption work? (ADOPT-CROSS-AGENT-GOVERNANCE.md step-by-step test)
**Yes, but with 4 active frictions:**
1. **Sibling directory structure assumption:** Both `mount-devkit.ps1:5-8` and `mount-devkit.sh:7-10` locate the Dev-Kit assuming it is a sibling folder to the adopting repository. If the local directory structure differs, the script fails to resolve paths.
2. **CI workflow permissions barrier:** Step 4 of the adoption runbook references the Dev-Kit's reusable GitHub Actions workflow:
   `uses: vibethink-edu/vibethink-dev-kit/.github/workflows/agent-context.yml@main`
   If the adopting repo belongs to a different GitHub organization or if the dev-kit repository is private, the CI runner will block access to the workflow unless shared credentials are set up (which is undocumented).
3. **Missing `package.json` script templates:** The runbook instructs the developer to wire the sync and inbox commands but does not provide the standard script blocks to add to `package.json`, forcing developers to write or copy them manually from other repos.
4. **Symlink vs Verbatim Copying:** The runbook enforces a "no-copy" Golden Rule (`ADOPT-CROSS-AGENT-GOVERNANCE.md:16`). However, in real-world implementations (like ViTo's current comms inheritance), repositories copy `comms-send.mjs`, `comms-sync.mjs`, and `inbox.mjs` physically to ensure the harness (like the `SessionStart` hook) works consistently in isolated dev environments or CI containers without requiring a local mounted workspace.

### 5. Does the check-agent-context smoke test validate neutrality?
**No. (Validation is partial/structural only).**
The `tools/check-agent-context.mjs` script validates rule file budgets, adapter paths, git tracking, rule numbering sequences, required anchors, and scans for secrets. 
However, **it contains no checks to verify L1 neutrality (the fire-test).** An agent or developer could commit product-specific code or brands directly into `AGENTS_UNIVERSAL.md` or `CANON-CROSS-AGENT-CONTEXT-LAYERING.md`, and the smoke test would output a false `GREEN` pass.

---

## 3. Findings Matrix

| ID | Sev | Finding + Evidence (file:line) | Risk (Failure Class) | Suggested Fix | Status / Owner |
|---|---|---|---|---|---|
| **F1** | **P1** | **Smoke test does not validate L1 neutrality (fire-test).** `tools/check-agent-context.mjs` has no brand/brand-exclusion pattern matching. | Silent brand leakages or product concepts pollute L1 files without CI detecting it. | Add an option in `agent-context.config.json` defining a `brandExclusionPatterns` array and enforce it in the script for files designated as L1. | **PROPOSAL ONLY** / SUPRA |
| **F2** | **P2** | **ViTo reference leak in L2 documentation.** `knowledge/ai-agents/AGENTS_METHODOLOGY_VIBETHINK.md:50` cites ViTo as the reference implementation. | Tight coupling between L2 organization methodology and a specific L3 product. | Reword the sentence to describe the port registry neutrally: *"Each consuming repo keeps its own port registry (e.g. a root ports.json)."* | **PROPOSAL ONLY** / SUPRA |
| **F3** | **P2** | **Redundancy and duplication between L1 and L2.** `knowledge/methodology/VT-METHOD.md:43-55` replicates restaurant analogy and the 6-step definition belonging to L1. | Increased maintenance cost and potential drift of methodology concepts between layers. | Move the restaurant analogy to L1 (`CANON-DEVELOPMENT-PROCESS.md`) and keep L2 focused strictly on VibeThink bindings. | **PROPOSAL ONLY** / SUPRA |
| **F4** | **P3** | **Rigid path resolution in mount scripts.** `tools/mount-devkit.ps1:5-8` and `tools/mount-devkit.sh:7-10` assume rigid sibling paths. | Context mounting fails on non-standard developer environments. | Update mounting scripts to accept an optional command-line argument specifying the path to the Dev-Kit. | **PROPOSAL ONLY** / SUPRA |

---

## 4. Agnosticism vs VibeThink Layer Mapping

| Component | Neutral / Agnostic Core (L1) | VibeThink/Org Binding (L2) | ViTo Product Specifics (L3) |
|---|---|---|---|
| **Rules / Canons** | Agnostic principles (`CANON-DEVELOPMENT-PROCESS.md`), cross-agent context budgets (`CONTEXT-LAYERING.md`), generic secret/security scanning concepts. | Tiered canon scheme (`SEALED -> CANON -> DRAFT`), organizational naming and branding (`VT = VibeThink`), global port assignment scheme. | Product-specific vocabulary (e.g., Friendship Model vocabulary), database schemas, product-specific `AGENTS.md` mission and stack. |
| **Tooling & CI** | Heuristic secret scanner, adapter pointer checks, rule sequence validation (`check-agent-context.mjs`). | Reusable GitHub Action workflows, context mounting templates (`mount-devkit`). | `SessionStart` hooks, local project scripts (`validate:quick`), product-specific wrappers (e.g., `agent-inbox.mjs`). |
| **Orchestration** | Agnostic inbox parser, priority sorting, recipient prose normalizer (`inbox.mjs`). | Standard lane paths (`docs/ai-coordination/comms`), generic comms sync. | Custom comms wrappers, custom filters (e.g., recency/top-N in `agent-inbox`). |
