#!/usr/bin/env node
/**
 * Tests for devkit-upgrade.mjs — one-shot "get me to the latest kit".
 * Integration style: runs the real CLI over throwaway upstream/consumer dirs with
 * --no-pull (skip git) + --upstream-root (point at the temp upstream). Pure Node.
 * Run: node tools/devkit-upgrade.test.mjs
 *
 * Guards: dry-run previews but does NOT write; apply re-syncs a drifted copied
 * runnable from upstream → local; in-sync is a no-op; a missing upstream → exit 1.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./devkit-upgrade.mjs", import.meta.url));

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
    console.log(`  ✗ ${name}\n    ${e.message}`);
  }
}

/** A temp upstream (the "kit") + a temp consumer with a copy-parity config. */
function scaffold({ upstreamBody, localBody }) {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "tools"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  writeFileSync(path.join(upstream, "tools", "engine.mjs"), upstreamBody, "utf8");
  if (localBody !== null)
    writeFileSync(path.join(consumer, "tools", "engine.mjs"), localBody, "utf8");
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({
      upstreamRoot: "../upstream",
      copies: [{ local: "tools/engine.mjs", upstream: "tools/engine.mjs" }],
    })
  );
  return { upstream, consumer };
}

function run(consumer, upstream, extra = []) {
  // --no-tools: never trigger a real install-external-tools during tests/CI.
  const r = spawnSync(
    "node",
    [TOOL, "--no-pull", "--no-tools", "--upstream-root", upstream, ...extra],
    { cwd: consumer, encoding: "utf8" }
  );
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
const localOf = (consumer) => readFileSync(path.join(consumer, "tools", "engine.mjs"), "utf8");

// 1. Dry-run previews drift but writes nothing.
test("--dry-run → reports would-re-sync, does NOT write", () => {
  const { consumer, upstream } = scaffold({ upstreamBody: "v2\n", localBody: "v1\n" });
  const { code, out } = run(consumer, upstream, ["--dry-run"]);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /would re-sync 1/);
  assert.equal(localOf(consumer), "v1\n", "dry-run must not modify the local file");
});

// 2. Apply re-syncs the drifted runnable from upstream.
test("apply → re-syncs the drifted runnable", () => {
  const { consumer, upstream } = scaffold({ upstreamBody: "v2\n", localBody: "v1\n" });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /re-synced 1/);
  assert.equal(localOf(consumer), "v2\n", "apply must copy upstream → local");
});

// 3. Already in sync → no-op.
test("in-sync → all in sync, no copy", () => {
  const { consumer, upstream } = scaffold({ upstreamBody: "same\n", localBody: "same\n" });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0);
  assert.match(out, /1 in parity/);
});

// 4. Missing upstream file → exit 1 (a stale config is surfaced, not silent).
test("missing upstream → exit 1", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const consumer = path.join(root, "consumer");
  const upstream = path.join(root, "upstream");
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  mkdirSync(upstream, { recursive: true });
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [{ local: "tools/x.mjs", upstream: "tools/gone.mjs" }] })
  );
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /upstream missing/i);
});

// 5. The provisioner's own messages are SURFACED (not swallowed) — a fake
//    install-external-tools that echoes a marker must appear in the upgrade output.
//    (No --no-tools here; the temp scripts are inert echoes, safe to run.)
test("provision surfaces install-external-tools output", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "setup"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  // Both platform scripts echo the same marker + exit 0 (non-blocking, no real install).
  writeFileSync(
    path.join(upstream, "setup", "install-external-tools.sh"),
    '#!/usr/bin/env bash\necho "✓ graphify: ya instalado (MARKER-123)"\nexit 0\n'
  );
  writeFileSync(
    path.join(upstream, "setup", "install-external-tools.ps1"),
    'Write-Host "✓ graphify: ya instalado (MARKER-123)"\nexit 0\n'
  );
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [] })
  );
  const r = spawnSync("node", [TOOL, "--no-pull", "--upstream-root", upstream], {
    cwd: consumer,
    encoding: "utf8",
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  assert.equal(r.status ?? 1, 0, `expected exit 0\n${out}`);
  assert.match(
    out,
    /ya instalado \(MARKER-123\)/,
    "the provisioner's messages must be surfaced, not swallowed"
  );
});

