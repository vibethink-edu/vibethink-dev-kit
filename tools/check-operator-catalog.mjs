#!/usr/bin/env node
/**
 * check-operator-catalog — keeps an operator command adapter honest.
 *
 * Field use of the operator command catalog (REFERENCE-OPERATOR-COMMAND-CATALOG)
 * showed `commands-help` listing junk: dead commands (a trigger with no body),
 * duplicate triggers, and prefix collisions (a short trigger firing before the
 * long one). This gate is the machine enforcement of catalog rule 6 (prefix-safe)
 * and rule 8 (one canonical trigger per intention — no dead/duplicate entries).
 *
 * It lints an Espanso-style adapter's TRIGGER SET + body presence only. It is
 * tool-neutral in intent (the shape it parses is the shipped template's shape)
 * and it NEVER executes a command body.
 *
 * Three RED conditions:
 *   - dead-command     — a trigger whose body (`replace`) is empty/missing.
 *   - duplicate-trigger — the same trigger defined twice.
 *   - prefix-collision  — a trigger that is an exact prefix of another (rule 6).
 *
 * Config (tools/operator-catalog.config.json), optional:
 *   { "adapter": "setup/templates/operator-command-expanders/operator-commands.example.yml" }
 * With no config, it defaults to the shipped example (the kit dogfoods its own
 * template). A consumer points `adapter` at their real local adapter to lint it.
 * If neither a config nor the default example exists → skip-with-note (GREEN),
 * the kit convention (a repo that ships no adapter has nothing to lint).
 *
 * Usage: node tools/check-operator-catalog.mjs [config-path]
 * Exit: 0 = GREEN (clean or skipped) · 1 = RED (adapter defect) · 2 = setup error.
 * Pure Node, zero deps.
 *
 * Non-goal: it does not cross-check triggers against §4's curated markdown (that
 * set is prose, not a machine manifest). It proves the adapter is internally
 * clean, which is what stops `commands-help` from listing dead/dup/colliding cmds.
 */
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

const ROOT = process.cwd();
const DEFAULT_CONFIG = "tools/operator-catalog.config.json";
const DEFAULT_ADAPTER =
  "setup/templates/operator-command-expanders/operator-commands.example.yml";

// ── pure core (unit-tested directly) ──────────────────────────────────────

/**
 * Lint a normalized command set.
 * @param {Array<{trigger: string, hasBody: boolean}>} commands
 * @returns {{ok: boolean, problems: Array<{kind: string, trigger: string, other?: string}>}}
 */
export function lintOperatorAdapter(commands) {
  const problems = [];
  const seen = new Map(); // trigger -> first index

  for (const cmd of commands) {
    const t = cmd.trigger;
    if (!cmd.hasBody) {
      problems.push({ kind: "dead-command", trigger: t });
    }
    if (seen.has(t)) {
      problems.push({ kind: "duplicate-trigger", trigger: t });
    } else {
      seen.set(t, true);
    }
  }

  // prefix collision: an exact prefix of another distinct trigger.
  const triggers = commands.map((c) => c.trigger);
  for (const a of new Set(triggers)) {
    for (const b of new Set(triggers)) {
      if (a !== b && b.startsWith(a)) {
        problems.push({ kind: "prefix-collision", trigger: a, other: b });
      }
    }
  }

  return { ok: problems.length === 0, problems };
}

// ── IO: minimal Espanso adapter scan (trigger set + body presence) ─────────

const BLOCK_INDICATORS = new Set([">", "|", ">-", "|-", ">+", "|+"]);

