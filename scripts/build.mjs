#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contrast } from "./color.mjs";
import { ACCENT_ORDER, NEUTRAL_ORDER, resolveAll } from "./resolve.mjs";
import { generate, groups } from "./ports/index.mjs";
import { npmPorts } from "./npm-packages.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const flavors = resolveAll();
const night = flavors.find((f) => f.id === "night");

const TEXT_ROLES = ["fg", "fgAlt", "fgMuted", "fgSubtle", "keyword", "function", "string", "number", "constant", "type", "decorator", "tag", "property", "parameter", "comment", "operator", "error", "warning", "info", "hint", "success", "link", "heading", "lineNumberActive"];
const audit = [];
for (const f of flavors) {
  for (const role of TEXT_ROLES) {
    const ratio = contrast(f.rr(role), f.raw.base);
    if (ratio < 4.5) audit.push(`${f.id}.${role} (${f.roles[role]}) ${ratio.toFixed(2)}:1`);
  }
}

const USES = {
  crust: "sidebars, tab bars, status lines", base: "background", mantle: "floats, cards, popups",
  surface0: "line highlight, inactive tabs", surface1: "borders, ANSI black", surface2: "selection",
  overlay: "line numbers, punctuation", comment: "comments, operators", subtext: "muted text, ANSI white",
  text2: "properties, parameters", text: "foreground",
};
const sw = (hex) => `<img src="assets/swatches/${hex.slice(1)}.svg" width="18" height="18" alt="${hex}">`;
const uses = (f, name) => {
  if (USES[name]) return USES[name];
  const roles = Object.entries(f.roles).filter(([, color]) => color === name).map(([role]) => role);
  return roles.length ? roles.join(" · ") : "Available for custom accents";
};
const table = (f, names) => [
  "| | Name | Hex | OKLCH | Used for |",
  "|:-:|---|---|---|---|",
  ...names.map((n) => `| ${sw(f.c(n))} | \`${n}\` | \`${f.c(n)}\` | \`${f.colors[n].css}\` | ${uses(f, n)} |`),
].join("\n");
const ansiTable = (f) => [
  "| | " + ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"].join(" | ") + " |",
  "|---|" + ":-:|".repeat(8),
  "| normal | " + f.ansi.normal.map(sw).join(" | ") + " |",
  "| bright | " + f.ansi.bright.map(sw).join(" | ") + " |",
].join("\n");

const SYNTAX = ["keyword", "function", "type", "string", "number", "decorator", "property", "operator", "comment"];
const roleTable = [
  `| Role | ${flavors.map((f) => f.name.replace("Living Code ", "")).join(" | ")} |`,
  `|---|${flavors.map(() => "---|").join("")}`,
  ...SYNTAX.map((role) => `| ${role} | ${flavors.map((f) => `${sw(f.r(role))} \`${f.roles[role]}\``).join(" | ")} |`),
].join("\n");

const portTables = groups.map((g) => `**${g.title}:** ${g.ports.map((p) => `[${p.name}](#${p.id})`).join(" · ")}`).join("\n\n");
const installs = groups.map((g) => `### ${g.title}\n\n${g.ports.map((p) => `<a id="${p.id}"></a>\n#### [${p.name}](${p.homepage})\n\n${p.install}\n`).join("\n")}`).join("\n");

