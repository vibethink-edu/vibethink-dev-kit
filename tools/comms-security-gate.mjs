#!/usr/bin/env node
/**
 * comms-security-gate — fail-closed secret scan for the shared comms lane.
 *
 * Dev-kit canonical source (inherited by consuming repos as a verbatim copy, per
 * ADR-20260524-supra-repo-inheritance-mechanism). Runnable directly as a pre-commit
 * gate (scans staged comm files); also exports HIGH_CONFIDENCE_PATTERNS so the SAME
 * patterns power tools/comms-send.mjs — zero drift between what the gate blocks and
 * what comms:send blocks before it ever writes.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const COMMS_PREFIX = "docs/ai-coordination/comms/";
export const HIGH_CONFIDENCE_PATTERNS = [
  { label: "Bearer token", regex: /authorization\s*:\s*bearer\s+[a-z0-9\-._~+/]+=*/i },
  {
    label: "JWT token",
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]{10,}\.[A-Za-z0-9._-]{10,}\b/,
  },
  { label: "OpenAI-style secret key", regex: /\bsk-[A-Za-z0-9_-]{16,}\b/ },
  { label: "Google API key", regex: /\bAIza[0-9A-Za-z\-_]{20,}\b/ },
  {
    label: "Explicit access token assignment",
    regex: /\baccess[_-]?token\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{12,}/i,
  },
  {
    label: "Explicit refresh token assignment",
    regex: /\brefresh[_-]?token\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{12,}/i,
  },
  {
    label: "Explicit client secret assignment",
    regex: /\bclient[_-]?secret\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i,
  },
  {
    label: "Service-role style secret reference with value",
    regex:
      /\b(service[_-]?role|supabase_service_role_key|livekit_api_secret)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i,
  },
  {
    label: "API key assignment",
    regex:
      /\b(api[_ -]?key|gemini_api_key|openai_api_key|anthropic_api_key)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i,
  },
];

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=AM", {
    cwd: process.cwd(),
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();

  if (!output) return [];
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(COMMS_PREFIX));
}

function main() {
  const stagedComms = getStagedFiles();
  if (stagedComms.length === 0) {
    process.exit(0);
  }

  const findings = [];

  for (const file of stagedComms) {
    const absolutePath = join(process.cwd(), file);
    const content = readFileSync(absolutePath, "utf-8");

    for (const pattern of HIGH_CONFIDENCE_PATTERNS) {
      const match = content.match(pattern.regex);
      if (match) {
        findings.push({
          file,
          label: pattern.label,
          sample: match[0].slice(0, 120),
        });
      }
    }
  }

  if (findings.length > 0) {
    console.error("");
    console.error("🚨 PRE-COMMIT BLOCKED: Sensitive material detected in comms artifacts.");
    console.error(
      "   Shared comms may reference secret NAMES, but never secret VALUES, tokens, or env payloads."
    );
    console.error("");
    for (const finding of findings) {
      console.error(`   • ${finding.file}`);
      console.error(`     ${finding.label}: ${finding.sample}`);
    }
    console.error("");
    console.error(
      "   Action: remove the sensitive value, replace it with a path/identifier/reference, and commit again."
    );
    process.exit(1);
  }
}

// Run only when invoked directly (pre-commit hook), NOT when imported for the patterns.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
