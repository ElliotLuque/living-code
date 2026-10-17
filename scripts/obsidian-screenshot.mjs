#!/usr/bin/env node
// Renders extras/obsidian/screenshot.png (512x288, the size Obsidian's theme directory recommends) with headless Chrome
// (CHROME_BIN overrides `google-chrome`). Run `node scripts/build.mjs` first. The PNG is committed.
// It is a static mock of a note, built from the theme's own variables: Night on the left, Paper on the right.
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { obsidianVariables } from "./ports/obsidian.mjs";
import { resolveAll } from "./resolve.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const browser = process.env.CHROME_BIN || "google-chrome";
const W = 512, H = 288;

const pane = (f) => {
  const v = Object.fromEntries(obsidianVariables(f));
  return `<section style="background:${v["--background-primary"]};color:${v["--text-normal"]}">
  <aside style="background:${v["--background-secondary"]};border-right:1px solid ${v["--background-modifier-border"]}">
    <i style="background:${v["--interactive-accent"]}"></i><b></b><b></b><b></b>
  </aside>
  <main>
    <h1 style="color:${v["--h1-color"]}">${f.name.replace("Living Code ", "")}</h1>
    <p>Notes follow your <a style="color:${v["--link-color"]}">links</a> and <span style="color:${v["--tag-color"]}">#tags</span>.</p>
    <blockquote style="color:${v["--blockquote-color"]};border-left:2px solid ${v["--background-modifier-border"]}">Quoted text sits quietly.</blockquote>
    <pre style="background:${v["--code-background"]}"><span style="color:${v["--code-comment"]}">// code</span>
<span style="color:${v["--code-keyword"]}">const</span> <span style="color:${v["--code-function"]}">live</span> = <span style="color:${v["--code-string"]}">"theme"</span>;
<span style="color:${v["--code-keyword"]}">return</span> <span style="color:${v["--code-value"]}">42</span>;</pre>
  </main>
</section>`;
};

export function page(flavors) {
  const night = flavors.find((f) => f.id === "night"), paper = flavors.find((f) => f.id === "paper");
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;display:flex;overflow:hidden;font:12px/1.5 system-ui,sans-serif}
section{width:50%;height:100%;display:flex}aside{width:34px;padding:12px 8px;display:flex;flex-direction:column;gap:10px}
aside i{width:18px;height:18px;border-radius:5px}aside b{width:18px;height:6px;border-radius:3px;background:currentColor;opacity:.25}
main{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:9px}h1{font-size:20px}p{font-size:11px}
blockquote{padding-left:8px;font-size:11px}pre{padding:8px;border-radius:5px;font:10px/1.5 ui-monospace,monospace}
</style>${pane(night)}${pane(paper)}`;
}

const tmp = await mkdtemp(join(tmpdir(), "living-code-obsidian-"));
try {
  const html = join(tmp, "shot.html"), png = join(tmp, "shot.png");
  await writeFile(html, page(resolveAll()));
  const result = spawnSync(browser, [
    "--headless", "--no-sandbox", "--disable-gpu", "--disable-background-networking", "--no-first-run", "--hide-scrollbars",
    `--user-data-dir=${join(tmp, "profile")}`, `--window-size=${W},${H}`, "--force-device-scale-factor=1", "--force-color-profile=srgb",
    "--virtual-time-budget=2000", `--screenshot=${png}`, pathToFileURL(html).href,
  ], { encoding: "utf8", timeout: 60000 });
  if (result.error?.code === "ENOENT") throw new Error(`Cannot find ${browser}. Install Chrome/Chromium or set CHROME_BIN.`);
  if (result.error) throw result.error;
  const data = await readFile(png);
  if (data.readUInt32BE(16) !== W || data.readUInt32BE(20) !== H) throw new Error(`Unexpected size ${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`);
  await writeFile(join(root, "extras/obsidian/screenshot.png"), data);
  console.log("wrote extras/obsidian/screenshot.png");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await rm(tmp, { recursive: true, force: true });
}