const readme = `<h1 align="center">Living Code</h1>

<p align="center"><b>Calm slate. Living color.</b><br>
A color scheme where the background stays quiet and the code comes alive.<br>
For editors, terminals, browsers and the web.</p>

<p align="center">
${flavors.map((f) => `<img src="assets/preview-${f.id}.png" width="49%" alt="${f.name}">`).join("\n")}
</p>

## Choose a flavor

Every flavor shares the same slate foundation and semantic roles. Night is the default.

| Flavor | Appearance | Syntax and accents |
|---|---|---|
| [Night](#living-code-night) | Dark slate, full palette | Cool structure, green strings, copper numbers and amber warnings. The default. |
| [Frost](#living-code-frost) | Lifted, bluer slate | Lower-chroma accents with amber strings and copper numbers. |
| [Paper](#living-code-paper) | Near-white slate | Darker accents with amber strings and copper numbers. |
| [Signal](#living-code-signal) | Dark slate, one accent | Minimal variant of Night: teal keywords and tags, everything else neutral. |

## Design

- **The ground stays calm.** Backgrounds, panels, selections, punctuation and comments live on one slate ramp, so the eye goes to the code, not the chrome.
- **Cool for structure, warm for data.** ${sw(night.c("teal"))} Teal, aqua and steel mark keywords, functions and types; ${sw(night.c("moss"))} moss, ${sw(night.c("amber"))} amber and ${sw(night.c("copper"))} copper mark strings, numbers and warnings.
- **Same roles everywhere.** Each port maps the same semantic roles (keyword, string, error, border...), so a theme feels the same in your editor, terminal and browser.
- **Built in OKLCH.** Every palette value is defined in OKLCH; hex and RGB are derived. The build checks text roles for WCAG AA contrast (≥ 4.5:1) against each flavor's background.

## Flavors

${flavors.map((f) => `### ${f.name}

${f.description}

<img src="assets/preview-${f.id}.png" width="100%" alt="${f.name}: editor syntax, terminal output and ANSI palette">

${f.id === "signal" ? `Accent names such as \`amber\`, \`copper\` and \`moss\` remain available for port compatibility,
but in Signal they are aliases of teal or neutral colors. Diagnostics are told apart by labels, signs and underlines instead of hue.

` : ""}<details${f.id === "night" ? " open" : ""}>
<summary>Palette</summary>

**Neutrals**

${table(f, NEUTRAL_ORDER)}

**${f.id === "signal" ? "Accent" : "Accents"}**

${table(f, f.id === "signal" ? ["teal"] : ACCENT_ORDER)}

**ANSI**

${ansiTable(f)}

