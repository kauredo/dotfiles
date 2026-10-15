#!/usr/bin/env node
// Checks that slash-command and pnpm-script references in skill docs resolve.
// Usage: node check-skill-references.mjs <skills-dir>   (default: skills)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BUILTINS = ["mcp", "run", "goal", "help", "init", "loop", "clear", "hooks", "model", "agents", "config", "doctor", "effort", "memory", "plugin", "resume", "skills", "compact", "context", "schedule", "simplify", "workflows", "permissions"];
// visual-edit cites the Design bridge's HTTP routes (snapshot, health and the rest).
const NON_SKILL_PATHS = ["foo", "tmp", "apps", "blog", "css2", "poll", "team", "about", "admin", "plans", "health", "upload", "clients", "company", "connect", "product", "about-us", "features", "insights", "packages", "platform", "snapshot", "changelog", "customers", "read-file", "resources", "solutions", "write-file", "case-studies", "command-name", "integrations", "pricing-plans", "success-stories", "live-edit-bridge"];
const UNINSTALLED_UPSTREAM = ["figma", "slideshow", "hooks-trust", "pr-to-video", "animate-text", "general-video", "music-to-video", "embedded-captions", "faceless-explainer", "talking-head-recut", "regenerate-examples", "product-launch-video", "remotion-to-hyperframes", "impeccable-asset-producer", "impeccable-finish-reviewer"];
export const ALLOWED = new Set([...BUILTINS, ...NON_SKILL_PATHS, ...UNINSTALLED_UPSTREAM]);

const BODY_REF = /`\/([a-z][a-z0-9-]+)`/g;
const SUB_REF = /`\/([a-z][a-z0-9-]*) ([a-z][a-z0-9-]*)`/g;
const DESC_REF = /(?<![\w@/])\/([a-z][a-z0-9-]+)/g;
const PNPM_REF = /\bpnpm (?:run )?([a-z][a-z0-9_-]*:[\w:.-]*[\w])/g;

export function readFrontmatter(path) {
  const m = readFileSync(path, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`${path}: missing YAML frontmatter`);
  const lines = m[1].split(/\r?\n/);
  const fields = {};
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^[|>][+-]?\d*$/.test(value)) {
      const block = [];
      while (i + 1 < lines.length && (/^\s/.test(lines[i + 1]) || lines[i + 1] === "")) block.push(lines[++i].trim());
      value = block.filter(Boolean).join(" ");
    } else {
      value = value.replace(/^(["'])(.*)\1$/, "$2");
    }
    fields[kv[1]] = value;
  }
  return fields;
}

export const isUserInvoked = (fm) => String(fm["disable-model-invocation"]).trim() === "true";

export function checkSkillReferences({ files, skills, scripts = null, descriptions = [], allowed = ALLOWED, subcommands = new Map() }) {
  const known = new Set([...skills, ...allowed]);
  const errors = [];
  for (const { path, text } of descriptions) {
    const seen = new Set();
    for (const [, name] of text.matchAll(DESC_REF)) {
      if (known.has(name) || seen.has(name)) continue;
      seen.add(name);
      errors.push(`${path}: description references /${name}, which is not a known skill. Fix the name if the skill was renamed, or reword if it is not a skill reference.`);
    }
  }
  for (const { path, text } of files) {
    const seen = new Set();
    for (const [, name] of text.matchAll(BODY_REF)) {
      if (known.has(name) || seen.has("n:" + name)) continue;
      seen.add("n:" + name);
      errors.push(`${path}: \`/${name}\` is not a known skill. Fix the name, or add a builtin or path to the allow-lists in this script.`);
    }
    for (const [, skill, sub] of text.matchAll(SUB_REF)) {
      const valid = subcommands.get(skill);
      if (!valid || valid.size === 0 || valid.has(sub) || seen.has(`s:${skill} ${sub}`)) continue;
      seen.add(`s:${skill} ${sub}`);
      errors.push(`${path}: \`/${skill} ${sub}\` is not a sub-command of ${skill}. Valid: ${[...valid].sort().join(", ")}.`);
    }
    if (scripts) {
      for (const [, script] of text.matchAll(PNPM_REF)) {
        if (scripts.has(script) || seen.has("p:" + script)) continue;
        seen.add("p:" + script);
        errors.push(`${path}: \`pnpm ${script}\` is not a script in package.json.`);
      }
    }
  }
  return errors;
}

const list = (dir) => { try { return readdirSync(dir, { withFileTypes: true }); } catch { return []; } };
const isSkillDir = (dir) => existsSync(join(dir, "SKILL.md"));

function markdownFiles(dir) {
  return list(dir).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return markdownFiles(p);
    return e.name.endsWith(".md") && e.name !== "VENDORED.md" ? [p] : [];
  });
}

function pluginNames(dir, depth = 0, names = new Set()) {
  if (depth > 6) return names;
  if (isSkillDir(dir)) names.add(basename(dir));
  for (const e of list(dir)) {
    if (!e.isDirectory() || e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.name === "commands") for (const f of list(p)) if (f.name.endsWith(".md")) names.add(f.name.slice(0, -3));
    pluginNames(p, depth + 1, names);
  }
  return names;
}

function subcommandsOf(skillDir) {
  const subs = new Set();
  const dims = join(skillDir, "dimensions");
  if (!existsSync(dims)) return subs;
  for (const e of [...list(dims), ...list(skillDir)]) {
    if (e.isFile() && e.name.endsWith(".md") && e.name !== "SKILL.md") subs.add(e.name.slice(0, -3));
  }
  return subs;
}

function main() {
  const skillsDir = resolve(process.argv[2] ?? "skills");
  const skillDirs = list(skillsDir).filter((e) => e.isDirectory() && isSkillDir(join(skillsDir, e.name)));
  const home = homedir();
  const skills = new Set(skillDirs.map((e) => e.name));
  for (const e of list(join(home, ".claude", "skills"))) skills.add(e.name);
  for (const e of list(join(home, ".claude", "commands"))) if (e.name.endsWith(".md")) skills.add(e.name.slice(0, -3));
  for (const n of pluginNames(join(home, ".claude", "plugins"))) skills.add(n);

  const files = markdownFiles(skillsDir).map((path) => ({ path, text: readFileSync(path, "utf8") }));
  const descriptions = skillDirs.map((e) => {
    const path = join(skillsDir, e.name, "SKILL.md");
    return { path, text: readFrontmatter(path).description ?? "" };
  });
  const subcommands = new Map(skillDirs.map((e) => [e.name, subcommandsOf(join(skillsDir, e.name))]));

  let scripts = null;
  if (existsSync("package.json")) scripts = new Set(Object.keys(JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {}));

  const errors = checkSkillReferences({ files, skills, scripts, descriptions, subcommands });
  if (errors.length === 0) {
    console.log(`check-skill-references: OK (${files.length} docs, ${skills.size} known skills)`);
    return;
  }
  for (const e of errors) console.error(`::error::${e}`);
  console.error(`\ncheck-skill-references: ${errors.length} broken reference${errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
