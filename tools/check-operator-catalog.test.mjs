#!/usr/bin/env node
/**
 * Tests for check-operator-catalog.mjs.
 * Honest gate cases: clean set, the three RED conditions, the comment/quote/
 * block-scalar/triggers-list scanner shapes (regressions for the adversarial
 * review findings M2/M3/D1/D2), the scan of the REAL shipped example, and the
 * CLI exit-code contract (green / red / setup / opted-out-skip), incl. the
 * SAFE-FAILURE cases that must fail LOUD (exit 2) not skip (M1, parse-gap).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  lintOperatorAdapter,
  parseEspansoAdapter,
  stripInlineComment,
} from "./check-operator-catalog.mjs";

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
function cli(args, cwd = KIT_ROOT) {
  return spawnSync("node", [TOOL, ...args], { cwd, encoding: "utf8" });
}
function triggers(text) {
  return parseEspansoAdapter(text).commands;
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

// ── comment stripping ──────────────────────────────────────────────────────

test("stripInlineComment: unquoted trailing comment removed, quoted # kept", () => {
  assert.equal(stripInlineComment('":x" # note').trim(), '":x"');
  assert.equal(stripInlineComment('"a # b"'), '"a # b"');
  assert.equal(stripInlineComment("# whole line"), "");
});

// ── IO scanner: parseEspansoAdapter ────────────────────────────────────────

test("scanner extracts trigger + inline body", () => {
  assert.deepEqual(triggers(['matches:', '  - trigger: ":x"', '    replace: "do x"'].join("\n")), [
    { trigger: ":x", hasBody: true },
  ]);
});

test("scanner flags empty inline body as no-body", () => {
  assert.deepEqual(triggers(['matches:', '  - trigger: ":empty"', '    replace: ""'].join("\n")), [
    { trigger: ":empty", hasBody: false },
  ]);
});

test("REGRESSION M3: replace that is only a comment → dead (no body)", () => {
  const cmds = triggers(['matches:', '  - trigger: ":x"', "    replace: # TODO write body"].join("\n"));
  assert.deepEqual(cmds, [{ trigger: ":x", hasBody: false }]);
});

test("REGRESSION M3: trailing comment on trigger line is not part of the trigger", () => {
  const cmds = triggers(
    ['matches:', '  - trigger: ":x"   # same again', '    replace: "a"', '  - trigger: ":x"', '    replace: "b"'].join("\n")
  );
  // both must normalize to :x so the lint sees the duplicate
  assert.deepEqual(cmds.map((c) => c.trigger), [":x", ":x"]);
  assert.equal(lintOperatorAdapter(cmds).ok, false);
});

test("REGRESSION D1: block-scalar body whose content is a markdown bullet → hasBody true", () => {
  const cmds = triggers(['matches:', '  - trigger: ":blk"', "    replace: |", "      - first step", "      - second"].join("\n"));
  assert.deepEqual(cmds, [{ trigger: ":blk", hasBody: true }]);
});

test("REGRESSION D1: empty block-scalar body → dead", () => {
  const cmds = triggers(['matches:', '  - trigger: ":blk"', "    replace: >-", '  - trigger: ":y"', '    replace: "b"'].join("\n"));
  assert.equal(cmds.find((c) => c.trigger === ":blk").hasBody, false);
  assert.equal(cmds.find((c) => c.trigger === ":y").hasBody, true);
});

test("REGRESSION D1: alternative body key (form:) counts as body", () => {
  const cmds = triggers(['matches:', '  - trigger: ":f"', '    form: "[[name]]"'].join("\n"));
  assert.deepEqual(cmds, [{ trigger: ":f", hasBody: true }]);
});

test("REGRESSION D1: replace declared BEFORE trigger in the same match", () => {
  const cmds = triggers(['matches:', '  - replace: "body first"', '    trigger: ":r"'].join("\n"));
  assert.deepEqual(cmds, [{ trigger: ":r", hasBody: true }]);
});

test("scanner: triggers: LIST form → each item a trigger sharing the body", () => {
  const cmds = triggers(['matches:', "  - triggers:", '      - ":a"', '      - ":b"', '    replace: "shared"'].join("\n"));
  assert.deepEqual(cmds, [
    { trigger: ":a", hasBody: true },
    { trigger: ":b", hasBody: true },
  ]);
});

test("REGRESSION D2: a `- \":foo\"` line inside a block body is NOT harvested as a trigger", () => {
  const cmds = triggers(
    ['matches:', '  - trigger: ":x"', "    replace: >-", '      mention - ":foo" in prose', '  - trigger: ":foo"', '    replace: "b"'].join("\n")
  );
  // only :x and :foo — the prose ":foo" must not create a duplicate
  assert.deepEqual(cmds.map((c) => c.trigger).sort(), [":foo", ":x"]);
  assert.equal(lintOperatorAdapter(cmds).ok, true);
});

test("scanner parses the REAL shipped example: 16 triggers, all with bodies", () => {
  const cmds = triggers(readFileSync(SHIPPED_EXAMPLE, "utf8"));
  assert.equal(cmds.length, 16, `expected 16 commands, got ${cmds.length}`);
  const noBody = cmds.filter((c) => !c.hasBody).map((c) => c.trigger);
  assert.deepEqual(noBody, [], `these have no body: ${noBody.join(", ")}`);
  assert.ok(cmds.some((c) => c.trigger === ":cristiano"));
  assert.ok(cmds.some((c) => c.trigger === ":repo-creds"));
});

test("shipped example passes the lint (clean)", () => {
  const { commands } = parseEspansoAdapter(readFileSync(SHIPPED_EXAMPLE, "utf8"));
  const { ok, problems } = lintOperatorAdapter(commands);
  assert.equal(ok, true, `shipped example not clean: ${JSON.stringify(problems)}`);
});

// ── CLI exit-code contract ──────────────────────────────────────────────────

test("CLI: default (shipped example) → exit 0 GREEN", () => {
  const r = cli([]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("CLI: KNOWN-BAD adapter (prefix collision) via config → exit 1 RED", () => {
  const bad = tmpAdapter(
    ['matches:', '  - trigger: ":handoff"', '    replace: "a"', '  - trigger: ":handoff-local"', '    replace: "b"'].join("\n")
  );
  const cfg = path.join(bad.dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: bad.file }), "utf8");
  const r = cli([cfg]);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /prefix-collision/);
});

test("REGRESSION M2: `matches: # comment` + a real duplicate → NOT skipped, exit 1", () => {
  const bad = tmpAdapter(
    ['matches: # my commands', '  - trigger: ":x"', '    replace: "a"', '  - trigger: ":x"', '    replace: "b"'].join("\n")
  );
  const cfg = path.join(bad.dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: bad.file }), "utf8");
  const r = cli([cfg]);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /duplicate-trigger/);
});

test("CLI: explicit missing config → exit 2 setup error", () => {
  const r = cli(["tools/does-not-exist.json"]);
  assert.equal(r.status, 2, r.stdout + r.stderr);
});

test("REGRESSION M1: config names a MISSING adapter → exit 2 (loud), NOT skip", () => {
  const { dir } = tmpAdapter("matches:\n");
  const cfg = path.join(dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: path.join(dir, "nope.yml") }), "utf8");
  const r = cli([cfg]);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /configured adapter not found/);
});

test("SAFE-FAILURE: adapter present but 0 commands parsed → exit 2, not GREEN", () => {
  const empty = tmpAdapter("matches:\n");
  const cfg = path.join(empty.dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: empty.file }), "utf8");
  const r = cli([cfg]);
  assert.equal(r.status, 2, r.stdout + r.stderr);
});

test("SAFE-FAILURE: a trigger declaration that yields no value (parse gap) → exit 2", () => {
  // `- trigger:` with no value → headerCount 1 but 0 commands → completeness check fires
  const gap = tmpAdapter(['matches:', "  - trigger:", '    replace: "x"'].join("\n"));
  const cfg = path.join(gap.dir, "cfg.json");
  writeFileSync(cfg, JSON.stringify({ adapter: gap.file }), "utf8");
  const r = cli([cfg]);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /not fully recognized|0 commands|trigger declaration/);
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
