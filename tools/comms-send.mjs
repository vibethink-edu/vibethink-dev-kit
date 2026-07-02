#!/usr/bin/env node
/**
 * comms:send — one-command "send" for a cross-agent comm (the dance).
 *
 * Dev-kit canonical source (inherited by consuming repos as a verbatim copy, per
 * ADR-20260524-supra-repo-inheritance-mechanism). Closes the danza "last-mile":
 * git only carries what is committed + pushed — an uncommitted comm reaches no one.
 * Sending by hand is ~5 fiddly steps (write → add → commit → push → handle the
 * pre-commit hook), so messages get stranded. This makes "send" ONE command.
 *
 * DESIGN ORDER ("siempre lo seguro primero"):
 *   1. SAFETY FIRST (fail-closed) — scan for secret VALUES; if found, ABORT before
 *      writing anything. Uses the SAME patterns as the pre-commit gate
 *      (tools/comms-security-gate.mjs) so there is zero drift.
 *   2. GOVERNED with criteria — validate frontmatter (to_agent/status/date/from/re),
 *      require target_layer/ref_branch for governance tasks, lane-scoped writes
 *      only, create-only (never overwrite a comm), known type.
 *   3. AUTOMATIC, not damaged — still ONE command; criteria run silently on the
 *      happy path. Safety may block the automatic; governance adds no friction.
 *
 * Self-governance (S3, CANON-RUNTIME-POLICY-ENGINE-001): immediately before the
 * push, this tool consults the SAME engine + git-hygiene manifest a policy-engine
 * hook would, passing the call-time grant `labels.commLane` that `GIT-MUST-ALL-VIA-PR`
 * (§7) declares as the comm lane's sole lawful exemption. This is the first governed
 * flow that grants ITSELF at invocation — a plain agent shelling out the identical
 * `git push origin <branch>` carries no such grant and is DENIED by the same rule.
 *
 * Lane is read from tools/inbox.config.json (agnostic, same as the inbox engine),
 * defaulting to docs/ai-coordination/comms.
 *
 * Usage:
 *   node tools/comms-send.mjs --to <agent|human> --type <task|finding|...> \
 *     --re "<subject>" [--priority high] [--from <id>] [--status open] \
 *     [--target-layer SUPRA-L1L2|product-L3|both] [--ref-branch <branch>] \
 *     [--summary "<1-line>"] (--body "<text>" | --body-file <path>) [--dry-run] [--no-push]
 *
 * Exit codes: 0 ok (pushed — OR a declared COMMITTED-LOCAL fallback when no remote
 *   is configured / --no-push, per CANON-MULTI-AGENT-ORCHESTRATION §2.2.1) ·
 *   1 SAFETY block (secret) · 2 governance/validation error · 3 create-only conflict
 *   (file exists) · 4 git failure with the file written (the COMMIT failed, the
 *   governed push self-check did not ALLOW, or the PUSH failed though a remote
 *   exists — surfaced, never swallowed).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HIGH_CONFIDENCE_PATTERNS } from "./comms-security-gate.mjs";
import { compileManifest, evaluate } from "./policy-engine/engine.mjs";

/** knowledge/policy/canon-git-hygiene.policy.json, resolved relative to THIS file
 *  (the tool's own location), never cwd — comms:send can run from any repo root. */
const GIT_HYGIENE_MANIFEST = new URL(
  "../knowledge/policy/canon-git-hygiene.policy.json",
  import.meta.url
);

/** Lane path, read from tools/inbox.config.json (matches the inbox engine). */
function resolveLane() {
  try {
    const cfgPath = join(dirname(fileURLToPath(import.meta.url)), "inbox.config.json");
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    if (cfg.lanePath) return cfg.lanePath;
  } catch {
    /* no config — fall back to the default */
  }
  return "docs/ai-coordination/comms";
}

export const LANE = resolveLane();

/** This repo's canonical name — written to the comm's `repo` field (the routing/guard
 *  target, so a recipient can tell it's reading a comm meant for a different repo). */
function resolveRepo() {
  try {
    const cfgPath = join(dirname(fileURLToPath(import.meta.url)), "inbox.config.json");
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    if (cfg.repo) return cfg.repo;
  } catch {
    /* fall through to git */
  }
  try {
    const top = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    if (top) return basename(top);
  } catch {
    /* no git — leave empty */
  }
  return "";
}

