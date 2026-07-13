#!/usr/bin/env node
/**
 * external-tools-health — local developer-tool health for the kit defaults.
 *
 * This is intentionally NOT a product-correctness gate. It answers a different
 * question: can this developer session actually use the external operator tools
 * the kit expects agents to use by default?
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import path, { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const THIS_FILE = fileURLToPath(import.meta.url);
const KIT_ROOT = dirname(dirname(THIS_FILE));
const DEFAULT_LOCK = join(KIT_ROOT, "setup", "external-tools.lock.json");

function uniq(xs) {
  return [...new Set(xs.filter(Boolean))];
}

// Roots that are not code graphify would index — never suggest refreshing them.
const NON_CODE_AREA_ROOTS = new Set([
  "docs", "node_modules", ".git", ".github", "dist", "build", "coverage",
  "graphify-out", ".next", ".turbo", ".vscode",
]);

// Pure: map a set of changed file paths to the graphify "areas" to refresh.
// An area is the workspace root of a changed file: `apps/<x>` / `packages/<x>`
// (the monorepo convention) or else the file's top-level directory. Root-level
// files (no directory) and non-code roots (docs, build output, …) are excluded.
// Deterministic — this is what turns "graphify update <subdir>" (which the human
// must guess) into a concrete "graphify update apps/dashboard".
export function graphifyAreasFromPaths(paths) {
  const areas = new Set();
  for (const raw of paths || []) {
    const p = String(raw).replace(/\\/g, "/").replace(/^\.\//, "").trim();
    if (!p || !p.includes("/")) continue; // a root-level file has no area
    const segs = p.split("/");
    if (NON_CODE_AREA_ROOTS.has(segs[0])) continue;
    const area = (segs[0] === "apps" || segs[0] === "packages") && segs[1]
      ? `${segs[0]}/${segs[1]}`
      : segs[0];
    areas.add(area);
  }
  return [...areas].sort();
}

// Best-effort: the changed code areas in this working tree (uncommitted + this
// branch vs its upstream). Never throws; a repo with no git / no upstream just
// yields fewer paths. Used to fill the concrete area into the graphify hint.
function readChangedAreas(cwd, runner) {
  const run = runner || ((args) => spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", timeout: 5000 }));
  const paths = [];
  try {
    const st = run(["status", "--porcelain"]);
    if (st && st.status === 0 && st.stdout) {
      for (const line of st.stdout.split(/\r?\n/)) {
        if (line.length < 4) continue;
        const rest = line.slice(3); // strip "XY " status prefix
        paths.push(rest.includes(" -> ") ? rest.split(" -> ").pop() : rest);
      }
    }
  } catch { /* best-effort */ }
  try {
    const df = run(["diff", "--name-only", "@{u}...HEAD"]);
    if (df && df.status === 0 && df.stdout) {
      for (const line of df.stdout.split(/\r?\n/)) if (line.trim()) paths.push(line.trim());
    }
  } catch { /* no upstream — fine */ }
  return graphifyAreasFromPaths(uniq(paths));
}

// The concrete graphify remediation: name the exact areas to refresh, or say a
// refresh is not needed (only docs/nothing changed). Replaces the cryptic
// `graphify update <subdir>` placeholder the human could not resolve.
function graphifyRefreshHint(areas) {
  if (areas.length) {
    return [
      `refresh only what you changed: ${areas.map((a) => `graphify update ${a}`).join("  ·  ")}`,
      "do NOT run `graphify update .` — a full monorepo rebuild is slow (and rarely what you need)",
    ];
  }
  return [
    "no code area changed since your last commit/pull — a graphify refresh is not needed now; run `graphify update <the-area-you-are-navigating>` only when you are about to trace code in a specific area",
    "do NOT run `graphify update .` — a full rebuild is slow",
  ];
}

