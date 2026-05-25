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
 *      lane-scoped writes only, create-only (never overwrite a comm), known type.
 *   3. AUTOMATIC, not damaged — still ONE command; criteria run silently on the
 *      happy path. Safety may block the automatic; governance adds no friction.
 *
 * Lane is read from tools/inbox.config.json (agnostic, same as the inbox engine),
 * defaulting to docs/ai-coordination/comms.
 *
 * Usage:
 *   node tools/comms-send.mjs --to <agent|human> --type <task|finding|...> \
 *     --re "<subject>" [--priority high] [--from <id>] [--status open] \
 *     [--summary "<1-line>"] (--body "<text>" | --body-file <path>) [--dry-run] [--no-push]
 *
 * Exit codes: 0 ok · 1 SAFETY block (secret) · 2 governance/validation error ·
 *   3 create-only conflict (file exists) · 4 git/push failure (file IS written).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HIGH_CONFIDENCE_PATTERNS } from "./comms-security-gate.mjs";

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

/** GOVERNANCE: returns an array of error strings ([] = valid). */
export function validate({ to, type, re, body }) {
  const errors = [];
  if (!to || !String(to).trim()) errors.push('--to is required (agent token or "human")');
  if (!type || !String(type).trim()) errors.push("--type is required");
  else if (!KNOWN_TYPES.includes(String(type).toLowerCase()))
    errors.push(`--type "${type}" is not known (${KNOWN_TYPES.join(", ")})`);
  if (!re || !String(re).trim()) errors.push('--re "<subject>" is required');
  if (!body || !String(body).trim()) errors.push("a body is required (--body or --body-file)");
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
}) {
  const toAgent = String(to).toLowerCase();
  const needs = toAgent === "human" ? "human" : "agent";
  const fm = [
    "---",
    `type: ${String(type).toLowerCase()}`,
    `from: ${from}`,
    `to_agent: ${toAgent}`,
    `to: ${to}`,
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
      `[dry-run] would commit + push · would appear in: node tools/inbox.mjs ${String(args.to).toLowerCase()}\n`
    );
    process.exit(0);
  }

  // 3. AUTOMATIC — write → commit (real pre-commit gate runs too = double safety)
  //    → push (--no-verify only skips the dirty-worktree HYGIENE check; the secret
  //    SECURITY check already ran twice).
  mkdirSync(join(root, LANE), { recursive: true });
  writeFileSync(absPath, content, "utf8");
  try {
    execFileSync("git", ["add", "--", relPath], { cwd: root, stdio: "pipe" });
    execFileSync("git", ["commit", "-m", `comms: ${String(args.type).toUpperCase()} ${args.re}`], {
      cwd: root,
      stdio: "pipe",
    });
    if (!args.noPush) {
      execFileSync("git", ["push", "--no-verify"], { cwd: root, stdio: "pipe" });
    }
  } catch (err) {
    console.error(
      `⚠ comms:send — file WRITTEN (${relPath}) but git step failed: ${err?.message ?? err}`
    );
    console.error(
      "   Nothing is lost. Commit/push manually (e.g. detached HEAD → checkout a branch first)."
    );
    process.exit(4);
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
  console.log(`  committed${args.noPush ? "" : " + pushed"} on ${branch}.`);
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
