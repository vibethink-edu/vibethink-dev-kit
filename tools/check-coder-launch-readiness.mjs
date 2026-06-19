#!/usr/bin/env node
/**
 * check-coder-launch-readiness.mjs — is this repo's coder launch-surface READY?
 * Closes F2 of CANON-CHANGE-PATH-AND-DECISION-CLASSES-001 §3.1: an agent that
 * decides "dispatch a coder" must be able to verify readiness ITSELF, instead of
 * punting the infra to the human (who then becomes the per-repo verifier).
 *
 * Split exactly the way CANON-AUDIT-PROTOCOL §8.7 splits a gate:
 *   - PORTABLE half (this gate): the launch-surface ARTIFACTS are present — a launch
 *     script, the per-session allowlist/deny settings, a declared bot-token env-var,
 *     and (if declared) the prompt dir. An agent runs this and gets "ready / missing X"
 *     with no human round-trip.
 *   - NON-PORTABLE half (NOT this gate): the live forge state — the bot account is
 *     low-privilege, the default branch is protected. A portable check cannot read it;
 *     it stays an L3 / human-forge confirmation. The GREEN verdict says so explicitly.
 *
 * A repo with no ready launch-surface must NOT improvise a coder — it stands the
 * surface up first (RUNBOOK-LAUNCH-CODERS §1–§3).
 *
 * Config-driven, skip-when-no-config (devkit-doctor skips it where no config exists).
 * Verdict-first. Exit: 0 = GREEN (ready) · 1 = RED (not ready) · 2 = setup error
 * (missing/invalid config). Pure Node, zero deps.
 *
 * Run: node tools/check-coder-launch-readiness.mjs tools/coder-launch-readiness.config.json
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CWD = process.cwd();
const configRel = process.argv[2];

function die(code, msg) {
  console.log(msg);
  process.exit(code);
}

if (!configRel)
  die(2, "RED — setup error: no config path given (usage: check-coder-launch-readiness <config>)");

const configPath = join(CWD, configRel);
if (!existsSync(configPath)) die(2, `RED — setup error: config not found at ${configRel}`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  die(2, `RED — setup error: config not valid JSON (${e.message})`);
}

// A non-empty file is present. A zero-byte file counts as missing (an empty launch
// script / settings file is not a ready surface).
function fileReady(rel) {
  const p = join(CWD, rel);
  if (!existsSync(p)) return false;
  try {
    return statSync(p).size > 0;
  } catch {
    return false;
  }
}
function dirReady(rel) {
  const p = join(CWD, rel);
  try {
    return existsSync(p) && statSync(p).isDirectory();
  } catch {
    return false;
  }
}

const missing = [];

// 1. launch script — the one command that runs the identity gate + worktree + launch.
if (!cfg.launchScript || typeof cfg.launchScript !== "string") {
  missing.push("launchScript: not declared in config (RUNBOOK §3)");
} else if (!fileReady(cfg.launchScript)) {
  missing.push(`launchScript: missing or empty at ${cfg.launchScript} (RUNBOOK §3)`);
}

// 2. per-session settings — the allowlist + deny-guard.
if (!cfg.sessionSettings || typeof cfg.sessionSettings !== "string") {
  missing.push("sessionSettings: not declared in config (RUNBOOK §5)");
} else if (!fileReady(cfg.sessionSettings)) {
  missing.push(`sessionSettings: missing or empty at ${cfg.sessionSettings} (RUNBOOK §5)`);
}

// 3. bot-token env-var — the NAME must be declared (the value lives in the session env,
//    never in a file; we check the declaration exists, not the secret).
if (!cfg.botTokenEnvVar || typeof cfg.botTokenEnvVar !== "string" || !cfg.botTokenEnvVar.trim()) {
  missing.push(
    "botTokenEnvVar: no bot-token env-var name declared (CANON-CODER-SAFE-IDENTITY-001 §4/§9)"
  );
}

// 4. prompt dir — optional; if declared it must exist (holds prompt-*.txt).
if (cfg.promptDir != null) {
  if (typeof cfg.promptDir !== "string" || !dirReady(cfg.promptDir)) {
    missing.push(
      `promptDir: declared but missing at ${cfg.promptDir} (RUNBOOK §3 / coder-prompt template)`
    );
  }
}

if (missing.length === 0) {
  const promptDirNote = cfg.promptDir != null ? ", prompt dir" : "";
  console.log(
    `GREEN — coder launch-surface READY: the portable artifacts (launch script, per-session settings, bot-token env-var declared${promptDirNote}) are present. NOT checked here (L3 / forge confirmation): the bot account is low-privilege and the default branch is protected (CANON-CODER-SAFE-IDENTITY-001 §3).`
  );
  process.exit(0);
}

console.log(
  `RED — coder launch-surface NOT ready: ${missing.length} artifact(s) missing. Do NOT improvise a coder — stand the surface up first (RUNBOOK-LAUNCH-CODERS §1–§3):`
);
for (const m of missing) console.log(`  ✗ ${m}`);
process.exit(1);
