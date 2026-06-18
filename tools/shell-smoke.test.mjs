#!/usr/bin/env node
/**
 * shell-smoke.test.mjs — the FIRST automated coverage of the kit's shell tools.
 *
 * The gap (issue #123): every `.mjs` engine has a test in CI, but the shell tools
 * (`setup/check-tools.sh`, `setup/install-external-tools.sh`, `tools/mount-devkit.sh`)
 * had **none**, and CI runs Linux-only → it executed **0 `.sh`** automated. The OS-specific
 * surface — exactly where a non-Windows consumer hits problems first — was un-looked-at.
 *
 * This is the CHEAP half of the #123 DoD: a smoke that runs on the Linux runner.
 * It exercises every shell tool with `bash -n` (parse/syntax check) — zero side effects
 * (NEVER executes the installers, which would mutate the machine). A syntax error, an
 * unclosed quote, a broken heredoc — the most common cross-OS shell breakage — fails here.
 * Deeper behavioural coverage + the Windows/macOS runner matrix are the second half of
 * #123 (parked, unblocked by Rodrigo's macOS hand-run 2026-06-17).
 *
 * Guards against the silent-false-green trap (CANON-AUDIT-PROTOCOL §8.6 / §6.1): it asserts
 * at least one shell tool was found, so a broken glob or a deletion can't make it pass on zero.
 *
 * If `shellcheck` is on PATH it ALSO lints (advisory — never fails the smoke, since shellcheck
 * is not guaranteed on every runner). Pure Node + bash, zero deps.
 * Run: node tools/shell-smoke.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["tools", "setup"];

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

// Discover every shell tool under the scanned dirs.
function discoverShellTools() {
  const found = [];
  for (const dir of SCAN_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const name of readdirSync(abs)) {
      if (name.endsWith(".sh")) found.push(path.join(dir, name));
    }
  }
  return found.sort();
}

const shellTools = discoverShellTools();
console.log("\n🐚 shell-smoke — bash -n over the kit's shell tools (issue #123, cheap half)\n");
console.log(`   found: ${shellTools.length ? shellTools.join(", ") : "(none)"}\n`);

// 1. No silent zero: the smoke must actually have a surface to check (§8.6 / §6.1).
test("at least one shell tool is discovered (no silent-zero pass)", () => {
  assert.ok(
    shellTools.length >= 1,
    "no .sh tools found under tools/ or setup/ — a broken glob or deletion would make this smoke pass on nothing"
  );
});

// 2. bash must be available, or the smoke cannot run (fail loud, never silent-skip).
test("bash is available to parse the shell tools", () => {
  const r = spawnSync("bash", ["-c", "exit 0"], { encoding: "utf8" });
  assert.equal(
    r.status,
    0,
    `bash not runnable on this host: ${r.error?.message ?? "non-zero exit"}`
  );
});

// 3. Every shell tool parses cleanly (bash -n — syntax check, zero side effects).
for (const rel of shellTools) {
  test(`bash -n parses ${rel} (no syntax error)`, () => {
    const r = spawnSync("bash", ["-n", path.join(ROOT, rel)], { encoding: "utf8" });
    assert.equal(r.status, 0, `bash -n failed for ${rel}:\n${(r.stderr || r.stdout || "").trim()}`);
  });
}

// 4. Advisory: shellcheck lint if present (never fails the smoke — not guaranteed on a runner).
const haveShellcheck = spawnSync("shellcheck", ["--version"], { encoding: "utf8" }).status === 0;
if (haveShellcheck) {
  for (const rel of shellTools) {
    const r = spawnSync("shellcheck", ["-S", "error", path.join(ROOT, rel)], { encoding: "utf8" });
    if (r.status !== 0) {
      console.log(`  ◆ shellcheck (advisory) flagged ${rel}:\n${(r.stdout || "").trim()}`);
    }
  }
} else {
  console.log("  – shellcheck not on PATH — lint skipped (advisory only; bash -n is the gate)");
}

console.log(`\nshell-smoke: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
