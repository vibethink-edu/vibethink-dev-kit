#!/usr/bin/env node
import { execSync } from "node:child_process";
/**
 * kdd-refresh — write the KDD memory freshness manifest.
 *
 * DevKit stays engine-neutral: this tool computes the auditable source fingerprint
 * and records declared index artifacts. A consuming repo may configure refresh
 * commands for Graphify, Engram, vector stores, or markdown-only adapters and run
 * them with --run-indexes before the manifest is written.
 *
 * Usage:
 *   node tools/kdd-refresh.mjs tools/knowledge-memory.config.json
 *   node tools/kdd-refresh.mjs tools/knowledge-memory.config.json --run-indexes
 *
 * Exit: 0 manifest written · 1 refresh command failed · 2 setup/config error.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { resolveArtifactCacheRoot, storeVerifiedArtifact } from "./lib/kdd-artifact-cache.mjs";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const configPath = args.find((a) => !a.startsWith("-")) || "tools/knowledge-memory.config.json";
const RUN_INDEXES = args.includes("--run-indexes");

function setupFail(msg) {
  console.error(`✗ kdd-refresh — ${msg}`);
  process.exit(2);
}

const toAbs = (p) => (isAbsolute(p) ? p : join(ROOT, p));
const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const derivedIndexDirectories = new Set(["graphify-out", "engram-out", ".engram"]);

const absConfig = toAbs(configPath);
if (!isFile(absConfig)) setupFail(`config not found: ${configPath}`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(absConfig, "utf8"));
} catch (e) {
  setupFail(`config is not valid JSON: ${e.message}`);
}

const manifestPath = cfg.manifestPath || "docs/knowledge/.kdd-memory-manifest.json";
const absManifest = toAbs(manifestPath);
const sourceRoots =
  Array.isArray(cfg.sourceRoots) && cfg.sourceRoots.length
    ? cfg.sourceRoots
    : [cfg.knowledgeRoot || "docs/knowledge"];
const sourceExtensions = new Set(
  (Array.isArray(cfg.sourceExtensions) && cfg.sourceExtensions.length
    ? cfg.sourceExtensions
    : [".md", ".json", ".yaml", ".yml"]
  ).map((e) => e.toLowerCase())
);
const sourceStatuses =
  Array.isArray(cfg.sourcePackStatuses) && cfg.sourcePackStatuses.length
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
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        derivedIndexDirectories.has(entry.name)
      )
        continue;
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
  if (sourceExclusions.has(fileRel)) return false;
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

const indexes = Array.isArray(cfg.indexes) ? cfg.indexes : [];
if (RUN_INDEXES) {
  for (const index of indexes) {
    if (!index.refreshCommand) continue;
    try {
      console.log(`running ${index.name || "index"} refresh: ${index.refreshCommand}`);
      execSync(index.refreshCommand, { cwd: ROOT, stdio: "inherit", shell: true });
    } catch (e) {
      console.error(`✗ refresh failed for ${index.name || "index"}: ${e.message}`);
      process.exit(1);
    }
  }
}

const sourceFiles = [
  ...new Set(
    sourceRoots
      .flatMap(walk)
      .filter(includeSource)
      .map((p) => resolve(p))
  ),
]
  .sort((a, b) => rel(a).localeCompare(rel(b)))
  .map(fileRecord);

const indexRecords = indexes.map((index) => {
  const artifacts = (Array.isArray(index.artifacts) ? index.artifacts : []).map((artifact) => {
    const p = toAbs(artifact);
    if (!isFile(p)) return { path: rel(p), exists: false };
    const r = fileRecord(p);
    return { ...r, exists: true };
  });
  return {
    name: index.name || "unnamed",
    required: index.required === true,
    requireArtifactNewerThanSources: index.requireArtifactNewerThanSources !== false,
    refreshCommand: index.refreshCommand || null,
    artifacts,
  };
});

const manifest = {
  $schema: "VIBETHINK_KDD_MEMORY_MANIFEST_V1",
  generatedAt: new Date().toISOString(),
  configPath: rel(absConfig),
  adapter: cfg.knowledgeMemoryAdapter || cfg.adapter || null,
  sourceRoots,
  sourceExtensions: [...sourceExtensions].sort(),
  sourcePackStatuses: sourceStatuses,
  sourceExclusions: [...sourceExclusions].sort(),
  sourceFingerprint: fingerprint(sourceFiles),
  sourceFiles,
  indexes: indexRecords,
};

const artifactCacheRoot = resolveArtifactCacheRoot(ROOT, cfg);
if (cfg.artifactCache?.mode === "git-common-dir" && !artifactCacheRoot) {
  setupFail(
    "artifactCache.mode is git-common-dir but Git's common directory could not be resolved"
  );
}
let cachedArtifacts = 0;
if (artifactCacheRoot) {
  for (const index of indexRecords) {
    for (const artifact of index.artifacts) {
      if (!artifact.exists || !artifact.sha256) continue;
      const stored = storeVerifiedArtifact({
        cacheRoot: artifactCacheRoot,
        artifactPath: toAbs(artifact.path),
        expectedHash: artifact.sha256,
      });
      if (!stored && index.required) {
        console.error(`✗ required artifact could not be stored in shared cache: ${artifact.path}`);
        process.exit(1);
      }
      if (stored) cachedArtifacts++;
    }
  }
}

mkdirSync(dirname(absManifest), { recursive: true });
writeFileSync(absManifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`✓ wrote ${rel(absManifest)}`);
console.log(`  sources: ${sourceFiles.length}`);
console.log(`  sourceFingerprint: ${manifest.sourceFingerprint}`);
console.log(`  indexes: ${indexRecords.length}`);
if (artifactCacheRoot) console.log(`  shared cache: ${cachedArtifacts} artifact(s)`);
