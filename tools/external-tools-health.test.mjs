#!/usr/bin/env node
/**
 * Tests for external-tools-health.mjs.
 * Run: node tools/external-tools-health.test.mjs
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  detectExternalTools,
  findExecutableOnPath,
} from "./external-tools-health.mjs";

let pass = 0;
let fail = 0;
const tmpdirs = [];

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.log(`  ✗ ${name}\n    ${e.stack || e.message}`);
  }
}

function tmp() {
  const d = mkdtempSync(path.join(os.tmpdir(), "external-tools-health-"));
  tmpdirs.push(d);
  return d;
}

function fakeLock() {
  return {
    tools: [
      {
        name: "graphify",
        class: "A",
        kind: "pip",
        package: "graphifyy",
        cli: "graphify",
        pin: "0.8.39",
      },
      {
        name: "rtk",
        class: "B",
        kind: "github-release",
        cli: "rtk",
        pin: "0.39.0",
        knownDirs: ["~/.vt-tools/rtk", "~/.vtwb-tools/rtk"],
        installDirWindows: "~/.vt-tools/rtk/0.39.0",
      },
    ],
  };
}

function runMap(entries) {
  return (cmd, args) => {
    const key = `${cmd} ${args.join(" ")}`;
    if (entries[key]) return entries[key];
    return { status: 127, error: "not found", stdout: "", stderr: "" };
  };
}

test("PATH lookup finds Windows .exe from a WSL-like shell", () => {
  const bin = tmp();
  writeFileSync(path.join(bin, "rtk.exe"), "");
  const hit = findExecutableOnPath("rtk", {
    platform: "linux",
    env: { PATH: bin, WSL_DISTRO_NAME: "Ubuntu" },
  });
  assert.ok(hit, "rtk.exe should be discoverable");
  assert.equal(hit.name, "rtk.exe");
  assert.equal(hit.exact, false);
});

test("Windows .exe visible but canonical CLI absent => shell-mismatch WARN", () => {
  const bin = tmp();
  const repo = tmp();
  mkdirSync(path.join(repo, "graphify-out"), { recursive: true });
  writeFileSync(path.join(repo, "graphify-out", "graph.json"), "{}");
  const rtkExe = path.join(bin, "rtk.exe");
  const graphifyExe = path.join(bin, "graphify.exe");
  writeFileSync(rtkExe, "");
  writeFileSync(graphifyExe, "");

  const health = detectExternalTools({
    lock: fakeLock(),
    platform: "linux",
    home: "/home/dev",
    cwd: repo,
    env: { PATH: bin, WSL_DISTRO_NAME: "Ubuntu" },
    now: Date.now(),
    run: runMap({
      [`${rtkExe} --version`]: { status: 0, stdout: "rtk 0.39.0\n", stderr: "" },
      [`${graphifyExe} --version`]: { status: 0, stdout: "graphify 0.8.39\n", stderr: "" },
    }),
  });

  assert.equal(health.status, "WARN");
  assert.equal(health.tools.find((t) => t.name === "rtk").state, "shell-mismatch");
  assert.equal(health.tools.find((t) => t.name === "graphify").state, "shell-mismatch");
  assert.match(
    health.tools.find((t) => t.name === "rtk").remediation.join("\n"),
    /stale shell/i
  );
  assert.match(
    health.tools.find((t) => t.name === "rtk").remediation.join("\n"),
    /hot-patch the live shell PATH/i
  );
});

test("pip package present but CLI absent => installed-not-in-path RED", () => {
  const repo = tmp();
  mkdirSync(path.join(repo, "graphify-out"), { recursive: true });
  writeFileSync(path.join(repo, "graphify-out", "graph.json"), "{}");
  const health = detectExternalTools({
    lock: { tools: [fakeLock().tools[0]] },
    platform: "linux",
    home: "/home/dev",
    cwd: repo,
    env: { PATH: "/usr/bin" },
    run: runMap({
      "python3 -m pip show graphifyy": {
        status: 0,
        stdout: "Name: graphifyy\nVersion: 0.8.39\n",
        stderr: "",
      },
      "python3 -m site --user-base": {
        status: 0,
        stdout: "/home/dev/.local\n",
        stderr: "",
      },
    }),
  });

  const graphify = health.tools[0];
  assert.equal(health.status, "RED");
  assert.equal(graphify.state, "installed-not-in-path");
  assert.match(graphify.message, /installed via python3/);
  assert.match(graphify.remediation.join("\n"), /not in PATH/);
  assert.match(graphify.remediation.join("\n"), /Bash\/Git Bash: export PATH/);
  assert.match(graphify.remediation.join("\n"), /already-open agents need the hot-patch/);
  assert.ok(graphify.expectedPaths.includes("/home/dev/.local/bin"));
});

test("missing tool is RED and prints installer remediation", () => {
  const health = detectExternalTools({
    lock: { tools: [fakeLock().tools[1]] },
    platform: "linux",
    home: "/home/dev",
    env: { PATH: "/usr/bin" },
    run: runMap({}),
  });

  const rtk = health.tools[0];
  assert.equal(health.status, "RED");
  assert.equal(rtk.state, "missing");
  assert.match(rtk.remediation.join("\n"), /install-external-tools/);
});

test("graphify CLI present but graph missing => WARN and says not to rely on it", () => {
  const repo = tmp();
  const health = detectExternalTools({
    lock: { tools: [fakeLock().tools[0]] },
    platform: "linux",
    home: "/home/dev",
    cwd: repo,
    env: { PATH: "/usr/bin" },
    run: runMap({
      "graphify --version": { status: 0, stdout: "graphify 0.8.39\n", stderr: "" },
    }),
  });

  const graphify = health.tools[0];
  assert.equal(health.status, "WARN");
  assert.equal(graphify.state, "artifact-missing");
  assert.equal(graphify.activity.state, "artifact-missing");
  assert.match(graphify.message, /do not rely/i);
  assert.match(graphify.remediation.join("\n"), /graphify update <subdir>/);
});

test("graphify stale graph => WARN and requires scoped update before use", () => {
  const repo = tmp();
  const graphDir = path.join(repo, "graphify-out");
  mkdirSync(graphDir, { recursive: true });
  writeFileSync(path.join(graphDir, "graph.json"), "{}");
  const now = Date.now() + 5 * 86_400_000;

  const health = detectExternalTools({
    lock: { tools: [fakeLock().tools[0]] },
    platform: "linux",
    home: "/home/dev",
    cwd: repo,
    env: { PATH: "/usr/bin", GRAPHIFY_STALE_DAYS: "3" },
    now,
    run: runMap({
      "graphify --version": { status: 0, stdout: "graphify 0.8.39\n", stderr: "" },
    }),
  });

  const graphify = health.tools[0];
  assert.equal(health.status, "WARN");
  assert.equal(graphify.state, "artifact-stale");
  assert.ok(graphify.activity.ageDays >= 4);
  assert.match(graphify.message, /do not read it as current/);
  assert.match(graphify.remediation.join("\n"), /prefer scoped update/i);
});

test("engram CLI present but memory stale => WARN and requires recall/doctor/export", () => {
  const repo = tmp();
  const home = tmp();
  const engramDir = path.join(home, ".engram");
  mkdirSync(engramDir, { recursive: true });
  writeFileSync(path.join(engramDir, "engram.db"), "db");
  const now = Date.now() + 10 * 86_400_000;

  const health = detectExternalTools({
    lock: {
      tools: [
        {
          name: "engram",
          class: "C",
          kind: "github-release",
          cli: "engram",
          pin: "1.17.0",
          dataDir: "~/.engram",
          stateful: true,
        },
      ],
    },
    platform: "linux",
    home,
    cwd: repo,
    env: { PATH: "/usr/bin", ENGRAM_STALE_DAYS: "7" },
    now,
    run: runMap({
      "engram --version": { status: 0, stdout: "engram 1.17.0\n", stderr: "" },
    }),
  });

  const engram = health.tools[0];
  assert.equal(health.status, "WARN");
  assert.equal(engram.state, "memory-stale");
  assert.match(engram.message, /recall may be stale/i);
  assert.match(engram.remediation.join("\n"), /engram doctor/);
  assert.match(engram.remediation.join("\n"), /export\/sync/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\nexternal-tools-health: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
