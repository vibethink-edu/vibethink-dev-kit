#!/usr/bin/env node
/**
 * Tests for check-operator-catalog.mjs.
 * Honest gate cases: clean set, the three RED conditions (dead-command,
 * duplicate-trigger, prefix-collision), the Espanso scanner against the REAL
 * shipped example, and the CLI exit codes (green / red / setup / skip).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { lintOperatorAdapter, parseEspansoAdapter } from "./check-operator-catalog.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = path.join(HERE, "check-operator-catalog.mjs");
const KIT_ROOT = path.resolve(HERE, "..");
const SHIPPED_EXAMPLE = path.join(
  KIT_ROOT,
  "setup/templates/operator-command-expanders/operator-commands.example.yml"
);

let pass = 0;
let fail = 0;
const tmpdirs = [];

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  OK   ${name}`);
  } catch (error) {
    fail++;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

function tmpAdapter(content) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "opcat-test-"));
  tmpdirs.push(dir);
  const file = path.join(dir, "adapter.yml");
  writeFileSync(file, content, "utf8");
  return { dir, file };
}

// ── pure core: lintOperatorAdapter ─────────────────────────────────────────

test("clean set → ok", () => {
  const { ok, problems } = lintOperatorAdapter([
    { trigger: ":repo-health", hasBody: true },
    { trigger: ":repo-creds", hasBody: true },
    { trigger: ":handoff-local", hasBody: true },
  ]);
  assert.equal(ok, true);
  assert.equal(problems.length, 0);
});

test("KNOWN-BAD: dead-command (empty body) → RED", () => {
  const { ok, problems } = lintOperatorAdapter([
    { trigger: ":repo-health", hasBody: true },
    { trigger: ":dead", hasBody: false },
  ]);
  assert.equal(ok, false);
  assert.ok(problems.some((p) => p.kind === "dead-command" && p.trigger === ":dead"));
});

test("KNOWN-BAD: duplicate-trigger → RED", () => {
  const { ok, problems } = lintOperatorAdapter([
    { trigger: ":owner", hasBody: true },
    { trigger: ":owner", hasBody: true },
  ]);
  assert.equal(ok, false);
  assert.ok(problems.some((p) => p.kind === "duplicate-trigger" && p.trigger === ":owner"));
});

test("KNOWN-BAD: prefix-collision (:handoff prefix of :handoff-local) → RED", () => {
  const { ok, problems } = lintOperatorAdapter([
    { trigger: ":handoff", hasBody: true },
    { trigger: ":handoff-local", hasBody: true },
  ]);
  assert.equal(ok, false);
  assert.ok(
    problems.some(
      (p) => p.kind === "prefix-collision" && p.trigger === ":handoff" && p.other === ":handoff-local"
    )
  );
});

test("no false prefix-collision on non-prefix pair (:repo-health / :repo-creds)", () => {
  const { ok } = lintOperatorAdapter([
    { trigger: ":repo-health", hasBody: true },
    { trigger: ":repo-creds", hasBody: true },
  ]);
  assert.equal(ok, true);
});

// ── IO scanner: parseEspansoAdapter ────────────────────────────────────────

test("scanner extracts trigger + inline body", () => {
  const cmds = parseEspansoAdapter(
    ["matches:", '  - trigger: ":x"', '    replace: "do x"'].join("\n")
  );
  assert.deepEqual(cmds, [{ trigger: ":x", hasBody: true }]);
});

test("scanner flags empty inline body as no-body", () => {
  const cmds = parseEspansoAdapter(
    ["matches:", '  - trigger: ":empty"', '    replace: ""'].join("\n")
  );
  assert.deepEqual(cmds, [{ trigger: ":empty", hasBody: false }]);
});

test("scanner: block-scalar body with content → hasBody true", () => {
  const cmds = parseEspansoAdapter(
    ["matches:", '  - trigger: ":blk"', "    replace: >-", "      real body"].join("\n")
  );
  assert.deepEqual(cmds, [{ trigger: ":blk", hasBody: true }]);
});

test("scanner parses the REAL shipped example: 16 triggers, all with bodies", () => {
  const text = readFileSync(SHIPPED_EXAMPLE, "utf8");
  const cmds = parseEspansoAdapter(text);
  assert.equal(cmds.length, 16, `expected 16 commands, got ${cmds.length}`);
  const noBody = cmds.filter((c) => !c.hasBody).map((c) => c.trigger);
  assert.deepEqual(noBody, [], `these have no body: ${noBody.join(", ")}`);
  assert.ok(cmds.some((c) => c.trigger === ":cristiano"));
  assert.ok(cmds.some((c) => c.trigger === ":repo-creds"));
});

test("shipped example passes the lint (clean)", () => {
  const text = readFileSync(SHIPPED_EXAMPLE, "utf8");
  const { ok, problems } = lintOperatorAdapter(parseEspansoAdapter(text));
  assert.equal(ok, true, `shipped example not clean: ${JSON.stringify(problems)}`);
});

// ── CLI exit codes ─────────────────────────────────────────────────────────

test("CLI: default (shipped example) → exit 0 GREEN", () => {
  const r = spawnSync("node", [TOOL], { cwd: KIT_ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("CLI: KNOWN-BAD adapter via config → exit 1 RED", () => {
  const bad = tmpAdapter(
    ["matches:", '  - trigger: ":handoff"', '    replace: "a"', '  - trigger: ":handoff-local"', '    replace: "b"'].join("\n")
  );
  const cfg = path.join(bad.dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: bad.file }), "utf8");
  const r = spawnSync("node", [TOOL, cfg], { cwd: KIT_ROOT, encoding: "utf8" });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /prefix-collision/);
});

test("CLI: explicit missing config → exit 2 setup error", () => {
  const r = spawnSync("node", [TOOL, "tools/does-not-exist.json"], {
    cwd: KIT_ROOT,
    encoding: "utf8",
  });
  assert.equal(r.status, 2, r.stdout + r.stderr);
});

test("CLI: config points at missing adapter → exit 0 skip", () => {
  const { dir } = tmpAdapter("matches:\n");
  const cfg = path.join(dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: path.join(dir, "nope.yml") }), "utf8");
  const r = spawnSync("node", [TOOL, cfg], { cwd: KIT_ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /skip/);
});

// ── teardown ────────────────────────────────────────────────────────────────

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ncheck-operator-catalog.test: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
