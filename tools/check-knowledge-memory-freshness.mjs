#!/usr/bin/env node
/**
 * check-knowledge-memory-freshness — fail-loud if KDD memory indexes are stale.
 *
 * The accepted Markdown Knowledge Pack is the source of truth. Graph, memory, vector,
 * and search indexes are derived artifacts. This gate compares the current source
 * fingerprint and configured index artifacts with the manifest written by kdd-refresh.
 *
 * Usage:
 *   node tools/check-knowledge-memory-freshness.mjs tools/knowledge-memory.config.json
 *
 * Exit: 0 fresh · 1 stale/missing derived memory · 2 setup/config error.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/knowledge-memory.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function setupFail(msg) {
  console.error(`✗ check-knowledge-memory-freshness — ${msg}`);
  process.exit(2);
}

const toAbs = (p) => (isAbsolute(p) ? p : join(ROOT, p));
const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const sha = (buf) => createHash("sha256").update(buf).digest("hex");

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    setupFail(`${label} is not valid JSON: ${e.message}`);
  }
}

const absConfig = toAbs(configPath);
if (!isFile(absConfig)) setupFail(`config not found: ${configPath}`);
const cfg = readJson(absConfig, "config");

const manifestPath = cfg.manifestPath || "docs/knowledge/.kdd-memory-manifest.json";
const absManifest = toAbs(manifestPath);
if (!isFile(absManifest)) {
  console.log(`\ncheck-knowledge-memory-freshness · ${rel(absConfig)}`);
  console.log(`repo: ${ROOT}\n`);
  console.log(`  ${red("✗")} manifest               missing ${manifestPath}`);
  console.log(`\n${red(bold("RED — KDD memory freshness is unknown."))}`);
  console.log(`fix: run node <kit>/tools/kdd-refresh.mjs ${configPath} after refreshing declared indexes\n`);
  process.exit(1);
}
const manifest = readJson(absManifest, "manifest");

const sourceRoots = Array.isArray(cfg.sourceRoots) && cfg.sourceRoots.length ? cfg.sourceRoots : [cfg.knowledgeRoot || "docs/knowledge"];
const sourceExtensions = new Set(
  (Array.isArray(cfg.sourceExtensions) && cfg.sourceExtensions.length
    ? cfg.sourceExtensions
    : [".md", ".json", ".yaml", ".yml"]
  ).map((e) => e.toLowerCase())
);
const sourceStatuses = Array.isArray(cfg.sourcePackStatuses) && cfg.sourcePackStatuses.length
  ? cfg.sourcePackStatuses.map((s) => String(s).toLowerCase())
  : ["accepted"];
const sourceExclusions = new Set(
  (Array.isArray(cfg.sourceExclusions) ? cfg.sourceExclusions : [])
    .map((p) => String(p).replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase())
    .filter(Boolean)
);

function walk(root) {
  const absRoot = toAbs(root);
  if (!isDir(absRoot)) setupFail(`sourceRoot is not a directory: ${root}`);
  const out = [];
  const stack = [absRoot];
  for (let i = 0; i < stack.length; i++) {
    for (const entry of readdirSync(stack[i], { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const p = join(stack[i], entry.name);
      if (entry.isDirectory()) stack.push(p);
      else if (sourceExtensions.has(extname(entry.name).toLowerCase())) out.push(p);
    }
  }
  return out;
}

function metadataStatus(dir) {
  const p = join(dir, "PACK-METADATA.md");
  if (!isFile(p)) return null;
  const text = readFileSync(p, "utf8");
  return (text.match(/^\s*status:\s*([a-z-]+)/im) || [])[1]?.toLowerCase() || null;
}

function packRootFor(file) {
  let dir = dirname(file);
  while (dir.startsWith(ROOT) && dir !== ROOT) {
    if (isFile(join(dir, "PACK-METADATA.md"))) return dir;
    dir = dirname(dir);
  }
  return null;
}

function includeSource(file) {
  if (resolve(file) === resolve(absManifest)) return false;
  const fileRel = rel(file).toLowerCase();
  const basename = fileRel.split("/").pop();
  if (sourceExclusions.has(fileRel) || sourceExclusions.has(basename)) return false;
  const packRoot = packRootFor(file);
  if (!packRoot) return true;
  const status = metadataStatus(packRoot);
  return status ? sourceStatuses.includes(status) : true;
}

function fileRecord(file) {
  const bytes = readFileSync(file);
  const st = statSync(file);
  return {
    path: rel(file),
    sha256: sha(bytes),
    bytes: st.size,
    mtimeMs: Math.trunc(st.mtimeMs),
  };
}

function fingerprint(records) {
  const h = createHash("sha256");
  for (const r of records) {
    h.update(r.path);
    h.update("\0");
    h.update(r.sha256);
    h.update("\0");
  }
  return h.digest("hex");
}

const sourceFiles = [...new Set(sourceRoots.flatMap(walk).filter(includeSource).map((p) => resolve(p)))]
  .sort((a, b) => rel(a).localeCompare(rel(b)))
  .map(fileRecord);
const currentFingerprint = fingerprint(sourceFiles);
const maxSourceMtime = sourceFiles.reduce((m, f) => Math.max(m, f.mtimeMs || 0), 0);

let problems = 0;
let warnings = 0;
let ok = 0;

console.log(`\ncheck-knowledge-memory-freshness · ${rel(absConfig)}`);
console.log(`repo: ${ROOT}\n`);

if (manifest.sourceFingerprint !== currentFingerprint) {
  problems++;
  console.log(`  ${red("✗")} source fingerprint     stale manifest does not match accepted sources`);
  console.log(`      manifest: ${manifest.sourceFingerprint || "(missing)"}`);
  console.log(`      current:  ${currentFingerprint}`);
} else {
  ok++;
  console.log(`  ${green("✓")} source fingerprint     ${currentFingerprint}`);
}

const cfgAdapter = cfg.knowledgeMemoryAdapter || cfg.adapter || null;
if (JSON.stringify(cfgAdapter || null) !== JSON.stringify(manifest.adapter || null)) {
  problems++;
  console.log(`  ${red("✗")} adapter                config adapter changed since manifest`);
} else if (cfgAdapter) {
  ok++;
  console.log(`  ${green("✓")} adapter                ${cfgAdapter.name || cfgAdapter.profile || "declared"}`);
}

if (JSON.stringify([...sourceExclusions].sort()) !== JSON.stringify(manifest.sourceExclusions || [])) {
  problems++;
  console.log(`  ${red("✗")} source exclusions      config exclusions changed since manifest`);
} else if (sourceExclusions.size) {
  ok++;
  console.log(`  ${green("✓")} source exclusions      ${[...sourceExclusions].sort().join(", ")}`);
}

if (typeof cfg.maxManifestAgeDays === "number" && cfg.maxManifestAgeDays >= 0) {
  const generatedAt = Date.parse(manifest.generatedAt || "");
  if (!Number.isFinite(generatedAt)) {
    problems++;
    console.log(`  ${red("✗")} manifest age           generatedAt missing/invalid`);
  } else {
    const ageDays = (Date.now() - generatedAt) / 86400000;
    if (ageDays > cfg.maxManifestAgeDays) {
      problems++;
      console.log(`  ${red("✗")} manifest age           ${ageDays.toFixed(1)}d > ${cfg.maxManifestAgeDays}d`);
    } else {
      ok++;
      console.log(`  ${green("✓")} manifest age           ${ageDays.toFixed(1)}d`);
    }
  }
}

const manifestIndexes = new Map((Array.isArray(manifest.indexes) ? manifest.indexes : []).map((i) => [i.name, i]));
for (const index of Array.isArray(cfg.indexes) ? cfg.indexes : []) {
  const name = index.name || "unnamed";
  const required = index.required === true;
  const manifestIndex = manifestIndexes.get(name);
  if (!manifestIndex) {
    (required ? problems++ : warnings++);
    console.log(`  ${(required ? red("✗") : yellow("⚠"))} index:${name.padEnd(15)} missing from manifest`);
    continue;
  }
  const artifacts = Array.isArray(index.artifacts) ? index.artifacts : [];
  if (artifacts.length === 0) {
    (required ? problems++ : warnings++);
    console.log(`  ${(required ? red("✗") : yellow("⚠"))} index:${name.padEnd(15)} declares no artifacts`);
    continue;
  }
  let indexProblems = 0;
  for (const artifact of artifacts) {
    const p = toAbs(artifact);
    const manifestArtifact = (manifestIndex.artifacts || []).find((a) => a.path === rel(p));
    if (!isFile(p)) {
      indexProblems++;
      console.log(`  ${(required ? red("✗") : yellow("⚠"))} index:${name.padEnd(15)} artifact missing ${artifact}`);
      continue;
    }
    const current = fileRecord(p);
    if (!manifestArtifact?.exists || manifestArtifact.sha256 !== current.sha256) {
      indexProblems++;
      console.log(`  ${(required ? red("✗") : yellow("⚠"))} index:${name.padEnd(15)} artifact changed since manifest: ${artifact}`);
    }
    const requireNewer = index.requireArtifactNewerThanSources !== false;
    if (requireNewer && current.mtimeMs < maxSourceMtime) {
      indexProblems++;
      console.log(`  ${(required ? red("✗") : yellow("⚠"))} index:${name.padEnd(15)} artifact older than accepted sources: ${artifact}`);
    }
  }
  if (indexProblems) {
    if (required) problems += indexProblems;
    else warnings += indexProblems;
  } else {
    ok++;
    console.log(`  ${green("✓")} index:${name.padEnd(15)} fresh`);
  }
}

console.log(`\n${bold("─".repeat(60))}`);
console.log(`${bold("OK:")} ${green(String(ok))}   ${bold("WARN:")} ${warnings ? yellow(String(warnings)) : "0"}   ${bold("RED:")} ${problems ? red(String(problems)) : "0"}`);
console.log(`${bold("─".repeat(60))}`);

if (problems) {
  console.log(`${red(bold(`\nRED — ${problems} KDD memory freshness problem(s).`))}`);
  console.log(`fix: refresh declared indexes, then run node <kit>/tools/kdd-refresh.mjs ${configPath}\n`);
  process.exit(1);
}

if (warnings) {
  console.log(yellow(bold("\nWARN — optional KDD memory artifact(s) are missing/stale; product correctness is not blocked.\n")));
  process.exit(0);
}

console.log(green(bold("\nGREEN — KDD memory manifest matches accepted sources and declared indexes.\n")));