</details>
`).join("\n")}

### Syntax roles

${roleTable}

The table shows resolved roles for every flavor. The full role map (UI, diagnostics, markup) is in
[\`palette/flavors.mjs\`](palette/flavors.mjs): \`defaultRoles\` plus each flavor's \`roles\` overrides.

Every port ships every flavor: pick the \`living-code-<flavor>\` file, or in Neovim use \`:colorscheme living-code-frost\`
or set \`flavor = "frost"\` in the [plugin setup](#neovim). Browser themes (Firefox and Chrome) ship Night and Paper only. A browser theme colours just backgrounds, borders and one accent, and in those slots Frost and Signal would look the same as (or barely different from) Night; both browser stores reject duplicate themes. If you use Frost or Signal elsewhere, Night is the closest match in the browser.

## Ports

${portTables}

Every file in \`extras/\`, \`colors/\` and \`lua/living-code/palettes/\` is generated. Install instructions are below.

## Installation

### npm packages

Ports used from JavaScript or CSS tooling are published to npm. Each package contains only that port's files.

| Port | Package |
|---|---|
${npmPorts.map((p) => `| [${p.name}](#${p.id}) | \`@living-code/${p.npm}\` |`).join("\n")}

Native apps (editors, terminals, CLI tools, browsers) don't need a package: copy their files from [\`extras/\`](extras)
or use the app's own install route, as described below.

${installs}

## Using the palette in something else

Any app can follow the theme: read [\`palette.json\`](palette.json) (hex, OKLCH, RGB, roles and ANSI for every flavor),
or map these semantic roles onto the app's own color slots:

| Slot | Role | Night |
|---|---|---|
| background / foreground | \`bg\` / \`fg\` | \`${night.r("bg")}\` / \`${night.r("fg")}\` |
| panels, sidebars | \`bgDeep\`, \`bgAlt\` | \`${night.r("bgDeep")}\`, \`${night.r("bgAlt")}\` |
| accent, cursor, focus ring | \`accent\` | \`${night.r("accent")}\` |
| selection | \`selection\` | \`${night.r("selection")}\` |
| borders | \`border\` / \`borderActive\` | \`${night.r("border")}\` / \`${night.r("borderActive")}\` |
| error / warning / info / success | \`error\` … | \`${night.r("error")}\` \`${night.r("warning")}\` \`${night.r("info")}\` \`${night.r("success")}\` |

## Recolor images

Turn any image, such as a wallpaper, into a Living Code version. Requires [ImageMagick 7](https://imagemagick.org).

\`\`\`sh
node scripts/recolor.mjs wallpaper.jpg --flavor night --mode lut
\`\`\`

| Mode | Result |
|---|---|
| \`lut\` | Starts with the theme's slate ramp. Shadows and muted areas stay neutral; colorful midtones receive the selected flavor's accents over that base. Lightness is fitted to the theme's range. Tune the accent amount with \`--color\` (default: 0.65). Core accents are teal, mint, aqua, steel, amber and copper; \`--accents all\` includes the remaining accents. |
| \`gradient\` | Maps brightness onto dark slate, an accent and light text. Pick the accent with \`--accent amber\`. |
| \`remap\` | Posterizes to the exact palette colors. Add \`--no-dither\` for flat areas. |
| \`all\` | Writes one file per mode. |

In \`lut\` mode, \`--color 0\` uses only the slate ramp; \`--color 1\` allows stronger accents while still protecting shadows and muted areas.
Unlike \`--strength\`, lowering \`--color\` does not bring back the original photo's colors. It controls accent blending, not a fixed percentage of the image's area.
Other controls are \`--spread\` (hue blending), \`--keep-light\` (brightness preservation) and \`--smooth\` (color-noise smoothing).
Use \`--flavor signal\` for slate and teal only; compatibility names such as \`amber\` do not add warm hues in Signal.

Output defaults to \`<image>-<flavor>-<mode>.png\` next to the input. Run with \`--help\` for every option.

## Contributing a port

1. Add a generator to \`scripts/ports/\`: a pure function from a resolved flavor to files.
2. Register it in \`scripts/ports/index.mjs\`.
3. \`node scripts/build.mjs\` regenerates everything, including this README.

If the port is consumed from JavaScript or CSS, set \`npm: "<name>"\` on it to publish it as \`@living-code/<name>\`.
Packages are built with \`pnpm run build:packages\`. Release instructions: [Publishing](docs/PUBLISHING.md).

Regenerate the README preview images with \`pnpm run screenshots\`. This uses headless Chrome (\`google-chrome\` by default;
set \`CHROME_BIN\` for another Chromium executable) and captures all four flavors from the live preview at 1280×720.
The scenes are illustrative editor and terminal previews, not screenshots of installed applications.

Live preview with sliders and every port's output: \`node scripts/serve.mjs\` → <http://localhost:4173/preview/>.

To change a color, edit [\`palette/flavors.mjs\`](palette/flavors.mjs) and rebuild. Do not edit generated files directly.

## License

[MIT](LICENSE) © Elliot Luque
`;

const swatches = new Set(flavors.flatMap((f) => [...Object.values(f.colors).map((c) => c.hex), ...f.ansi.normal, ...f.ansi.bright]));
const files = [
  ...generate(flavors),
  { path: "README.md", content: readme },
  ...[...swatches].map((h) => ({
    path: `assets/swatches/${h.slice(1)}.svg`,
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><rect width="18" height="18" rx="3" fill="${h}"/><rect x=".5" y=".5" width="17" height="17" rx="2.5" fill="none" stroke="#888" stroke-opacity=".35"/></svg>\n`,
  })),
];

let stale = 0;
if (!check) await rm(join(root, "assets/swatches"), { recursive: true, force: true });
for (const { path, content } of files) {
  const abs = join(root, path);
  if (check) {
    const cur = await readFile(abs, "utf8").catch(() => null);
    if (cur !== content) { stale++; console.error(`stale: ${path}`); }
    continue;
  }
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content);
}

console.log(`${check ? "checked" : "wrote"} ${files.length} files for ${flavors.length} flavors`);
if (audit.length) {
  console.error(`\ncontrast below 4.5:1:\n  ${audit.join("\n  ")}`);
  process.exitCode = 1;
}
if (stale) {
  console.error(`\n${stale} generated files out of date. Run node scripts/build.mjs`);
  process.exitCode = 1;
}
