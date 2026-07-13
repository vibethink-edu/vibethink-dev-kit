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
 * It lints an Espanso-style adapter's TRIGGER SET + body presence only. It never
 * executes a command body.
 *
 * Three RED conditions:
 *   - dead-command      — a trigger whose body is empty/missing.
 *   - duplicate-trigger — the same trigger defined twice.
 *   - prefix-collision  — a trigger that is an exact prefix of another (rule 6).
 *
 * SAFE FAILURE MODE (design principle): a hand-rolled scanner cannot parse every
 * Espanso shape. When it is unsure it FAILS LOUD (exit 2 setup error), NEVER
 * silently GREEN. A parse-completeness self-check (parsed fewer triggers than the
 * file declares → exit 2) turns any unanticipated shape into a loud stop instead
 * of a false "clean". A false RED is annoying; a false GREEN over a broken adapter
 * is the failure this gate exists to prevent.
 *
 * Config (tools/operator-catalog.config.json), optional:
 *   { "adapter": "setup/templates/operator-command-expanders/operator-commands.example.yml" }
 * With no config, it defaults to the shipped example (the kit dogfoods its own
 * template). A consumer points `adapter` at their real local adapter to lint it.
 *   - no config AND default example absent  → skip-with-note (GREEN) — opted out.
 *   - config names an adapter that is MISSING → exit 2 (loud — a demanded file is gone).
 *
 * Usage: node tools/check-operator-catalog.mjs [config-path]
 * Exit: 0 = GREEN (clean or opted-out skip) · 1 = RED (adapter defect) · 2 = setup error.
 * Pure Node, zero deps.
 *
 * Non-goal: it does not cross-check triggers against §4's curated markdown (that
 * set is prose, not a machine manifest). It proves the adapter is internally
 * clean, which is what stops `commands-help` from listing dead/dup/colliding cmds.
 *
 * Known limitation (declared, not silent): the completeness self-check counts
 * trigger DECLARATIONS (a `trigger:` or a `triggers:` header). A `triggers:` list
 * yields N commands from one header, so a list that drops SOME (not all) of its
 * items cannot be detected by the parsed<declared net. Singular `trigger:` (the
 * shipped form) has no such gap. Malformed-YAML values that Espanso itself would
 * not load are out of scope.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isAbsolute, join, resolve } from "node:path";

const ROOT = process.cwd();
const DEFAULT_CONFIG = "tools/operator-catalog.config.json";
const DEFAULT_ADAPTER =
  "setup/templates/operator-command-expanders/operator-commands.example.yml";

// ── pure core: the lint (unit-tested directly) ─────────────────────────────

/**
 * Lint a normalized command set.
 * @param {Array<{trigger: string, hasBody: boolean}>} commands
 * @returns {{ok: boolean, problems: Array<{kind: string, trigger: string, other?: string}>}}
 */
export function lintOperatorAdapter(commands) {
  const problems = [];
  const seen = new Set();

  for (const cmd of commands) {
    const t = cmd.trigger;
    if (!cmd.hasBody) problems.push({ kind: "dead-command", trigger: t });
    if (seen.has(t)) problems.push({ kind: "duplicate-trigger", trigger: t });
    else seen.add(t);
  }

  // prefix collision: an exact prefix of another distinct trigger (rule 6).
  const uniq = [...new Set(commands.map((c) => c.trigger))];
  for (const a of uniq) {
    for (const b of uniq) {
      if (a !== b && b.startsWith(a)) {
        problems.push({ kind: "prefix-collision", trigger: a, other: b });
      }
    }
  }

  return { ok: problems.length === 0, problems };
}

// ── IO: minimal, comment/quote/indent-aware Espanso scan ───────────────────

const BLOCK_INDICATORS = new Set([">", "|", ">-", "|-", ">+", "|+"]);
const BODY_KEYS = "replace|form|markdown|html|image_path|vars";

/** Strip an UNQUOTED trailing `# comment` from a scalar (a `#` inside quotes stays). */
export function stripInlineComment(raw) {
  let inS = false;
  let inD = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD && (i === 0 || /\s/.test(raw[i - 1]))) {
      return raw.slice(0, i);
    }
  }
  return raw;
}

