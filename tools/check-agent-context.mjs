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
 * Usage:  node tools/check-agent-context.mjs [path/to/config.json] [--include-untracked]
 *   --include-untracked : also scan untracked working-tree files in the secret scan
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
const argv = process.argv.slice(2);
const includeUntracked = argv.includes("--include-untracked");
const configArg = argv.find((a) => !a.startsWith("--")) || "tools/agent-context.config.json";
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
// Scans the WHOLE repo, not just agentsDir (finding #2): a stray CLAUDE.md /
// AGENTS.md anywhere is exactly what a "parallel constitution" looks like. The
// root authority + declared adapters are auto-legit; every other pattern-matching
// file must be allowlisted (templates, examples, integration docs) or it fails.
(() => {
  const re = new RegExp(
    cfg.agentFilePattern ||
      "^(CLAUDE|CODEX|COPILOT_INSTRUCTIONS|WINDSURFRULES|GEMINI|AGENTS|AGENTS_GOLDEN)\\.md$"
  );
  if (tracked.size === 0)
    return skip("6 no-parallel", "not a git repo — cannot enumerate tracked files repo-wide");
  const norm = (p) => p.replace(/\\/g, "/");
  const legit = new Set();
  if (cfg.rootRulesFile) legit.add(norm(cfg.rootRulesFile));
  for (const a of cfg.adapters || []) legit.add(norm(a.file));
  for (const p of cfg.agentFileAllowlist || []) legit.add(norm(p));
  const allowedBasenames = new Set(cfg.nonAdapterAgentFiles || []); // legacy basename allowlist
  const problems = [];
  let scanned = 0;
  for (const rel of tracked) {
    const base = path.basename(rel);
    if (!re.test(base)) continue;
    scanned++;
    if (legit.has(rel) || allowedBasenames.has(base)) continue;
    problems.push(
      `${rel} matches the agent-rules pattern but is neither the declared root authority, a declared adapter, nor allowlisted (parallel constitution — declare it or allowlist it)`
    );
  }
  if (problems.length === 0)
    pass("6 no-parallel", `scanned repo-wide; ${scanned} agent-pattern file(s) all accounted for`);
  else fail("6 no-parallel", problems.join("; "));
})();

// ── Check 7: basic secret pattern scan (heuristic, NOT a full secret scanner) ─
// Honest scope (finding #5): this matches known provider key SHAPES in tracked
// text files. A clean result means "no matches for the configured patterns" — it
// does NOT prove the absence of secrets. By default it scans tracked files only;
// pass --include-untracked to also scan untracked working-tree files before a push.
(() => {
  const patterns = (cfg.secretPatterns || []).map((p) => new RegExp(p));
  if (patterns.length === 0) return skip("7 secret-scan", "no secret patterns declared");
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
  const scanSet = new Set(tracked);
  if (includeUntracked) {
    try {
      const others = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
        cwd: ROOT,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      })
        .split("\n")
        .map((s) => s.trim().replace(/\\/g, "/"))
        .filter(Boolean);
      for (const s of others) scanSet.add(s);
    } catch {
      /* not a git repo — nothing extra to add */
    }
  }
  const scanList = [...scanSet];
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
    for (let i = 0; i < lines.length; i++) {
      for (const re of patterns)
        if (re.test(lines[i])) {
          hits.push(`${rel}:${i + 1}`);
          break;
        }
    }
  }
  const scope = includeUntracked ? "tracked + untracked" : "tracked";
  if (hits.length === 0)
    pass(
      "7 secret-scan",
      `scanned ${scanList.length} ${scope} file(s); no matches for the basic secret patterns (heuristic — not a full secret scanner)`
    );
  else
    fail(
      "7 secret-scan",
      `possible secrets at: ${hits.slice(0, 20).join(", ")}${hits.length > 20 ? ` (+${hits.length - 20} more)` : ""}`
    );
})();

