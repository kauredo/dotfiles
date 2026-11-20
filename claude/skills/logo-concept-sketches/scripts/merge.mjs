#!/usr/bin/env node
// Merges the sketch agents' sheets into one, one section per agent, numbered in the order given.
// Usage: node merge.mjs <out.json> <agentDir> [<agentDir> ...]
// Each agentDir holds a cells.json; its folder name becomes the section title.
// Prints each agent's number range, which the ledger and the user's board refer to.
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const [, , outPath, ...dirs] = process.argv;
if (!outPath || !dirs.length) {
  console.error("Usage: node merge.mjs <out.json> <agentDir> [<agentDir> ...]");
  process.exit(1);
}
const merged = [];
for (const dir of dirs) {
  const cells = JSON.parse(readFileSync(join(dir, "cells.json"), "utf8"));
  console.log(`${basename(dir)}: ${merged.length + 1}-${merged.length + cells.length}`);
  for (const c of cells) merged.push({ ...c, section: basename(dir), flag: false });
}
writeFileSync(outPath, JSON.stringify(merged));
console.log(`Wrote ${merged.length} cells to ${outPath}`);
