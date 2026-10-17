#!/usr/bin/env node
// Builds dist/firefox/living-code-firefox-<flavor>.xpi for the flavors the Firefox port ships (Night and Paper).
// An .xpi is a zip with manifest.json at the root. These are unsigned: they install in Firefox Developer Edition,
// Nightly and ESR with xpinstall.signatures.required=false, or temporarily through about:debugging. Release Firefox
// users should use the signed listings on addons.mozilla.org. Run `node scripts/build.mjs` first.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./package-jetbrains.mjs";
import { firefox } from "./ports/browsers.mjs";
import { resolveAll } from "./resolve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICONS = ["icons/icon-48.png", "icons/icon-96.png"];

export const xpiName = (f) => `living-code-firefox-${f.id}.xpi`;

export function firefoxPackages(flavors = resolveAll()) {
  return flavors.filter((f) => firefox.files(f).length).map((f) => {
    const dir = join(root, "extras/firefox", f.slug);
    const entries = [
      { path: "icons/", content: "" },
      { path: "manifest.json", content: readFileSync(join(dir, "manifest.json")) },
      ...ICONS.map((path) => ({ path, content: readFileSync(join(dir, path)) })),
    ];
    return { flavor: f, entries };
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(root, "dist/firefox");
  mkdirSync(out, { recursive: true });
  for (const { flavor, entries } of firefoxPackages()) {
    const buf = zip(entries);
    const file = join(out, xpiName(flavor));
    writeFileSync(file, buf);
    console.log(`Wrote ${file} (${buf.length} bytes)`);
  }
}
