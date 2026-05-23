#!/usr/bin/env node
/**
 * Unit tests for inbox.mjs — happy path + failure modes (testing policy).
 * Pure Node, no deps. Run: node tools/inbox.test.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  collectInbox,
  isOpen,
  matchesInbox,
  normalizeRecipient,
  parseCommMeta,
  parseFrontMatter,
} from "./inbox.mjs";

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

// ── parseFrontMatter ──────────────────────────────────────────────────────────
test("parseFrontMatter: reads flat keys", () => {
  const fm = parseFrontMatter("---\nto_agent: codex\nstatus: open\n---\n# body");
  assert.equal(fm.to_agent, "codex");
  assert.equal(fm.status, "open");
});
test("parseFrontMatter: no block returns empty object", () => {
  assert.deepEqual(parseFrontMatter("# just a body, no front-matter"), {});
});
test("parseFrontMatter: strips quotes and inline comments", () => {
  const fm = parseFrontMatter('---\nto_agent: "claude"\nneeds: human   # judgment gate\n---');
  assert.equal(fm.to_agent, "claude");
  assert.equal(fm.needs, "human");
});

// ── isOpen ────────────────────────────────────────────────────────────────────
test("isOpen: missing status counts as open", () => assert.equal(isOpen({}), true));
test("isOpen: status closed is not open (failure mode)", () =>
  assert.equal(isOpen({ status: "closed" }), false));

// ── matchesInbox ──────────────────────────────────────────────────────────────
test("matchesInbox: addressed + open matches recipient", () =>
  assert.equal(matchesInbox({ to_agent: "codex", status: "open" }, "codex"), true));
test("matchesInbox: wrong recipient does not match (failure mode)", () =>
  assert.equal(matchesInbox({ to_agent: "claude", status: "open" }, "codex"), false));
test("matchesInbox: to_agent any matches everyone", () =>
  assert.equal(matchesInbox({ to_agent: "any" }, "gemini"), true));
test("matchesInbox: closed does not match (failure mode)", () =>
  assert.equal(matchesInbox({ to_agent: "codex", status: "closed" }, "codex"), false));
test("matchesInbox: needs human lands in human inbox", () =>
  assert.equal(matchesInbox({ to_agent: "codex", needs: "human" }, "human"), true));
test("matchesInbox: non-needs message stays out of human inbox (failure mode)", () =>
  assert.equal(matchesInbox({ to_agent: "codex" }, "human"), false));

// ── collectInbox (integration over a fixtures dir) ────────────────────────────
test("collectInbox: filters, ignores malformed, sorts by priority", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "inbox-test-"));
  fs.writeFileSync(
    path.join(dir, "a.md"),
    "---\nto_agent: codex\nstatus: open\npriority: low\ndate: 2026-05-20\n---\n# A"
  );
  fs.writeFileSync(
    path.join(dir, "b.md"),
    "---\nto_agent: codex\nstatus: open\npriority: high\ndate: 2026-05-19\n---\n# B"
  );
  fs.writeFileSync(
    path.join(dir, "c.md"),
    "---\nto_agent: claude\nstatus: open\n---\n# C (other recipient)"
  );
  fs.writeFileSync(
    path.join(dir, "d.md"),
    "---\nto_agent: codex\nstatus: closed\n---\n# D (closed)"
  );
  fs.writeFileSync(path.join(dir, "e.md"), "no front-matter at all, must not crash");
  const items = collectInbox(dir, "codex");
  assert.equal(items.length, 2, "only the 2 open codex messages");
  assert.equal(items[0].file, "b.md", "high priority sorts first");
  fs.rmSync(dir, { recursive: true, force: true });
});
test("collectInbox: missing lane dir returns empty, no throw", () =>
  assert.deepEqual(collectInbox("/no/such/dir/xyz", "codex"), []));

// ── normalizeRecipient (the shared router — finding #1) ───────────────────────
test("normalizeRecipient: explicit to_agent wins verbatim", () =>
  assert.equal(normalizeRecipient({ to_agent: "claude" }), "claude"));
test("normalizeRecipient: prose to: codex extracts codex", () =>
  assert.equal(normalizeRecipient({ to: "codex" }), "codex"));
test("normalizeRecipient: prose to: codex-dev (real shape) extracts codex", () =>
  assert.equal(normalizeRecipient({ to: "codex-dev" }), "codex"));
test("normalizeRecipient: prose to: claude-DKS-dev (real shape) extracts claude", () =>
  assert.equal(normalizeRecipient({ to: "claude-DKS-dev" }), "claude"));
test('normalizeRecipient: "Codex (Principal Architect)" extracts codex', () =>
  assert.equal(normalizeRecipient({ to: "Codex (Principal Architect)" }), "codex"));
test("normalizeRecipient: to: any maps to any", () =>
  assert.equal(normalizeRecipient({ to: "any" }), "any"));
test("normalizeRecipient: to_agent overrides a conflicting prose to:", () =>
  assert.equal(normalizeRecipient({ to_agent: "gemini", to: "codex-dev" }), "gemini"));
test("normalizeRecipient: no known token returns empty (failure mode)", () =>
  assert.equal(normalizeRecipient({ to: "Marcelo (Principal Architect)" }), ""));
test("normalizeRecipient: re: fallback when to: is absent", () =>
  assert.equal(normalizeRecipient({ re: "thread owned by gemini" }), "gemini"));
test("normalizeRecipient: to: outranks a token in re: (landmine — to/re not concatenated)", () =>
  assert.equal(normalizeRecipient({ to: "gemini-dev", re: "TASK about codex work" }), "gemini"));
test("normalizeRecipient: to: any outranks a token in re:", () =>
  assert.equal(normalizeRecipient({ to: "any", re: "codex thread" }), "any"));
test("normalizeRecipient: custom agents list overrides defaults", () =>
  assert.equal(normalizeRecipient({ to: "athena-dev" }, { agents: ["athena"] }), "athena"));

// ── parseCommMeta (YAML + real-lane bold-label body form — finding #1) ────────
test("parseCommMeta: reads YAML front-matter", () => {
  const fm = parseCommMeta("---\nto_agent: codex\nstatus: open\n---\n# body");
  assert.equal(fm.to_agent, "codex");
});
test("parseCommMeta: reads bold-label body header (**To**: codex-dev)", () => {
  const fm = parseCommMeta("# Title\n\n**From**: claude-arq\n**To**: codex-dev\n\nbody");
  assert.equal(fm.from, "claude-arq");
  assert.equal(fm.to, "codex-dev");
});
test("parseCommMeta: reads Spanish bold labels (**De:** / **Para:**)", () => {
  const fm = parseCommMeta("# T\n\n**De:** claude-RES-arq\n**Para:** codex-dev\n");
  assert.equal(fm.from, "claude-RES-arq");
  assert.equal(fm.to, "codex-dev");
});
test("parseCommMeta: YAML wins over a body label (failure mode)", () => {
  const fm = parseCommMeta("---\nto: codex\n---\n# T\n\n**To**: gemini\n");
  assert.equal(fm.to, "codex");
});
test("parseCommMeta: ignores unknown bold labels", () => {
  const fm = parseCommMeta("# T\n\n**Reason**: because\n**Extends**: other\n");
  assert.equal(fm.to, undefined);
  assert.equal(fm.from, undefined);
});

// ── matchesInbox over the real-lane prose shapes (finding #1 regression) ──────
test("matchesInbox: prose to: codex-dev routes to codex", () =>
  assert.equal(matchesInbox({ to: "codex-dev", status: "open" }, "codex"), true));
test("matchesInbox: prose to: any reaches everyone", () =>
  assert.equal(matchesInbox({ to: "any" }, "gemini"), true));
test("matchesInbox: prose to: claude-X does not match codex (failure mode)", () =>
  assert.equal(matchesInbox({ to: "claude-DKS-dev" }, "codex"), false));

// ── collectInbox over a real-shaped fixtures dir (YAML + body, EN + ES) ───────
test("collectInbox: recovers real-lane shapes the old to_agent-only path missed", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "inbox-real-"));
  // YAML with prose `to:` (222 of the real lane use this; 0 used to_agent)
  fs.writeFileSync(
    path.join(dir, "a.md"),
    "---\nfrom: claude-arq\nto: codex-dev\nstatus: open\ndate: 2026-05-15\nre: TASK alpha\n---\nbody"
  );
  // No YAML — English bold-label body header (the majority shape)
  fs.writeFileSync(
    path.join(dir, "b.md"),
    "# ADDENDUM\n\n**From**: claude-arq (Opus 4.7)\n**To**: codex-dev\n**Date**: 2026-05-15\n\nbody"
  );
  // No YAML — Spanish bold-label body header
  fs.writeFileSync(
    path.join(dir, "c.md"),
    "# TASK\n\n**De:** claude-RES-arq\n**Para:** codex-dev\n\nbody"
  );
  // canonical to_agent (the new convention) — must still work
  fs.writeFileSync(path.join(dir, "d.md"), "---\nto_agent: codex\nstatus: open\n---\nbody");
  // addressed elsewhere — must be excluded
  fs.writeFileSync(path.join(dir, "e.md"), "---\nto: claude-dev\nstatus: open\n---\nbody");
  // addressed to a human, no agent token — must be excluded from an agent inbox
  fs.writeFileSync(path.join(dir, "f.md"), "# T\n\n**To**: Marcelo (Principal Architect)\n");
  const items = collectInbox(dir, "codex");
  assert.equal(items.length, 4, "the 4 codex messages across all real shapes");
  assert.ok(!items.some((i) => i.file === "e.md"), "claude-dev message excluded");
  assert.ok(!items.some((i) => i.file === "f.md"), "human-addressed message excluded");
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