function unquote(raw) {
  const s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

/**
 * Extract [{trigger, hasBody}] from an Espanso adapter's `matches:` section.
 * Supports the shipped template shape: list items delimited by `- trigger:`
 * (singular) or `- triggers:` (list), with an inline or block `replace:` body.
 * Deliberately narrow: it reads the trigger set + body presence, not full YAML.
 */
export function parseEspansoAdapter(text) {
  const lines = text.split(/\r?\n/);
  const matchesIdx = lines.findIndex((l) => /^matches:\s*$/.test(l));
  if (matchesIdx === -1) return [];

  const commands = [];
  let cur = null;
  const flush = () => {
    if (!cur) return;
    for (const trig of cur.triggers) {
      commands.push({ trigger: trig, hasBody: cur.hasBody });
    }
    cur = null;
  };

  for (let i = matchesIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    // a new column-0 key ends the matches section
    if (/^\S/.test(line)) {
      flush();
      break;
    }

    const isListItem = /^\s*-\s/.test(line);
    const triggerM = line.match(/^\s*-?\s*trigger:\s*(.+?)\s*$/);
    const triggersM = /^\s*-?\s*triggers:\s*$/.test(line);
    const inlineTriggerListM = line.match(/^\s*-\s*(["']?:[^"'\s]+["']?)\s*$/);

    if (triggerM) {
      if (isListItem) flush();
      cur = cur || { triggers: [], hasBody: false };
      cur.triggers.push(unquote(triggerM[1]));
      continue;
    }
    if (triggersM) {
      if (isListItem) flush();
      cur = cur || { triggers: [], hasBody: false };
      continue;
    }
    // a bare `- ":x"` list item directly under a `triggers:` list
    if (cur && cur.triggers.length >= 0 && inlineTriggerListM && !/(trigger|replace):/.test(line)) {
      cur.triggers.push(unquote(inlineTriggerListM[1]));
      continue;
    }

    const replaceM = line.match(/^\s*replace:\s*(.*)$/);
    if (replaceM && cur) {
      const val = replaceM[1].trim();
      if (BLOCK_INDICATORS.has(val)) {
        // block scalar: body present if any following more-indented line is non-empty
        let hasContent = false;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() === "") continue;
          if (/^\s*-\s/.test(lines[j]) || /^\S/.test(lines[j])) break;
          hasContent = true;
          break;
        }
        cur.hasBody = hasContent;
      } else {
        cur.hasBody = unquote(val).length > 0;
      }
    }
  }
  flush();
  return commands;
}

// ── CLI ────────────────────────────────────────────────────────────────────

function green(msg) {
  console.log(`✅ check-operator-catalog: ${msg}`);
  process.exit(0);
}
function red(problems, adapterRel) {
  console.log(`❌ check-operator-catalog: ${problems.length} defect(s) in ${adapterRel}`);
  for (const p of problems) {
    if (p.kind === "prefix-collision") {
      console.log(`   • prefix-collision: "${p.trigger}" is an exact prefix of "${p.other}" (rule 6)`);
    } else if (p.kind === "duplicate-trigger") {
      console.log(`   • duplicate-trigger: "${p.trigger}" is defined more than once`);
    } else {
      console.log(`   • dead-command: "${p.trigger}" has an empty/missing body`);
    }
  }
  console.log(`   fix: one canonical trigger per intention (rule 8), prefix-safe (rule 6), every command a body.`);
  process.exit(1);
}
function setupError(msg) {
  console.error(`check-operator-catalog setup error: ${msg}`);
  process.exit(2);
}

function main() {
  const configArg = process.argv[2];
  const configRel = configArg || DEFAULT_CONFIG;
  const configAbs = isAbsolute(configRel) ? configRel : join(ROOT, configRel);

  let adapterRel = DEFAULT_ADAPTER;
  if (existsSync(configAbs)) {
    let cfg;
    try {
      cfg = JSON.parse(readFileSync(configAbs, "utf8"));
    } catch (e) {
      setupError(`config is not valid JSON (${e.message})`);
    }
    if (cfg && typeof cfg.adapter === "string" && cfg.adapter.trim()) {
      adapterRel = cfg.adapter.trim();
    }
  } else if (configArg) {
    // an explicit config path was given but does not exist → setup error
    setupError(`config not found: ${configRel}`);
  }

  const adapterAbs = isAbsolute(adapterRel) ? adapterRel : join(ROOT, adapterRel);
  if (!existsSync(adapterAbs)) {
    // no adapter to lint (and no explicit config demanded one) → skip-with-note
    green(`no adapter at ${adapterRel} — nothing to lint (skip)`);
  }

  const text = readFileSync(adapterAbs, "utf8");
  const commands = parseEspansoAdapter(text);
  if (commands.length === 0) {
    green(`${adapterRel} defines no matches — nothing to lint (skip)`);
  }

  const { ok, problems } = lintOperatorAdapter(commands);
  if (ok) {
    green(`${commands.length} commands clean in ${adapterRel} (no dead/duplicate/prefix-colliding triggers)`);
  }
  red(problems, adapterRel);
}

// run only as CLI, not when imported by the test
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("check-operator-catalog.mjs")) {
  main();
}
