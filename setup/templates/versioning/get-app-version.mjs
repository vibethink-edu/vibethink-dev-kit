#!/usr/bin/env node
/**
 * get-app-version — reference LIVE version source for a deploy-in-commit app.
 *
 * Donated by a consuming product's architect (elevate-back, G-008) as the reference impl
 * the versioning canon was missing. The point: a version that is COMPUTED can never
 * freeze. Hand-typed version strings rot (an app sat at one number for weeks because
 * nothing forced it to move); a derived one moves with every commit, for free.
 *
 * It derives a CalVer build string `YYYY.MM.DD+<shortSha>` from the HEAD commit:
 *   - date  = the HEAD commit's committer date (deterministic for a given commit,
 *             so the same commit always yields the same version — good for caches);
 *   - sha   = the short commit hash, as SemVer build metadata after `+`.
 * `+<sha>` is build metadata (ignored for ordering) that uniquely pins the build
 * WITHOUT needing a stateful per-day counter — ideal for stateless / deploy-in-commit
 * apps. (Canon §5 also allows the stateful `YYYY.MM.DD-N` form; pick per repo.)
 *
 * Wire it: copy into your repo's tools/, point your `/healthz` (or equivalent) at
 * getAppVersion(), and declare it in tools/versioning.config.json so check-versioning
 * confirms the source is real, not just declared.
 *
 * Usage:  node tools/get-app-version.mjs        # prints the live version
 *         import { getAppVersion } from "./get-app-version.mjs"
 * Pure Node, zero deps. No git / no commit → falls back to today's date (no sha).
 */
import { execFileSync } from "node:child_process";

function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** HEAD committer date as YYYY.MM.DD (dots), or "" when there is no commit. */
export function headDate() {
  const iso = git(["show", "-s", "--format=%cs", "HEAD"]); // %cs = committer date, YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.replaceAll("-", ".") : "";
}

/** Short HEAD sha, or "" when there is no commit / no git. */
export function headSha() {
  return git(["rev-parse", "--short", "HEAD"]);
}

/** Today's date as YYYY.MM.DD (the no-git fallback — still a valid CalVer date). */
function todayDots(now = new Date()) {
  return now.toISOString().slice(0, 10).replaceAll("-", ".");
}

/**
 * The live app version. Computed, never stored — so it cannot go stale.
 * Override date/sha for testing or for a non-git build context.
 */
export function getAppVersion({ date, sha } = {}) {
  const d = date ?? headDate() ?? "";
  const finalDate = d || todayDots();
  const s = sha ?? headSha();
  return s ? `${finalDate}+${s}` : finalDate;
}

import { resolve } from "node:path";
// CLI: print the version (what a build step or /healthz handler calls).
import { fileURLToPath } from "node:url";
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${getAppVersion()}\n`);
}
