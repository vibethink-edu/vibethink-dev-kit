#!/usr/bin/env node
/**
 * Unit tests for inbox.mjs — happy path + failure modes (testing policy).
 * Pure Node, no deps. Run: node tools/inbox.test.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectInbox, isOpen, matchesInbox, parseFrontMatter } from "./inbox.mjs";

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

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