// ── Check 8: L1 neutrality fire-test (canon §8 — no brand in neutral cores) ──
// Finding F1 (Gemini) + F2 (Opus): a brand / product / org name committed into a
// neutral L1 file would otherwise pass GREEN. Word-boundary + case-insensitive
// match over the configured neutralL1Files. Org/methodology names are fine in
// L2/portal docs; these neutral cores must stay brand-free.
(() => {
  const brands = cfg.brandExclusionPatterns || [];
  const l1Files = cfg.neutralL1Files || [];
  if (brands.length === 0 || l1Files.length === 0)
    return skip("8 l1-neutrality", "no brandExclusionPatterns / neutralL1Files declared");
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const compiled = brands.map((b) => ({ b, re: new RegExp(`\\b${escapeRe(b)}\\b`, "i") }));
  const hits = [];
  for (const f of l1Files) {
    if (!exists(f)) {
      hits.push(`${f} (missing)`);
      continue;
    }
    const lines = read(f).split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const { b, re } of compiled) {
        if (re.test(lines[i])) {
          hits.push(`${f}:${i + 1} (${b})`);
          break;
        }
      }
    }
  }
  if (hits.length === 0)
    pass(
      "8 l1-neutrality",
      `${l1Files.length} neutral L1 file(s) clean of ${brands.length} brand pattern(s)`
    );
  else
    fail(
      "8 l1-neutrality",
      `brand/product name(s) in neutral L1: ${hits.slice(0, 20).join(", ")}${hits.length > 20 ? ` (+${hits.length - 20} more)` : ""}`
    );
})();

// ── Check 9: L2 product-neutrality (no product brand in the agnostic canon set) ─
// Counterpart to check 8: the L1 fire-test guards the few neutral cores; this guards
// the broader L2 canon/doc set (productScanDirs) against PRODUCT names (ViTo/Campus/
// WorkBench/…). Org names (VibeThink/VT-Method) and the architect's name are allowed
// here — only product brands are forbidden, so the kit names no product. Declared
// file/content exceptions (ecosystem port registry, dated research, the one verbatim
// architect-directive quote) are skipped.
(() => {
  const prods = cfg.productExclusionPatterns || [];
  const dirs = cfg.productScanDirs || [];
  if (prods.length === 0 || dirs.length === 0)
    return skip(
      "9 l2-product-neutrality",
      "no productExclusionPatterns / productScanDirs declared"
    );
  if (tracked.size === 0)
    return skip("9 l2-product-neutrality", "not a git repo — cannot enumerate tracked files");
  const exts = new Set(cfg.productScanExtensions || [".md", ".mjs", ".cjs", ".baseline"]);
  const fileExc = new Set((cfg.productScanFileExceptions || []).map((p) => p.replace(/\\/g, "/")));
  const contentExc = cfg.productScanContentExceptions || [];
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const compiled = prods.map((b) => ({ b, re: new RegExp(`\\b${escapeRe(b)}\\b`, "i") }));
  // Lines marked PROPOSED/DRAFT may name the reference implementation (fire-test:
  // genericized at seal) — skip them so a draft amendment doesn't false-RED.
  const draftMarkers = (cfg.productScanDraftMarkers || ["PROPOSED", "DRAFT"]).map(
    (m) => new RegExp(`\\b${escapeRe(m)}\\b`, "i")
  );
  const norm = (p) => p.replace(/\\/g, "/");
  const hits = [];
  for (const rel of tracked) {
    const r = norm(rel);
    if (!dirs.some((d) => r.startsWith(d.endsWith("/") ? d : `${d}/`))) continue;
    if (fileExc.has(r)) continue;
    const ext = path.extname(r).toLowerCase();
    const base = path.basename(r);
    if (!exts.has(ext) && !exts.has(base)) continue;
    const full = path.join(ROOT, r);
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      continue;
    }
    if (!st.isFile() || st.size > 2 * 1024 * 1024) continue;
    const lines = fs.readFileSync(full, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (contentExc.some((c) => line.includes(c))) continue;
      if (draftMarkers.some((m) => m.test(line))) continue; // PROPOSED/DRAFT line — ref-impl naming allowed until seal
      for (const { b, re } of compiled) {
        if (re.test(line)) {
          hits.push(`${r}:${i + 1} (${b})`);
          break;
        }
      }
    }
  }
  if (hits.length === 0)
    pass(
      "9 l2-product-neutrality",
      `scanned ${dirs.join(", ")} for ${prods.length} product name(s); none outside declared exceptions`
    );
  else
    fail(
      "9 l2-product-neutrality",
      `product name(s) in agnostic canon: ${hits.slice(0, 20).join(", ")}${hits.length > 20 ? ` (+${hits.length - 20} more)` : ""}`
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
