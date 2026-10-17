#!/usr/bin/env node
// Rasterizes the generated marketplace SVGs to PNG with headless Chrome (CHROME_BIN overrides `google-chrome`).
// Run `node scripts/build.mjs` first. The PNGs are committed: marketplaces need raster icons and build.mjs only writes text.
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const browser = process.env.CHROME_BIN || "google-chrome";
const SIZE = 128;
// flavor id -> destinations (relative to the repo root)
const targets = { night: ["extras/vscode/images/icon.png"] };

// Chrome's screenshot viewport is smaller than the requested window, so draw on a canvas and read the PNG back from the DOM.
const page = (svg) => `<!doctype html><meta charset="utf-8"><body><script>
const image = new Image();
image.onload = () => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = ${SIZE};
  canvas.getContext("2d").drawImage(image, 0, 0, ${SIZE}, ${SIZE});
  document.body.textContent = "PNG:" + canvas.toDataURL("image/png").split(",")[1];
};
image.src = "data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}";
</script>`;

const tmp = await mkdtemp(join(tmpdir(), "living-code-icons-"));
try {
  for (const [id, destinations] of Object.entries(targets)) {
    const html = join(tmp, `${id}.html`);
    await writeFile(html, page(await readFile(join(root, `assets/icons/living-code-${id}.svg`), "utf8")));
    const result = spawnSync(browser, [
      "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--disable-background-networking",
      `--user-data-dir=${join(tmp, `profile-${id}`)}`, "--force-color-profile=srgb",
      "--virtual-time-budget=2000", "--dump-dom", pathToFileURL(html).href,
    ], { encoding: "utf8", timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
    if (result.error?.code === "ENOENT") throw new Error(`Cannot find ${browser}. Install Chrome/Chromium or set CHROME_BIN.`);
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Chrome failed for ${id}: ${result.stderr}`);
    const encoded = result.stdout.match(/PNG:([A-Za-z0-9+/=]+)/)?.[1];
    if (!encoded) throw new Error(`Chrome did not render ${id}`);
    for (const dest of destinations) {
      await writeFile(join(root, dest), Buffer.from(encoded, "base64"));
      console.log(`wrote ${dest}`);
    }
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}
