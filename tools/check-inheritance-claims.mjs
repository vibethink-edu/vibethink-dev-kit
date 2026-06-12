#!/usr/bin/env node
/**
 * check-inheritance-claims.mjs — the reference claims validator
 *
 * INHERITANCE-CONTRACT §2 requires every heir to run "a claims validator that
 * rejects vague claims and verifies cited mechanisms exist". Until now the kit
 * demanded it without shipping it (heir finding A-4, Campus 2026-06-12). This
 * is the reference implementation.
 *
 * Usage:  node tools/check-inheritance-claims.mjs <path/to/DEV_KIT_INHERITANCE_STATUS.md>
 * Exit 0: all claims valid. Exit 1: vague/invalid claims or cited files missing.
 *
 * Valid status vocabulary (contract §2):
 *   WIRED-CI(file:job) · WIRED-HOOK(file:hook) · WIRED-SCRIPT(file)
 *   DECLARED-ONLY(file) · ADOPTED-NATIVE · PENDING · N-A(reason)
 * Parse bounds are deliberately loose on piece COUNT (the contract warns an
 * exact ceiling freezes at N — it happened twice).
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';

const statusPath = process.argv[2];
if (!statusPath) {
  console.error('usage: node tools/check-inheritance-claims.mjs <DEV_KIT_INHERITANCE_STATUS.md>');
  process.exit(1);
}
let text;
try {
  text = readFileSync(statusPath, 'utf8');
} catch (e) {
  console.error(`cannot read ${statusPath}: ${e.message}`);
  process.exit(1);
}
const repoRoot = join(dirname(statusPath), '..'); // docs/ -> repo root (adjust via cwd if needed)

const STATUS = [
  { re: /^WIRED-CI\(([^:()]+):([^()]+)\)$/, cite: 'file' },
  { re: /^WIRED-HOOK\(([^:()]+):([^()]+)\)$/, cite: 'file' },
  { re: /^WIRED-SCRIPT\(([^()]+)\)$/, cite: 'file' },
  { re: /^DECLARED-ONLY\(([^()]+)\)$/, cite: 'file' },
  { re: /^ADOPTED-NATIVE$/, cite: null }, // must name binding in the row text
  { re: /^PENDING$/, cite: null },
  { re: /^N-A\((.+)\)$/, cite: 'reason' },
];

const problems = [];
let rows = 0;

for (const [i, line] of text.split('\n').entries()) {
  if (!line.trim().startsWith('|')) continue;
  const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
  if (cells.length < 2) continue;
  // find the cell that looks like a status claim
  const claim = cells.find((c) =>
    /^(WIRED-CI|WIRED-HOOK|WIRED-SCRIPT|DECLARED-ONLY|ADOPTED-NATIVE|PENDING|N-A)/.test(c)
  );
  if (!claim) continue;
  rows++;
  const ln = i + 1;

  const match = STATUS.find((s) => s.re.test(claim));
  if (!match) {
    problems.push(`${ln}: vague/malformed claim "${claim}" — empty parens or wrong shape invalidates (contract §2)`);
    continue;
  }
  const m = claim.match(match.re);
  if (match.cite === 'file') {
    const file = m[1];
    if (!file || file.length < 2) {
      problems.push(`${ln}: claim "${claim}" cites no file`);
    } else if (!existsSync(join(process.cwd(), file)) && !existsSync(join(repoRoot, file))) {
      problems.push(`${ln}: claim "${claim}" cites "${file}" which does not exist`);
    }
  }
  if (match.cite === 'reason' && m[1].trim().length < 4) {
    problems.push(`${ln}: N-A with a non-reason ("${m[1]}") — the reason travels with the claim`);
  }
  if (/^ADOPTED-NATIVE$/.test(claim)) {
    const rowText = cells.join(' ');
    if (rowText.replace(claim, '').trim().length < 8) {
      problems.push(`${ln}: ADOPTED-NATIVE must name the native binding in the row`);
    }
  }
}

if (rows === 0) {
  console.error('no claim rows found — is this the status doc? (silence is not declaration)');
  process.exit(1);
}
if (problems.length) {
  console.error(`inheritance-claims: ${problems.length} problem(s) over ${rows} row(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`inheritance-claims: VALID — ${rows} row(s), vocabulary strict, cited files exist`);
process.exit(0);
