#!/usr/bin/env node
// Builds dist/chrome/living-code-chrome-<flavor>.zip for Night and Paper: the theme folder in extras/chrome/<slug>
// with manifest.json at the zip root, which is what the Chrome Web Store dashboard and "Load unpacked" expect.
// Run `node scripts/build.mjs` first. Reuses the deterministic zip writer from the JetBrains packager.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./package-jetbrains.mjs";
import { chrome } from "./ports/browsers.mjs";
import { resolveAll } from "./resolve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICON_SIZES = [48, 128];

export const zipName = (f) => `living-code-chrome-${f.id}.zip`;

// The flavors the Chrome port ships, as { flavor, entries } with entries ready for zip().
export function chromePackages(flavors = resolveAll()) {
  return flavors.filter((f) => chrome.files(f).length).map((f) => {
    const dir = join(root, "extras/chrome", f.slug);
    const entries = [
      { path: "icons/", content: "" },
      { path: "manifest.json", content: readFileSync(join(dir, "manifest.json")) },
      ...ICON_SIZES.map((n) => ({ path: `icons/icon-${n}.png`, content: readFileSync(join(dir, `icons/icon-${n}.png`)) })),
    ];
    return { flavor: f, entries };
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(root, "dist/chrome");
  mkdirSync(out, { recursive: true });
  for (const { flavor, entries } of chromePackages()) {
    const buf = zip(entries);
    const file = join(out, zipName(flavor));
    writeFileSync(file, buf);
    console.log(`Wrote ${file} (${buf.length} bytes)`);
  }
}
