#!/usr/bin/env node
/**
 * Tests for check-knowledge-memory-freshness.mjs and kdd-refresh.mjs.
 *
 * Proves the KDD memory harness goes GREEN after a manifest refresh and RED when
 * accepted source knowledge, adapter config, required index artifacts, or the manifest
 * itself is stale/missing. Pure Node, no deps.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHECK = fileURLToPath(new URL("./check-knowledge-memory-freshness.mjs", import.meta.url));
const REFRESH = fileURLToPath(new URL("./kdd-refresh.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "kdd-memory-test-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content, null, 2), "utf8");
}

function baseConfig(overrides = {}) {
  return {
    manifestPath: "docs/knowledge/.kdd-memory-manifest.json",
    sourceRoots: ["docs/knowledge"],
    sourceExtensions: [".md", ".json"],
    sourcePackStatuses: ["accepted"],
    maxManifestAgeDays: 30,
    knowledgeMemoryAdapter: {
      name: "vibethink-default",
      engines: ["graphify", "engram"],
      sourceOfTruth: "versioned-markdown",
    },
    indexes: [
      {
        name: "graphify",
        required: true,
        artifacts: ["graphify-out/graph.json"],
        refreshCommand: "graphify update docs/knowledge",
      },
      {
        name: "engram",
        required: false,
        artifacts: ["engram-out/facts.json"],
        refreshCommand: "engram ingest docs/knowledge",
      },
    ],
    ...overrides,
  };
}

function fixture(dir, cfg = baseConfig()) {
  write(dir, "tools/knowledge-memory.config.json", cfg);
  write(
    dir,
    "docs/knowledge/vito-core/PACK-METADATA.md",
    "# Pack\nstatus: accepted\nvalidator: Principal Architect\nupdated: 2026-06-28\n"
  );
  write(dir, "docs/knowledge/vito-core/BUSINESS-CONTEXT.md", "# Business\n\nAccepted context.\n");
  write(dir, "graphify-out/graph.json", '{"nodes":[],"edges":[]}\n');
  write(dir, "engram-out/facts.json", '{"facts":[]}\n');
}

function runTool(tool, dir, args = ["tools/knowledge-memory.config.json"]) {
  const r = spawnSync("node", [tool, ...args], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function refresh(dir) {
  return runTool(REFRESH, dir);
}

function check(dir) {
  return runTool(CHECK, dir);
}

console.log("\ncheck-knowledge-memory-freshness tests\n");

test("refresh writes manifest and check passes → GREEN", () => {
  const dir = makeDir();
  fixture(dir);
  let r = refresh(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /wrote/);
  r = check(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /GREEN/);
});

test("missing manifest → RED with refresh remediation", () => {
  const dir = makeDir();
  fixture(dir);
  const r = check(dir);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /manifest.*missing/);
  assert.match(r.out, /kdd-refresh/);
});

test("accepted source changes after refresh → RED", () => {
  const dir = makeDir();
  fixture(dir);
  assert.equal(refresh(dir).code, 0);
  write(dir, "docs/knowledge/vito-core/BUSINESS-CONTEXT.md", "# Business\n\nChanged context.\n");
  const r = check(dir);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /source fingerprint/);
});

test("candidate pack changes do not stale accepted-source manifest", () => {
  const dir = makeDir();
  fixture(dir);
  write(dir, "docs/knowledge/draft/PACK-METADATA.md", "# Draft\nstatus: candidate\nvalidator: pending\n");
  write(dir, "docs/knowledge/draft/BUSINESS-CONTEXT.md", "# Draft\n\nv1\n");
  assert.equal(refresh(dir).code, 0);
  write(dir, "docs/knowledge/draft/BUSINESS-CONTEXT.md", "# Draft\n\nv2\n");
  const r = check(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /GREEN/);
});

test("excluded OKF generated surfaces can churn without staling accepted memory → GREEN", () => {
  const dir = makeDir();
  fixture(
    dir,
    baseConfig({
      sourceExclusions: ["docs/knowledge/vito-core/generated/index.md", "docs/knowledge/vito-core/generated/log.md"],
    })
  );
  write(dir, "docs/knowledge/vito-core/generated/index.md", "# OKF Index\n\n- [Business](../BUSINESS-CONTEXT.md)\n");
  write(dir, "docs/knowledge/vito-core/generated/log.md", "# OKF Log\n\n- generated before refresh\n");
  assert.equal(refresh(dir).code, 0);
  write(dir, "docs/knowledge/vito-core/generated/index.md", "# OKF Index\n\n- [Business](../BUSINESS-CONTEXT.md)\n- regenerated\n");
  write(dir, "docs/knowledge/vito-core/generated/log.md", "# OKF Log\n\n- generated after refresh\n");
  const r = check(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /source exclusions/);
  assert.match(r.out, /GREEN/);
});

test("basename source exclusion does not hide accepted index changes → RED", () => {
  const dir = makeDir();
  fixture(
    dir,
    baseConfig({
      sourceExclusions: ["index.md"],
    })
  );
  write(dir, "docs/knowledge/vito-core/index.md", "# Accepted Index\n\nLoad-bearing accepted context v1.\n");
  assert.equal(refresh(dir).code, 0);
  write(dir, "docs/knowledge/vito-core/index.md", "# Accepted Index\n\nLoad-bearing accepted context v2.\n");
  const r = check(dir);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /source fingerprint/);
});

test("source exclusions changed after refresh → RED", () => {
  const dir = makeDir();
  fixture(
    dir,
    baseConfig({
      sourceExclusions: ["docs/knowledge/vito-core/generated/index.md", "docs/knowledge/vito-core/generated/log.md"],
    })
  );
  write(dir, "docs/knowledge/vito-core/generated/index.md", "# OKF Index\n");
  assert.equal(refresh(dir).code, 0);
  write(dir, "tools/knowledge-memory.config.json", baseConfig({ sourceExclusions: ["docs/knowledge/vito-core/generated/index.md"] }));
  const r = check(dir);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /source exclusions.*changed/);
});

test("required index artifact missing → RED", () => {
  const dir = makeDir();
  fixture(dir);
  assert.equal(refresh(dir).code, 0);
  rmSync(path.join(dir, "graphify-out/graph.json"), { force: true });
  const r = check(dir);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /artifact missing/);
});

test("optional index artifact missing → WARN but exit 0", () => {
  const dir = makeDir();
  fixture(dir);
  assert.equal(refresh(dir).code, 0);
  rmSync(path.join(dir, "engram-out/facts.json"), { force: true });
  const r = check(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /WARN/);
});

test("adapter config changed after refresh → RED", () => {
  const dir = makeDir();
  fixture(dir);
  assert.equal(refresh(dir).code, 0);
  const cfg = baseConfig({
    knowledgeMemoryAdapter: {
      name: "markdown-only",
      engines: ["markdown"],
      sourceOfTruth: "versioned-markdown",
    },
  });
  write(dir, "tools/knowledge-memory.config.json", cfg);
  const r = check(dir);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /adapter.*changed/);
});

test("missing config → setup error exit 2", () => {
  const dir = makeDir();
  const r = runTool(CHECK, dir);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /config not found/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-knowledge-memory-freshness: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
