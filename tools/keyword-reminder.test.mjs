#!/usr/bin/env node
/**
 * Tests for keyword-reminder.mjs — the generic UserPromptSubmit reminder engine.
 * The engine reads a sibling keyword-reminders.json and is config-driven, so we
 * COPY it into a tmp dir alongside a test config (the engine has no local imports).
 * This tests the engine's behavior without depending on, or mutating, any repo's
 * real reminders file. Pure Node, no deps. Run: node tools/keyword-reminder.test.mjs
 *
 * Guards the hook contract + the matching logic:
 *   - match → banner with the rule title + the matched patterns;
 *   - no match → no output;
 *   - per-pattern flags honored (case-sensitive acronym);
 *   - non-JSON stdin is treated as the prompt (never crashes);
 *   - missing / non-array config → no output;
 *   - ALWAYS exit 0 (a prompt hook must never block the prompt).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE_SRC = fileURLToPath(new URL("./keyword-reminder.mjs", import.meta.url));

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

const RULES = [
  {
    id: "hygiene",
    title: "REMINDER: command hygiene",
    patterns: ["\\bgit\\b"],
    message: ["use git -C"],
  },
  {
    id: "seal",
    title: "REMINDER: seal",
    patterns: [{ re: "\\bSEAL\\b", flags: "" }],
    message: "merge = seal",
  },
];

/** Copy the engine into a fresh dir; optionally drop a config beside it. */
function makeEngine(configValue) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "kwr-test-"));
  tmpdirs.push(dir);
  const engine = path.join(dir, "keyword-reminder.mjs");
  copyFileSync(ENGINE_SRC, engine);
  if (configValue !== undefined) {
    const body = typeof configValue === "string" ? configValue : JSON.stringify(configValue);
    writeFileSync(path.join(dir, "keyword-reminders.json"), body, "utf8");
  }
  return engine;
}

/** Pipe `input` to the engine on stdin; return { code, out }. */
function run(engine, input) {
  const r = spawnSync("node", [engine], { input, encoding: "utf8" });
  return { code: r.status ?? 1, out: r.stdout ?? "" };
}

// 1. Matching prompt → banner with title + the matched pattern, exit 0.
test("matching prompt → banner with title, exit 0", () => {
  const engine = makeEngine(RULES);
  const { code, out } = run(engine, JSON.stringify({ prompt: "please run git status" }));
  assert.equal(code, 0);
  assert.match(out, /command hygiene/);
  assert.match(out, /Matched:/);
});

// 2. Non-matching prompt → no output, exit 0.
test("non-matching prompt → no output, exit 0", () => {
  const engine = makeEngine(RULES);
  const { code, out } = run(engine, JSON.stringify({ prompt: "hello there" }));
  assert.equal(code, 0);
  assert.equal(out, "", `expected no output, got: ${out}`);
});

// 3. Per-pattern flags honored — case-sensitive acronym matches only uppercase.
test("case-sensitive pattern: SEAL matches, seal does not", () => {
  const engine = makeEngine(RULES);
  const upper = run(engine, JSON.stringify({ prompt: "time to SEAL it" }));
  assert.match(upper.out, /REMINDER: seal/, "uppercase SEAL should fire the rule");
  const lower = run(engine, JSON.stringify({ prompt: "time to seal it" }));
  assert.equal(lower.out, "", "lowercase seal must not fire a case-sensitive rule");
});

// 4. Non-JSON stdin is treated as the raw prompt (hook must not crash).
test("non-JSON stdin → treated as prompt, still matches, exit 0", () => {
  const engine = makeEngine(RULES);
  const { code, out } = run(engine, "raw text mentioning git directly");
  assert.equal(code, 0);
  assert.match(out, /command hygiene/);
});

// 5. No config file → no output, exit 0 (the kit's own state: engine ships config-less).
test("missing config → no output, exit 0", () => {
  const engine = makeEngine(undefined);
  const { code, out } = run(engine, JSON.stringify({ prompt: "git push now" }));
  assert.equal(code, 0);
  assert.equal(out, "", `expected no output with no config, got: ${out}`);
});

// 6. Non-array / malformed config → no output, exit 0 (never blocks the prompt).
test("malformed config → no output, exit 0", () => {
  const engine = makeEngine('{ "not": "an array" }');
  const { code, out } = run(engine, JSON.stringify({ prompt: "git push now" }));
  assert.equal(code, 0);
  assert.equal(out, "");
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\nkeyword-reminder: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
