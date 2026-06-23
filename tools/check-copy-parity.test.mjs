#!/usr/bin/env node
/**
 * Tests for check-copy-parity.mjs — the ADR-20260524 §3.1 drift guard.
 *
 * A gate must bite a known-bad case (REVIEW-CALL-CHECKLIST control #4): these
 * tests build throwaway consumer+upstream trees with controlled content and
 * assert the verdict AND the exit code for every mode: parity, CRLF-vs-LF
 * neutrality, real drift, declared adaptation, undeclared-reason adaptation,
 * missing files, and setup errors.
 *
 * Pure Node, no deps. Run: node tools/check-copy-parity.test.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-copy-parity.mjs");

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

/** Build a consumer dir + upstream dir, write files, run the engine from the consumer. */
function run({ consumerFiles = {}, upstreamFiles = {}, config, args = [] }) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "copy-parity-test-"));
  const consumer = path.join(base, "consumer");
  const upstream = path.join(base, "upstream");
  fs.mkdirSync(consumer, { recursive: true });
  fs.mkdirSync(upstream, { recursive: true });
  for (const [rel, content] of Object.entries(consumerFiles)) {
    const p = path.join(consumer, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  for (const [rel, content] of Object.entries(upstreamFiles)) {
    const p = path.join(upstream, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  if (config !== undefined) {
    fs.mkdirSync(path.join(consumer, "tools"), { recursive: true });
    fs.writeFileSync(
      path.join(consumer, "tools", "copy-parity.config.json"),
      JSON.stringify(config)
    );
  }
  let code = 0;
  let out = "";
  try {
    out = execFileSync(
      "node",
      [ENGINE, "tools/copy-parity.config.json", "--upstream-root", upstream, ...args],
      { cwd: consumer, encoding: "utf8" }
    );
  } catch (e) {
    code = e.status ?? 1;
    out = `${e.stdout || ""}${e.stderr || ""}`;
  }
  fs.rmSync(base, { recursive: true, force: true });
  return { code, out };
}

console.log("\ncheck-copy-parity tests\n");

test("identical copy → GREEN, exit 0", () => {
  const { code, out } = run({
    consumerFiles: { "scripts/engine.mjs": "console.log('x');\n" },
    upstreamFiles: { "tools/engine.mjs": "console.log('x');\n" },
    config: { copies: [{ local: "scripts/engine.mjs", upstream: "tools/engine.mjs" }] },
  });
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("CRLF copy of LF upstream → still parity (modulo line endings), exit 0", () => {
  const { code, out } = run({
    consumerFiles: { "scripts/engine.mjs": "a();\r\nb();\r\n" },
    upstreamFiles: { "tools/engine.mjs": "a();\nb();\n" },
    config: { copies: [{ local: "scripts/engine.mjs", upstream: "tools/engine.mjs" }] },
  });
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("real content drift → RED, exit 1, names the pair + diff hint", () => {
  const { code, out } = run({
    consumerFiles: { "scripts/engine.mjs": "console.log('patched locally');\n" },
    upstreamFiles: { "tools/engine.mjs": "console.log('upstream');\n" },
    config: { copies: [{ local: "scripts/engine.mjs", upstream: "tools/engine.mjs" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /DRIFT/);
  assert.match(out, /scripts\/engine\.mjs/);
  assert.match(out, /git diff --no-index/);
});

test("declared adaptation (with reason) → visible ADAPTED, exit 0", () => {
  const { code, out } = run({
    consumerFiles: { "scripts/engine.mjs": "console.log('deliberately different');\n" },
    upstreamFiles: { "tools/engine.mjs": "console.log('upstream');\n" },
    config: {
      copies: [
        {
          local: "scripts/engine.mjs",
          upstream: "tools/engine.mjs",
          adapted: { reason: "consumer lane filter", since: "2026-06-01" },
        },
      ],
    },
  });
  assert.equal(code, 0, out);
  assert.match(out, /ADAPTED \(declared\): consumer lane filter/);
});

test("adapted WITHOUT reason → RED, exit 1 (adaptation must declare why)", () => {
  const { code, out } = run({
    consumerFiles: { "scripts/engine.mjs": "x\n" },
    upstreamFiles: { "tools/engine.mjs": "y\n" },
    config: {
      copies: [{ local: "scripts/engine.mjs", upstream: "tools/engine.mjs", adapted: {} }],
    },
  });
  assert.equal(code, 1, out);
  assert.match(out, /without a reason/);
});

test("missing local copy → RED, exit 1", () => {
  const { code, out } = run({
    upstreamFiles: { "tools/engine.mjs": "x\n" },
    config: { copies: [{ local: "scripts/engine.mjs", upstream: "tools/engine.mjs" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /local copy MISSING/);
});

test("missing upstream source → RED, exit 1 (copy points at nothing)", () => {
  const { code, out } = run({
    consumerFiles: { "scripts/engine.mjs": "x\n" },
    config: { copies: [{ local: "scripts/engine.mjs", upstream: "tools/engine.mjs" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /upstream source MISSING/);
});

test("empty copies list → notice, exit 0 (nothing declared, nothing checked)", () => {
  const { code, out } = run({ config: { copies: [] } });
  assert.equal(code, 0, out);
  assert.match(out, /No copies declared/);
});

test("missing config → setup error, exit 2 (fail-closed when invoked explicitly)", () => {
  const { code, out } = run({});
  assert.equal(code, 2, out);
  assert.match(out, /config not found/);
});

test("missing upstream root → setup error, exit 2", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "copy-parity-test-"));
  const consumer = path.join(base, "consumer");
  fs.mkdirSync(path.join(consumer, "tools"), { recursive: true });
  fs.writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [{ local: "a", upstream: "b" }] })
  );
  let code = 0;
  let out = "";
  try {
    out = execFileSync(
      "node",
      [ENGINE, "tools/copy-parity.config.json", "--upstream-root", path.join(base, "nope")],
      { cwd: consumer, encoding: "utf8" }
    );
  } catch (e) {
    code = e.status ?? 1;
    out = `${e.stdout || ""}${e.stderr || ""}`;
  }
  fs.rmSync(base, { recursive: true, force: true });
  assert.equal(code, 2, out);
  assert.match(out, /upstream root does not exist/);
});

// ── Directory-set entries ──────────────────────────────────────────────────

test("dir: identical tree → GREEN, exit 0, counts files", () => {
  const { code, out } = run({
    consumerFiles: {
      "packages/p/src/a.ts": "export const a=1;\n",
      "packages/p/src/sub/b.ts": "export const b=2;\n",
    },
    upstreamFiles: {
      "packages/p/src/a.ts": "export const a=1;\n",
      "packages/p/src/sub/b.ts": "export const b=2;\n",
    },
    config: { copies: [{ localDir: "packages/p/src", upstreamDir: "packages/p/src" }] },
  });
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
  assert.match(out, /\(2 files\)/);
});

test("dir: a drifted file → RED, exit 1, names the file", () => {
  const { code, out } = run({
    consumerFiles: { "packages/p/src/a.ts": "export const a=999;\n" },
    upstreamFiles: { "packages/p/src/a.ts": "export const a=1;\n" },
    config: { copies: [{ localDir: "packages/p/src", upstreamDir: "packages/p/src" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /DRIFT: a\.ts/);
});

test("dir: file present upstream but missing locally → RED, exit 1 (rot)", () => {
  const { code, out } = run({
    consumerFiles: { "packages/p/src/a.ts": "x\n" },
    upstreamFiles: { "packages/p/src/a.ts": "x\n", "packages/p/src/new.ts": "y\n" },
    config: { copies: [{ localDir: "packages/p/src", upstreamDir: "packages/p/src" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /local MISSING: new\.ts/);
});

test("dir: extra local file absent upstream → RED, exit 1", () => {
  const { code, out } = run({
    consumerFiles: { "packages/p/src/a.ts": "x\n", "packages/p/src/extra.ts": "z\n" },
    upstreamFiles: { "packages/p/src/a.ts": "x\n" },
    config: { copies: [{ localDir: "packages/p/src", upstreamDir: "packages/p/src" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /extra local \(absent upstream\): extra\.ts/);
});

test("dir: excluded segment (node_modules) ignored → GREEN, exit 0", () => {
  const { code, out } = run({
    consumerFiles: {
      "packages/p/src/a.ts": "x\n",
      "packages/p/src/node_modules/junk.ts": "LOCAL\n",
    },
    upstreamFiles: { "packages/p/src/a.ts": "x\n" },
    config: {
      copies: [
        { localDir: "packages/p/src", upstreamDir: "packages/p/src", exclude: ["node_modules"] },
      ],
    },
  });
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("dir: CRLF-vs-LF neutral within a tree → GREEN, exit 0", () => {
  const { code, out } = run({
    consumerFiles: { "packages/p/src/a.ts": "a();\r\nb();\r\n" },
    upstreamFiles: { "packages/p/src/a.ts": "a();\nb();\n" },
    config: { copies: [{ localDir: "packages/p/src", upstreamDir: "packages/p/src" }] },
  });
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("dir: declared adaptation (with reason) → ADAPTED, exit 0", () => {
  const { code, out } = run({
    consumerFiles: { "packages/p/src/a.ts": "LOCAL\n" },
    upstreamFiles: { "packages/p/src/a.ts": "UPSTREAM\n" },
    config: {
      copies: [
        {
          localDir: "packages/p/src",
          upstreamDir: "packages/p/src",
          adapted: { reason: "consumer fork" },
        },
      ],
    },
  });
  assert.equal(code, 0, out);
  assert.match(out, /ADAPTED \(declared\): consumer fork/);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
