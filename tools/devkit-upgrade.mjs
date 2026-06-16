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
 *      local drift in a copied runnable is a bug, so this restores it;
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
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
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
if (!NO_PULL) {
  try {
    execFileSync("git", ["-C", KIT_ROOT, "fetch", "origin", "--quiet"], { stdio: "pipe" });
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
const resync = { applies: !!parityCfg, total: 0, drift: [], copied: [], missingUpstream: [] };
if (parityCfg && Array.isArray(parityCfg.copies)) {
  for (const c of parityCfg.copies) {
    resync.total++;
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
};
if (!DRY && !NO_TOOLS) {
  const isWin = process.platform === "win32";
  const script = join(
    UPSTREAM,
    "setup",
    isWin ? "install-external-tools.ps1" : "install-external-tools.sh"
  );
  if (!existsSync(script)) {
    provision = { ran: false, note: "no install script in upstream" };
  } else {
    const [cmd, cmdArgs] = isWin ? ["pwsh", ["-NoProfile", "-File", script]] : ["bash", [script]];
    try {
      const r = spawnSync(cmd, cmdArgs, {
        encoding: "utf8",
        timeout: 180000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      provision = r.error
        ? { ran: false, note: `${cmd} unavailable — provision by hand` }
        : { ran: true, note: "ran install-external-tools (install-if-missing)" };
    } catch {
      provision = { ran: false, note: `${cmd} unavailable — provision by hand` };
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

const result = {
  repo: basename(CWD),
  mode: DRY ? "dry-run" : "applied",
  pull,
  resync,
  provision,
  tools: tools.map(({ hint, ...t }) => t),
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
if (!resync.applies) {
  out.push(`  Copied runnables   · none declared (upstream, or not a consumer)`);
} else if (resync.drift.length === 0) {
  out.push(`  Copied runnables   ${green("✓")} all ${resync.total} in sync`);
} else {
  const verb = DRY ? "would re-sync" : "re-synced";
  out.push(`  Copied runnables   ${green("↻")} ${verb} ${resync.drift.length} / ${resync.total}`);
  for (const f of resync.drift) out.push(`        ↻ ${f}`);
  if (!DRY) out.push(`     → review with: git diff`);
}
out.push(`  Provision tools    ${provision.ran ? green("✓") : "·"} ${provision.note}`);
const drifted = tools.filter((t) => t.behind);
out.push(
  `  Tools (to pin)     ${drifted.length === 0 ? green("✓ all at pin / absent") : yellow(`${drifted.length} behind`)}`
);
for (const t of tools) {
  if (t.behind) out.push(`        ⚠ ${t.name} ${t.installed} → ${t.pin}   run: ${t.hint}`);
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
