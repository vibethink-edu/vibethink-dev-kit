#!/usr/bin/env node
/**
 * check-identifier-language — the GATE that makes CANON-NAMING-CONVENTIONS-001 §8 bite.
 *
 * §8 (the rule) and §8.6 (surface-complete) were sealed without a mechanism — "policy
 * without a mechanism is a suggestion". This is the mechanism, lifted agnostic from a
 * consumer's proven CI gate. It enforces: **identifiers are written in one declared
 * language; the rule spans every declared identifier surface (schema · route/URL slugs ·
 * file/dir names · config keys), not just one.**
 *
 * THE DESIGN — vocabulary-allowlist, NOT a forbidden-word denylist:
 *   Enumerating the FORBIDDEN language is impossible to keep complete (freeze-at-N: it only
 *   catches the words someone already thought of). Instead every identifier token must be a
 *   CONSCIOUSLY-ADMITTED vocabulary entry. A non-declared-language leak is, by definition, a
 *   token nobody admitted → it fails. The vocabulary grows only by reviewed PR additions.
 *   This classifies by the REAL condition ("is this token in the declared vocabulary?"),
 *   never pretends to know a language, and is self-maintaining (CANON-AUDIT-PROTOCOL §8.1).
 *
 * AGNOSTIC ENGINE / PER-REPO BINDING (the fire-test line):
 *   The engine knows nothing about any product, language, framework, or repo layout. EVERY
 *   surface and locale fact lives in the binding (tools/identifier-language.config.json):
 *   the declared language, the schema dirs, the slug surfaces (route/feature/… dir trees),
 *   the DB column-type keywords, the admitted vocabulary, and documented exceptions. That
 *   separation is what makes it a shared kit tool — each consumer ships its own binding.
 *
 * Config (tools/identifier-language.config.json):
 *   {
 *     "declaredLanguage": "en",
 *     "schemaDirs":  ["db/migrations"],                         // dirs of DDL .sql (identifiers extracted)
 *     "columnTypes": ["UUID","TEXT","JSONB", ...],              // type keywords that anchor a column def
 *     "slugSurfaces": [                                          // dir trees whose child dir NAMES are identifiers
 *       { "dir": "apps/web/src/app", "recursive": true, "skip": ["api"] },
 *       { "dir": "apps/web/src/features", "recursive": false }
 *     ],
 *     "allow": ["account","person", ...],                        // admitted vocabulary tokens
 *     "exceptions": { "dane": "national-ID acronym (domain term)" }
 *   }
 *
 * Usage:
 *   node tools/check-identifier-language.mjs           # gate: fail on any token not in the vocabulary
 *   node tools/check-identifier-language.mjs --seed    # (re)generate "allow" from the current surfaces
 *                                                      # (review the diff in PR; never auto-admit a leak)
 * Exit: 0 all tokens admitted (or conscious N-A) · 1 unknown token(s) (a leak or an un-admitted term) · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2]?.startsWith("--")
  ? "tools/identifier-language.config.json"
  : process.argv[2] || "tools/identifier-language.config.json";
const SEED = process.argv.includes("--seed");

function fail(msg) {
  console.error(`✗ check-identifier-language — ${msg}`);
  process.exit(2);
}

const absConfig = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
if (!existsSync(absConfig) && !SEED)
  fail(
    `config not found: ${configPath} (a repo declares its identifier-language posture here — see tools/identifier-language.config.example.json)`
  );

let cfg = {
  declaredLanguage: "en",
  schemaDirs: [],
  columnTypes: [],
  slugSurfaces: [],
  allow: [],
  exceptions: {},
};
if (existsSync(absConfig)) {
  try {
    cfg = { ...cfg, ...JSON.parse(readFileSync(absConfig, "utf8")) };
  } catch (e) {
    fail(`config is not valid JSON: ${e.message}`);
  }
}

const resolve = (p) => (isAbsolute(p) ? p : join(ROOT, p));
const tokensOf = (id) =>
  id
    .toLowerCase()
    .split(/[-_]/)
    .filter((t) => t && !/^\d+$/.test(t));

// ── Schema surface: extract identifiers (table/column/function/index) from DDL .sql ──────
function buildExtractors(columnTypes) {
  const types = (columnTypes || []).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return {
    decls: [
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[a-z_]+\.)?([a-z_][a-z0-9_]*)/gi,
      /ALTER\s+TABLE\s+(?:[a-z_]+\.)?[a-z0-9_]+\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_][a-z0-9_]*)/gi,
      /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:[a-z_]+\.)?([a-z_][a-z0-9_]*)/gi,
      /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_][a-z0-9_]*)/gi,
    ],
    // Column definitions inside a CREATE TABLE body: "<name>  TYPE ...". The declared type
    // keywords anchor it, so constraint lines (PRIMARY KEY / FOREIGN KEY / CHECK) are skipped.
    columnDef: types ? new RegExp(`^\\s+([a-z_][a-z0-9_]*)\\s+(?:${types})\\b`, "gim") : null,
  };
}

function listSqlFiles(dirs) {
  const out = [];
  for (const dir of dirs || []) {
    const abs = resolve(dir);
    if (!existsSync(abs)) continue;
    for (const e of readdirSync(abs, { withFileTypes: true }))
      if (e.isFile() && e.name.endsWith(".sql")) out.push(join(dir, e.name));
  }
  return out.sort();
}

function collectSchemaTokens(into) {
  const ex = buildExtractors(cfg.columnTypes);
  for (const f of listSqlFiles(cfg.schemaDirs)) {
    const sql = readFileSync(resolve(f), "utf8");
    const ids = new Set();
    const scan = (re) => {
      re.lastIndex = 0;
      let m = re.exec(sql);
      while (m) {
        ids.add(m[1]);
        m = re.exec(sql);
      }
    };
    for (const re of ex.decls) scan(re);
    if (ex.columnDef) scan(ex.columnDef);
    for (const id of ids) for (const tok of tokensOf(id)) addToken(into, tok, `${f} (${id})`);
  }
}

// ── Slug surfaces: child DIR NAMES are identifiers (route slugs, feature dirs, …) ────────
// Universal exclusions: private `_*` folders, and group `(..)` / param `[..]` brackets
// (no literal segment). Per-surface `skip` removes named subtrees (e.g. "api"). `recursive`
// walks the tree; otherwise only immediate children are identifiers.
function collectSlugTokens(into) {
  for (const s of cfg.slugSurfaces || []) {
    const base = resolve(s.dir);
    if (!existsSync(base)) continue;
    const skip = new Set(s.skip || []);
    const walk = (dir, crumbs) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        const name = e.name;
        if (name.startsWith("_") || skip.has(name)) continue;
        const bracketed = /^\(.+\)$/.test(name) || /^\[.+\]$/.test(name);
        if (bracketed) {
          if (s.recursive) walk(join(dir, name), crumbs);
          continue;
        }
        const here = [...crumbs, name];
        for (const tok of tokensOf(name)) addToken(into, tok, `${s.dir}/${here.join("/")}`);
        if (s.recursive) walk(join(dir, name), here);
      }
    };
    walk(base, []);
  }
}

function addToken(map, tok, source) {
  if (!map.has(tok)) map.set(tok, new Set());
  map.get(tok).add(source);
}

// ── Collect every token across every declared surface ───────────────────────────────────
const tokenSources = new Map();
collectSchemaTokens(tokenSources);
collectSlugTokens(tokenSources);
const allTokens = [...tokenSources.keys()].sort();
const surfaceCount = (cfg.schemaDirs?.length || 0) + (cfg.slugSurfaces?.length || 0);

// ── Seed mode: (re)generate the admitted vocabulary from the current surfaces ────────────
if (SEED) {
  cfg.declaredLanguage = cfg.declaredLanguage || "en";
  cfg.exceptions = cfg.exceptions || {};
  cfg.allow = allTokens.filter((t) => !(t in cfg.exceptions));
  writeFileSync(absConfig, `${JSON.stringify(cfg, null, 2)}\n`);
  console.log(
    `✓ seeded ${cfg.allow.length} token(s) into ${relative(ROOT, absConfig)} from ${surfaceCount} declared surface(s).`
  );
  console.log(
    "  REVIEW the diff: any token here that is NOT a declared-language / technical / domain term is a leak — rename it, do not admit it."
  );
  process.exit(0);
}

console.log(`\ncheck-identifier-language · ${relative(ROOT, absConfig)}`);
console.log(`repo: ${ROOT} · declared language: ${cfg.declaredLanguage}\n`);

// No silent zero: if nothing was scanned, the config declares no surface — say so loudly
// (CANON-AUDIT-PROTOCOL §8.6: an un-scanned surface is not green, it is un-looked-at).
if (surfaceCount === 0) {
  fail(
    "config declares no surfaces (schemaDirs + slugSurfaces are both empty) — nothing would be checked. Declare at least one surface, or remove the config for a conscious N-A."
  );
}

const known = new Set([...(cfg.allow || []), ...Object.keys(cfg.exceptions || {})]);
const unknown = allTokens.filter((t) => !known.has(t));

if (unknown.length) {
  console.error(
    "✗ identifier-language gate (CANON-NAMING-CONVENTIONS-001 §8 — surface-complete §8.6):"
  );
  console.error("  Unknown identifier token(s) — not in the declared vocabulary. For each:");
  console.error('  • intended declared-language/technical identifier → add it to "allow";');
  console.error('  • domain acronym → add it to "exceptions" with a reason;');
  console.error("  • a leak in another language → RENAME the identifier (never silently admit).\n");
  for (const t of unknown) console.error(`   • "${t}"  ←  ${[...tokenSources.get(t)].join(", ")}`);
  console.error(`\n${unknown.length} unknown token(s) across ${surfaceCount} surface(s).`);
  process.exit(1);
}
console.log(
  `✓ ${allTokens.length} identifier token(s) across ${surfaceCount} surface(s), all in the declared vocabulary.`
);
process.exit(0);
