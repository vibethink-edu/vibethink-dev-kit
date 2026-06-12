#!/usr/bin/env node
/**
 * check-tenant-contamination.mjs — core stays tenant-free
 *
 * The product-code twin of the agent-rules fire-test: no tenant slug may
 * appear inside core paths. Instances (seeds, prompts, vocabularies) belong
 * in per-tenant seeds or the vertical's repo (CANON-VERTICAL-BOUNDARY-001).
 *
 * Usage:  node tools/check-tenant-contamination.mjs <config.json>
 * Exit 0: clean. Exit 1: contamination found (file:line per hit) or bad config.
 *
 * Config shape:
 * {
 *   "corePaths":   ["packages", "db/migrations", "apps/dashboard/src"],
 *   "excludeDirs": ["node_modules", ".git", "dist", "coverage"],
 *   "excludeGlobs": ["seeds/tenant-", "docs/tenants/"],   // path substrings allowed to mention tenants
 *   "slugs":       ["colegio-colup", "colup", "ovitality", "la-petite-tarterie"],
 *   "allowlist":   [ { "path": "db/migrations/2026..._backfill.sql", "reason": "identity backfill, approved ADR-..." } ],
 *   "maxFileSizeKB": 512
 * }
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import process from 'node:process';

const configPath = process.argv[2];
if (!configPath) {
  console.error('usage: node tools/check-tenant-contamination.mjs <config.json>');
  process.exit(1);
}

let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error(`cannot read config ${configPath}: ${e.message}`);
  process.exit(1);
}

const corePaths = cfg.corePaths ?? [];
const excludeDirs = new Set(cfg.excludeDirs ?? ['node_modules', '.git', 'dist', 'coverage']);
const excludeGlobs = (cfg.excludeGlobs ?? []).map((g) => g.replaceAll('/', sep));
const slugs = (cfg.slugs ?? []).map((s) => s.toLowerCase());
const allow = new Map((cfg.allowlist ?? []).map((a) => [a.path.replaceAll('/', sep), a.reason]));
const maxBytes = (cfg.maxFileSizeKB ?? 512) * 1024;

if (slugs.length === 0 || corePaths.length === 0) {
  console.error('config needs non-empty "slugs" and "corePaths"');
  process.exit(1);
}

const root = process.cwd();
const hits = [];
let scanned = 0;

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    const rel = relative(root, full);
    if (e.isDirectory()) {
      if (excludeDirs.has(e.name)) continue;
      if (excludeGlobs.some((g) => (rel + sep).includes(g))) continue;
      walk(full);
      continue;
    }
    if (excludeGlobs.some((g) => rel.includes(g))) continue;
    if (allow.has(rel)) continue;
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.size > maxBytes) continue; // binaries/bundles — naming linter covers paths
    let text;
    try {
      text = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    scanned++;
    const lower = text.toLowerCase();
    for (const slug of slugs) {
      if (!lower.includes(slug)) continue;
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(slug)) {
          hits.push({ file: rel, line: i + 1, slug, snippet: line.trim().slice(0, 120) });
        }
      });
    }
  }
}

for (const p of corePaths) walk(join(root, p));

if (hits.length === 0) {
  console.log(`tenant-contamination: CLEAN (${scanned} files scanned, ${slugs.length} slugs, ${allow.size} allowlisted)`);
  process.exit(0);
}

console.error(`tenant-contamination: ${hits.length} hit(s) in core paths — instances belong in per-tenant seeds or the vertical repo (CANON-VERTICAL-BOUNDARY-001):\n`);
for (const h of hits.slice(0, 200)) {
  console.error(`  ${h.file}:${h.line}  [${h.slug}]  ${h.snippet}`);
}
if (hits.length > 200) console.error(`  ... and ${hits.length - 200} more`);
console.error('\nFix: move the instance out of core, or add an allowlist entry WITH a reason (visible deviation).');
process.exit(1);