function stripAnsi(s) {
  return String(s || "").replace(/\x1b\[[0-9;]*m/g, "");
}

function splitPath(value, platform = process.platform) {
  if (!value) return [];
  const sep = platform === "win32" && value.includes(";") ? ";" : path.delimiter;
  return value
    .split(sep)
    .map((p) => p.trim())
    .filter(Boolean);
}

function isWindowsLike(platform, env) {
  return (
    platform === "win32" ||
    Boolean(env.WSL_DISTRO_NAME) ||
    Boolean(env.WSL_INTEROP) ||
    splitPath(env.PATH || env.Path || "", platform).some((p) => /^\/mnt\/[a-z]\//i.test(p))
  );
}

function executableNames(cli, platform = process.platform, env = process.env) {
  const names = [cli];
  if (isWindowsLike(platform, env)) {
    const pathext = (env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
      .split(";")
      .map((x) => x.toLowerCase())
      .filter(Boolean);
    for (const ext of pathext) names.push(`${cli}${ext}`);
    names.push(`${cli}.exe`);
  }
  return uniq(names);
}

function safeExists(p, exists = existsSync) {
  try {
    return exists(p);
  } catch {
    return false;
  }
}

function safeStat(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

function isWinPath(p) {
  return /^[A-Za-z]:[\\/]/.test(p);
}

function joinTarget(base, ...parts) {
  return isWinPath(base) ? path.win32.join(base, ...parts) : path.posix.join(base, ...parts);
}

function dirnameTarget(p) {
  return isWinPath(p) ? path.win32.dirname(p) : path.posix.dirname(p);
}

function isExecutableCandidate(p, exists = existsSync) {
  return safeExists(p, exists);
}

export function findExecutableOnPath(cli, opts = {}) {
  const platform = opts.platform || process.platform;
  const env = opts.env || process.env;
  const exists = opts.exists || existsSync;
  const pathDirs = splitPath(env.PATH || env.Path || "", platform);
  const names = opts.allowExtensions === false ? [cli] : executableNames(cli, platform, env);

  for (const dir of pathDirs) {
    for (const name of names) {
      const candidate = joinTarget(dir, name);
      if (isExecutableCandidate(candidate, exists)) {
        return { path: candidate, name, exact: name === cli };
      }
    }
  }
  return null;
}

function defaultRun(cmd, args = [], opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd,
    env: opts.env,
    encoding: "utf8",
    timeout: opts.timeout || 5000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    status: r.status,
    error: r.error ? r.error.message : null,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
  };
}

function runOk(run, cmd, args, opts) {
  const r = run(cmd, args, opts);
  const text = stripAnsi(`${r.stdout || ""}${r.stderr || ""}`).trim();
  return {
    ok: !r.error && (r.status === 0 || Boolean(text)),
    status: r.status,
    error: r.error,
    text,
  };
}

function versionFromText(text) {
  const m = String(text || "").match(/\b(\d+\.\d+\.\d+|\d+\.\d+)\b/);
  return m ? m[1] : null;
}

function loadLock(lockPath = DEFAULT_LOCK) {
  return JSON.parse(readFileSync(lockPath, "utf8"));
}

function userHomes(env, platform, home) {
  const homes = [home, env.HOME, env.USERPROFILE];
  const pathText = env.PATH || env.Path || "";
  for (const m of pathText.matchAll(/(\/mnt\/[a-z]\/Users\/[^/:;]+)/gi)) homes.push(m[1]);
  return uniq(homes);
}

function expandTilde(p, homes) {
  if (!p) return [];
  if (!p.startsWith("~")) return [p];
  const rest = p.replace(/^~\/?/, "");
  return homes.map((home) => joinTarget(home, rest));
}

function candidateKnownDirs(tool, env, platform, home) {
  const homes = userHomes(env, platform, home);
  const dirs = [];
  for (const raw of tool.knownDirs || []) dirs.push(...expandTilde(raw, homes));
  if (tool.installDirWindows) dirs.push(...expandTilde(tool.installDirWindows, homes));
  return uniq(dirs);
}

function candidateDataDirs(tool, env, platform, home) {
  const homes = userHomes(env, platform, home);
  return uniq(expandTilde(tool.dataDir || "", homes));
}

function findInKnownDirs(tool, opts) {
  const exists = opts.exists || existsSync;
  const dirs = candidateKnownDirs(tool, opts.env, opts.platform, opts.home);
  const names = executableNames(tool.cli, opts.platform, opts.env);
  for (const dir of dirs) {
    if (!safeExists(dir, exists)) continue;
    const stack = [dir];
    for (let i = 0; i < stack.length && i < 50; i++) {
      const current = stack[i];
      let entries = [];
      try {
        entries = readdirSync(current, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        const full = joinTarget(current, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (names.includes(entry.name)) return full;
      }
    }
  }
  return null;
}

function pythonCommands(env) {
  const cmds = [];
  if (env.PYTHON) cmds.push(env.PYTHON);
  cmds.push("py", "python3", "python");
  return uniq(cmds);
}

function pipShow(packageName, opts) {
  for (const py of pythonCommands(opts.env)) {
    const r = runOk(opts.run, py, ["-m", "pip", "show", packageName], opts);
    if (r.ok) {
      const version = (r.text.match(/^Version:\s*(\S+)/m) || [])[1] || versionFromText(r.text);
      return { installed: true, version, via: py };
    }
  }
  return { installed: false, version: null, via: null };
}

function pythonUserScriptDirs(opts) {
  const dirs = [];
  for (const py of pythonCommands(opts.env)) {
    const r = runOk(opts.run, py, ["-m", "site", "--user-base"], opts);
    if (r.ok && r.text) {
      const base = r.text.split(/\r?\n/)[0].trim();
      if (base) dirs.push(joinTarget(base, isWindowsLike(opts.platform, opts.env) ? "Scripts" : "bin"));
    }
  }
  return uniq(dirs);
}

function psQuote(s) {
  return String(s).replace(/'/g, "''");
}

function bashQuote(s) {
  return `"${String(s).replace(/(["\\$`])/g, "\\$1")}"`;
}

function bashPath(p) {
  const win = String(p || "").match(/^([A-Za-z]):[\\/](.*)$/);
  if (!win) return p;
  return `/${win[1].toLowerCase()}/${win[2].replace(/[\\/]+/g, "/")}`;
}

function wslPath(p) {
  const win = String(p || "").match(/^([A-Za-z]):[\\/](.*)$/);
  if (!win) return null;
  return `/mnt/${win[1].toLowerCase()}/${win[2].replace(/[\\/]+/g, "/")}`;
}

function hotPatchRemediation(expectedPaths) {
  const dir = expectedPaths.find(Boolean);
  if (!dir) return [];
  const lines = [
    "if this session has history, do not restart first; hot-patch the live shell PATH",
    `PowerShell: $env:Path = '${psQuote(dir)};' + $env:Path`,
    `cmd.exe: set "PATH=${dir};%PATH%"`,
    `Bash/Git Bash: export PATH=${bashQuote(`${bashPath(dir)}:$PATH`)}`,
  ];
  const wsl = wslPath(dir);
  if (wsl) lines.push(`WSL Bash: export PATH=${bashQuote(`${wsl}:$PATH`)}`);
  lines.push("persistent PATH fixes only affect future launches; already-open agents need the hot-patch in their own session");
  return lines;
}

function remediation(tool, state, expectedPaths) {
  const name = tool.name;
  if (state === "available") return [];
  const lines = [];
  if (state === "shell-mismatch") {
    lines.push(
      `shell mismatch: '${tool.cli}' does not resolve in this shell, but a Windows executable does`
    );
    lines.push("add the executable directory to this shell PATH, or open a fresh launch when session history is disposable");
    lines.push("stale shell: PATH is captured when the session starts; persistent PATH edits do not update live agents");
  } else if (state === "installed-not-in-path") {
    lines.push(`${name} is installed, but CLI '${tool.cli}' is not in PATH`);
    lines.push("add one expected directory to PATH; hot-patch this live session if restarting would lose history");
  } else {
    lines.push(`${name} is missing`);
    lines.push("run the non-blocking installer: pwsh setup/install-external-tools.ps1 or bash setup/install-external-tools.sh");
  }
  if (expectedPaths.length) lines.push(`expected path(s): ${expectedPaths.join(" ; ")}`);
  if (state === "shell-mismatch" || state === "installed-not-in-path") {
    lines.push(...hotPatchRemediation(expectedPaths));
  }
  return lines;
}

function severityMax(a, b) {
  const rank = { ok: 0, warn: 1, error: 2 };
  return (rank[b] || 0) > (rank[a] || 0) ? b : a;
}

function daysSince(ms, now = Date.now()) {
  return Math.floor((now - ms) / 86_400_000);
}

function newestMtimeUnder(dir, limit = 200) {
  if (!safeExists(dir)) return null;
  const stack = [dir];
  let newest = null;
  for (let i = 0; i < stack.length && i < limit; i++) {
    const current = stack[i];
    let entries = [];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = joinTarget(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else {
        const fst = safeStat(full);
        if (fst && (!newest || fst.mtimeMs > newest.mtimeMs)) newest = { path: full, mtimeMs: fst.mtimeMs };
      }
    }
  }
  return newest;
}

function graphifyActivity(tool, result, opts) {
  if (tool.name !== "graphify") return null;
  // single source of truth: the lock's artifact.staleDays (same as devkit-upgrade reads) — an env
  // var still overrides. Fixes the doctor↔upgrade disagreement (doctor hardcoded 3, lock/upgrade 7).
  const staleDays = Number(opts.env.GRAPHIFY_STALE_DAYS || tool.artifact?.staleDays || 3);
  const graph = join(opts.cwd, "graphify-out", "graph.json");
  // Deterministic area(s): opts.changedAreas (tests) else read from git in cwd.
  const areas = opts.changedAreas ?? readChangedAreas(opts.cwd, opts.gitRun);
  const st = safeStat(graph);
  if (!st) {
    return {
      status: "WARN",
      state: "artifact-missing",
      path: graph,
      ageDays: null,
      areas,
      message: "graphify graph is missing; do not rely on graphify orientation until a scoped graph is built",
      remediation: graphifyRefreshHint(areas),
    };
  }
  const ageDays = daysSince(st.mtimeMs, opts.now);
  if (ageDays > staleDays) {
    return {
      status: "WARN",
      state: "artifact-stale",
      path: graph,
      ageDays,
      areas,
      message: `graphify graph is ${ageDays}d old; do not read it as current`,
      remediation: graphifyRefreshHint(areas),
    };
  }
  return {
    status: "OK",
    state: "artifact-fresh",
    path: graph,
    ageDays,
    message: `graphify graph is fresh (${ageDays}d old)`,
    remediation: [],
  };
}

function engramActivity(tool, result, opts) {
  if (tool.name !== "engram" && !tool.stateful) return null;
  const staleDays = Number(opts.env.ENGRAM_STALE_DAYS || tool.artifact?.staleDays || 7);
  const dataDirs = candidateDataDirs(tool, opts.env, opts.platform, opts.home);
  const existing = dataDirs.find((d) => safeExists(d));
  if (!existing) {
    return {
      status: "WARN",
      state: "memory-missing",
      path: dataDirs[0] || null,
      ageDays: null,
      message: "engram memory store is missing; recall is not active for this operator",
      remediation: [
        "run engram setup for the current agent and verify engram save/search",
        "if this machine should carry prior memory, restore it from engram export/sync backup",
      ],
    };
  }
  const newest = newestMtimeUnder(existing);
  if (!newest) {
    return {
      status: "WARN",
      state: "memory-empty",
      path: existing,
      ageDays: null,
      message: "engram memory store exists but no readable activity was found",
      remediation: ["run engram doctor and save/search a known fact before relying on recall"],
    };
  }
  const ageDays = daysSince(newest.mtimeMs, opts.now);
  if (ageDays > staleDays) {
    return {
      status: "WARN",
      state: "memory-stale",
      path: newest.path,
      ageDays,
      message: `engram memory activity is ${ageDays}d old; recall may be stale or inactive`,
      remediation: [
        `run engram search <topic> before relying on recall (stale threshold: ${staleDays}d)`,
        "run engram doctor and export/sync backup before treating memory as healthy",
      ],
    };
  }
  return {
    status: "OK",
    state: "memory-recent",
    path: newest.path,
    ageDays,
    message: `engram memory activity is recent (${ageDays}d old)`,
    remediation: [],
  };
}

function applyActivity(tool, result, opts) {
  const activity = graphifyActivity(tool, result, opts) || engramActivity(tool, result, opts);
  if (!activity) return result;
  const activitySeverity =
    activity.status === "OK" ? "ok" : activity.status === "WARN" ? "warn" : "error";
  const severity = severityMax(result.severity, activitySeverity);
  const state =
    severity === result.severity && result.severity !== "ok"
      ? result.state
      : activity.status === "OK"
        ? result.state
        : activity.state;
  return {
    ...result,
    severity,
    state,
    message:
      activity.status === "OK" ? result.message : `${result.message}; ${activity.message}`,
    remediation: [...(result.remediation || []), ...(activity.remediation || [])],
    activity,
  };
}

function detectTool(tool, opts) {
  const run = opts.run;
  const expectedPaths =
    tool.kind === "pip"
      ? pythonUserScriptDirs(opts)
      : candidateKnownDirs(tool, opts.env, opts.platform, opts.home);

  const canonical = runOk(run, tool.cli, ["--version"], opts);
  if (canonical.ok) {
    return applyActivity(tool, {
      name: tool.name,
      cli: tool.cli,
      pin: tool.pin,
      class: tool.class,
      severity: "ok",
      state: "available",
      version: versionFromText(canonical.text),
      executable: tool.cli,
      message: `${tool.cli} resolves by canonical name`,
      remediation: [],
      expectedPaths,
    }, opts);
  }

  const onPath = findExecutableOnPath(tool.cli, opts);
  if (onPath) {
    const suffixed = runOk(run, onPath.path, ["--version"], opts);
    if (suffixed.ok) {
      return applyActivity(tool, {
        name: tool.name,
        cli: tool.cli,
        pin: tool.pin,
        class: tool.class,
        severity: onPath.exact ? "ok" : "warn",
        state: onPath.exact ? "available" : "shell-mismatch",
        version: versionFromText(suffixed.text),
        executable: onPath.path,
        message: onPath.exact
          ? `${tool.cli} resolves by canonical name`
          : `${onPath.name} is visible, but '${tool.cli}' is not`,
        remediation: remediation(tool, onPath.exact ? "available" : "shell-mismatch", [
          dirnameTarget(onPath.path),
          ...expectedPaths,
        ]),
        expectedPaths: uniq([dirnameTarget(onPath.path), ...expectedPaths]),
      }, opts);
    }
  }

  if (tool.kind === "pip") {
    const pkg = pipShow(tool.package, opts);
    if (pkg.installed) {
      return applyActivity(tool, {
        name: tool.name,
        cli: tool.cli,
        pin: tool.pin,
        class: tool.class,
        severity: "error",
        state: "installed-not-in-path",
        version: pkg.version,
        executable: null,
        message: `${tool.package} ${pkg.version || "?"} installed via ${pkg.via}, but ${tool.cli} is not in PATH`,
        remediation: remediation(tool, "installed-not-in-path", expectedPaths),
        expectedPaths,
      }, opts);
    }
  } else {
    const known = findInKnownDirs(tool, opts);
    if (known) {
      const knownRun = runOk(run, known, ["--version"], opts);
      return applyActivity(tool, {
        name: tool.name,
        cli: tool.cli,
        pin: tool.pin,
        class: tool.class,
        severity: "error",
        state: "installed-not-in-path",
        version: versionFromText(knownRun.text),
        executable: known,
        message: `${basenameOrPath(known)} exists, but ${tool.cli} is not in PATH`,
        remediation: remediation(tool, "installed-not-in-path", [dirnameTarget(known), ...expectedPaths]),
        expectedPaths: uniq([dirnameTarget(known), ...expectedPaths]),
      }, opts);
    }
  }

  return applyActivity(tool, {
    name: tool.name,
    cli: tool.cli,
    pin: tool.pin,
    class: tool.class,
    severity: "error",
    state: "missing",
    version: null,
    executable: null,
    message: `${tool.cli} is not available`,
    remediation: remediation(tool, "missing", expectedPaths),
    expectedPaths,
  }, opts);
}

function basenameOrPath(p) {
  try {
    return path.basename(p);
  } catch {
    return p;
  }
}

export function detectExternalTools(options = {}) {
  const lock = options.lock || loadLock(options.lockPath || DEFAULT_LOCK);
  const opts = {
    env: options.env || process.env,
    platform: options.platform || process.platform,
    home: options.home || os.homedir(),
    cwd: options.cwd || process.cwd(),
    run: options.run || defaultRun,
    exists: options.exists || existsSync,
    now: options.now || Date.now(),
    changedAreas: options.changedAreas, // optional (tests); undefined → read from git
    gitRun: options.gitRun, // optional (tests): inject the git runner
  };
  const tools = (lock.tools || []).map((tool) => detectTool(tool, opts));
  const status = tools.some((t) => t.severity === "error")
    ? "RED"
    : tools.some((t) => t.severity === "warn")
      ? "WARN"
      : "OK";
  return {
    status,
    blocking: false,
    summary:
      status === "OK"
        ? "external developer tools available"
        : "external developer tools degraded (non-blocking for product correctness)",
    tools,
  };
}

export function formatExternalToolsHuman(health, opts = {}) {
  const loud = opts.loud !== false;
  const mark = health.status === "OK" ? "✓" : health.status === "WARN" ? "⚠" : "✗";
  const lines = [];
  lines.push(`${mark} external developer tools: ${health.status} — ${health.summary}`);
  if (health.status !== "OK" && loud) {
    lines.push("  NON-BLOCKING for product correctness, but NOT optional for local/session health.");
  }
  for (const t of health.tools) {
    const tmark = t.severity === "ok" ? "✓" : t.severity === "warn" ? "⚠" : "✗";
    const version = t.version ? ` ${t.version}` : "";
    const exe = t.executable ? ` (${t.executable})` : "";
    lines.push(`  ${tmark} ${t.name} [${t.class}] ${t.state}${version}${exe}`);
    lines.push(`      ${t.message}`);
    if (t.activity && t.activity.status !== "OK") {
      lines.push(`      activity: ${t.activity.state}${t.activity.ageDays === null ? "" : ` (${t.activity.ageDays}d)`}`);
      if (t.activity.path) lines.push(`      activity-path: ${t.activity.path}`);
    }
    for (const fix of t.remediation || []) lines.push(`      fix: ${fix}`);
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const args = { json: false, lockPath: DEFAULT_LOCK, cwd: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--lock") args.lockPath = resolve(argv[++i]);
    else if (a === "--repo" || a === "--cwd") args.cwd = resolve(argv[++i]);
  }
  return args;
}

if (process.argv[1] && resolve(process.argv[1]) === THIS_FILE) {
  const args = parseArgs(process.argv.slice(2));
  const health = detectExternalTools({ lockPath: args.lockPath, cwd: args.cwd });
  if (args.json) console.log(JSON.stringify(health, null, 2));
  else console.log(formatExternalToolsHuman(health));
  process.exit(0);
}
