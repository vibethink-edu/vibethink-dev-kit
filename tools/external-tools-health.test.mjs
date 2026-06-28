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
  const rtkExe = path.join(bin, "rtk.exe");
  const graphifyExe = path.join(bin, "graphify.exe");
  writeFileSync(rtkExe, "");
  writeFileSync(graphifyExe, "");

  const health = detectExternalTools({
    lock: fakeLock(),
    platform: "linux",
    home: "/home/dev",
    env: { PATH: bin, WSL_DISTRO_NAME: "Ubuntu" },
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
});

test("pip package present but CLI absent => installed-not-in-path RED", () => {
  const health = detectExternalTools({
    lock: { tools: [fakeLock().tools[0]] },
    platform: "linux",
    home: "/home/dev",
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

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\nexternal-tools-health: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
