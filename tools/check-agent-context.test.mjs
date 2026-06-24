#!/usr/bin/env node
/**
 * Negative-regression tests for check-agent-context.mjs — the smoke gate itself.
 *
 * Finding F2 (Opus): the gate that guards every fork had no test of its own. A
 * gate must bite a known-bad case (REVIEW-CALL-CHECKLIST control #4). This builds
 * throwaway git repos with deliberate violations and asserts the relevant check
 * FAILS — covering neutrality (F1), secret-scan, and root-budget.
 *
 * Pure Node, no deps. Run: node tools/check-agent-context.test.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SMOKE = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-agent-context.mjs");

let pass = 0;
let fail = 0;
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.log(`  ✗ ${name}\n    ${e.message}`);
  }
}

// Build a throwaway git repo with the given files + config, run the smoke,
// return { code, out }. A real git repo so the gate's `git ls-files` works.
function runSmoke(files, config) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "smoke-test-"));
  try {
    for (const [rel, content] of Object.entries(files)) {
      const full = path.join(dir, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
    fs.writeFileSync(path.join(dir, "ctx.config.json"), JSON.stringify(config, null, 2));
    execFileSync("git", ["init", "-q"], { cwd: dir });
    execFileSync("git", ["add", "-A"], { cwd: dir });
    let code = 0;
    let out = "";
    try {
      out = execFileSync("node", [SMOKE, "ctx.config.json"], { cwd: dir, encoding: "utf8" });
    } catch (e) {
      code = e.status ?? 1;
      out = `${e.stdout || ""}${e.stderr || ""}`;
    }
    return { code, out };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// A config + files that pass the structural checks, so a test can isolate ONE failure.
const baseConfig = (extra = {}) => ({
  rootRulesFile: "AGENTS.md",
  agentBudgets: { codex: 32768, claude: 1000000 },
  adapters: [{ agent: "codex", file: "CODEX.md" }],
  maxAdapterBytes: 6144,
  ...extra,
});
const baseFiles = (extra = {}) => ({
  "AGENTS.md": "# root rules\nCANON-CROSS-AGENT-CONTEXT-LAYERING\n",
  "CODEX.md": "see AGENTS.md\n",
  ...extra,
});

// ── F1 / neutrality ─────────────────────────────────────────────────────────
test("neutrality: brand in a neutral L1 file → '8 l1-neutrality' FAILS + exit 1", () => {
  const { code, out } = runSmoke(
    baseFiles({ "L1.md": "# neutral core\nThis paragraph mentions ViTo by name.\n" }),
    baseConfig({ brandExclusionPatterns: ["ViTo", "XMS"], neutralL1Files: ["L1.md"] })
  );
  assert.match(out, /✗ 8 l1-neutrality/, "check 8 must FAIL on a brand hit");
  assert.equal(code, 1, "smoke must exit non-zero when a check fails");
});

test("neutrality: clean neutral L1 → '8 l1-neutrality' PASSES", () => {
  const { out } = runSmoke(
    baseFiles({ "L1.md": "# neutral core\nNo product names here whatsoever.\n" }),
    baseConfig({ brandExclusionPatterns: ["ViTo", "XMS"], neutralL1Files: ["L1.md"] })
  );
  assert.match(out, /✓ 8 l1-neutrality/, "check 8 must PASS on a clean neutral file");
});

test("neutrality: word-boundary avoids substring false positives", () => {
  const { out } = runSmoke(
    baseFiles({
      "L1.md": "# neutral\nThe word 'invito' has those letters but is not the brand.\n",
    }),
    baseConfig({ brandExclusionPatterns: ["ViTo"], neutralL1Files: ["L1.md"] })
  );
  assert.match(out, /✓ 8 l1-neutrality/, "'vito' inside 'invito' must not match \\bViTo\\b");
});

test("neutrality: not configured → '8 l1-neutrality' SKIPS (no false fail)", () => {
  const { out } = runSmoke(baseFiles(), baseConfig());
  assert.match(out, /– 8 l1-neutrality/, "check 8 must skip when not configured");
});

// ── L2 product-neutrality (check 9) ─────────────────────────────────────────
test("product-neutrality: product name in an L2 canon → '9 l2-product-neutrality' FAILS + exit 1", () => {
  const { code, out } = runSmoke(
    baseFiles({ "knowledge/canon.md": "# canon\nThis L2 doc names ViTo as the platform.\n" }),
    baseConfig({
      productExclusionPatterns: ["ViTo", "Campus"],
      productScanDirs: ["knowledge"],
      productScanExtensions: [".md"],
    })
  );
  assert.match(
    out,
    /✗ 9 l2-product-neutrality/,
    "check 9 must FAIL on a product name in an L2 doc"
  );
  assert.equal(code, 1, "smoke must exit non-zero when a check fails");
});

test("product-neutrality: clean L2 canon → '9 l2-product-neutrality' PASSES", () => {
  const { out } = runSmoke(
    baseFiles({ "knowledge/canon.md": "# canon\nA fully agnostic doc, no product names.\n" }),
    baseConfig({
      productExclusionPatterns: ["ViTo", "Campus"],
      productScanDirs: ["knowledge"],
      productScanExtensions: [".md"],
    })
  );
  assert.match(out, /✓ 9 l2-product-neutrality/, "check 9 must PASS on a clean L2 doc");
});

test("product-neutrality: org name (VibeThink) allowed in L2 → '9 l2-product-neutrality' PASSES", () => {
  const { out } = runSmoke(
    baseFiles({
      "knowledge/canon.md": "# canon\nThe VibeThink VT-Method is the L2 house binding.\n",
    }),
    baseConfig({
      productExclusionPatterns: ["ViTo", "Campus"],
      productScanDirs: ["knowledge"],
      productScanExtensions: [".md"],
    })
  );
  assert.match(
    out,
    /✓ 9 l2-product-neutrality/,
    "org names (VibeThink) must not trip the product scan"
  );
});

test("product-neutrality: declared file exception (port registry) is skipped → PASSES", () => {
  const { out } = runSmoke(
    baseFiles({ "knowledge/PORTS.md": "# registry\nViTo 3000-3099, Campus 3400-3409.\n" }),
    baseConfig({
      productExclusionPatterns: ["ViTo", "Campus"],
      productScanDirs: ["knowledge"],
      productScanExtensions: [".md"],
      productScanFileExceptions: ["knowledge/PORTS.md"],
    })
  );
  assert.match(out, /✓ 9 l2-product-neutrality/, "a declared file exception must not trip check 9");
});

test("product-neutrality: declared content exception (verbatim quote) is skipped → PASSES", () => {
  const { out } = runSmoke(
    baseFiles({
      "knowledge/canon.md":
        '# canon\nQuoting the directive: "keep ViTo out of the agnostic core".\n',
    }),
    baseConfig({
      productExclusionPatterns: ["ViTo"],
      productScanDirs: ["knowledge"],
      productScanExtensions: [".md"],
      productScanContentExceptions: ["keep ViTo out of the agnostic core"],
    })
  );
  assert.match(
    out,
    /✓ 9 l2-product-neutrality/,
    "a declared content exception must not trip check 9"
  );
});

test("product-neutrality: a PROPOSED/DRAFT line may name the ref-impl → '9 l2-product-neutrality' PASSES", () => {
  const { out } = runSmoke(
    baseFiles({
      "knowledge/canon.md":
        "# canon\n**Amendment — PROPOSED (pending seal):** surfaced by ViTo's diagnosis.\n",
    }),
    baseConfig({
      productExclusionPatterns: ["ViTo"],
      productScanDirs: ["knowledge"],
      productScanExtensions: [".md"],
    })
  );
  assert.match(
    out,
    /✓ 9 l2-product-neutrality/,
    "a PROPOSED/DRAFT line must not trip check 9 (fire-test allows ref-impl naming in draft)"
  );
});

// ── secret-scan ─────────────────────────────────────────────────────────────
test("secret-scan: fake AWS key shape → '7 secret-scan' FAILS + exit 1", () => {
  const { code, out } = runSmoke(
    baseFiles({ "leak.md": "aws: AKIAIOSFODNN7EXAMPLE\n" }),
    baseConfig({ secretPatterns: ["AKIA[0-9A-Z]{16}"] })
  );
  assert.match(out, /✗ 7 secret-scan/, "check 7 must FAIL on a key shape");
  assert.equal(code, 1, "smoke must exit non-zero");
});

// ── root-budget (size) ──────────────────────────────────────────────────────
test("root-budget: oversized root → '1 root-budget' FAILS + exit 1", () => {
  const { code, out } = runSmoke(
    { "AGENTS.md": `# root\n${"x".repeat(40000)}\n`, "CODEX.md": "see AGENTS.md\n" },
    baseConfig()
  );
  assert.match(out, /✗ 1 root-budget/, "check 1 must FAIL when root exceeds the strictest budget");
  assert.equal(code, 1, "smoke must exit non-zero");
});

// ── sanity: a fully valid minimal repo is GREEN ─────────────────────────────
test("sanity: minimal valid repo → GREEN (exit 0)", () => {
  const { code, out } = runSmoke(baseFiles(), baseConfig());
  assert.equal(code, 0, "a structurally valid minimal repo must be green");
  assert.match(out, /GREEN/, "report must say GREEN");
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
