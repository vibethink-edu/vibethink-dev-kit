#!/usr/bin/env node
/**
 * operator-tools-health.mjs — SessionStart "tools loaded" nudge (TEMPLATE · agnostic).
 *
 * STATUS: SEALED 2026-06-27 (Principal Architect) — companion of graphify-staleness.mjs for the
 * operator-tooling activation standard (setup/EXTERNAL-TOOLS.md § Freshness & activación).
 *
 * graphify-staleness nudges the GRAPH freshness; this nudges that the operator-tools themselves
 * are LOADED (resolve by name). The "installed ≠ available" PATH gotcha — a `--user` Scripts/bin
 * not on PATH — once left a whole wave of executors reporting `<tool>: unavailable` though the
 * package WAS installed, so they "learned" to skip it. If a tool does not resolve, nudge to
 * install/refresh. Silent when all resolve (no noise).
 *
 * spawn-light (one `--version` per tool, fast-fails on ENOENT), always exits 0, never blocks.
 * Per-repo binding: the TOOLS list (the operator-tools this repo provisions).
 */
import { execFileSync } from "node:child_process";

const TOOLS = ["graphify", "engram", "rtk"];
const missing = [];

for (const t of TOOLS) {
  try {
    execFileSync(t, ["--version"], { stdio: "ignore", timeout: 5000 });
  } catch (e) {
    // ENOENT = the binary does not resolve by name (the gotcha). Any other error = the tool ran
    // but `--version` failed → still "loaded", ignore.
    if (e && e.code === "ENOENT") missing.push(t);
  }
}

if (missing.length) {
  console.log(
    `🧰 operator-tools NOT loaded: ${missing.join(", ")} (do not resolve by name). Run install-external-tools (or "refresh devkit") — usually the "installed ≠ available" gotcha: the --user Scripts/bin is not on PATH, and an already-open process will NOT pick it up (only a fresh shell/launch). Suspect a stale version → same refresh.`
  );
}

process.exit(0);
