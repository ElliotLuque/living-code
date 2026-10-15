#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contrast } from "./color.mjs";
import { ACCENT_ORDER, NEUTRAL_ORDER, resolveAll } from "./resolve.mjs";
import { generate, groups, ports } from "./ports/index.mjs";
import { packageId } from "./npm-packages.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const flavors = resolveAll();
const signal = flavors.find((f) => f.id === "signal");

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
  if (f.id === "signal" && name !== "teal") {
    const alias = [...NEUTRAL_ORDER, "teal"].find((n) => f.c(n) === f.c(name));
    return `Compatibility alias of \`${alias}\`; no additional hue`;
  }
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

<p align="center"><b>Slate first. Color with purpose.</b><br>
A color scheme for editors, terminals, browsers and the web.</p>

<p align="center">
<img src="assets/preview-signal.png" width="100%" alt="Living Code Signal preview: teal keywords and focus, gray syntax and diagnostics, dark slate surfaces">
</p>

<p align="center"><b>Living Code Signal</b> · One teal accent. The rest is slate.</p>

## Choose a flavor

All four flavors share a slate foundation and semantic roles. Signal pares the colors down to a single accent;
Night, Frost and Paper keep broader palettes. Night remains the default.

| Flavor | Appearance | Syntax and accents |
|---|---|---|
| [Signal](#living-code-signal) | Dark slate, one accent | Teal keywords, builtins, decorators and tags. Neutral functions, literals and diagnostics. |
| [Night](#living-code-night) | Dark slate, full palette | Cool structure, green strings, copper numbers and amber warnings. The default. |
| [Frost](#living-code-frost) | Lifted, bluer slate | Lower-chroma accents with amber strings and copper numbers. |
| [Paper](#living-code-paper) | Near-white slate | Darker accents with amber strings and copper numbers. |

## Signal: one accent, not a rainbow

Signal uses ${sw(signal.c("teal"))} teal for structure and interaction,
not a separate hue for every syntax category. It keeps the same neutral ramp as Night.

- **Teal marks structure and focus.** Keywords, builtins, decorators, tags, links, cursors and active borders use the same accent.
- **Literals read as text.** Functions, strings, numbers, constants, escapes and regular expressions use the main foreground. Types and parameters use a softer gray.
- **Surfaces stay slate.** Backgrounds, panels, selections, punctuation and comments use the existing neutral ramp.
- **Diagnostics stay neutral.** Errors, warnings, info and hints use foreground shades rather than red, amber, blue and green. Labels, signs and underlines distinguish their meaning.
- **Terminals follow the same rule.** ANSI cyan and bright cyan are teal. The other ANSI slots resolve to neutral shades, including the bright variants.

The named slots \`amber\`, \`copper\`, \`moss\` and the other accent names remain available for port compatibility,
but in Signal they are aliases of teal or neutral colors. They do not introduce warm literals or additional accent hues.

Every palette value is defined in OKLCH; hex and RGB are derived. The build checks text roles for WCAG AA contrast
(≥ 4.5:1) against each flavor's main background.

## Flavors

${flavors.map((f) => `### ${f.name}

${f.description}

${f.id === "signal" ? "The preview at the top shows Signal in the same editor and terminal scene as the other flavors." : `<img src="assets/preview-${f.id}.png" width="100%" alt="${f.name}: editor syntax, terminal output and ANSI palette">`}

<details${f.id === "signal" ? " open" : ""}>
<summary>Palette</summary>

**Neutrals**

${table(f, NEUTRAL_ORDER)}

**${f.id === "signal" ? "Accent and compatibility aliases" : "Accents"}**

${table(f, ACCENT_ORDER)}

**ANSI**

${ansiTable(f)}

</details>
`).join("\n")}

### Syntax roles

${roleTable}

The table shows resolved roles for every flavor. The full role map (UI, diagnostics, markup) is in
[\`palette/flavors.mjs\`](palette/flavors.mjs): \`defaultRoles\` plus each flavor's \`roles\` overrides.

To try Signal in Neovim, use \`:colorscheme living-code-signal\` or set \`flavor = "signal"\` in the [plugin setup](#neovim).
For other apps, choose the \`living-code-signal\` file in the relevant [port](#ports). Firefox currently provides Night and Paper only.

## Ports

${portTables}

Every file in \`extras/\`, \`colors/\` and \`lua/living-code/palettes/\` is generated. Install instructions are below.

## Installation

### npm packages

Install only the port you need. Each \`@living-code/<port>\` package contains that port’s themes, not the entire ecosystem.

\`\`\`sh
pnpm add @living-code/expressive-code
\`\`\`

| Port | Package |
|---|---|
${ports.map((p) => `| [${p.name}](#${p.id}) | \`@living-code/${packageId(p)}\` |`).join("\n")}

For native apps, the theme files are installed under \`node_modules/@living-code/<port>/\`; apply them using the app-specific instructions below. VS Code’s extension is in the package’s \`extension/\` directory. Neovim’s package includes its full \`lua/\` and \`colors/\` plugin directories.

${installs}

## Using the palette in something else

Any app can follow the theme: read [\`palette.json\`](palette.json) (hex, OKLCH, RGB, roles and ANSI for every flavor),
or map these semantic roles onto the app's own color slots:

| Slot | Role | Signal |
|---|---|---|
| background / foreground | \`bg\` / \`fg\` | \`${signal.r("bg")}\` / \`${signal.r("fg")}\` |
| panels, sidebars | \`bgDeep\`, \`bgAlt\` | \`${signal.r("bgDeep")}\`, \`${signal.r("bgAlt")}\` |
| accent, cursor, focus ring | \`accent\` | \`${signal.r("accent")}\` |
| selection | \`selection\` | \`${signal.r("selection")}\` |
| borders | \`border\` / \`borderActive\` | \`${signal.r("border")}\` / \`${signal.r("borderActive")}\` |
| error / warning / info / success | \`error\` … | \`${signal.r("error")}\` \`${signal.r("warning")}\` \`${signal.r("info")}\` \`${signal.r("success")}\` |

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

Scoped npm packages are built from the registered ports with \`pnpm run build:packages\`. Release instructions: [Publishing](docs/PUBLISHING.md).

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
