import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { extrasEntries } from "./package-extras.mjs";
import { firefoxPackages, xpiName } from "./package-firefox.mjs";
import { firefox } from "./ports/browsers.mjs";
import { resolveAll } from "./resolve.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const release = await read(".github/workflows/release.yml");
const pkg = JSON.parse(await read("package.json"));

test("release.yml runs only on pushed v* tags", () => {
  const on = release.split(/^on:\n/m)[1].split(/^\S/m)[0];
  assert.match(on, /^\s+push:\n\s+tags: \["v\*"\]\s*$/);
  assert.doesNotMatch(on, /pull_request|schedule|workflow_dispatch|branches/);
});

test("release.yml has minimal permissions and uses no secrets beyond the built-in token", () => {
  assert.match(release, /^permissions:\n  contents: read$/m);
  assert.equal([...release.matchAll(/contents: write/g)].length, 1);
  assert.doesNotMatch(release.replace(/contents: write/, ""), /: write\b/);
  assert.doesNotMatch(release, /secrets\.(?!GITHUB_TOKEN)/);
  assert.doesNotMatch(release, /git tag|git push|--latest=false/);
});

test("release.yml builds with package:all and attaches every artifact", () => {
  assert.match(release, /pnpm run package:all/);
  for (const artifact of ["dist/vscode/*.vsix", "dist/jetbrains/*.zip", "dist/sublime/*.sublime-package", "dist/chrome/*.zip", "dist/firefox/*.xpi", "dist/living-code-extras.zip"]) {
    assert.ok(release.includes(artifact), artifact);
  }
  const all = pkg.scripts["package:all"];
  for (const s of ["vscode", "jetbrains", "sublime", "chrome", "firefox", "extras"]) assert.ok(all.includes(`package:${s}`), s);
});

test("no workflow other than the publish ones can publish, and those are manual only", async () => {
  for (const name of (await readdir(new URL("../.github/workflows/", import.meta.url))).filter((n) => n.startsWith("publish-"))) {
    const text = await read(`.github/workflows/${name}`);
    const on = text.split(/^on:\n/m)[1].split(/^\S/m)[0];
    assert.match(on, /workflow_dispatch/, name);
    assert.doesNotMatch(on, /push|pull_request|schedule/, name);
  }
});

test("Firefox .xpi files hold the manifest and icons it names, for the flavors the port ships", () => {
  const flavors = resolveAll();
  const packs = firefoxPackages(flavors);
  assert.deepEqual(packs.map((p) => p.flavor.id), ["night", "paper"]);
  for (const { flavor, entries } of packs) {
    assert.equal(xpiName(flavor), `living-code-firefox-${flavor.id}.xpi`);
    const manifest = JSON.parse(entries.find((e) => e.path === "manifest.json").content);
    assert.equal(manifest.browser_specific_settings.gecko.id, `${flavor.slug}@elliotluque`);
    for (const icon of Object.values(manifest.icons)) assert.ok(entries.some((e) => e.path === icon), icon);
  }
  assert.equal(flavors.filter((f) => firefox.files(f).length).length, 2);
});

test("living-code-extras.zip covers every file under extras/", async () => {
  const entries = extrasEntries();
  assert.ok(entries.length > 100);
  for (const e of entries) {
    assert.match(e.path, /^extras\//);
    assert.ok(existsSync(new URL(`../${e.path}`, import.meta.url)), e.path);
  }
  assert.ok(entries.some((e) => e.path === "extras/kitty/living-code-night.conf"));
  assert.ok(entries.some((e) => e.path === "extras/firefox/living-code-night/icons/icon-96.png"));
});

test("DISTRIBUTION.md covers every authorized channel and nothing unauthorized", async () => {
  const doc = await read("docs/DISTRIBUTION.md");
  const channels = ["VS Code Marketplace", "Open VSX", "JetBrains Marketplace", "Zed registry", "Chrome Web Store", "Obsidian community themes", "Sublime Package Control"];
  for (const name of channels) {
    const section = doc.split(new RegExp(`^## ${name}\\n`, "m"))[1]?.split(/^## /m)[0];
    assert.ok(section, name);
    for (const field of ["**Status:**", "**Submit:**", "**Rules:**", "**Account / secret:**", "**Cost:**"]) assert.ok(section.includes(field), `${name} lacks ${field}`);
    assert.match(section, /https:\/\//, `${name} lacks a rules link`);
    assert.match(section, /^1\. /m, `${name} lacks numbered steps`);
  }
  assert.match(doc.split("## Chrome Web Store\n")[1], /\$5 one-time/);
  assert.match(doc, /community-css-themes\.json/);
  assert.match(doc, /living-code-obsidian/);
  assert.match(doc, /^## Firefox AMO$/m);
  assert.match(doc, /addons\.mozilla\.org\/firefox\/addon\/living-code-night/);
  assert.match(doc, /addons\.mozilla\.org\/firefox\/addon\/living-code-paper/);
  const notPursued = doc.split(/^## Not pursued\n/m)[1];
  for (const name of ["iTerm2-Color-Schemes", "kitty-themes", "alacritty-theme", "Helix", "btop", "tinted-theming", "yazi flavors"]) assert.ok(notPursued.includes(`**${name}:**`), name);
  assert.doesNotMatch(doc, /—/);
});

test("README and PUBLISHING.md link to DISTRIBUTION.md", async () => {
  assert.match(await read("README.md"), /\]\(docs\/DISTRIBUTION\.md\)/);
  assert.match(await read("docs/PUBLISHING.md"), /\]\(DISTRIBUTION\.md\)/);
});
