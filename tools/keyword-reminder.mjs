#!/usr/bin/env node
/**
 * UserPromptSubmit hook — generic keyword reminder engine.
 *
 * Topic-agnostic. Reads a rules table from `keyword-reminders.json` (next to
 * this file): each rule is a set of keyword patterns + a reminder message. For
 * every rule whose patterns match the user prompt, prepends its reminder banner
 * to the conversation (Claude Code / Codex hook contract: stdout becomes
 * additional context). Add or change reminders by editing the JSON — never the
 * code.
 *
 * This replaces the per-topic hooks (xms-keyword-reminder, crm-antipattern-
 * reminder), which were the same mechanism hardcoded to one subject. The engine
 * is vendor-neutral and reusable across repos; only the rules file is project-
 * specific.
 *
 * Hook contract: read the prompt payload from stdin, emit context to stdout,
 * use stderr for diagnostics, always exit 0 (never block the prompt).
 *
 * Rule shape (keyword-reminders.json — array of rules):
 *   {
 *     "id": "short-slug",
 *     "title": "ONE-LINE HEADER shown in the banner",
 *     "patterns": ["\\bword\\b", { "re": "\\bACRONYM\\b", "flags": "" }],
 *     "message": ["line 1", "line 2", ...]   // or a single string
 *   }
 * Pattern strings default to case-insensitive ("i"); use the {re, flags} form
 * to override (e.g. flags "" for a case-sensitive acronym).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONFIG = path.join(HERE, "keyword-reminders.json");
const RULE = "════════════════════════════════════════════════════════════";

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    payload = { prompt: input };
  }
  const prompt = String(payload.prompt ?? payload.user_prompt ?? input ?? "");

  let rules;
  try {
    rules = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
  } catch {
    process.exit(0);
  }
  if (!Array.isArray(rules)) process.exit(0);

  const out = [];
  for (const rule of rules) {
    let matched;
    try {
      const regexes = (rule.patterns || []).map((p) =>
        typeof p === "string" ? new RegExp(p, "i") : new RegExp(p.re, p.flags ?? "i")
      );
      matched = regexes.filter((re) => re.test(prompt));
    } catch {
      continue; // a malformed rule never breaks the others
    }
    if (matched.length === 0) continue;

    const body = Array.isArray(rule.message) ? rule.message.join("\n") : String(rule.message ?? "");
    out.push(
      "",
      RULE,
      rule.title ?? `REMINDER: ${rule.id ?? "keyword match"}`,
      `Matched: ${matched.map((re) => re.toString()).join(", ")}`,
      "",
      body,
      RULE,
      ""
    );
  }

  if (out.length === 0) process.exit(0);
  process.stdout.write(out.join("\n"));
  process.exit(0);
});