// 6. Template-instantiation gap is surfaced: a config-backed template (`ports`) with no
//    consumer target is flagged "not instantiated"; the total is counted; a non-config
//    template (`adr`) just adds to the count. (--no-pull → canon-delta stays skipped.)
test("surfaces kit templates + flags a config-template not instantiated", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "setup", "templates", "ports"), { recursive: true });
  mkdirSync(path.join(upstream, "setup", "templates", "adr"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({ copies: [] })
  );
  // consumer has NO tools/ports.config.json → ports is flagged not-instantiated.
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /Kit templates\s+2 available/);
  assert.match(out, /ports — copy setup\/templates\/ports\//);
});

// 7. An `adapted` copy is EXEMPT — preserved, never re-synced (mirrors the doctor /
//    check-copy-parity). Re-syncing it would silently REVERT a sanctioned adaptation.
//    Covers BOTH dry-run and apply (the finding asked whether apply skips or only dry-run).
test("adapted copy → preserved, never re-synced (dry-run + apply)", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "tools"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  writeFileSync(path.join(upstream, "tools", "engine.mjs"), "UPSTREAM\n", "utf8");
  writeFileSync(path.join(consumer, "tools", "engine.mjs"), "ADAPTED-LOCAL\n", "utf8");
  writeFileSync(
    path.join(consumer, "tools", "copy-parity.config.json"),
    JSON.stringify({
      upstreamRoot: "../upstream",
      copies: [
        {
          local: "tools/engine.mjs",
          upstream: "tools/engine.mjs",
          adapted: { reason: "consumer layout split", since: "2026-06-11" },
        },
      ],
    })
  );
  // dry-run: must NOT report it as would-re-sync.
  const dry = run(consumer, upstream, ["--dry-run"]);
  assert.equal(dry.code, 0, `dry-run expected exit 0, got ${dry.code}\n${dry.out}`);
  assert.doesNotMatch(dry.out, /would re-sync/, "dry-run must not flag an adapted copy as drift");
  assert.match(dry.out, /adapted \(preserved\)/);
  // apply: must NOT overwrite the local adaptation.
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0, `apply expected exit 0, got ${code}\n${out}`);
  assert.equal(
    localOf(consumer),
    "ADAPTED-LOCAL\n",
    "an adapted copy must NOT be re-synced (no silent revert)"
  );
  assert.match(out, /adapted \(preserved\)/);
  assert.doesNotMatch(out, /re-synced 1/);
});

// A temp upstream declaring an artifact-bearing tool (cli:node so it's always "installed",
// making the artifact mtime the thing under test) + a consumer whose artifact has a
// controlled age (null = not built).
function scaffoldArtifact({ ageDays }) {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-art-"));
  tmpdirs.push(root);
  const upstream = path.join(root, "upstream");
  const consumer = path.join(root, "consumer");
  mkdirSync(path.join(upstream, "setup"), { recursive: true });
  mkdirSync(path.join(consumer, "tools"), { recursive: true });
  writeFileSync(
    path.join(upstream, "setup", "external-tools.lock.json"),
    JSON.stringify({
      tools: [
        {
          name: "graphtest",
          cli: "node",
          pin: "v",
          artifact: { path: "art/graph.json", staleDays: 7, refresh: "graphtest update <scope>" },
        },
      ],
    })
  );
  writeFileSync(path.join(consumer, "tools", "copy-parity.config.json"), JSON.stringify({ copies: [] }));
  if (ageDays !== null) {
    mkdirSync(path.join(consumer, "art"), { recursive: true });
    const f = path.join(consumer, "art", "graph.json");
    writeFileSync(f, "{}\n");
    const when = new Date(Date.now() - ageDays * 86400000);
    utimesSync(f, when, when);
  }
  return { upstream, consumer };
}

