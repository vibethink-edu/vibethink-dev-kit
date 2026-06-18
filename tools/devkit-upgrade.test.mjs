#!/usr/bin/env node
/**
 * Tests for devkit-upgrade.mjs — one-shot "get me to the latest kit".
 * Integration style: runs the real CLI over throwaway upstream/consumer dirs with
 * --no-pull (skip git) + --upstream-root (point at the temp upstream). Pure Node.
 * Run: node tools/devkit-upgrade.test.mjs
 *
 * Guards: dry-run previews but does NOT write; apply re-syncs a drifted copied
 * runnable from upstream → local; in-sync is a no-op; a missing upstream → exit 1.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./devkit-upgrade.mjs", import.meta.url));

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

/** A temp upstream (the "kit") + a temp consumer with a copy-parity config. */
function scaffold({ upstreamBody, localBody }) {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "tools"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  writeFileSync(path.join(upstream, "tools", "engine.mjs"), upstreamBody, "utf8");
  if (localBody !== null)
    writeFileSync(path.join(consumer, "tools", "engine.mjs"), localBody, "utf8");
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({
      upstreamRoot: "../upstream",
      copies: [{ local: "tools/engine.mjs", upstream: "tools/engine.mjs" }],
    })
  );
  return { upstream, consumer };
}

function run(consumer, upstream, extra = []) {
  // --no-tools: never trigger a real install-external-tools during tests/CI.
  const r = spawnSync(
    "node",
    [TOOL, "--no-pull", "--no-tools", "--upstream-root", upstream, ...extra],
    { cwd: consumer, encoding: "utf8" }
  );
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
const localOf = (consumer) => readFileSync(path.join(consumer, "tools", "engine.mjs"), "utf8");

// 1. Dry-run previews drift but writes nothing.
test("--dry-run → reports would-re-sync, does NOT write", () => {
  const { consumer, upstream } = scaffold({ upstreamBody: "v2\n", localBody: "v1\n" });
  const { code, out } = run(consumer, upstream, ["--dry-run"]);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /would re-sync 1/);
  assert.equal(localOf(consumer), "v1\n", "dry-run must not modify the local file");
});

// 2. Apply re-syncs the drifted runnable from upstream.
test("apply → re-syncs the drifted runnable", () => {
  const { consumer, upstream } = scaffold({ upstreamBody: "v2\n", localBody: "v1\n" });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /re-synced 1/);
  assert.equal(localOf(consumer), "v2\n", "apply must copy upstream → local");
});

// 3. Already in sync → no-op.
test("in-sync → all in sync, no copy", () => {
  const { consumer, upstream } = scaffold({ upstreamBody: "same\n", localBody: "same\n" });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0);
  assert.match(out, /all 1 in sync/);
});

// 4. Missing upstream file → exit 1 (a stale config is surfaced, not silent).
test("missing upstream → exit 1", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const consumer = path.join(root, "consumer");
  const upstream = path.join(root, "upstream");
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  mkdirSync(upstream, { recursive: true });
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [{ local: "tools/x.mjs", upstream: "tools/gone.mjs" }] })
  );
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /upstream missing/i);
});

// 5. The provisioner's own messages are SURFACED (not swallowed) — a fake
//    install-external-tools that echoes a marker must appear in the upgrade output.
//    (No --no-tools here; the temp scripts are inert echoes, safe to run.)
test("provision surfaces install-external-tools output", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "setup"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  // Both platform scripts echo the same marker + exit 0 (non-blocking, no real install).
  writeFileSync(
    path.join(upstream, "setup", "install-external-tools.sh"),
    '#!/usr/bin/env bash\necho "✓ graphify: ya instalado (MARKER-123)"\nexit 0\n'
  );
  writeFileSync(
    path.join(upstream, "setup", "install-external-tools.ps1"),
    'Write-Host "✓ graphify: ya instalado (MARKER-123)"\nexit 0\n'
  );
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [] })
  );
  const r = spawnSync("node", [TOOL, "--no-pull", "--upstream-root", upstream], {
    cwd: consumer,
    encoding: "utf8",
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  assert.equal(r.status ?? 1, 0, `expected exit 0\n${out}`);
  assert.match(
    out,
    /ya instalado \(MARKER-123\)/,
    "the provisioner's messages must be surfaced, not swallowed"
  );
});

// 6. Template-instantiation gap is surfaced: a config-backed template (`ports`) with no
//    consumer target is flagged "not instantiated"; the total is counted; a non-config
//    template (`adr`) just adds to the count. (--no-pull → canon-delta stays skipped.)
test("surfaces kit templates + flags a config-template not instantiated", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "setup", "templates", "ports"), { recursive: true });
  mkdirSync(path.join(upstream, "setup", "templates", "adr"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [] })
  );
  // consumer has NO tools/ports.config.json → ports is flagged not-instantiated.
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /Kit templates\s+2 available/);
  assert.match(out, /ports — copy setup\/templates\/ports\//);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ndevkit-upgrade: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