export const REPO = resolveRepo();
export const KNOWN_TYPES = [
  "task",
  "finding",
  "briefing",
  "delivery",
  "handoff",
  "review",
  "note",
  "reference",
  "decision",
  "addendum",
  "guide",
  "audit",
];
export const GOVERNANCE_TYPES = new Set(["task", "review", "audit"]);
export const TARGET_LAYERS = new Set(["SUPRA-L1L2", "product-L3", "both"]);

/** SAFETY: secret VALUES in the comm content (shared patterns — no drift). */
export function scanSecrets(content) {
  const hits = [];
  for (const p of HIGH_CONFIDENCE_PATTERNS) {
    const m = String(content).match(p.regex);
    if (m) hits.push({ label: p.label, sample: m[0].slice(0, 120) });
  }
  return hits;
}

/** kebab-case slug from a subject line, for the filename. */
export function slugify(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // strip accents
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Today's date as YYYY-MM-DD (UTC). */
export function today(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/** Convention: {TYPE}-{SLUG}-{YYYY-MM-DD}.md */
export function buildFilename(type, re, date) {
  return `${String(type).toUpperCase()}-${slugify(re)}-${date}.md`;
}

/** Text of the markdown section started by `headingRe`, up to the next `## ` heading
 *  (or end of doc). Lets governance inspect a section's CONTENT, not just its presence. */
export function sectionBody(body, headingRe) {
  const lines = String(body).split(/\r?\n/);
  const start = lines.findIndex((l) => headingRe.test(l));
  if (start === -1) return "";
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) break; // next section ends this one
    out.push(lines[i]);
  }
  return out.join("\n");
}

/** GOVERNANCE: returns an array of error strings ([] = valid). */
export function validate({ to, type, re, body, targetLayer, refBranch }) {
  const errors = [];
  const normalizedType = String(type ?? "").toLowerCase();
  if (!to || !String(to).trim()) errors.push('--to is required (agent token or "human")');
  if (!type || !String(type).trim()) errors.push("--type is required");
  else if (!KNOWN_TYPES.includes(normalizedType))
    errors.push(`--type "${type}" is not known (${KNOWN_TYPES.join(", ")})`);
  if (!re || !String(re).trim()) errors.push('--re "<subject>" is required');
  if (!body || !String(body).trim()) errors.push("a body is required (--body or --body-file)");
  if (GOVERNANCE_TYPES.has(normalizedType)) {
    if (!targetLayer || !String(targetLayer).trim())
      errors.push(`--target-layer is required for ${normalizedType} comms`);
    else if (!TARGET_LAYERS.has(String(targetLayer)))
      errors.push(`--target-layer must be one of: ${[...TARGET_LAYERS].join(", ")}`);
    if (!refBranch || !String(refBranch).trim())
      errors.push(`--ref-branch is required for ${normalizedType} comms`);
    const SELF_CHECK_RE = /^## Recipient Self-Check\b/m;
    if (!SELF_CHECK_RE.test(String(body)))
      errors.push(
        `body must include a "## Recipient Self-Check" section for ${normalizedType} comms`
      );
    else {
      // A heading alone is not a self-check (#23.3 — a blank heading used to pass):
      // the section must carry content AND orient the recipient — at minimum the
      // branch to work on and the target repo/layer it pertains to.
      const text = sectionBody(String(body), SELF_CHECK_RE).trim();
      if (text.length < 12)
        errors.push(
          `the "## Recipient Self-Check" section must have content, not just a heading, for ${normalizedType} comms`
        );
      else {
        const lower = text.toLowerCase();
        const namesBranch =
          /\bbranch\b/.test(lower) ||
          (refBranch && lower.includes(String(refBranch).toLowerCase()));
        const namesTarget =
          /\brepo\b|\blayer\b/.test(lower) ||
          (targetLayer && lower.includes(String(targetLayer).toLowerCase()));
        if (!namesBranch)
          errors.push(
            `the Self-Check must reference the branch (ref_branch / branch) for ${normalizedType} comms`
          );
        if (!namesTarget)
          errors.push(
            `the Self-Check must reference the target repo or layer for ${normalizedType} comms`
          );
      }
    }
  }
  return errors;
}

