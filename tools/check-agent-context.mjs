#!/usr/bin/env node
import { execFileSync } from "node:child_process";
/**
 * check-agent-context — the cross-agent layering smoke test (canon §6).
 *
 * A repo is NOT "multi-agent" until this passes — before adding a second agent
 * and on every hygiene pass. Vendor-neutral: behaviour is driven entirely by
 * tools/agent-context.config.json (canon §7: that file declares which file is
 * the source authority vs which are derived adapters).
 *
 * Usage:  node tools/check-agent-context.mjs [path/to/config.json]
 * Exit:   0 = all checks pass (green seal) · 1 = at least one check failed
 *
 * No dependencies — pure Node + git.
 */
import fs from "node:fs";
import path from "node:path";

function repoRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

const ROOT = repoRoot();
const configArg = process.argv[2] || "tools/agent-context.config.json";
const configPath = path.isAbsolute(configArg) ? configArg : path.join(ROOT, configArg);

if (!fs.existsSync(configPath)) {
  console.error(`✗ config not found: ${configPath}`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

const abs = (p) => path.join(ROOT, p);
const exists = (p) => fs.existsSync(abs(p));
const size = (p) => (exists(p) ? fs.statSync(abs(p)).size : -1);
const read = (p) => (exists(p) ? fs.readFileSync(abs(p), "utf8") : "");

let tracked = new Set();
try {
  tracked = new Set(
    execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/\\/g, "/"))
  );
} catch {
  /* not a git repo — tracked-checks degrade to existence */
}
const isTracked = (p) => tracked.has(p.replace(/\\/g, "/"));

const results = [];
const pass = (name, detail) => results.push({ name, ok: true, detail });
const fail = (name, detail) => results.push({ name, ok: false, detail });
const skip = (name, detail) => results.push({ name, ok: true, skipped: true, detail });

// ── Check 1: root rules file < the most restrictive agent's budget ──────────
(() => {
  const budgets = cfg.agentBudgets || {};
  const entries = Object.entries(budgets);
  if (!cfg.rootRulesFile || entries.length === 0)
    return fail("1 root-budget", "no rootRulesFile / agentBudgets declared");
  if (!exists(cfg.rootRulesFile))
    return fail("1 root-budget", `root rules file missing: ${cfg.rootRulesFile}`);
  const [strictAgent, minBudget] = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  const s = size(cfg.rootRulesFile);
  if (s < minBudget)
    pass(
      "1 root-budget",
      `${cfg.rootRulesFile} = ${s} B < ${minBudget} B (strictest: ${strictAgent})`
    );
  else
    fail(
      "1 root-budget",
      `${cfg.rootRulesFile} = ${s} B ≥ ${minBudget} B (strictest: ${strictAgent}) — layer detail into subdirs or raise the budget with a tracked override`
    );
})();

// ── Check 2: every adapter exists, points to the source, is not a copy ──────
(() => {
  const adapters = cfg.adapters || [];
  if (adapters.length === 0) return fail("2 adapters", "no adapters declared");
  const rootBase = path.basename(cfg.rootRulesFile || "");
  const max = cfg.maxAdapterBytes || 8192;
  const problems = [];
  for (const a of adapters) {
    if (!exists(a.file)) {
      problems.push(`${a.file} missing`);
      continue;
    }
    if (tracked.size && !isTracked(a.file)) problems.push(`${a.file} untracked`);
    const s = size(a.file);
    if (s > max) problems.push(`${a.file} = ${s} B > ${max} B (looks like a copy, not a pointer)`);
    if (rootBase && !read(a.file).includes(rootBase))
      problems.push(`${a.file} does not point to ${rootBase}`);
  }
  if (problems.length === 0)
    pass("2 adapters", `${adapters.length} adapters exist, point to ${rootBase}, all ≤ ${max} B`);
  else fail("2 adapters", problems.join("; "));
})();

// ── Check 3: agent configs are tracked (untracked = does not travel) ────────
(() => {
  const confs = cfg.agentConfigs || [];
  if (confs.length === 0)
    return skip(
      "3 configs-tracked",
      "none declared (root fits strictest budget natively — no override needed)"
    );
  const problems = [];
  for (const c of confs) {
    if (!exists(c)) problems.push(`${c} missing`);
    else if (tracked.size && !isTracked(c))
      problems.push(`${c} untracked (will not travel between machines)`);
  }
  if (problems.length === 0) pass("3 configs-tracked", `${confs.length} agent config(s) tracked`);
  else fail("3 configs-tracked", problems.join("; "));
})();

