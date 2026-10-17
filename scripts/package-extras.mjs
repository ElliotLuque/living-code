#!/usr/bin/env node
// Builds dist/living-code-extras.zip: every generated file under extras/, in a top-level extras/ folder.
// For people who want all the ports at once instead of one download command per app. Run `node scripts/build.mjs` first.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./package-jetbrains.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const EXTRAS_ZIP = "living-code-extras.zip";

// Every file under extras/ as zip entries named extras/<path>; forward slashes on every OS.
export function extrasEntries(dir = join(root, "extras"), prefix = "extras") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory()
    ? extrasEntries(join(dir, e.name), `${prefix}/${e.name}`)
    : [{ path: `${prefix}/${e.name}`, content: readFileSync(join(dir, e.name)) }]));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(root, "dist");
  mkdirSync(out, { recursive: true });
  const buf = zip(extrasEntries());
  writeFileSync(join(out, EXTRAS_ZIP), buf);
  console.log(`Wrote ${join(out, EXTRAS_ZIP)} (${buf.length} bytes)`);
}
