import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { oklabToOklch, rgbToOklab } from "./color.mjs";
import { flavorOrder, resolveFlavor } from "./resolve.mjs";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("README lists only the four JS/CSS npm packages", () => {
  const section = readme.split("### npm packages\n")[1].split("\n### ")[0];
  const packages = [...section.matchAll(/`(@living-code\/[^`]+)`/g)].map((match) => match[1]);
  assert.deepEqual(packages, [
    "@living-code/expressive-code",
    "@living-code/css",
    "@living-code/tailwind",
    "@living-code/palette",
  ]);
  assert.match(section, /Native apps .* don't need a package/);
  assert.doesNotMatch(readme, /@living-code\/(?:tmtheme|delta|hunk)\b/);
});

test("README shows only Signal's teal accent, not compatibility slots", () => {
  const signal = resolveFlavor("signal");
  const section = readme.split("### Living Code Signal\n")[1].split("\n### ")[0];
  const accents = section.split("**Accent**\n")[1]?.split("**ANSI**")[0];
  assert.ok(accents);
  const names = [...accents.matchAll(/\| `([^`]+)` \|/g)].map((match) => match[1]).filter((name) => !name.startsWith("#") && !name.startsWith("oklch("));
  assert.deepEqual(names, ["teal"]);
  assert.ok(accents.includes(`\`${signal.c("teal")}\``));
  assert.doesNotMatch(section, /Compatibility alias/);
  assert.match(readme, /Night is the default/);
  assert.doesNotMatch(readme, /\u2014/);
});

test("README keeps the four-flavor grid and a screenshot in every flavor section", () => {
  const grid = [...readme.matchAll(/<p align="center">([\s\S]*?)<\/p>/g)].find((match) => match[1].includes("assets/preview-"))?.[1];
  assert.ok(grid);
  const images = [...grid.matchAll(/<img src="assets\/preview-([^\"]+)\.png" width="49%"/g)];
  assert.deepEqual(images.map((match) => match[1]), flavorOrder);
  for (const flavor of flavorOrder) {
    const f = resolveFlavor(flavor);
    const section = readme.split(`### ${f.name}\n`)[1].split("\n### ")[0];
    assert.ok(section.includes(`<img src="assets/preview-${flavor}.png" width="100%"`), flavor);
  }
});

test("README image references exist and flavor previews are 1280 by 720", async () => {
  for (const [, path] of readme.matchAll(/<img src="([^"]+)"/g)) {
    await readFile(new URL(`../${path}`, import.meta.url));
  }
  for (const flavor of flavorOrder) {
    const path = `assets/preview-${flavor}.png`;
    assert.ok(readme.includes(path), path);
    const png = await readFile(new URL(`../${path}`, import.meta.url));
    assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), 1280, flavor);
    assert.equal(png.readUInt32BE(20), 720, flavor);
  }
});

test("Signal preview image contains slate and teal, not the old multicolor palette", () => {
  const path = fileURLToPath(new URL("../assets/preview-signal.png", import.meta.url));
  const pixels = execFileSync("magick", [path, "-depth", "8", "rgb:-"], { maxBuffer: 4 * 1024 * 1024 });
  let teal = 0, neutral = 0, samples = 0;
  for (let i = 0; i < pixels.length; i += 3 * 17) {
    const [, chroma, hue] = oklabToOklch(rgbToOklab([pixels[i], pixels[i + 1], pixels[i + 2]]));
    samples++;
    if (chroma < 0.035) neutral++;
    else {
      assert.ok(hue >= 160 && hue <= 205, `Unexpected accent hue: ${hue}`);
      teal++;
    }
  }
  assert.ok(teal > 100, "Teal accents should be visible");
  assert.ok(neutral / samples > 0.8, "Slate surfaces should dominate");
});
