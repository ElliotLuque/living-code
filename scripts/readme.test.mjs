import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { oklabToOklch, rgbToOklab } from "./color.mjs";
import { ACCENT_ORDER, NEUTRAL_ORDER, flavorOrder, resolveFlavor } from "./resolve.mjs";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("README describes Signal aliases using the resolved palette", () => {
  const signal = resolveFlavor("signal");
  const section = readme.split("### Living Code Signal\n")[1].split("### Living Code Frost\n")[0];
  assert.match(section, /Accent and compatibility aliases/);
  for (const name of ACCENT_ORDER.filter((n) => n !== "teal")) {
    const alias = [...NEUTRAL_ORDER, "teal"].find((n) => signal.c(n) === signal.c(name));
    const row = section.split("\n").find((line) => line.includes(`| \`${name}\` |`));
    assert.ok(row?.includes(`\`${signal.c(name)}\``), name);
    assert.ok(row?.includes(`Compatibility alias of \`${alias}\``), name);
  }
  assert.match(readme, /Night remains the default/);
  assert.doesNotMatch(readme, /\u2014/);
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
