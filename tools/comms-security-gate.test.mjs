#!/usr/bin/env node
/**
 * Tests for comms-security-gate.mjs — the fail-closed secret scanner for the comms lane.
 * Unit style: HIGH_CONFIDENCE_PATTERNS is exported, so we test the patterns directly —
 * no git, no fs, pure. These are the SAME patterns comms-send.mjs uses to block before
 * writing, so this file guards both the pre-commit gate and the governed send.
 *
 * Two duties, both must hold:
 *   - DETECT: every known secret SHAPE trips at least one pattern (a missed secret is a leak).
 *   - DON'T CRY WOLF: clean prose / secret NAMES without values do NOT trip (false positives
 *     train people to bypass the gate — a noisy fail-closed gate gets disabled).
 * Pure Node, no deps. Run: node tools/comms-security-gate.test.mjs
 */
import assert from "node:assert/strict";
import { HIGH_CONFIDENCE_PATTERNS } from "./comms-security-gate.mjs";

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

/** True if ANY high-confidence pattern matches the text (mirrors how main()/send scan). */
function trips(text) {
  return HIGH_CONFIDENCE_PATTERNS.some((p) => p.regex.test(text));
}

// ── DETECT: known secret shapes must trip (a missed secret is a leak) ──────────────

const MUST_TRIP = [
  ["Bearer token header", "Authorization: Bearer ey9aBcDeFg1234567890+/=="],
  [
    "JWT",
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
  ],
  ["OpenAI-style sk- key", "the key is sk-ABCDEF0123456789ghij"],
  ["Google API key", "AIzaSyD-1234567890abcdefghijklmnopqrstuv"],
  ["access_token assignment", 'access_token: "abcdef0123456789ABCDEF"'],
  ["refresh_token assignment", "refresh_token=abcdef0123456789ABCDEF"],
  ["client_secret assignment", 'client_secret="s3cr3t-value-here"'],
  ["service_role with value", "supabase_service_role_key: eyJrole12345678"],
  ["api_key assignment", 'OPENAI_API_KEY="sk-not-even-needed-just-the-assign"'],
];

for (const [label, sample] of MUST_TRIP) {
  test(`detects: ${label}`, () => {
    assert.ok(trips(sample), `expected a pattern to trip on: ${sample}`);
  });
}

// ── DON'T CRY WOLF: clean text / NAMES-without-VALUES must NOT trip ─────────────────
// The canon allows comms to reference secret NAMES; it forbids only VALUES. These are
// the legitimate things a coordination comm says — none may trip.

const MUST_NOT_TRIP = [
  ["plain prose", "We rotated the production credentials yesterday; all green."],
  [
    "secret NAME, no value",
    "Set SUPABASE_SERVICE_ROLE_KEY in the deploy env (do not paste it here).",
  ],
  [
    "api key mentioned by name",
    "The api key lives in the vault; reference it by path, never inline.",
  ],
  ["token word alone", "The access token expired, so the run failed — re-auth and retry."],
  [
    "a file path, not a secret",
    "See tools/comms-security-gate.mjs and docs/ai-coordination/comms/.",
  ],
  ["bearer word in prose", "The bearer of the seal is Marcelo; merge equals seal."],
  ["sk- prefix but too short to be a key", "sku-12 is a product code, not a secret."],
];

for (const [label, sample] of MUST_NOT_TRIP) {
  test(`clean (no false positive): ${label}`, () => {
    assert.ok(!trips(sample), `expected NO pattern to trip on: ${sample}`);
  });
}

// ── shape sanity: the export is the contract comms-send.mjs depends on ──────────────
test("HIGH_CONFIDENCE_PATTERNS is a non-empty array of {label, regex}", () => {
  assert.ok(Array.isArray(HIGH_CONFIDENCE_PATTERNS), "must be an array");
  assert.ok(HIGH_CONFIDENCE_PATTERNS.length > 0, "must be non-empty (fail-closed needs patterns)");
  for (const p of HIGH_CONFIDENCE_PATTERNS) {
    assert.equal(typeof p.label, "string", "each pattern needs a label");
    assert.ok(p.regex instanceof RegExp, `each pattern needs a regex (${p.label})`);
  }
});

console.log(`\ncomms-security-gate: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
