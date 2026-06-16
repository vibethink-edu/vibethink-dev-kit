#!/usr/bin/env node
/**
 * Tests for check-feature-docs.mjs — makes CANON-DEVELOPMENT-PROCESS §5/§6 bite.
 * Integration style: the gate reads a config and resolves paths against cwd, so we run
 * it for real over throwaway configs/files in tmp dirs. Pure Node, no deps.
 * Run: node tools/check-feature-docs.test.mjs
 *
 * Guards the silent-gap teeth: a feature dir missing a required artifact fails; a unit
 * that carries all of them passes; null is a conscious N-A; a missing config is a setup
 * error, not a silent pass.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-feature-docs.mjs", import.meta.url));

let pass = 0;
let fail = 0;
const tmpdirs = [];
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

function makeDir() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "feature-docs-test-"));
  tmpdirs.push(dir);
  return dir;
}

/** Write dir/<rel> (creating parent dirs); JSON-stringify objects. */
function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content), "utf8");
}

/** Write dir/feature-docs.config.json and run the gate with cwd=dir. */
function run(dir, config) {
  write(dir, "feature-docs.config.json", config);
  const r = spawnSync("node", [TOOL, "feature-docs.config.json"], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. All-null → conscious N-A → GREEN.
test("all sections null → N-A, exit 0", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: null },
    findings: { location: null },
  });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 2. Binding declared but missing → RED.
test("binding declared but missing → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    binding: "AGENTS.md",
    featureScope: { root: null },
    findings: { location: null },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /missing or empty/);
});

// 3. Binding present + non-empty → GREEN.
test("binding present → carried, exit 0", () => {
  const dir = makeDir();
  write(dir, "AGENTS.md", "# binding\nROADMAP role → ROADMAP.md\n");
  const { code, out } = run(dir, {
    binding: "AGENTS.md",
    featureScope: { root: null },
    findings: { location: null },
  });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 4. Feature root declared but not a directory → RED.
test("featureScope root not a dir → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: "docs/features", requiredArtifacts: ["ROADMAP.md"] },
    findings: { location: null },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /not a directory/);
});

// 5. Feature root declared but requiredArtifacts empty → RED (nothing would be enforced).
test("featureScope requiredArtifacts empty → exit 1", () => {
  const dir = makeDir();
  mkdirSync(path.join(dir, "docs/features"), { recursive: true });
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: "docs/features", requiredArtifacts: [] },
    findings: { location: null },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /requiredArtifacts is empty/);
});

// 6. A feature dir missing a required artifact → RED.
test("feature dir missing an artifact → exit 1", () => {
  const dir = makeDir();
  write(dir, "docs/features/alpha/ROADMAP.md", "# roadmap\n");
  // alpha has ROADMAP but no LOG.md
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: "docs/features", requiredArtifacts: ["ROADMAP.md", "LOG.md"] },
    findings: { location: null },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /is missing "LOG.md"/);
});

// 7. Every feature dir carries all required artifacts → GREEN.
test("all units carry artifacts → carried, exit 0", () => {
  const dir = makeDir();
  write(dir, "docs/features/alpha/ROADMAP.md", "# roadmap\n");
  write(dir, "docs/features/alpha/LOG.md", "# log\n");
  write(dir, "docs/features/beta/ROADMAP.md", "# roadmap\n");
  write(dir, "docs/features/beta/LOG.md", "# log\n");
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: "docs/features", requiredArtifacts: ["ROADMAP.md", "LOG.md"] },
    findings: { location: null },
  });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 8. An empty (zero-byte) artifact counts as missing → RED.
test("zero-byte artifact counts as missing → exit 1", () => {
  const dir = makeDir();
  write(dir, "docs/features/alpha/ROADMAP.md", "");
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: "docs/features", requiredArtifacts: ["ROADMAP.md"] },
    findings: { location: null },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /is missing "ROADMAP.md"/);
});

// 9. Findings location declared but missing → RED.
test("findings location missing → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    binding: null,
    featureScope: { root: null },
    findings: { location: "docs/comms" },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /does not exist/);
});

// 10. No config file at all → setup error (exit 2), not a silent pass.
test("no config file → setup error, exit 2", () => {
  const dir = makeDir();
  const r = spawnSync("node", [TOOL, "feature-docs.config.json"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 2, `expected exit 2, got ${r.status}`);
  assert.match(`${r.stdout ?? ""}${r.stderr ?? ""}`, /config not found/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-feature-docs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
