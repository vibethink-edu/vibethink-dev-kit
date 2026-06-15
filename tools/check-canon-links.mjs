#!/usr/bin/env node
/**
 * check-canon-links — the cross-reference integrity gate for the canon web.
 *
 * With ~40 canons referencing each other (companion-canon links, "Piece #N", §refs),
 * a broken link lies in silence (AUDIT-PROTOCOL: an artifact must not mislead). Nothing
 * verified them. This does:
 *   1. every relative markdown link [text](path) in the docs resolves to a real file;
 *   2. every "Piece #N" reference points to a piece that exists in the ADOPT catalog.
 *
 * Producer-side (the kit owns the canon web): scans knowledge/ + setup/ + README.md.
 * Low-false-positive: fenced code blocks are stripped (example/placeholder paths don't
 * count), and targets with placeholders (`<...>`, `*`) or external schemes are skipped.
 *
 * Usage:  node tools/check-canon-links.mjs
 * Exit: 0 all links/refs resolve · 1 a broken link or dangling piece ref · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

// ── files to scan ────────────────────────────────────────────────────────────
function walk(dir, acc) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    // `templates/` holds copy-and-rename payload — its links resolve in the CONSUMER's
    // repo after copying, not here, so checking them in place is a false positive.
    if (e === "node_modules" || e.startsWith(".git") || e === "templates") continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (e.endsWith(".md")) acc.push(p);
  }
  return acc;
}
const files = [];
walk(join(ROOT, "knowledge"), files);
walk(join(ROOT, "setup"), files);
if (existsSync(join(ROOT, "README.md"))) files.push(join(ROOT, "README.md"));

if (!files.length) {
  console.error("✗ check-canon-links — no knowledge/ or setup/ docs found (run from the kit root).");
  process.exit(2);
}

// ── known catalog pieces (### N — ...) ───────────────────────────────────────
const pieces = new Set();
const adopt = join(ROOT, "setup", "ADOPT-DEV-KIT.md");
if (existsSync(adopt)) {
  for (const m of readFileSync(adopt, "utf8").matchAll(/^###\s+([0-9]+[ab]?)\s*—/gm)) pieces.add(m[1]);
}

const stripFences = (text) => text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
const isExternal = (t) => /^(https?:|mailto:|#)/i.test(t);
const isPlaceholder = (t) => /[<>*]/.test(t) || t.includes("…");

const brokenLinks = [];
const danglingPieces = [];

for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const text = stripFences(raw);
  const rel = relative(ROOT, file);

  // 1 — relative markdown links resolve
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    let target = m[1].trim();
    if (!target || isExternal(target) || isPlaceholder(target)) continue;
    target = target.split("#")[0]; // drop anchor
    if (!target) continue; // was a pure #anchor
    const abs = resolve(dirname(file), target);
    if (!existsSync(abs)) brokenLinks.push({ rel, target: m[1] });
  }

  // 2 — "Piece #N" references point to a real catalog piece
  if (pieces.size) {
    for (const m of text.matchAll(/\bPiece #([0-9]+[ab]?)\b/g)) {
      if (!pieces.has(m[1])) danglingPieces.push({ rel, ref: `Piece #${m[1]}` });
    }
  }
}

console.log(`\ncheck-canon-links · scanned ${files.length} docs\nrepo: ${ROOT}\n`);

if (!brokenLinks.length && !danglingPieces.length) {
  console.log(green(`  ✓ every relative markdown link resolves`));
  console.log(green(`  ✓ every "Piece #N" reference points to a real catalog piece (${pieces.size} pieces)`));
  console.log(green(bold("\nGREEN — the canon cross-reference web is intact.\n")));
  process.exit(0);
}

for (const b of brokenLinks) console.log(`  ${red("✗")} broken link in ${b.rel} → ${b.target}`);
for (const d of danglingPieces) console.log(`  ${red("✗")} dangling ref in ${d.rel} → ${d.ref} (no such piece)`);
console.log(red(bold(`\nRED — ${brokenLinks.length} broken link(s), ${danglingPieces.length} dangling piece ref(s).`)) + "\n");
process.exit(1);
