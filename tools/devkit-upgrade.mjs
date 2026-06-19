#!/usr/bin/env node
/**
 * devkit-upgrade — one-shot "get me to the latest kit" for a consumer.
 *
 * The complement of `devkit-doctor --adoption`: that lens shows what's stale; this
 * brings it current in one command. It does the three update steps §1.5 documents,
 * but as a mechanism instead of a checklist:
 *   1. PULL the kit mount (`--ff-only`) — canon updates for free (inherited by reference);
 *   2. RE-SYNC the copy-distributed runnables this repo declares (copy-parity) from the
 *      kit → local — the only step that was manual; the kit is the source of truth, a
 *      local drift in a copied runnable is a bug, so this restores it. A copy declared
 *      `adapted` (a sanctioned bounded adaptation) is EXEMPT — preserved, never re-synced —
 *      mirroring the doctor / check-copy-parity (re-syncing it would silently revert it);
 *   3. PROVISION missing default tools — runs install-external-tools, which is
 *      install-if-missing + non-blocking, so it provisions ABSENT tools to their pin
 *      and never moves a present tool's version (the evidence-gated pin rule holds for
 *      free). Default in apply; `--no-tools` to skip. It does NOT force an installed
 *      tool past its pin — a pin move stays an evidence-gated PR to external-tools.lock.json.
 *   4. REPORT remaining external-tool drift (installed-but-behind vs pin) + the exact
 *      upgrade command (a present-but-behind tool is a deliberate version-forward, not
 *      an auto-action).
 *
 * APPLIES BY DEFAULT (you want the latest). Guards that are NOT timidity:
 *   - `--ff-only` pull (never force a diverged kit);
 *   - re-copied files land in your working tree → review `git diff` (nothing is lost — git has it);
 *   - `--dry-run` to preview; `--no-pull` skips git; `--no-tools` skips provisioning (offline).
 *
 * Usage:
 *   node <kit>/tools/devkit-upgrade.mjs [--dry-run] [--no-pull] [--no-tools] [--json]
 *     [--parity-config tools/copy-parity.config.json] [--upstream-root <path>]
 * Exit: 0 ok · 1 a re-sync or pull step failed. Pure Node, zero deps.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_TOOLS = dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = dirname(KIT_TOOLS);
const CWD = process.cwd();
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const NO_PULL = argv.includes("--no-pull");
const NO_TOOLS = argv.includes("--no-tools");
const JSON_OUT = argv.includes("--json");
const flag = (name, def) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
};
const PARITY = flag("--parity-config", "tools/copy-parity.config.json");
const UPSTREAM = flag("--upstream-root", KIT_ROOT);

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const readMaybe = (p) => {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
};
const abs = (root, p) => (isAbsolute(p) ? p : join(root, p));

// ── 1. PULL the kit mount (canon is free by reference) ───────────────────────
let pull = { done: false, note: "skipped (--no-pull)" };
let oldHead = null; // the consumer's kit HEAD BEFORE this pull — anchors the canon-delta report
if (!NO_PULL) {
  try {
    execFileSync("git", ["-C", KIT_ROOT, "fetch", "origin", "--quiet"], { stdio: "pipe" });
    try {
      oldHead = execFileSync("git", ["-C", KIT_ROOT, "rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim();
    } catch {
      /* no HEAD (shallow / detached) — canon-delta will skip */
    }
    if (DRY) {
      const behind = execFileSync(
        "git",
        ["-C", KIT_ROOT, "rev-list", "--count", "HEAD..origin/master"],
        { encoding: "utf8" }
      ).trim();
      pull = { done: false, note: `would fast-forward ${behind} commit(s)` };
    } else {
      execFileSync("git", ["-C", KIT_ROOT, "merge", "--ff-only", "origin/master"], {
        stdio: "pipe",
      });
      const sha = execFileSync("git", ["-C", KIT_ROOT, "rev-parse", "--short", "HEAD"], {
        encoding: "utf8",
      }).trim();
      pull = { done: true, note: `fast-forwarded to ${sha}` };
    }
  } catch (e) {
    const msg = String(e?.stderr || e?.message || e).split("\n")[0];
    pull = {
      done: false,
      note: `⚠ pull failed (diverged or no upstream) — resolve by hand: ${msg}`,
    };
  }
}

// ── 2. RE-SYNC copy-distributed runnables (the only manual step, now a mechanism) ─
const parityCfg = JSON.parse(readMaybe(join(CWD, PARITY)) || "null");
const resync = {
  applies: !!parityCfg,
  total: 0,
  drift: [],
  copied: [],
  adapted: [],
  missingUpstream: [],
};
if (parityCfg && Array.isArray(parityCfg.copies)) {
  for (const c of parityCfg.copies) {
    resync.total++;
    // A declared bounded adaptation (copy-parity §6.1) is EXEMPT — mirror the doctor /
    // check-copy-parity, which reports it as ADAPTED, never compares it, never fails on it.
    // Re-syncing it would silently REVERT a sanctioned adaptation. The consumer drops the
    // `adapted` flag deliberately when it wants the upstream version back — never the upgrade.
    if (c.adapted) {
      resync.adapted.push(c.local);
      continue;
    }
    const up = abs(UPSTREAM, c.upstream);
    const local = abs(CWD, c.local);
    const upText = readMaybe(up);
    if (upText === null) {
      resync.missingUpstream.push(c.upstream);
      continue;
    }
    const localText = readMaybe(local);
    if (localText === upText) continue; // in sync
    resync.drift.push(c.local);
    if (!DRY) {
      mkdirSync(dirname(local), { recursive: true });
      copyFileSync(up, local);
      resync.copied.push(c.local);
    }
  }
}

