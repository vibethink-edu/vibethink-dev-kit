#!/usr/bin/env node
/**
 * Tests for the telemetry consumption lens (tools/policy-engine/telemetry-lens.mjs
 * + the CLI `report` subcommand) — roadmap item 6, the reader of what S3 emits.
 *
 * Known-bad discipline (CANON-AUDIT-PROTOCOL §8.7a): every advisory promise is
 * demonstrated on its violating input — a corrupt JSONL line is COUNTED, never a
 * crash; a missing default source is NO DATA (exit 0), a missing EXPLICIT source
 * is a setup error (exit 2); a broken --streak is refused; interleaved sessions
 * cannot fake or hide a friction streak.
 *
 * Pure Node, no deps. Run: node tools/policy-engine-telemetry-lens.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseTelemetryLines,
  renderReport,
  summarizeTelemetry,
} from "./policy-engine/telemetry-lens.mjs";

const CLI = fileURLToPath(new URL("./policy-engine.mjs", import.meta.url));
const KIT_ROOT = path.dirname(path.dirname(CLI));
const GIT_MANIFEST = path.join(KIT_ROOT, "knowledge", "policy", "canon-git-hygiene.policy.json");
const TMP = mkdtempSync(path.join(os.tmpdir(), "polens-test-"));

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

const line = (verdict, rule, session = "s1", tMs = 1_700_000_000_000) =>
  JSON.stringify({
    timeUnixNano: String(tMs * 1e6),
    severityText: verdict === "DENY" || verdict === "ASK" ? "WARN" : "INFO",
    body: `${verdict} ${rule ?? "no-objection"}`,
    attributes: {
      "policy.point": "tool-call",
      "policy.tool": "bash",
      "policy.verdict": verdict,
      ...(rule ? { "policy.deciding": rule } : {}),
      "policy.session_id": session,
    },
  });

const recsOf = (...lines) => parseTelemetryLines(lines.join("\n")).records;

console.log("policy-engine-telemetry-lens.test.mjs\n");

/* ───────────────────────────── parsing ───────────────────────────── */

test("valid JSONL parses; blank lines skipped", () => {
  const { records, malformed } = parseTelemetryLines(`${line("ALLOW")}\n\n${line("DENY", "R/A")}\n`);
  assert.equal(records.length, 2);
  assert.equal(malformed, 0);
});

test("KNOWN-BAD: corrupt line + non-object line are COUNTED as malformed, never a crash", () => {
  const { records, malformed } = parseTelemetryLines(
    `${line("ALLOW")}\n{not json at all\n"just a string"\n${line("DENY", "R/A")}`
  );
  assert.equal(records.length, 2);
  assert.equal(malformed, 2);
});

test("empty / null input → 0 records, 0 malformed", () => {
  assert.deepEqual(parseTelemetryLines(""), { records: [], malformed: 0 });
  assert.deepEqual(parseTelemetryLines(null), { records: [], malformed: 0 });
});

/* ─────────────────────────── aggregation ─────────────────────────── */

test("verdict mix + per-rule ranking (DENY+ASK, sorted desc)", () => {
  const s = summarizeTelemetry(
    recsOf(
      line("ALLOW"),
      line("DENY", "R/HOT"),
      line("ALLOW"),
      line("DENY", "R/HOT"),
      line("ASK", "R/WARM"),
      line("DENY", "R/HOT")
    )
  );
  assert.equal(s.total, 6);
  assert.deepEqual(s.byVerdict, { ALLOW: 2, DENY: 3, ASK: 1, OTHER: 0 });
  assert.equal(s.rules[0].rule, "R/HOT");
  assert.equal(s.rules[0].DENY, 3);
  assert.equal(s.rules[1].rule, "R/WARM");
  assert.equal(s.rules[1].ASK, 1);
});

test("never-fired: enforceable rules absent from the log are listed; fired ones are not", () => {
  const s = summarizeTelemetry(recsOf(line("DENY", "R/FIRED")), {
    enforceableRuleNames: ["R/FIRED", "R/SLEEPING", "R/DEAD"],
  });
  assert.deepEqual(s.neverFired, ["R/SLEEPING", "R/DEAD"]);
});

test("never-fired is null (section skipped) when no manifest names are given", () => {
  assert.equal(summarizeTelemetry(recsOf(line("DENY", "R/A"))).neverFired, null);
});

test("friction streak: 3 consecutive DENYs, same session+rule → reported", () => {
  const s = summarizeTelemetry(
    recsOf(line("DENY", "R/WALL"), line("DENY", "R/WALL"), line("DENY", "R/WALL"), line("ALLOW"))
  );
  assert.equal(s.streaks.length, 1);
  assert.deepEqual(s.streaks[0], { session: "s1", rule: "R/WALL", length: 3 });
});

test("KNOWN-BAD: an ALLOW in between breaks the run — no streak from 2+2", () => {
  const s = summarizeTelemetry(
    recsOf(
      line("DENY", "R/WALL"),
      line("DENY", "R/WALL"),
      line("ALLOW"),
      line("DENY", "R/WALL"),
      line("DENY", "R/WALL")
    )
  );
  assert.equal(s.streaks.length, 0);
});