/** Build the comm file content (frontmatter + body). `to` drives routing. */
export function buildComm({
  to,
  type,
  re,
  body,
  from = "claude",
  priority = "normal",
  status = "open",
  date = today(),
  summary = "",
  repo = REPO,
  targetLayer = "",
  refBranch = "",
}) {
  const toAgent = String(to).toLowerCase();
  const needs = toAgent === "human" ? "human" : "agent";
  const fm = [
    "---",
    `type: ${String(type).toLowerCase()}`,
    `from: ${from}`,
    `to_agent: ${toAgent}`,
    `to: ${to}`,
    // The repo this comm pertains to / where to act — lets a recipient detect a
    // mismatch with the repo it is actually in (comms:sync warns; the wrong-chat guard).
    ...(repo && String(repo).trim() ? [`repo: ${repo}`] : []),
    ...(targetLayer && String(targetLayer).trim() ? [`target_layer: ${targetLayer}`] : []),
    ...(refBranch && String(refBranch).trim() ? [`ref_branch: ${refBranch}`] : []),
    `status: ${status}`,
    `needs: ${needs}`,
    `priority: ${priority}`,
    `date: ${date}`,
    `re: ${re}`,
    // Plain-language one-liner shown in the inbox (what this is / what to decide).
    // Quoted so ':' in the text never breaks the YAML.
    ...(summary && String(summary).trim()
      ? [`summary: ${JSON.stringify(String(summary).trim())}`]
      : []),
    "---",
    "",
  ].join("\n");
  return `${fm}${String(body).trimEnd()}\n`;
}

function repoRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