// ── 3. PROVISION missing default tools (fresh installs only) ──────────────────
// install-external-tools is install-if-missing + non-blocking BY DESIGN, so running
// it provisions ABSENT tools to their pin and NEVER moves a present tool's version —
// it respects the evidence-gated pin rule for free. Default in apply; --no-tools to
// skip (offline / no-network); never in --dry-run; never fails the upgrade.
let provision = {
  ran: false,
  note: DRY ? "skipped (dry-run)" : NO_TOOLS ? "skipped (--no-tools)" : "skipped",
  output: "",
};
if (!DRY && !NO_TOOLS) {
  const isWin = process.platform === "win32";
  const script = join(
    UPSTREAM,
    "setup",
    isWin ? "install-external-tools.ps1" : "install-external-tools.sh"
  );
  if (!existsSync(script)) {
    provision = { ran: false, note: "no install script in upstream", output: "" };
  } else {
    const [cmd, cmdArgs] = isWin ? ["pwsh", ["-NoProfile", "-File", script]] : ["bash", [script]];
    try {
      const r = spawnSync(cmd, cmdArgs, {
        encoding: "utf8",
        timeout: 180000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      // Surface the provisioner's own per-tool messages ("ya instalado (vX)", drift,
      // "instalando…", the PATH gotcha) — they ARE the value of this step; swallowing
      // them would hide whether a tool was already present or freshly installed.
      const text = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
      provision = r.error
        ? { ran: false, note: `${cmd} unavailable — provision by hand`, output: "" }
        : { ran: true, note: "ran install-external-tools (install-if-missing)", output: text };
    } catch {
      provision = { ran: false, note: `${cmd} unavailable — provision by hand`, output: "" };
    }
  }
}

// ── 4. REPORT external-tool drift (installed vs pin) — never auto-install, never bump a pin ─
const lock = JSON.parse(readMaybe(join(UPSTREAM, "setup", "external-tools.lock.json")) || "{}");
const tools = (lock.tools || []).map((t) => {
  let installed = null;
  try {
    const r = spawnSync(t.cli, ["--version"], {
      encoding: "utf8",
      timeout: 4000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const out = (r.stdout || "").trim().split(/\r?\n/)[0];
    if ((r.status === 0 || out) && !r.error) installed = out || "present";
  } catch {
    /* not on PATH */
  }
  const atPin = installed ? installed.includes(t.pin) : false;
  const hint =
    t.kind === "pip"
      ? `pip install -U ${t.package}==${t.pin}`
      : `re-run setup/install-external-tools (pin ${t.pin})`;
  return { name: t.name, pin: t.pin, installed, atPin, behind: installed && !atPin, hint };
});

// ── 5. CANON-DELTA — what protocol/canon changed since the consumer's last pull ─
// Mechanically current ≠ knowing what to re-read. Surface the governance changes over
// the pull range (new DECISION-REGISTER rows + changed canon/runbook files) so the
// consumer re-reads them instead of acting on stale knowledge. Skipped with --no-pull
// (no range). Best-effort; never fails the upgrade.
const canonDelta = { applies: false, decisions: [], changed: [] };
if (!NO_PULL && (oldHead || DRY)) {
  const range = DRY ? "HEAD..origin/master" : `${oldHead}..HEAD`;
  const git = (args) => {
    try {
      return execFileSync("git", ["-C", KIT_ROOT, ...args], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      return "";
    }
  };
  for (const line of git(["diff", range, "--", "doc/decisions/DECISION-REGISTER.md"]).split(
    /\r?\n/
  )) {
    const m =
      /^\+\|\s*(D-\d+)\s*\|\s*[^|]*\|\s*\*\*([^*]+)\*\*/.exec(line) ||
      /^\+\|\s*(D-\d+)\s*\|/.exec(line);
    if (m) canonDelta.decisions.push(m[2] ? `${m[1]} — ${m[2].trim()}` : m[1]);
  }
  for (const line of git(["diff", "--name-status", range, "--", "knowledge", "setup"]).split(
    /\r?\n/
  )) {
    const m = /^([A-Z])\d*\t(.+)$/.exec(line.trim());
    if (!m) continue;
    const [, st, p] = m;
    if (/SUPRA-MAP\.md$/.test(p)) continue; // generated graph — noise, not a re-read
    if (/CANON-/.test(p) || /RUNBOOK/i.test(p) || p.endsWith("ADOPT-DEV-KIT.md"))
      canonDelta.changed.push(`${st} ${p}`);
  }
  canonDelta.applies = canonDelta.decisions.length > 0 || canonDelta.changed.length > 0;
}

// ── 6. TEMPLATE-INSTANTIATION — surface kit templates (by-instantiation; upgrade was mute) ─
// Templates are copied + filled by the consumer (not copy-synced), so the upgrade can't
// auto-apply them — but it should SURFACE them. For the few with a detectable config
// target, flag instantiated vs not; the rest are listed by count (copy as needed).
const TEMPLATE_TARGETS = {
  ports: "tools/ports.config.json",
  "feature-docs": "tools/feature-docs.config.json",
  "identifier-language": "tools/identifier-language.config.json",
  versioning: "tools/versioning.config.json",
};
const templates = { applies: false, count: 0, missing: [] };
const tplDir = join(UPSTREAM, "setup", "templates");
if (existsSync(tplDir)) {
  const names = readdirSync(tplDir).sort();
  templates.count = names.length;
  templates.applies = names.length > 0;
  for (const name of names) {
    const target = TEMPLATE_TARGETS[name];
    if (target && !existsSync(join(CWD, target))) templates.missing.push({ name, target });
  }
}

const result = {
  repo: basename(CWD),
  mode: DRY ? "dry-run" : "applied",
  pull,
  resync,
  provision,
  tools: tools.map(({ hint, ...t }) => t),
  canonDelta,
  templates,
};

if (JSON_OUT) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(resync.missingUpstream.length ? 1 : 0);
}

const out = [];
out.push("");
out.push(
  `  ${bold(`Dev-Kit Upgrade · ${result.repo}`)}   [${DRY ? yellow("DRY-RUN") : green("APPLIED")}]`
);
out.push(`  ${"─".repeat(52)}`);
out.push(`  Canon / kit pull   ${pull.done ? green("✓") : "·"} ${pull.note}`);
const adaptedNote = resync.adapted.length
  ? ` · ${yellow(`${resync.adapted.length} adapted (preserved)`)}`
  : "";
if (!resync.applies) {
  out.push(`  Copied runnables   · none declared (upstream, or not a consumer)`);
} else if (resync.drift.length === 0) {
  out.push(`  Copied runnables   ${green("✓")} ${resync.total} in parity${adaptedNote}`);
} else {
  const verb = DRY ? "would re-sync" : "re-synced";
  out.push(
    `  Copied runnables   ${green("↻")} ${verb} ${resync.drift.length} / ${resync.total}${adaptedNote}`
  );
  for (const f of resync.drift) out.push(`        ↻ ${f}`);
  for (const f of resync.adapted) out.push(`        ${yellow("◆")} ${f} — adapted, preserved`);
  if (!DRY) out.push(`     → review with: git diff`);
}
out.push(`  Provision tools    ${provision.ran ? green("✓") : "·"} ${provision.note}`);
if (provision.output)
  for (const line of provision.output.split(/\r?\n/))
    if (line.trim()) out.push(`      ${line.trim()}`);
const drifted = tools.filter((t) => t.behind);
out.push(
  `  Tools (to pin)     ${drifted.length === 0 ? green("✓ all at pin / absent") : yellow(`${drifted.length} behind`)}`
);
for (const t of tools) {
  if (t.behind) out.push(`        ⚠ ${t.name} ${t.installed} → ${t.pin}   run: ${t.hint}`);
}
// Canon-delta — the headline: current ≠ knowing what changed. Re-read these.
if (canonDelta.applies) {
  out.push(
    `  ${bold("Canon / protocol")}    ${yellow("⚠ changed — re-read before acting on stale knowledge")}`
  );
  for (const d of canonDelta.decisions) out.push(`        • ${d}`);
  for (const c of canonDelta.changed) out.push(`        ${c}`);
} else if (!NO_PULL && (pull.done || DRY)) {
  out.push(
    `  Canon / protocol   ${green("✓")} no governance changes in this ${DRY ? "range" : "pull"}`
  );
}
// Templates — surface the by-instantiation set + flag config-templates not instantiated.
if (templates.applies) {
  out.push(
    `  Kit templates      ${templates.count} available (by-instantiation)${templates.missing.length ? yellow(` · ${templates.missing.length} not instantiated`) : ""}`
  );
  for (const m of templates.missing)
    out.push(`        ${yellow("○")} ${m.name} — copy setup/templates/${m.name}/ → ${m.target}`);
}
if (resync.missingUpstream.length)
  out.push(
    `  ${yellow("⚠")} upstream missing for: ${resync.missingUpstream.join(", ")} (stale config?)`
  );
out.push("");
out.push(
  `  Next   node ${join(basename(KIT_ROOT), "tools", "devkit-doctor.mjs")} --adoption   (see the new state)`
);
out.push("");
console.log(out.join("\n"));
process.exit(resync.missingUpstream.length ? 1 : 0);
