#!/usr/bin/env node
/**
 * Tests for check-identifier-language.mjs — makes CANON-NAMING-CONVENTIONS-001 §8 bite.
 * Integration style: the gate reads a config + scans surfaces resolved against cwd, so we
 * run it for real over throwaway files in tmp dirs. Pure Node, no deps.
 * Run: node tools/check-identifier-language.test.mjs
 *
 * Guards: an admitted vocabulary passes; an un-admitted token fails (leak); the gate is
 * SURFACE-COMPLETE (a clean schema + a leaked slug dir still fails — §8.6); exceptions are
 * admitted; --seed regenerates the vocabulary; no config / no surface is a loud setup error,
 * never a silent pass.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-identifier-language.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "idlang-test-"));
  tmpdirs.push(dir);
  return dir;
}
function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content), "utf8");
}
function mkdir(dir, rel) {
  mkdirSync(path.join(dir, rel), { recursive: true });
}
function run(dir, config, extraArgs = []) {
  if (config !== null) write(dir, "tools/identifier-language.config.json", config);
  const r = spawnSync("node", [TOOL, ...extraArgs], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const SCHEMA = `CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  display_name TEXT
);`;

// 1. Clean schema, all tokens admitted → GREEN.
test("admitted vocabulary → exit 0", () => {
  const dir = makeDir();
  write(dir, "db/migrations/001_init.sql", SCHEMA);
  const { code, out } = run(dir, {
    declaredLanguage: "en",
    schemaDirs: ["db/migrations"],
    columnTypes: ["UUID", "TEXT"],
    allow: ["accounts", "id", "display", "name"],
  });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /all in the declared vocabulary/);
});

// 2. An un-admitted schema token → RED (a leak).
test("un-admitted schema token → exit 1", () => {
  const dir = makeDir();
  write(dir, "db/migrations/001.sql", "CREATE TABLE sedes ( id UUID );");
  const { code, out } = run(dir, {
    schemaDirs: ["db/migrations"],
    columnTypes: ["UUID"],
    allow: ["id"],
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /"sedes"/);
});

// 3. SURFACE-COMPLETE: schema clean, but a slug dir name is not admitted → RED (§8.6).
test("clean schema + leaked slug dir → exit 1 (surface-complete)", () => {
  const dir = makeDir();
  write(dir, "db/migrations/001.sql", "CREATE TABLE accounts ( id UUID );");
  mkdir(dir, "app/comidas"); // a route slug in another language
  const { code, out } = run(dir, {
    schemaDirs: ["db/migrations"],
    columnTypes: ["UUID"],
    slugSurfaces: [{ dir: "app", recursive: true }],
    allow: ["accounts", "id"],
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /"comidas"/);
  assert.match(out, /app\/comidas/);
});

// 4. Slug exclusions: private _*, brackets, and skip list contribute no tokens.
test("slug exclusions (_*, brackets, skip) → exit 0", () => {
  const dir = makeDir();
  mkdir(dir, "app/_private");
  mkdir(dir, "app/(group)");
  mkdir(dir, "app/api/internal");
  mkdir(dir, "app/dashboard");
  const { code, out } = run(dir, {
    slugSurfaces: [{ dir: "app", recursive: true, skip: ["api"] }],
    allow: ["dashboard"],
  });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
});

// 5. Exceptions admit a domain acronym → GREEN.
test("exception token admitted → exit 0", () => {
  const dir = makeDir();
  write(dir, "db/migrations/001.sql", "CREATE TABLE x ( dane_code TEXT );");
  const { code } = run(dir, {
    schemaDirs: ["db/migrations"],
    columnTypes: ["TEXT"],
    allow: ["x", "code"],
    exceptions: { dane: "national statistics acronym" },
  });
  assert.equal(code, 0);
});

// 6. --seed regenerates the allow list from the surfaces.
test("--seed writes the vocabulary, exit 0", () => {
  const dir = makeDir();
  write(dir, "db/migrations/001.sql", SCHEMA);
  write(dir, "tools/identifier-language.config.json", {
    declaredLanguage: "en",
    schemaDirs: ["db/migrations"],
    columnTypes: ["UUID", "TEXT"],
    allow: [],
  });
  const r = spawnSync("node", [TOOL, "--seed"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0, `expected 0, got ${r.status}\n${r.stdout}${r.stderr}`);
  const cfg = JSON.parse(
    readFileSync(path.join(dir, "tools/identifier-language.config.json"), "utf8")
  );
  assert.ok(cfg.allow.includes("accounts"), `seeded allow missing 'accounts': ${cfg.allow}`);
});

// 7. No config + not seed → setup error (exit 2), not a silent pass.
test("no config → setup error, exit 2", () => {
  const dir = makeDir();
  const r = spawnSync("node", [TOOL], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 2, `expected 2, got ${r.status}`);
  assert.match(`${r.stdout}${r.stderr}`, /config not found/);
});

// 8. Config with zero surfaces → setup error (no silent-zero, §8.6).
test("config declares no surfaces → setup error, exit 2", () => {
  const dir = makeDir();
  const { code, out } = run(dir, { declaredLanguage: "en", allow: [] });
  assert.equal(code, 2, `expected 2, got ${code}\n${out}`);
  assert.match(out, /no surfaces/);
});

// 9. File-name surface: a Spanish-named governance file (TABLERO.md) leaks; the canonical
//    English file (OPS.md) is admitted. Closes the §8 "file names" surface — agents can't
//    invent a status-board name by whim, the gate forces the declared-language canonical name.
test("leaked file basename (TABLERO.md) → exit 1; OPS.md admitted", () => {
  const dir = makeDir();
  write(dir, "TABLERO.md", "# board\n");
  write(dir, "OPS.md", "# ops\n");
  const bad = run(dir, {
    declaredLanguage: "en",
    fileSurfaces: [{ dir: ".", recursive: false, extensions: [".md"] }],
    allow: ["ops"],
  });
  assert.equal(bad.code, 1, `expected 1, got ${bad.code}\n${bad.out}`);
  assert.match(bad.out, /"tablero"/);
});

// 10. File-name surface admits the declared-language vocabulary → GREEN.
test("admitted file basenames → exit 0", () => {
  const dir = makeDir();
  write(dir, "OPS.md", "# ops\n");
  write(dir, "CHANGELOG.md", "# changelog\n");
  const { code, out } = run(dir, {
    declaredLanguage: "en",
    fileSurfaces: [{ dir: ".", recursive: false, extensions: [".md"] }],
    allow: ["ops", "changelog"],
  });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-identifier-language: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