// 8. artifact freshness (dim 3) — a STALE derived artifact is surfaced with the scoped
//    refresh command, and it is HEALTH not a blocker (exit 0). The false-fresh fix.
test("artifact stale → '⚠ STALE' + scoped refresh, exit 0 (not a blocker)", () => {
  const { consumer, upstream } = scaffoldArtifact({ ageDays: 30 });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0, `a stale artifact must NOT fail the upgrade (health, not blocker)\n${out}`);
  assert.match(out, /STALE/, "must surface the stale artifact");
  assert.match(out, /graphtest update <scope>/, "must recommend the tool's scoped refresh");
});

// 9. artifact freshness — a fresh artifact is reported fresh, not flagged.
test("artifact fresh → reported fresh, no STALE", () => {
  const { consumer, upstream } = scaffoldArtifact({ ageDays: 1 });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0);
  assert.match(out, /fresh/);
  assert.doesNotMatch(out, /STALE/);
});

// 10. artifact freshness — a not-built artifact is surfaced (not silently "fresh").
test("artifact missing → 'not built' + scoped refresh", () => {
  const { consumer, upstream } = scaffoldArtifact({ ageDays: null });
  const { code, out } = run(consumer, upstream);
  assert.equal(code, 0);
  assert.match(out, /not built/);
});

// 11. opt-in --with-<tool> <scope> is explicit + scoped and only previews in dry-run —
//     never a default full rebuild.
test("--with-graphtest <scope> (dry-run) → 'would run' scoped, never a default rebuild", () => {
  const { consumer, upstream } = scaffoldArtifact({ ageDays: 30 });
  const { code, out } = run(consumer, upstream, ["--dry-run", "--with-graphtest", "apps/x"]);
  assert.equal(code, 0);
  assert.match(out, /would run: graphtest update apps\/x/);
});

// ── Divergence diagnosis ─────────────────────────────────────────────────────
// A mount that cannot fast-forward must say WHY in the same breath. "diverged"
// alone sent four readers to git, where the cause was not (the cause was a PR that
// could never merge). These guard both halves: the dry-run must not promise a
// fast-forward the apply cannot perform, and the failure must name the owner.

const DEFAULT_BRANCH = "master";

