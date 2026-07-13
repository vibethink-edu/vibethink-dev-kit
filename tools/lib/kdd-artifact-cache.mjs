import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  utimesSync,
} from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

const CACHE_DIR_NAME = "vibethink-kdd-artifacts";
const SHA256 = /^[a-f0-9]{64}$/;

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function resolveArtifactCacheRoot(repoRoot, config) {
  if (config?.artifactCache?.mode !== "git-common-dir") return null;

  const result = spawnSync("git", ["rev-parse", "--git-common-dir"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) return null;

  const raw = result.stdout.trim();
  if (!raw) return null;
  const gitCommonDir = isAbsolute(raw) ? raw : resolve(repoRoot, raw);
  return join(gitCommonDir, CACHE_DIR_NAME);
}

export function cachePathForHash(cacheRoot, hash) {
  if (!cacheRoot || !SHA256.test(hash || "")) return null;
  return join(cacheRoot, "sha256", hash.slice(0, 2), hash);
}

export function storeVerifiedArtifact({ cacheRoot, artifactPath, expectedHash }) {
  const cachePath = cachePathForHash(cacheRoot, expectedHash);
  if (!cachePath || !isFile(artifactPath) || sha256(artifactPath) !== expectedHash) return false;
  if (isFile(cachePath) && sha256(cachePath) === expectedHash) return true;

  mkdirSync(dirname(cachePath), { recursive: true });
  const temporary = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    copyFileSync(artifactPath, temporary);
    if (sha256(temporary) !== expectedHash) return false;
    rmSync(cachePath, { force: true });
    renameSync(temporary, cachePath);
    return true;
  } finally {
    rmSync(temporary, { force: true });
  }
}

export function restoreVerifiedArtifact({
  cacheRoot,
  artifactPath,
  expectedHash,
  minimumMtimeMs = 0,
}) {
  const cachePath = cachePathForHash(cacheRoot, expectedHash);
  if (!cachePath || !isFile(cachePath) || sha256(cachePath) !== expectedHash) return false;

  mkdirSync(dirname(artifactPath), { recursive: true });
  const temporary = `${artifactPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    copyFileSync(cachePath, temporary);
    if (sha256(temporary) !== expectedHash) return false;
    const restoredAt = new Date(Math.max(Date.now(), minimumMtimeMs + 1));
    utimesSync(temporary, restoredAt, restoredAt);
    rmSync(artifactPath, { force: true });
    renameSync(temporary, artifactPath);
    return true;
  } finally {
    rmSync(temporary, { force: true });
  }
}
