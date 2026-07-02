#!/usr/bin/env node
/**
 * check-knowledge-pack — structural gate for CANON-KNOWLEDGE-NATIVE-VT-METHOD-001.
 *
 * It does not judge semantic quality. It only verifies that accepted/candidate
 * knowledge lives in files, has the minimum shape, carries traceable references,
 * and that complex/product-shaping feature docs declare a Knowledge Baseline.
 *
 * Config (tools/knowledge-pack.config.json):
 * {
 *   "knowledgeRoot": "docs/knowledge",
 *   "featureRoots": ["docs/features", "specs"],
 *   "requiredPackArtifacts": ["PACK-METADATA.md", "BUSINESS-CONTEXT.md", "..."],
 *   "knowledgeMemoryAdapter": {
 *     "name": "vibethink-default",
 *     "required": true,
 *     "engines": ["engram", "graphify"],
 *     "sourceOfTruth": "versioned-markdown"
 *   },
 *   "featureKnowledgeBaseline": {
 *     "sectionName": "Knowledge Baseline",
 *     "requiredFor": ["complex", "product-shaping", "ai-assisted", "cross-boundary"],
 *     "requireAdapterCitation": true
 *   },
 *   "engines": { "graphify": { "optional": true }, "engram": { "optional": true } }
 * }
 *
 * Exit: 0 holds · 1 structural failure · 2 setup/config error.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve, dirname } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/knowledge-pack.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

const DEFAULT_REQUIRED = [
  "PACK-METADATA.md",
  "BUSINESS-CONTEXT.md",
  "PRODUCT-CONTEXT.md",
  "DOMAIN-VOCABULARY.md",
  "OPERATING-RULES.md",
  "DECISION-LINKS.md",
  "WORKED-SCENARIOS.md",
  "ANTI-EXAMPLES.md",
  "OPEN-QUESTIONS.md",
  "SOURCES.md",
];

function fail(msg) {
  console.error(`✗ check-knowledge-pack — ${msg}`);
  process.exit(2);
}

const abs = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
if (!existsSync(abs)) fail(`config not found: ${configPath}`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(abs, "utf8"));
} catch (e) {
  fail(`config is not valid JSON: ${e.message}`);
}

const toAbs = (p) => (isAbsolute(p) ? p : join(ROOT, p));
const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const nonEmptyFile = (p) => isFile(p) && statSync(p).size > 0;

function walkMarkdown(dir) {
  if (!isDir(dir)) return [];
  const out = [];
  const stack = [dir];
  for (let i = 0; i < stack.length; i++) {
    for (const e of readdirSync(stack[i], { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".git")) continue;
      const p = join(stack[i], e.name);
      if (e.isDirectory()) stack.push(p);
      else if (extname(e.name).toLowerCase() === ".md") out.push(p);
    }
  }
  return out;
}

function markdownLinks(text) {
  const links = [];
  const re = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const m of text.matchAll(re)) links.push(m[1].trim());
  return links;
}

function isExternalLink(href) {
  return /^(https?:|mailto:|#)/i.test(href);
}

function linkTargetExists(file, href) {
  if (isExternalLink(href)) return true;
  const clean = href.split("#")[0].trim();
  if (!clean) return true;
  const decoded = clean.replace(/^<|>$/g, "");
  const candidates = [resolve(dirname(file), decoded), resolve(ROOT, decoded)];
  return candidates.some((p) => existsSync(p));
}

function metadataStatus(packDir) {
  const p = join(packDir, "PACK-METADATA.md");
  if (!isFile(p)) return null;
  const text = readFileSync(p, "utf8");
  const status = (text.match(/^\s*status:\s*([a-z-]+)/im) || [])[1] || null;
  const validator = (text.match(/^\s*validator:\s*(.+)$/im) || [])[1]?.trim() || "";
  return { status, validator };
}

function checkOpenQuestions(file) {
  if (!isFile(file)) return [];
  const problems = [];
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!/^\|.*\|$/.test(line) || /^(\|\s*-+\s*)+\|$/.test(line)) continue;
    if (/Question\s*\|\s*Owner\s*\|\s*Status/i.test(line)) continue;
    const cols = line
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    if (cols.length < 3) continue;
    const [question, owner, status] = cols;
    if (!question || /^<.*>$/.test(question)) continue;
    if (!owner || /^<.*>$/.test(owner)) problems.push(`open question missing owner: ${question}`);
    if (!status || /^<.*>$/.test(status)) problems.push(`open question missing status: ${question}`);
  }
  return problems;
}

function hasHeading(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^#{1,6}\\s+${escaped}\\s*$`, "im").test(text);
}

function featureRequiresBaseline(text, markers) {
  const lower = text.toLowerCase();
  if (/knowledge\s*required\s*:\s*true/i.test(text)) return true;
  return markers.some((m) => lower.includes(String(m).toLowerCase()));
}

function baselineReference(text, sectionName) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^#{1,6}\\s+${sectionName}\\s*$`, "i").test(l));
  if (start < 0) return null;
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  const joined = body.join("\n");
  const href = markdownLinks(joined)[0] || (joined.match(/baseline\s*:\s*(\S+)/i) || [])[1] || null;
  return href;
}

function sectionBody(text, sectionName) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^#{1,6}\\s+${sectionName}\\s*$`, "i").test(l));
  if (start < 0) return "";
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

function citesAdapter(section, adapterNames) {
  if (/knowledge\s+memory\s+adapter\s*:/i.test(section)) return true;
  if (/retrieved\s+via\s*:/i.test(section)) return true;
  if (/adapter\s*:/i.test(section)) return true;
  const lower = section.toLowerCase();
  return adapterNames.some((name) => name && lower.includes(String(name).toLowerCase()));
}

console.log(`\ncheck-knowledge-pack · ${rel(abs)}`);
console.log(`repo: ${ROOT}\n`);

let problems = 0;
let ok = 0;
let na = 0;

const adapter = cfg.knowledgeMemoryAdapter;
const adapterRequired = !adapter || adapter.required !== false;
const adapterNames = [];

if (adapterRequired) {
  if (!adapter || typeof adapter !== "object") {
    problems++;
    console.log(
      `  ${red("✗")} knowledge adapter      missing knowledgeMemoryAdapter (VT-METHOD requires a declared retrieval path)`
    );
  } else {
    if (adapter.name) adapterNames.push(adapter.name);
    if (adapter.profile) adapterNames.push(adapter.profile);
    if (Array.isArray(adapter.engines)) adapterNames.push(...adapter.engines);
    if (adapter.sourceOfTruth) adapterNames.push(adapter.sourceOfTruth);

    const hasName = typeof adapter.name === "string" && adapter.name.trim();
    const hasTruth = typeof adapter.sourceOfTruth === "string" && adapter.sourceOfTruth.trim();
    const hasRetrieval =
      Array.isArray(adapter.engines) && adapter.engines.length > 0
        ? adapter.engines.every((e) => typeof e === "string" && e.trim())
        : typeof adapter.retrieval === "string" && adapter.retrieval.trim();
    if (!hasName || !hasTruth || !hasRetrieval) {
      problems++;
      console.log(
        `  ${red("✗")} knowledge adapter      declare name, retrieval engines/path, and sourceOfTruth`
      );
    } else {
      ok++;
      console.log(
        `  ${green("✓")} knowledge adapter      ${adapter.name} (${adapter.sourceOfTruth})`
      );
    }
  }
} else {
  na++;
  console.log("  – knowledge adapter      N-A (config declares adapter not required)");
}

if (cfg.knowledgeRoot === null || cfg.knowledgeRoot === undefined) {
  na++;
  console.log("  – knowledgeRoot           N-A (no knowledge root declared)");
} else if (typeof cfg.knowledgeRoot !== "string" || !cfg.knowledgeRoot.trim()) {
  problems++;
  console.log(`  ${red("✗")} knowledgeRoot           invalid value`);
} else {
  const root = toAbs(cfg.knowledgeRoot);
  if (!isDir(root)) {
    problems++;
    console.log(`  ${red("✗")} knowledgeRoot           ${cfg.knowledgeRoot} is not a directory`);
  } else {
    const required = Array.isArray(cfg.requiredPackArtifacts) && cfg.requiredPackArtifacts.length
      ? cfg.requiredPackArtifacts
      : DEFAULT_REQUIRED;
    const packDirs = (Array.isArray(cfg.packs) && cfg.packs.length
      ? cfg.packs.map((p) => toAbs(p.path || p))
      : readdirSync(root, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => join(root, d.name))
    ).filter(Boolean);

    if (packDirs.length === 0) {
      problems++;
      console.log(`  ${red("✗")} packs                   no pack directories under ${cfg.knowledgeRoot}`);
    }

    for (const pack of packDirs) {
      if (!isDir(pack)) {
        problems++;
        console.log(`  ${red("✗")} pack                    ${rel(pack)} is not a directory`);
        continue;
      }
      let packProblems = 0;
      for (const artifact of required) {
        const file = join(pack, artifact);
        if (!nonEmptyFile(file)) {
          packProblems++;
          console.log(`  ${red("✗")} pack                    ${rel(pack)} missing/non-empty ${artifact}`);
        }
      }
      const meta = metadataStatus(pack);
      if (meta && !["raw-input", "candidate", "accepted", "superseded", "rejected"].includes(meta.status || "")) {
        packProblems++;
        console.log(`  ${red("✗")} pack                    ${rel(pack)} has invalid status`);
      }
      if (meta?.status === "accepted" && (!meta.validator || /^pending$/i.test(meta.validator))) {
        packProblems++;
        console.log(`  ${red("✗")} pack                    ${rel(pack)} accepted without validator`);
      }
      for (const q of checkOpenQuestions(join(pack, "OPEN-QUESTIONS.md"))) {
        packProblems++;
        console.log(`  ${red("✗")} open questions          ${rel(pack)}: ${q}`);
      }
      for (const file of walkMarkdown(pack)) {
        const text = readFileSync(file, "utf8");
        for (const href of markdownLinks(text)) {
          if (!linkTargetExists(file, href)) {
            packProblems++;
            console.log(`  ${red("✗")} reference               ${rel(file)} -> ${href} does not resolve`);
          }
        }
      }
      if (packProblems === 0) {
        ok++;
        console.log(`  ${green("✓")} pack                    ${rel(pack)}`);
      } else {
        problems += packProblems;
      }
    }
  }
}

const featureRoots = Array.isArray(cfg.featureRoots) ? cfg.featureRoots : [];
const baselineCfg = cfg.featureKnowledgeBaseline || {};
const sectionName = baselineCfg.sectionName || "Knowledge Baseline";
const requireAdapterCitation = baselineCfg.requireAdapterCitation !== false;
const markers = Array.isArray(baselineCfg.requiredFor)
  ? baselineCfg.requiredFor
  : ["complex", "product-shaping", "ai-assisted", "cross-boundary"];

if (featureRoots.length === 0) {
  na++;
  console.log("  – feature baselines       N-A (no feature roots declared)");
} else {
  let checked = 0;
  for (const rootRel of featureRoots) {
    const root = toAbs(rootRel);
    if (!isDir(root)) {
      problems++;
      console.log(`  ${red("✗")} featureRoot             ${rootRel} is not a directory`);
      continue;
    }
    for (const file of walkMarkdown(root)) {
      const text = readFileSync(file, "utf8");
      if (!featureRequiresBaseline(text, markers)) continue;
      checked++;
      if (!hasHeading(text, sectionName)) {
        problems++;
        console.log(`  ${red("✗")} feature baseline        ${rel(file)} missing "${sectionName}" section`);
        continue;
      }
      const href = baselineReference(text, sectionName);
      if (!href || !linkTargetExists(file, href)) {
        problems++;
        console.log(`  ${red("✗")} feature baseline        ${rel(file)} baseline reference missing/unresolved`);
      }
      if (requireAdapterCitation && !citesAdapter(sectionBody(text, sectionName), adapterNames)) {
        problems++;
        console.log(`  ${red("✗")} feature baseline        ${rel(file)} missing knowledge adapter citation`);
      }
    }
  }
  if (checked > 0 && problems === 0) {
    ok++;
    console.log(`  ${green("✓")} feature baselines       ${checked} marked feature(s) cite a baseline`);
  } else if (checked === 0) {
    console.log("  – feature baselines       no marked feature docs found");
  }
}

const engines = cfg.engines || {};
for (const [name, engine] of Object.entries(engines)) {
  const required = engine && engine.optional === false;
  console.log(
    `  ${required ? "•" : "–"} engine:${name.padEnd(14)} ${required ? "declared required by L3" : "optional L3 binding"}`
  );
}

console.log(`\n${bold("─".repeat(60))}`);
console.log(`${bold("OK:")} ${green(String(ok))}   ${bold("N-A:")} ${na}   ${bold("Problems:")} ${problems ? red(String(problems)) : "0"}`);
console.log(`${bold("─".repeat(60))}`);

if (problems) {
  console.log(
    `${red(bold(`\nRED — ${problems} knowledge-pack structural problem(s).`))} (fix artifacts/references/baseline declarations; semantic quality is reviewed by the authority.)\n`
  );
  process.exit(1);
}

console.log(green(bold("\nGREEN — knowledge packs are structurally usable (CANON-KNOWLEDGE-NATIVE-VT-METHOD-001).\n")));
process.exit(0);