function parseArgs(argv) {
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const bodyFile = get("--body-file");
  let body = get("--body");
  if (!body && bodyFile) body = readFileSync(bodyFile, "utf8");
  return {
    to: get("--to"),
    type: get("--type"),
    re: get("--re"),
    from: get("--from") || "claude",
    priority: get("--priority") || "normal",
    status: get("--status") || "open",
    summary: get("--summary") || "",
    repo: get("--repo"), // override the target repo; defaults to this repo (REPO)
    targetLayer: get("--target-layer"),
    refBranch: get("--ref-branch"),
    body,
    dryRun: argv.includes("--dry-run"),
    noPush: argv.includes("--no-push"),
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function isMain() {
  return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const args = parseArgs(process.argv.slice(2));

  // 2. GOVERNANCE (validate) — cheap checks first so we fail fast on bad input.
  const errors = validate(args);
  if (errors.length) {
    console.error("✗ comms:send — invalid request:");
    for (const e of errors) console.error(`   • ${e}`);
    process.exit(2);
  }

  const content = buildComm(args);

  // 1. SAFETY FIRST (fail-closed) — never write a comm that carries a secret value.
  const secrets = scanSecrets(content);
  if (secrets.length) {
    console.error("🚨 comms:send BLOCKED — secret value detected (safety first, nothing written):");
    for (const s of secrets) console.error(`   • ${s.label}: ${s.sample}`);
    console.error("   Reference the secret by NAME/path, never its value. Then re-send.");
    process.exit(1);
  }

  const root = repoRoot();
  const date = today();
  const filename = buildFilename(args.type, args.re, date);
  const relPath = `${LANE}/${filename}`;
  const absPath = join(root, LANE, filename);

  // 2b. GOVERNANCE — create-only: never overwrite an existing comm.
  if (existsSync(absPath)) {
    console.error(
      `✗ comms:send — create-only: ${relPath} already exists. Pick a different subject.`
    );
    process.exit(3);
  }

  if (args.dryRun) {
    console.log(`\n[dry-run] would write ${relPath}\n`);
    console.log(content);
    console.log(
      `[dry-run] would commit (+ push if a remote exists; else COMMITTED-LOCAL) · would appear in: node tools/inbox.mjs ${String(args.to).toLowerCase()}\n`
    );
    process.exit(0);
  }

  // 3. AUTOMATIC — write → commit (PERSISTENCE, always required) → push (TRAVEL, only
  //    when a remote exists). No remote / --no-push degrades to a declared
  //    COMMITTED-LOCAL fallback with a loud warning, NOT a hard failure
  //    (CANON-MULTI-AGENT-ORCHESTRATION §2.2.1). --no-verify on push only skips the
  //    dirty-worktree HYGIENE check; the secret SECURITY check already ran twice.
  mkdirSync(join(root, LANE), { recursive: true });
  writeFileSync(absPath, content, "utf8");

  // 3a. Commit = persistence. If THIS fails, that is the real failure class.
  try {
    execFileSync("git", ["add", "--", relPath], { cwd: root, stdio: "pipe" });
    // Conventional-commit message (type docs, scope comms) with a lowercased subject,
    // so it passes commitlint anywhere — not a custom "comms:" type (which the
    // standard config-conventional enum rejects).
    const subject = `${args.re.charAt(0).toLowerCase()}${args.re.slice(1)}`;
    execFileSync("git", ["commit", "-m", `docs(comms): ${subject}`], { cwd: root, stdio: "pipe" });
  } catch (err) {
    console.error(
      `⚠ comms:send — file WRITTEN (${relPath}) but the COMMIT failed: ${err?.message ?? err}`
    );
    console.error(
      "   Nothing is lost. Commit manually (e.g. detached HEAD → checkout a branch first)."
    );
    process.exit(4);
  }

  // 3b. Push = travel. Only when a remote exists and the caller didn't opt out.
  const hasRemote = (() => {
    try {
      return execFileSync("git", ["remote"], { cwd: root, encoding: "utf8" }).trim().length > 0;
    } catch {
      return false;
    }
  })();
  let outcome; // "pushed" | "committed-local"
  if (args.noPush || !hasRemote) {
    outcome = "committed-local";
  } else {
    // GOVERNED self-check (S3): consult the runtime policy engine BEFORE the push,
    // the same way any other governed tool-call would. This is the call-time GRANT
    // shape (CANON-RUNTIME-POLICY-ENGINE-001 §3/engine.mjs compileManifest doc): the
    // comm lane is the SOLE lawful exception to CANON-GIT-HYGIENE §7 (everything via
    // PR), and it is honored ONLY because THIS governed flow passes `commLane` at
    // invocation — never because it is comms-send's code path by assumption. A plain
    // agent shelling out `git push origin main` carries no such grant and is DENIED
    // by the identical rule (see comms-send.test.mjs).
    const pushBranch = (() => {
      try {
        return (
          execFileSync("git", ["branch", "--show-current"], {
            cwd: root,
            encoding: "utf8",
          }).trim() || "HEAD"
        );
      } catch {
        return "HEAD";
      }
    })();
    const pushContent = `git push origin ${pushBranch} --no-verify`;
    let manifest;
    try {
      manifest = JSON.parse(readFileSync(GIT_HYGIENE_MANIFEST, "utf8"));
    } catch (err) {
      console.error(
        `⚠ comms:send — could not load the git-hygiene policy manifest (${GIT_HYGIENE_MANIFEST}): ${err?.message ?? err}`
      );
      console.error("   Aborting before push — governed self-check is required, not optional.");
      process.exit(4);
    }
    const policies = compileManifest(manifest);
    const verdict = evaluate(
      { point: "tool-call", tool: "bash", content: pushContent, labels: { commLane: true } },
      {},
      policies
    );
    if (verdict.verdict !== "ALLOW") {
      console.error(
        `⚠ comms:send — the governed push self-check did NOT allow this push: ${verdict.verdict} — ${verdict.decidingPolicy ?? "?"}`
      );
      console.error(`   ${verdict.reason ?? "(no reason returned)"}`);
      console.error("   The commit is safe locally. Nothing was pushed.");
      process.exit(4);
    }
    try {
      execFileSync("git", ["push", "--no-verify"], { cwd: root, stdio: "pipe" });
      outcome = "pushed";
    } catch (err) {
      // A remote EXISTS but the push failed (network / auth). Surfaced, never swallowed,
      // never reported as if it travelled. The commit is safe → exit 4.
      console.error(
        `⚠ comms:send — committed (${relPath}) but the PUSH to the remote FAILED: ${err?.message ?? err}`
      );
      console.error(
        "   The commit is safe locally. Fix the remote/auth issue and `git push` to make it travel."
      );
      process.exit(4);
    }
  }

  const branch = (() => {
    try {
      return (
        execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim() ||
        "(detached)"
      );
    } catch {
      return "?";
    }
  })();
  console.log(`✓ sent: ${relPath}`);
  if (outcome === "pushed") {
    console.log(`  committed + pushed on ${branch}.`);
  } else {
    // COMMITTED-LOCAL — the declared offline fallback (§2.2.1), with the mandatory warning.
    const why = args.noPush ? "--no-push (deliberate)" : "no remote is configured";
    console.log(`  committed on ${branch} — state: COMMITTED-LOCAL (${why}).`);
    console.warn(
      "  ⚠ LOCAL ONLY — not pushed. It will NOT reach other machines and is not backed up off this machine."
    );
    console.warn(
      "    Push it as soon as a remote is available; the state reconciles to PUSHED then (CANON-MULTI-AGENT-ORCHESTRATION §2.2.1)."
    );
  }
  console.log(
    `  appears in ${String(args.to).toLowerCase()}'s inbox once on their lane: node tools/inbox.mjs ${String(args.to).toLowerCase()}`
  );
  if (branch !== "main" && branch !== "master") {
    console.log(
      "  (on a branch → reaches other agents when it lands on the default branch; PR/merge as usual.)"
    );
  }
  process.exit(0);
}