/** A real git mount with an upstream default branch, optionally diverged from it. */
function scaffoldGitMount({ diverge, advanceUpstream, orphanUpstream }) {
  const root = mkdtempSync(path.join(os.tmpdir(), "upgrade-git-"));
  tmpdirs.push(root);
  const remote = path.join(root, "remote.git");
  const mount = path.join(root, "mount");
  const other = path.join(root, "other");
  const git = (cwd, ...args) => spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  const seed = (dir, name, email) => {
    git(dir, "config", "user.email", email);
    git(dir, "config", "user.name", name);
  };
  spawnSync("git", ["init", "--bare", "-b", DEFAULT_BRANCH, remote], { encoding: "utf8" });
  spawnSync("git", ["clone", remote, mount], { encoding: "utf8" });
  seed(mount, "Test Owner", "t@t.local");
  writeFileSync(path.join(mount, "seed.md"), "seed\n");
  git(mount, "add", "-A");
  git(mount, "commit", "-m", "seed");
  git(mount, "push", "-u", "origin", DEFAULT_BRANCH);

  if (diverge) {
    // someone else advances the default branch…
    spawnSync("git", ["clone", remote, other], { encoding: "utf8" });
    seed(other, "Other Person", "o@o.local");
    writeFileSync(path.join(other, "theirs.md"), "theirs\n");
    git(other, "add", "-A");
    git(other, "commit", "-m", "theirs");
    git(other, "push", "origin", DEFAULT_BRANCH);
    // …while this mount parks work on a branch of its own
    git(mount, "checkout", "-b", "someone/parked-work");
    writeFileSync(path.join(mount, "mine.md"), "mine\n");
    git(mount, "add", "-A");
    git(mount, "commit", "-m", "mine");
    git(mount, "fetch", "origin", "--quiet");
  }

  if (advanceUpstream) {
    // Upstream moves; the mount stays put → behind, never diverged.
    spawnSync("git", ["clone", remote, other], { encoding: "utf8" });
    seed(other, "Other Person", "o@o.local");
    writeFileSync(path.join(other, "theirs.md"), "theirs\n");
    git(other, "add", "-A");
    git(other, "commit", "-m", "theirs");
    git(other, "push", "origin", DEFAULT_BRANCH);
    git(mount, "fetch", "origin", "--quiet");
  }

  if (orphanUpstream) {
    // The shape a single-branch clone produces: the fetch SUCCEEDS (it tracks a real
    // branch) but the default branch it measures against was never fetched. Both
    // halves matter — a failing fetch takes a different path, and deleting the ref
    // without narrowing the refspec would just restore it on the next fetch.
    git(mount, "checkout", "-b", "tracked-elsewhere");
    git(mount, "push", "-u", "origin", "tracked-elsewhere");
    git(mount, "config", "remote.origin.fetch",
        "+refs/heads/tracked-elsewhere:refs/remotes/origin/tracked-elsewhere");
    git(mount, "update-ref", "-d", `refs/remotes/origin/${DEFAULT_BRANCH}`);
  }

  mkdirSync(path.join(mount, "tools"), { recursive: true });
  writeFileSync(path.join(mount, "tools", "devkit-upgrade.mjs"), readFileSync(TOOL, "utf8"));
  return mount;
}

