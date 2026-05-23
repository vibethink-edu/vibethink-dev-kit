#!/usr/bin/env node
/**
 * Unit tests for feed.mjs — happy path + failure modes (testing policy).
 * Pure Node, no deps. Run: node tools/feed.test.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectFeed } from "./feed.mjs";

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

function fixtures() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "feed-test-"));
  fs.writeFileSync(
    path.join(dir, "a.md"),
    "---\nfrom: claude\nto_agent: codex\nstatus: open\ndate: 2026-05-20\nre: alpha\n---"
  );
  fs.writeFileSync(
    path.join(dir, "b.md"),
    "---\nfrom: codex\nto_agent: claude\nstatus: closed\ndate: 2026-05-22\nre: bravo\n---"
  );
  fs.writeFileSync(
    path.join(dir, "c.md"),
    "---\nfrom: codex\nto_agent: human\nneeds: human\nstatus: open\ndate: 2026-05-21\nre: charlie\n---"
  );
  fs.writeFileSync(path.join(dir, "d.md"), "no front-matter, must not crash");
  return dir;
}

test("collectFeed: includes closed messages (unlike inbox)", () => {
  const dir = fixtures();
  const items = collectFeed(dir);
  const files = items.map((i) => i.file);
  assert.ok(files.includes("b.md"), "closed message b.md is in the feed");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("collectFeed: sorts newest-first by date", () => {
  const dir = fixtures();
  const items = collectFeed(dir);
  // b (05-22) > c (05-21) > a (05-20); d has no date -> last
  assert.equal(items[0].file, "b.md");
  assert.equal(items[1].file, "c.md");
  assert.equal(items[2].file, "a.md");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("collectFeed: malformed file does not crash, still listed", () => {
  const dir = fixtures();
  const items = collectFeed(dir);
  assert.equal(items.length, 4, "all 4 files appear, including the malformed one");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("collectFeed: limit caps the result (failure-mode guard)", () => {
  const dir = fixtures();
  const items = collectFeed(dir, { limit: 2 });
  assert.equal(items.length, 2);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("collectFeed: missing lane dir returns empty, no throw", () =>
  assert.deepEqual(collectFeed("/no/such/dir/xyz"), []));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
