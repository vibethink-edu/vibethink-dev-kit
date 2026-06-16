#!/usr/bin/env node
/**
 * Tests for check-tenant-contamination.mjs — core stays tenant-free
 * (CANON-VERTICAL-BOUNDARY-001: no tenant slug inside core paths).
 * Integration style: the tool walks corePaths under cwd, so we run it for real
 * over throwaway core trees in a tmp dir. Pure Node, no deps.
 * Run: node tools/check-tenant-contamination.test.mjs
 *
 * Guards: a slug in core is caught; a clean core passes; the escape hatches
 * (allowlist WITH reason, excludeGlobs, excludeDirs) work; a config that names
 * no slugs/corePaths fails closed rather than silently passing everything.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-tenant-contamination.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "tenant-test-"));
  tmpdirs.push(dir);
  return dir;
}

/** Write dir/rel with content, creating parent dirs. */
function writeFile(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
}

/** Write dir/config.json and run the tool with cwd=dir. */
function run(dir, config) {
  const cfgPath = path.join(dir, "config.json");
  writeFileSync(cfgPath, JSON.stringify(config), "utf8");
  const r = spawnSync("node", [TOOL, cfgPath], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const baseCfg = { corePaths: ["packages"], slugs: ["acme-tenant"] };

// 1. Clean core → exit 0.
test("clean core → CLEAN, exit 0", () => {
  const dir = makeDir();
  writeFile(dir, "packages/a.js", "export const x = 1;\n");
  const { code, out } = run(dir, baseCfg);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /CLEAN/);
});

// 2. A tenant slug inside a core file → exit 1, file:line reported.
test("slug in core file → contamination, exit 1", () => {
  const dir = makeDir();
  writeFile(dir, "packages/a.js", "// config for acme-tenant\nexport const x = 1;\n");
  const { code, out } = run(dir, baseCfg);
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /acme-tenant/);
  assert.match(out, /packages[\\/]a\.js:1/);
});

// 3. Allowlisted file WITH a reason → exit 0 (visible deviation, not a silent pass).
test("allowlisted offending file → CLEAN, exit 0", () => {
  const dir = makeDir();
  writeFile(dir, "packages/a.js", "// acme-tenant backfill\n");
  const { code, out } = run(dir, {
    ...baseCfg,
    allowlist: [{ path: "packages/a.js", reason: "identity backfill, approved ADR-X" }],
  });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /CLEAN/);
});

// 4. excludeGlobs path substring → file skipped.
test("excludeGlobs path → skipped, exit 0", () => {
  const dir = makeDir();
  writeFile(dir, "packages/vendor/v.js", "// acme-tenant vendored\n");
  const { code, out } = run(dir, { ...baseCfg, excludeGlobs: ["packages/vendor/"] });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /CLEAN/);
});

// 5. excludeDirs (node_modules by default) is never walked.
test("node_modules under core → not scanned, exit 0", () => {
  const dir = makeDir();
  writeFile(dir, "packages/node_modules/dep/index.js", "// acme-tenant in a dep\n");
  const { code } = run(dir, baseCfg);
  assert.equal(code, 0, "vendored deps must not be scanned");
});

// 6. A config with no slugs fails closed (won't silently pass an unscanned tree).
test("empty slugs → bad config, exit 1", () => {
  const dir = makeDir();
  writeFile(dir, "packages/a.js", "clean\n");
  const { code, out } = run(dir, { corePaths: ["packages"], slugs: [] });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /non-empty/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-tenant-contamination: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