const runInMount = (mount, args = [], extraEnv = {}) => {
  // Scrub the forge CLI's repo-override env: an exported GH_REPO makes it ignore
  // the local remote and answer about a real repo over the network, which would
  // make the offline tests both flaky and non-offline.
  const env = { ...process.env, ...extraEnv };
  delete env.GH_REPO;
  delete env.GH_HOST;
  delete env.GH_TOKEN;
  const r = spawnSync(
    process.execPath,
    [path.join(mount, "tools", "devkit-upgrade.mjs"), "--dry-run", "--no-tools", ...args],
    { cwd: mount, encoding: "utf8", env }
  );
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

/** The same run without --dry-run: exercises the failed-apply path, not the preview. */
const applyInMount = (mount, extraEnv = {}) => {
  const env = { ...process.env, ...extraEnv };
  delete env.GH_REPO;
  delete env.GH_HOST;
  delete env.GH_TOKEN;
  const r = spawnSync(
    process.execPath,
    [path.join(mount, "tools", "devkit-upgrade.mjs"), "--no-tools"],
    { cwd: mount, encoding: "utf8", env }
  );
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

/**
 * A fake forge CLI on PATH that answers `pr list` with canned JSON.
 * The three lines this feature exists for (RED / green / no-route) are otherwise
 * untestable without network — and they are precisely the lines that must not lie.
 * POSIX-only: the tool spawns the CLI without a shell, so a shell script is not
 * resolvable on win32. CI (the gate that counts) is ubuntu.
 */
function withForgeShim(json) {
  const bin = mkdtempSync(path.join(os.tmpdir(), "forge-shim-"));
  tmpdirs.push(bin);
  const shim = path.join(bin, "gh");
  writeFileSync(shim, `#!/bin/sh\ncat <<'JSON'\n${json}\nJSON\n`, { mode: 0o755 });
  return { PATH: `${bin}${path.delimiter}${process.env.PATH}` };
}
const posixOnly = process.platform !== "win32";

// 12. The dry-run must not promise a fast-forward the apply cannot perform.
test("diverged mount (dry-run) → says it would NOT fast-forward, not a bogus commit count", () => {
  const mount = scaffoldGitMount({ diverge: true });
  const { code, out } = runInMount(mount);
  assert.equal(code, 0);
  assert.match(out, /would NOT fast-forward/);
  assert.doesNotMatch(out, /would fast-forward \d+ commit/);
});

// 13. The missing half: who owns this, and can the work land at all.
test("diverged mount → diagnosis names the branch, the ahead/behind split and the last author", () => {
  const mount = scaffoldGitMount({ diverge: true });
  const { out } = runInMount(mount);
  assert.match(out, /mount is on 'someone\/parked-work'/);
  assert.match(out, /1 commit\(s\) ahead \/ 1 behind/);
  assert.match(out, /last commit: Test Owner/);
});

// 14. Degrade, never block: an unavailable forge is stated as unknown, never guessed.
test("diverged mount with no forge behind it → says the PR was not checked, claims nothing", () => {
  const mount = scaffoldGitMount({ diverge: true });
  const { out } = runInMount(mount);
  assert.match(out, /PR: not checked/);
  assert.doesNotMatch(out, /PR #/);
});

// 15. No regression: an in-sync mount previews an empty fast-forward.
test("in-sync mount → previews a 0-commit fast-forward, never the divergence warning", () => {
  const mount = scaffoldGitMount({ diverge: false });
  const { code, out } = runInMount(mount);
  assert.equal(code, 0);
  assert.match(out, /would fast-forward 0 commit\(s\)/);
  assert.doesNotMatch(out, /would NOT fast-forward/);
});

// 16. The ordinary case the suite never covered — behind, with nothing local. This
//     is the branch that hid the `?? 0` lie: with no test on it, a preview that
//     invents a number looks identical to one that measured it.
test("behind-only mount → previews the real commit count, not a divergence", () => {
  const mount = scaffoldGitMount({ diverge: false, advanceUpstream: true });
  const { code, out } = runInMount(mount);
  assert.equal(code, 0);
  assert.match(out, /would fast-forward 1 commit\(s\)/);
  assert.doesNotMatch(out, /would NOT fast-forward/);
});

// 17. Unresolvable counts must be stated as unknown. Saying "0" would be the same
//     lie this feature exists to kill, moved from the calculation into the render.
test("mount that cannot resolve the upstream ref → says it cannot preview, invents no number", () => {
  const mount = scaffoldGitMount({ diverge: false, orphanUpstream: true });
  const { code, out } = runInMount(mount);
  assert.equal(code, 0);
  assert.match(out, /cannot preview/);
  assert.doesNotMatch(out, /would fast-forward \d+ commit/);
});

// ── The three lines this feature exists for ──────────────────────────────────
// A diverged mount whose PR is RED (the scar: two PRs sat red for weeks while four
// readers were told only "diverged"), one whose checks are merely UNFINISHED, and
// one whose PR already landed. Each was a confident falsehood before these.

if (posixOnly) {
  // 18. The scar itself.
  test("diverged mount, PR red → names the failing check and says it cannot merge", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const env = withForgeShim(
      '[{"number":268,"state":"OPEN","statusCheckRollup":[{"name":"l2-product-neutrality","status":"COMPLETED","conclusion":"FAILURE"}]}]'
    );
    const { out } = runInMount(mount, [], env);
    assert.match(out, /PR #268: RED — l2-product-neutrality/);
    assert.match(out, /cannot merge as-is/);
  });

  // 19. Not-failing is not green. A running check must never read as "merge it".
  test("diverged mount, checks still running → says wait, never 'checks green'", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const env = withForgeShim(
      '[{"number":268,"state":"OPEN","statusCheckRollup":[{"name":"build","status":"IN_PROGRESS"}]}]'
    );
    const { out } = runInMount(mount, [], env);
    assert.match(out, /checks still running/);
    assert.doesNotMatch(out, /checks green/);
  });

  // 20. A runner that dies reports CANCELLED / TIMED_OUT, never FAILURE — this repo
  //     has seen it. Treating those as green would recommend merging a dead gate.
  test("diverged mount, check cancelled → counted as failing, not as green", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const env = withForgeShim(
      '[{"number":268,"state":"OPEN","statusCheckRollup":[{"name":"affected build","status":"COMPLETED","conclusion":"CANCELLED"}]}]'
    );
    const { out } = runInMount(mount, [], env);
    assert.match(out, /RED — affected build/);
    assert.doesNotMatch(out, /checks green/);
  });

  // 21. A squash-merge leaves the old commits counted as ahead, so "already landed"
  //     is the likeliest divergence — and the one previously reported as "no route".
  test("diverged mount whose PR already merged → says the branch is stale, not 'no route'", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const head = spawnSync("git", ["-C", mount, "rev-parse", "HEAD"], { encoding: "utf8" })
      .stdout.trim();
    const env = withForgeShim(`[{"number":268,"state":"MERGED","headRefOid":"${head}"}]`);
    const { out } = runInMount(mount, [], env);
    assert.match(out, /already MERGED/);
    assert.match(out, /put the mount back on master/);
    assert.doesNotMatch(out, /no route to master/);
  });

  // 22. …but only when the tip is what landed. Commits pushed after the merge live
  //     nowhere else; "go back to master" would tell their author to abandon them,
  //     and this repo has already lost late-pushed commits once.
  test("merged PR but branch has newer commits → warns to review them, never says just go back", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const stale = "0".repeat(40); // the merged head is NOT this branch's tip
    const env = withForgeShim(`[{"number":268,"state":"MERGED","headRefOid":"${stale}"}]`);
    const { out } = runInMount(mount, [], env);
    assert.match(out, /commits AFTER the merged head/);
    assert.doesNotMatch(out, /put the mount back on master/);
  });

  // 23. The other check shape (classic statuses) carries state/context, not
  //     conclusion/name. Without this, deleting that half of the filter is silent.
  test("classic status check in FAILURE → read as red, by its context name", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const env = withForgeShim(
      '[{"number":268,"state":"OPEN","statusCheckRollup":[{"context":"ci/legacy","state":"FAILURE"}]}]'
    );
    const { out } = runInMount(mount, [], env);
    assert.match(out, /RED — ci\/legacy/);
    assert.doesNotMatch(out, /checks green/);
  });

  // 24. A PR closed without merging is a dead end too — but a different one.
  test("PR closed without merging → says so explicitly, not 'none at all'", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const { out } = runInMount(mount, [], withForgeShim('[{"number":268,"state":"CLOSED"}]'));
    assert.match(out, /CLOSED without merging/);
  });

  // 22. Only a genuinely empty answer earns the dead-end verdict.
  test("diverged mount with no PR at all → only then says there is no route", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const { out } = runInMount(mount, [], withForgeShim("[]"));
    assert.match(out, /no route to master/);
  });

  // 25. Green is asserted, never inferred from an empty rollup.
  test("diverged mount, zero checks reported → asks to verify, does not claim green", () => {
    const mount = scaffoldGitMount({ diverge: true });
    const env = withForgeShim('[{"number":268,"state":"OPEN","statusCheckRollup":[]}]');
    const { out } = runInMount(mount, [], env);
    assert.match(out, /no checks reported/);
    assert.doesNotMatch(out, /checks green/);
  });
}

// 26. The surface the whole feature exists for is the FAILED APPLY, not the preview —
//     and every divergence test above runs --dry-run. Without this, the path the four
//     readers actually hit has no net under it.
test("apply on a diverged mount → the pull failure carries the diagnosis, not just the git error", () => {
  const mount = scaffoldGitMount({ diverge: true });
  const { code, out } = applyInMount(mount);
  assert.equal(code, 0);
  assert.match(out, /pull failed/);
  assert.match(out, /mount is on 'someone\/parked-work'/);
  assert.match(out, /last commit: Test Owner/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ndevkit-upgrade: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