function unquote(raw) {
  const s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function indentOf(line) {
  return line.length - line.replace(/^\s+/, "").length;
}

/**
 * Extract commands from an Espanso adapter's `matches:` section.
 * Returns { commands, headerCount, hasMatches } — headerCount is the number of
 * trigger declarations found (a `trigger:` or a `triggers:` list header), used by
 * the CLI for the parse-completeness self-check.
 *
 * Supported shapes: singular `trigger:` and `triggers:` lists; inline and block
 * (`>`,`|`,…) bodies under `replace`/`form`/`markdown`/`html`/`image_path`/`vars`;
 * trailing `# comments`; keys in any order within a match; CRLF.
 */
export function parseEspansoAdapter(text) {
  const lines = text.split(/\r?\n/);
  const matchesIdx = lines.findIndex((l) => /^matches:\s*(#.*)?$/.test(l));
  if (matchesIdx === -1) return { commands: [], headerCount: 0, hasMatches: false };

  const commands = [];
  let headerCount = 0;
  let cur = null;
  let inBlock = false;
  let blockIndent = -1;

  const flush = () => {
    if (!cur) return;
    for (const t of cur.triggers) commands.push({ trigger: t, hasBody: cur.hasBody });
    cur = null;
  };
  const newMatch = () => ({ triggers: [], hasBody: false, openByTriggersList: false });

  for (let i = matchesIdx + 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine.trim() === "") continue;

    // consume block-scalar body content by indentation (deeper than its key).
    if (inBlock) {
      if (indentOf(rawLine) > blockIndent) {
        if (cur && stripInlineComment(rawLine).trim() !== "") cur.hasBody = true;
        continue;
      }
      inBlock = false; // dedent → block ended; fall through to handle this line
    }

    // a column-0 non-comment key ends the matches section.
    if (/^\S/.test(rawLine) && !/^\s*#/.test(rawLine)) {
      flush();
      break;
    }

    const line = stripInlineComment(rawLine);
    if (line.trim() === "") continue; // comment-only line

    const isListItem = /^\s*-\s/.test(line);
    const hasKey = /^\s*-?\s*[\w-]+:/.test(line);
    const triggerM = line.match(/^\s*-?\s*trigger:\s*(.*)$/);
    const triggersHeader = /^\s*-?\s*triggers:\s*$/.test(line);
    const bodyM = line.match(new RegExp(`^\\s*-?\\s*(?:${BODY_KEYS}):\\s*(.*)$`));

    // a new list item that carries a key starts a new match.
    if (isListItem && hasKey) {
      flush();
      cur = newMatch();
    }

    if (triggerM) {
      headerCount++;
      cur = cur || newMatch();
      const val = unquote(triggerM[1]);
      if (val) cur.triggers.push(val);
      continue;
    }
    if (triggersHeader) {
      headerCount++;
      cur = cur || newMatch();
      cur.openByTriggersList = true;
      continue;
    }
    if (bodyM) {
      cur = cur || newMatch();
      const val = bodyM[1].trim();
      if (BLOCK_INDICATORS.has(val)) {
        inBlock = true;
        blockIndent = indentOf(line);
      } else if (unquote(val).length > 0) {
        cur.hasBody = true;
      }
      continue;
    }
    // a bare list item value (`- ":foo"`) continues an open `triggers:` list.
    if (isListItem && !hasKey && cur && cur.openByTriggersList) {
      const m = line.match(/^\s*-\s*(.+?)\s*$/);
      if (m) {
        const val = unquote(m[1]);
        if (val) cur.triggers.push(val);
      }
    }
  }
  flush();
  return { commands, headerCount, hasMatches: true };
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
  let fromConfig = false;
  if (existsSync(configAbs)) {
    let cfg;
    try {
      cfg = JSON.parse(readFileSync(configAbs, "utf8"));
    } catch (e) {
      setupError(`config is not valid JSON (${e.message})`);
    }
    if (cfg && typeof cfg.adapter === "string" && cfg.adapter.trim()) {
      adapterRel = cfg.adapter.trim();
      fromConfig = true;
    }
  } else if (configArg) {
    setupError(`config not found: ${configRel}`);
  }

  const adapterAbs = isAbsolute(adapterRel) ? adapterRel : join(ROOT, adapterRel);
  if (!existsSync(adapterAbs)) {
    // a config that names a missing adapter is a loud setup error, not a skip.
    if (fromConfig) setupError(`configured adapter not found: ${adapterRel}`);
    // no config + no default example → the repo opted out of shipping an adapter.
    green(`no adapter at ${adapterRel} — nothing to lint (skip)`);
  }

  const text = readFileSync(adapterAbs, "utf8");
  const { commands, headerCount, hasMatches } = parseEspansoAdapter(text);

  if (!hasMatches) {
    setupError(`${adapterRel} has no 'matches:' section — not a recognizable adapter (failing loud, not skipping)`);
  }
  if (commands.length < headerCount) {
    setupError(
      `${adapterRel}: parsed ${commands.length} trigger(s) but found ${headerCount} trigger declaration(s) — adapter format not fully recognized. Failing loud rather than reporting a false 'clean'.`
    );
  }
  if (commands.length === 0) {
    setupError(`${adapterRel} has a 'matches:' section but 0 commands parsed — check the adapter format`);
  }

  const { ok, problems } = lintOperatorAdapter(commands);
  if (ok) {
    green(`${commands.length} commands clean in ${adapterRel} (no dead/duplicate/prefix-colliding triggers)`);
  }
  red(problems, adapterRel);
}

// run only as a real CLI, never when imported by the test.
let isCli = false;
try {
  isCli = process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
} catch {
  isCli = false;
}
if (isCli) main();
