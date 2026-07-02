#!/usr/bin/env node
/**
 * Tests for check-knowledge-pack.mjs — structural teeth for
 * CANON-KNOWLEDGE-NATIVE-VT-METHOD-001.
 *
 * The gate must prove both sides: valid packs pass, and missing baseline,
 * adapter, validator, references, or open-question ownership goes RED.
 * Pure Node, no deps. Run: node tools/check-knowledge-pack.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-knowledge-pack.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "knowledge-pack-test-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content, null, 2), "utf8");
}

function config(overrides = {}) {
  return {
    knowledgeRoot: "docs/knowledge",
    packs: ["docs/knowledge/customer-ops-v1"],
    featureRoots: ["docs/features"],
    requiredPackArtifacts: [
      "PACK-METADATA.md",
      "BUSINESS-CONTEXT.md",
      "PRODUCT-CONTEXT.md",
      "DOMAIN-VOCABULARY.md",
      "OPERATING-RULES.md",
      "DECISION-LINKS.md",
      "WORKED-SCENARIOS.md",
      "ANTI-EXAMPLES.md",
      "OPEN-QUESTIONS.md",
      "SOURCES.md",
    ],
    knowledgeMemoryAdapter: {
      name: "vibethink-default",
      required: true,
      engines: ["engram", "graphify"],
      sourceOfTruth: "versioned-markdown",
    },
    featureKnowledgeBaseline: {
      sectionName: "Knowledge Baseline",
      requiredFor: ["product-shaping", "complex", "ai-assisted", "cross-boundary"],
      requireAdapterCitation: true,
    },
    engines: {
      engram: { optional: true },
      graphify: { optional: true },
    },
    ...overrides,
  };
}

function validPack(dir) {
  const pack = "docs/knowledge/customer-ops-v1";
  write(
    dir,
    `${pack}/PACK-METADATA.md`,
    [
      "# Customer Ops Knowledge Pack",
      "id: customer-ops",
      "version: 1.0",
      "status: accepted",
      "validator: Principal Architect",
      "",
    ].join("\n")
  );
  for (const name of [
    "BUSINESS-CONTEXT.md",
    "PRODUCT-CONTEXT.md",
    "DOMAIN-VOCABULARY.md",
    "OPERATING-RULES.md",
    "DECISION-LINKS.md",
    "WORKED-SCENARIOS.md",
    "ANTI-EXAMPLES.md",
    "SOURCES.md",
  ]) {
    write(dir, `${pack}/${name}`, `# ${name}\n\nAccepted baseline content.\n`);
  }
  write(
    dir,
    `${pack}/OPEN-QUESTIONS.md`,
    [
      "# Open Questions",
      "",
      "| Question | Owner | Status |",
      "|---|---|---|",
      "| Which edge scenario needs more evidence? | Principal Architect | open |",
      "",
    ].join("\n")
  );
}

function validFeature(dir, body = "") {
  write(
    dir,
    "docs/features/refunds.md",
    [
      "# Refunds",
      "",
      "classification: product-shaping",
      "",
      "## Knowledge Baseline",
      "",
      "Baseline: ../knowledge/customer-ops-v1",
      "Knowledge Memory Adapter: vibethink-default",
      "",
      body,
    ].join("\n")
  );
}

function run(dir, cfg = config()) {
  write(dir, "tools/knowledge-pack.config.json", cfg);
  const r = spawnSync("node", [TOOL, "tools/knowledge-pack.config.json"], {
    cwd: dir,
    encoding: "utf8",
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

console.log("\ncheck-knowledge-pack tests\n");

test("valid accepted pack + product-shaping feature cites baseline through adapter → GREEN", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
  assert.match(out, /knowledge adapter/);
});

test("missing required artifact → RED", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  rmSync(path.join(dir, "docs/knowledge/customer-ops-v1/ANTI-EXAMPLES.md"), { force: true });
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, /missing\/non-empty ANTI-EXAMPLES\.md/);
});

test("accepted pack without validator → RED", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  write(
    dir,
    "docs/knowledge/customer-ops-v1/PACK-METADATA.md",
    "# Customer Ops Knowledge Pack\nstatus: accepted\nvalidator: pending\n"
  );
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, /accepted without validator/);
});

test("open question missing owner/status → RED", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  write(
    dir,
    "docs/knowledge/customer-ops-v1/OPEN-QUESTIONS.md",
    "# Open Questions\n\n| Question | Owner | Status |\n|---|---|---|\n| Who approves refunds? | <owner> | <status> |\n"
  );
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, /missing owner/);
  assert.match(out, /missing status/);
});

test("product-shaping feature missing Knowledge Baseline → RED", () => {
  const dir = makeDir();
  validPack(dir);
  write(dir, "docs/features/refunds.md", "# Refunds\n\nclassification: product-shaping\n");
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, /missing "Knowledge Baseline" section/);
});

test("baseline reference unresolved → RED", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  write(
    dir,
    "docs/features/refunds.md",
    "# Refunds\n\nclassification: product-shaping\n\n## Knowledge Baseline\n\nBaseline: ../knowledge/missing\nKnowledge Memory Adapter: vibethink-default\n"
  );
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, /baseline reference missing\/unresolved/);
});

test("baseline missing adapter citation → RED", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  write(
    dir,
    "docs/features/refunds.md",
    "# Refunds\n\nclassification: product-shaping\n\n## Knowledge Baseline\n\nBaseline: ../knowledge/customer-ops-v1\n"
  );
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, /missing knowledge adapter citation/);
});

test("OKF-compatible raw-input pack with descriptive frontmatter + relative index links → GREEN", () => {
  const dir = makeDir();
  validPack(dir);
  write(
    dir,
    "docs/knowledge/customer-ops-v1/PACK-METADATA.md",
    [
      "---",
      "type: kdd-pack-metadata",
      "title: Pack Metadata",
      "tags: [kdd, knowledge-pack, metadata]",
      "timestamp: 2026-07-02",
      "---",
      "",
      "# Customer Ops Knowledge Pack",
      "id: customer-ops",
      "version: 1.0",
      "status: raw-input",
      "validator: pending",
      "",
    ].join("\n")
  );
  write(
    dir,
    "docs/knowledge/customer-ops-v1/BUSINESS-CONTEXT.md",
    [
      "---",
      "type: kdd-business-context",
      "title: Business Context",
      "tags: [kdd, business-context]",
      "timestamp: 2026-07-02",
      "---",
      "",
      "# Business Context",
      "",
      "Imported external evidence, not accepted knowledge.",
      "",
    ].join("\n")
  );
  write(
    dir,
    "docs/knowledge/customer-ops-v1/index.md",
    [
      "---",
      'okf_version: "0.1"',
      "title: Customer Ops Knowledge Pack",
      "---",
      "",
      "# Index",
      "",
      "- [Metadata](./PACK-METADATA.md)",
      "- [Business Context](./BUSINESS-CONTEXT.md)",
      "",
    ].join("\n")
  );
  const { code, out } = run(dir, config({ featureRoots: [] }));
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("OKF slash-absolute bundle link is rejected by current KDD reference gate → RED", () => {
  const dir = makeDir();
  validPack(dir);
  write(dir, "docs/knowledge/customer-ops-v1/index.md", "# Index\n\n- [Metadata](/PACK-METADATA.md)\n");
  const { code, out } = run(dir, config({ featureRoots: [] }));
  assert.equal(code, 1, out);
  assert.match(out, /reference/);
  assert.match(out, /\/PACK-METADATA\.md/);
});

test("OKF slash-absolute concept link is rejected by current KDD reference gate → RED", () => {
  const dir = makeDir();
  validPack(dir);
  write(
    dir,
    "docs/knowledge/customer-ops-v1/BUSINESS-CONTEXT.md",
    "# Business Context\n\nSee [metadata](/PACK-METADATA.md).\n"
  );
  const { code, out } = run(dir, config({ featureRoots: [] }));
  assert.equal(code, 1, out);
  assert.match(out, /reference/);
  assert.match(out, /\/PACK-METADATA\.md/);
});

test("missing knowledgeMemoryAdapter → RED", () => {
  const dir = makeDir();
  validPack(dir);
  validFeature(dir);
  const cfg = config();
  delete cfg.knowledgeMemoryAdapter;
  const { code, out } = run(dir, cfg);
  assert.equal(code, 1, out);
  assert.match(out, /missing knowledgeMemoryAdapter/);
});

test("knowledgeRoot null + adapter not required + no features → N-A GREEN", () => {
  const dir = makeDir();
  const { code, out } = run(
    dir,
    config({
      knowledgeRoot: null,
      packs: [],
      featureRoots: [],
      knowledgeMemoryAdapter: { required: false },
    })
  );
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
  assert.match(out, /N-A/);
});

test("no config file → setup error, exit 2", () => {
  const dir = makeDir();
  const r = spawnSync("node", [TOOL, "tools/knowledge-pack.config.json"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 2, `${r.stdout ?? ""}${r.stderr ?? ""}`);
  assert.match(`${r.stdout ?? ""}${r.stderr ?? ""}`, /config not found/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-knowledge-pack: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