// ── Check 4: rule sequence intact (no gaps, no duplicates) ──────────────────
(() => {
  if (!cfg.ruleNumberPattern)
    return skip(
      "4 rule-sequence",
      "root uses sectioned layout, not a numbered rule list (no pattern configured)"
    );
  const re = new RegExp(cfg.ruleNumberPattern, "gm");
  const nums = [...read(cfg.rootRulesFile).matchAll(re)]
    .map((m) => Number(m[1]))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return fail("4 rule-sequence", "ruleNumberPattern matched nothing");
  const seen = new Set();
  const dupSet = new Set();
  for (const n of nums) {
    if (seen.has(n)) dupSet.add(n);
    else seen.add(n);
  }
  const dups = [...dupSet];
  const sorted = [...seen].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i] !== sorted[i - 1] + 1) gaps.push(`${sorted[i - 1]}→${sorted[i]}`);
  if (dups.length === 0 && gaps.length === 0)
    pass("4 rule-sequence", `rules ${sorted[0]}–${sorted[sorted.length - 1]} intact`);
  else
    fail(
      "4 rule-sequence",
      [dups.length ? `dups: ${dups.join(",")}` : "", gaps.length ? `gaps: ${gaps.join(",")}` : ""]
        .filter(Boolean)
        .join("; ")
    );
})();

// ── Check 5: no critical rule orphaned (required anchors live in the root) ───
(() => {
  const anchors = cfg.requiredAnchorsInRoot || [];
  if (anchors.length === 0) return skip("5 no-orphan", "no required anchors declared");
  const body = read(cfg.rootRulesFile);
  const missing = anchors.filter((a) => !body.includes(a));
  if (missing.length === 0)
    pass("5 no-orphan", `${anchors.length} required anchor(s) present in root`);
  else fail("5 no-orphan", `missing from root: ${missing.join(", ")}`);
})();

// ── Check 6: no parallel constitution (undeclared agent rules tree) ─────────
(() => {
  const dir = cfg.agentsDir;
  if (!dir || !exists(dir)) return skip("6 no-parallel", "no agentsDir to scan");
  const re = new RegExp(cfg.agentFilePattern || "^(CLAUDE|CODEX|GEMINI|AGENTS)\\.md$");
  const declared = new Set((cfg.adapters || []).map((a) => path.basename(a.file)));
  const allowed = new Set(cfg.nonAdapterAgentFiles || []);
  const max = cfg.maxAdapterBytes || 8192;
  const problems = [];
  for (const name of fs.readdirSync(abs(dir))) {
    if (!re.test(name)) continue;
    if (allowed.has(name)) continue;
    if (!declared.has(name)) {
      problems.push(
        `${name} is an agent rules file but is not a declared adapter (parallel constitution)`
      );
      continue;
    }
    const s = size(path.join(dir, name));
    if (s > max) problems.push(`${name} = ${s} B > ${max} B (diverging copy, not a pointer)`);
  }
  if (problems.length === 0) pass("6 no-parallel", `no parallel constitution in ${dir}`);
  else fail("6 no-parallel", problems.join("; "));
})();

// ── Check 7: no secret values committed (checked before any push) ───────────
(() => {
  const patterns = (cfg.secretPatterns || []).map((p) => new RegExp(p));
  if (patterns.length === 0) return skip("7 no-secrets", "no secret patterns declared");
  const exts = new Set(
    cfg.secretScanExtensions || [
      ".md",
      ".json",
      ".js",
      ".mjs",
      ".cjs",
      ".ts",
      ".toml",
      ".yml",
      ".yaml",
    ]
  );
  const excl = cfg.secretExcludeContains || [];
  const scanList = tracked.size ? [...tracked] : [];
  const hits = [];
  for (const rel of scanList) {
    if (excl.some((x) => rel.includes(x))) continue;
    const ext = path.extname(rel).toLowerCase();
    const base = path.basename(rel);
    if (!exts.has(ext) && !exts.has(base)) continue;
    const full = path.join(ROOT, rel);
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      continue;
    }
    if (!st.isFile() || st.size > 2 * 1024 * 1024) continue;
    const lines = fs.readFileSync(full, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const re of patterns)
        if (re.test(line)) {
          hits.push(`${rel}:${i + 1}`);
          break;
        }
    });
  }
  if (hits.length === 0)
    pass("7 no-secrets", `scanned ${scanList.length} tracked files, no live secrets`);
  else
    fail(
      "7 no-secrets",
      `possible secrets at: ${hits.slice(0, 20).join(", ")}${hits.length > 20 ? ` (+${hits.length - 20} more)` : ""}`
    );
})();

// ── Report ──────────────────────────────────────────────────────────────────
console.log(`\ncheck-agent-context · ${path.relative(process.cwd(), configPath) || configPath}`);
console.log(`repo: ${ROOT}\n`);
let failed = 0;
for (const r of results) {
  const mark = r.skipped ? "–" : r.ok ? "✓" : "✗";
  if (!r.ok) failed++;
  console.log(`  ${mark} ${r.name}: ${r.detail}`);
}
console.log("");
if (failed === 0) {
  console.log("GREEN — cross-agent layering holds (canon §6).\n");
  process.exit(0);
} else {
  console.log(`RED — ${failed} check(s) failed. Not "multi-agent" until green (canon §6).\n`);
  process.exit(1);
}
