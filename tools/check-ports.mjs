#!/usr/bin/env node
/**
 * check-ports — makes CANON-PORT-ASSIGNMENT-001 BITE for a repo that deploys.
 *
 * The principle: an instance declares its ports canonically; the kit mandates THAT
 * you declare them, never WHICH ports. No canonical declaration → the deploy is
 * refused (fail-closed). This gate is that refusal, wired into the board so it is
 * verified — not left as a hand-kept promise (the §8.6 lesson: an invariant with no
 * gate is un-looked-at, not green).
 *
 * Config-driven, N-A-aware, same spirit as check-versioning / check-feature-docs:
 *   - deploys:false → the gate does not apply (a markdown/library repo with no
 *     runtime); reported as a conscious N-A, never a failure.
 *   - deploys:true + no canonical declaration (missing/empty) → FAIL. This is the
 *     fail-closed refusal: you said you deploy, but you did not declare your ports.
 *   - declaration present → carried. If you use the kit's RECOMMENDED form
 *     (format:"recommended"), the gate also rejects a port claimed by two services
 *     (the exact collision the canon exists to prevent). A "custom" form is checked
 *     for existence only — you own its shape and its overlap check.
 *   - No config at all → the gate does not apply (the doctor skips it).
 *
 * It does NOT prescribe the numbers, the ranges, or the file name — those are the
 * instance's L3 content. It guarantees the DECLARATION EXISTS before a deploy.
 *
 * Config (tools/ports.config.json):
 *   {
 *     "deploys": true | false,
 *     "declaration": "ports.json" | null,
 *     "format": "recommended" | "custom"
 *   }
 *
 * Usage:  node tools/check-ports.mjs [config-path]   (default: tools/ports.config.json)
 * Exit: 0 holds (carried or conscious N-A) · 1 declaration missing/colliding (refuse deploy) · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/ports.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function fail(msg) {
  console.error(`✗ check-ports — ${msg}`);
  process.exit(2);
}

const abs = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
if (!existsSync(abs))
  fail(
    `config not found: ${configPath} (a repo declares its deploy/port posture here — see tools/ports.config.example.json)`
  );

let cfg;
try {
  cfg = JSON.parse(readFileSync(abs, "utf8"));
} catch (e) {
  fail(`config is not valid JSON: ${e.message}`);
}

console.log(`\ncheck-ports · ${relative(ROOT, abs)}`);
console.log(`repo: ${ROOT}\n`);

const resolve = (value) => (isAbsolute(value) ? value : join(ROOT, value));
const nonEmptyFile = (value) => {
  const p = resolve(value);
  return existsSync(p) && statSync(p).isFile() && statSync(p).size > 0;
};

let problems = 0;
let carried = 0;
let na = 0;

// 1. Does this repo deploy at all? deploys:false is a conscious N-A.
const deploys = cfg?.deploys;
if (deploys === false) {
  na++;
  console.log(`  – deploys                 N-A (repo declares no runtime services)`);
  console.log(`\n${bold("─".repeat(60))}`);
  console.log(
    `${bold("Carried:")} ${green(String(carried))}   ${bold("N-A:")} ${na}   ${bold("Refusals:")} 0`
  );
  console.log(`${bold("─".repeat(60))}`);
  console.log(green(bold("\nGREEN — no runtime; the port discipline does not apply.\n")));
  process.exit(0);
}
if (deploys !== true) {
  fail(`"deploys" must be a boolean (true if this repo runs/deploys services, false if not)`);
}

// 2. deploys:true → the canonical declaration MUST exist (fail-closed).
const declaration = cfg?.declaration;
if (declaration === null || declaration === undefined || !String(declaration).trim()) {
  problems++;
  console.log(
    `  ${red("✗")} declaration             REFUSED — repo declares it deploys but names no canonical port declaration`
  );
} else if (!nonEmptyFile(declaration)) {
  problems++;
  console.log(
    `  ${red("✗")} declaration             REFUSED — declared "${declaration}" but it is missing or empty`
  );
} else {
  carried++;
  console.log(`  ${green("✓")} declaration             ${declaration}`);

  // 3. If using the kit's RECOMMENDED form, sanity-check for port collisions.
  const format = cfg?.format ?? "recommended";
  if (format === "recommended") {
    try {
      const decl = JSON.parse(readFileSync(resolve(declaration), "utf8"));
      const seen = new Map(); // port/range value → "system.service"
      const systems = decl?.systems ?? {};
      let collisions = 0;
      for (const [sys, services] of Object.entries(systems)) {
        if (!services || typeof services !== "object") continue;
        for (const [svc, value] of Object.entries(services)) {
          if (value === null || value === undefined) continue;
          const key = String(value);
          const where = `${sys}.${svc}`;
          if (seen.has(key)) {
            collisions++;
            console.log(
              `  ${red("✗")} declaration             collision — ${where} and ${seen.get(key)} both claim "${key}"`
            );
          } else {
            seen.set(key, where);
          }
        }
      }
      if (collisions > 0) problems += collisions;
      else
        console.log(
          `  ${green("✓")} no-collision            ${seen.size} declared port(s)/range(s), none shared`
        );
    } catch (e) {
      problems++;
      console.log(
        `  ${red("✗")} declaration             format:"recommended" but not valid JSON (${e.message}) — fix it or set format:"custom"`
      );
    }
  } else {
    na++;
    console.log(
      `  – format                 custom (existence checked; overlap is the instance's own check)`
    );
  }
}

console.log(`\n${bold("─".repeat(60))}`);
console.log(
  `${bold("Carried:")} ${green(String(carried))}   ${bold("N-A:")} ${na}   ${bold("Refusals:")} ${problems ? red(String(problems)) : "0"}`
);
console.log(`${bold("─".repeat(60))}`);

if (problems) {
  console.log(
    `${red(bold(`\nRED — deploy refused: ${problems} port-declaration problem(s).`))} (declare your ports canonically — CANON-PORT-ASSIGNMENT-001 §3 — or set deploys:false for a conscious N-A.)\n`
  );
  process.exit(1);
}
console.log(
  green(bold("\nGREEN — canonical port declaration present (CANON-PORT-ASSIGNMENT-001).\n"))
);
process.exit(0);
