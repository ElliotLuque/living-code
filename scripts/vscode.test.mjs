import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveAll } from "./resolve.mjs";
import { vscode } from "./ports/editors.mjs";

const flavors = resolveAll();
const read = (path) => readFile(new URL(`../extras/vscode/${path}`, import.meta.url), "utf8");
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await read("package.json"));
const png = await readFile(new URL("../extras/vscode/images/icon.png", import.meta.url));

test("manifest has the fields the Marketplace and Open VSX need", () => {
  assert.equal(manifest.publisher, "elliotluque");
  assert.equal(manifest.name, "living-code");
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.icon, "images/icon.png");
  assert.equal(manifest.galleryBanner.color, flavors.find((f) => f.id === "night").c("base"));
  assert.equal(manifest.galleryBanner.theme, "dark");
  assert.equal(manifest.homepage, "https://github.com/ElliotLuque/living-code");
  assert.equal(manifest.bugs.url, "https://github.com/ElliotLuque/living-code/issues");
  assert.equal(manifest.repository.directory, "extras/vscode");
  assert.ok(manifest.keywords.length > 0);
  assert.deepEqual(manifest.categories, ["Themes"]);
});

test("one theme per flavor, labels unchanged, files exist", async () => {
  assert.deepEqual(manifest.contributes.themes.map((t) => t.label), flavors.map((f) => f.name));
  for (const [i, f] of flavors.entries()) {
    const entry = manifest.contributes.themes[i];
    assert.equal(entry.uiTheme, f.light ? "vs" : "vs-dark", f.id);
    JSON.parse(await read(entry.path.replace("./", "")));
  }
});

test("icon is a 128x128 RGBA PNG", () => {
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 128);
  assert.equal(png.readUInt32BE(20), 128);
  assert.equal(png[24], 8, "bit depth");
  assert.equal(png[25], 6, "RGBA color type");
});

test("README images are absolute https URLs and cover every flavor", async () => {
  const readme = await read("README.md");
  const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
  assert.equal(images.length, flavors.length);
  for (const [i, f] of flavors.entries()) {
    assert.equal(images[i], `https://raw.githubusercontent.com/ElliotLuque/living-code/main/assets/preview-${f.id}.png`);
  }
  assert.doesNotMatch(readme, /\u2014/);
});

test("CHANGELOG documents the current version and LICENSE is bundled", async () => {
  assert.match(await read("CHANGELOG.md"), new RegExp(`## \\[?${pkg.version.replaceAll(".", "\\.")}\\]?`));
  assert.match(await read("LICENSE"), /^MIT License/);
});

test("committed files match the generator", async () => {
  const files = [...flavors.flatMap((f) => vscode.files(f)), ...vscode.all(flavors)];
  for (const file of files) {
    assert.equal(await read(file.path.replace("extras/vscode/", "")), file.content, file.path);
  }
});
