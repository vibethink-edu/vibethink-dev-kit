#!/usr/bin/env node
/**
 * external-tools-health — local developer-tool health for the kit defaults.
 *
 * This is intentionally NOT a product-correctness gate. It answers a different
 * question: can this developer session actually use the external operator tools
 * the kit expects agents to use by default?
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
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

function remediation(tool, state, expectedPaths) {
  const name = tool.name;
  if (state === "available") return [];
  const lines = [];
  if (state === "shell-mismatch") {
    lines.push(
      `shell mismatch: '${tool.cli}' does not resolve in this shell, but a Windows executable does`
    );
    lines.push("open a fresh PowerShell/Codex session or add the executable directory to this shell PATH");
    lines.push("stale shell: PATH is captured when the session starts; restart after changing PATH");
  } else if (state === "installed-not-in-path") {
    lines.push(`${name} is installed, but CLI '${tool.cli}' is not in PATH`);
    lines.push("add one expected directory to PATH, then open a new shell");
  } else {
    lines.push(`${name} is missing`);
    lines.push("run the non-blocking installer: pwsh setup/install-external-tools.ps1 or bash setup/install-external-tools.sh");
  }
  if (expectedPaths.length) lines.push(`expected path(s): ${expectedPaths.join(" ; ")}`);
  return lines;
}

function detectTool(tool, opts) {
  const run = opts.run;
  const expectedPaths =
    tool.kind === "pip"
      ? pythonUserScriptDirs(opts)
      : candidateKnownDirs(tool, opts.env, opts.platform, opts.home);

  const canonical = runOk(run, tool.cli, ["--version"], opts);
  if (canonical.ok) {
    return {
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
    };
  }

  const onPath = findExecutableOnPath(tool.cli, opts);
  if (onPath) {
    const suffixed = runOk(run, onPath.path, ["--version"], opts);
    if (suffixed.ok) {
      return {
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
      };
    }
  }

  if (tool.kind === "pip") {
    const pkg = pipShow(tool.package, opts);
    if (pkg.installed) {
      return {
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
      };
    }
  } else {
    const known = findInKnownDirs(tool, opts);
    if (known) {
      const knownRun = runOk(run, known, ["--version"], opts);
      return {
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
      };
    }
  }

  return {
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
  };
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