test("interleaved sessions: another session's records neither break nor inflate a streak", () => {
  const s = summarizeTelemetry(
    recsOf(
      line("DENY", "R/WALL", "s1"),
      line("ALLOW", null, "s2"),
      line("DENY", "R/WALL", "s1"),
      line("DENY", "R/OTHER", "s2"),
      line("DENY", "R/WALL", "s1") // s1 run of 3 survives the interleaving; s2 never reaches 3
    )
  );
  assert.equal(s.streaks.length, 1);
  assert.deepEqual(s.streaks[0], { session: "s1", rule: "R/WALL", length: 3 });
});

test("a streak still open at end-of-log is flushed (the wall the agent is hitting RIGHT NOW)", () => {
  const s = summarizeTelemetry(
    recsOf(line("DENY", "R/WALL"), line("DENY", "R/WALL"), line("DENY", "R/WALL"))
  );
  assert.equal(s.streaks.length, 1);
});

test("freshness: lastAgeMs computed from caller's now (pure)", () => {
  const t = 1_700_000_000_000;
  const s = summarizeTelemetry(recsOf(line("ALLOW", null, "s1", t)), { nowMs: t + 120000 });
  assert.equal(s.lastAgeMs, 120000);
});

/* ─────────────────────────── rendering ─────────────────────────── */

test("render: NO DATA names the condition and the sources, and stays advisory (no throw)", () => {
  const txt = renderReport(summarizeTelemetry([]), { sources: [], malformed: 0 });
  assert.match(txt, /NO DATA/);
});

test("render: with data → verdict mix + rule ranking + malformed count surfaced", () => {
  const s = summarizeTelemetry(recsOf(line("ALLOW"), line("DENY", "R/HOT")), { nowMs: Date.now() });
  const txt = renderReport(s, { sources: ["x.jsonl"], malformed: 1 });
  assert.match(txt, /ALLOW 1 · DENY 1/);
  assert.match(txt, /R\/HOT/);
  assert.match(txt, /1 malformed/);
});

/* ─────────────────────────── CLI end-to-end ─────────────────────────── */

const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });

test("CLI report over a real JSONL → exit 0, ranking printed", () => {
  const f = path.join(TMP, "t.jsonl");
  writeFileSync(f, `${line("DENY", "R/HOT")}\n${line("ALLOW")}\n`);
  const r = run("report", "--telemetry", f);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /R\/HOT/);
});

test("CLI report + manifest cross → never-fired section lists real unfired rules, exit 0", () => {
  const f = path.join(TMP, "t2.jsonl");
  writeFileSync(f, `${line("DENY", "CANON-GIT-HYGIENE/GIT-NEVER-FORCE-PUSH-DEFAULT")}\n`);
  const r = run("report", "--telemetry", f, "--manifest", GIT_MANIFEST);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /never-fired enforceable rules/);
  assert.doesNotMatch(
    r.stdout.split("never-fired")[1],
    /GIT-NEVER-FORCE-PUSH-DEFAULT\b/,
    "a fired rule must not be listed as never-fired"
  );
});

test("KNOWN-BAD: CLI report with an EXPLICIT missing source → setup error exit 2", () => {
  const r = run("report", "--telemetry", path.join(TMP, "does-not-exist.jsonl"));
  assert.equal(r.status, 2, r.stdout + r.stderr);
});

test("CLI report over an empty file → NO DATA, still exit 0 (a lens is not a gate)", () => {
  const f = path.join(TMP, "empty.jsonl");
  writeFileSync(f, "");
  const r = run("report", "--telemetry", f);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /NO DATA/);
});

test("KNOWN-BAD: CLI report with a corrupt line → counted, exit 0, no crash", () => {
  const f = path.join(TMP, "corrupt.jsonl");
  writeFileSync(f, `${line("ALLOW")}\n{broken\n`);
  const r = run("report", "--telemetry", f);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /1 malformed/);
});

test("KNOWN-BAD: --streak below 2 or non-integer is refused (exit 2)", () => {
  const f = path.join(TMP, "s.jsonl");
  writeFileSync(f, `${line("ALLOW")}\n`);
  assert.equal(run("report", "--telemetry", f, "--streak", "1").status, 2);
  assert.equal(run("report", "--telemetry", f, "--streak", "x").status, 2);
});

test("CLI --streak raises the threshold (2 DENYs no longer a streak at --streak 3, are at 2)", () => {
  const f = path.join(TMP, "st.jsonl");
  writeFileSync(f, `${line("DENY", "R/W")}\n${line("DENY", "R/W")}\n`);
  assert.doesNotMatch(run("report", "--telemetry", f, "--streak", "3").stdout, /friction streaks/);
  assert.match(run("report", "--telemetry", f, "--streak", "2").stdout, /friction streaks/);
});

/* ─────────────────────────────── done ─────────────────────────────── */

rmSync(TMP, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
