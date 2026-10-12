#!/usr/bin/env node
// Generates every port, palette.json, swatches and the README from
// palette/flavors.mjs.   node scripts/build.mjs [--check]
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contrast } from "./color.mjs";
import { ACCENT_ORDER, NEUTRAL_ORDER, resolveAll } from "./resolve.mjs";
import { generate, groups } from "./ports/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const flavors = resolveAll();

// ── Contrast audit: every text role must reach WCAG AA (4.5:1) on bg ────────
const TEXT_ROLES = ["fg", "fgAlt", "fgMuted", "fgSubtle", "keyword", "function", "string", "number", "constant", "type", "decorator", "tag", "property", "parameter", "comment", "operator", "error", "warning", "info", "hint", "success", "link", "heading", "lineNumberActive"];
const audit = [];
for (const f of flavors) {
  for (const role of TEXT_ROLES) {
    const ratio = contrast(f.rr(role), f.raw.base);
    if (ratio < 4.5) audit.push(`${f.id}.${role} (${f.roles[role]}) ${ratio.toFixed(2)}:1`);
  }
}

// ── README ───────────────────────────────────────────────────────────────────
const USES = {
  crust: "sidebars, tab bars, status lines", base: "background", mantle: "floats, cards, popups",
  surface0: "line highlight, inactive tabs", surface1: "borders, ANSI black", surface2: "selection",
  overlay: "line numbers, punctuation", comment: "comments, operators", subtext: "muted text, ANSI white",
  text2: "properties, parameters", text: "foreground",
  teal: "accent · cursor · focus · ANSI cyan", mint: "keywords", aqua: "functions", steel: "types · info · ANSI blue",
  amber: "strings · warnings", copper: "numbers · constants", flare: "errors only", moss: "success · diff add",
  orchid: "decorators · tags · ANSI magenta", rose: "rare accents",
};
const sw = (hex) => `<img src="assets/swatches/${hex.slice(1)}.svg" width="18" height="18" alt="${hex}">`;
const table = (f, names) => [
  "| | Name | Hex | OKLCH | Used for |",
  "|:-:|---|---|---|---|",
  ...names.map((n) => `| ${sw(f.c(n))} | \`${n}\` | \`${f.c(n)}\` | \`${f.colors[n].css}\` | ${USES[n]} |`),
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

const portTables = groups.map((g) => `**${g.title}** — ${g.ports.map((p) => `[${p.name}](#${p.id})`).join(" · ")}`).join("\n\n");
const installs = groups.map((g) => `### ${g.title}\n\n${g.ports.map((p) => `<a id="${p.id}"></a>\n#### [${p.name}](${p.homepage})\n\n${p.install}\n`).join("\n")}`).join("\n");

const readme = `<h1 align="center">Living Code</h1>

<p align="center"><b>Two temperatures, not a rainbow.</b><br>
A color scheme for editors, terminals and the web — teal structure, amber data, on dark slate.</p>

<p align="center">
${flavors.map((f) => `<img src="assets/preview-${f.id}.png" width="49%" alt="${f.name}">`).join("\n")}
</p>

## Philosophy

Most themes spread hues evenly around the color wheel and give each syntax role its own color.
Living Code clusters them instead:

- **Cool = structure.** Keywords, functions and types live in one family around the brand teal
  (${sw(flavors[0].c("mint"))} mint → ${sw(flavors[0].c("aqua"))} aqua → ${sw(flavors[0].c("steel"))} steel).
- **Warm = data.** Strings and numbers are ${sw(flavors[0].c("amber"))} amber and ${sw(flavors[0].c("copper"))} copper.
- **Red means wrong.** ${sw(flavors[0].c("flare"))} flare is reserved for errors and deletions.
- **Punctuation recedes** into the slate ramp, so the shape of the code reads first.
- **OKLCH is canonical.** Every value is defined in OKLCH and checked for WCAG AA (≥ 4.5:1) on its background; hex is derived.

## Flavors

${flavors.map((f) => `### ${f.name}

${f.description}

<details${f.id === "night" ? " open" : ""}>
<summary>Palette</summary>

**Neutrals**

${table(f, NEUTRAL_ORDER)}

**Accents**

${table(f, ACCENT_ORDER)}

**ANSI**

${ansiTable(f)}

</details>
`).join("\n")}

### Syntax roles

${roleTable}

Full role map (UI, diagnostics, markup) in [\`palette/flavors.mjs\`](palette/flavors.mjs) → \`defaultRoles\`.

## Ports

${portTables}

Every file in \`extras/\`, \`colors/\` and \`lua/living-code/palettes/\` is generated — install instructions below.

## Installation

${installs}

## Using the palette in something else

Any app can follow the theme: read [\`palette.json\`](palette.json) (hex, OKLCH, RGB, roles and ANSI for every flavor),
or map these semantic roles onto the app's own color slots:

| Slot | Role | Night |
|---|---|---|
| background / foreground | \`bg\` / \`fg\` | \`${flavors[0].r("bg")}\` / \`${flavors[0].r("fg")}\` |
| panels, sidebars | \`bgDeep\`, \`bgAlt\` | \`${flavors[0].r("bgDeep")}\`, \`${flavors[0].r("bgAlt")}\` |
| accent, cursor, focus ring | \`accent\` | \`${flavors[0].r("accent")}\` |
| selection | \`selection\` | \`${flavors[0].r("selection")}\` |
| borders | \`border\` / \`borderActive\` | \`${flavors[0].r("border")}\` / \`${flavors[0].r("borderActive")}\` |
| error / warning / info / success | \`error\` … | \`${flavors[0].r("error")}\` \`${flavors[0].r("warning")}\` \`${flavors[0].r("info")}\` \`${flavors[0].r("success")}\` |

## Contributing a port

1. Add a generator to \`scripts/ports/\` — a pure function from a resolved flavor to files.
2. Register it in \`scripts/ports/index.mjs\`.
3. \`node scripts/build.mjs\` regenerates everything, including this README.

Live preview with sliders and every port's output: \`node scripts/serve.mjs\` → <http://localhost:4173/preview/>.

To change a color, edit [\`palette/flavors.mjs\`](palette/flavors.mjs) and rebuild — never edit generated files.

## License

[MIT](LICENSE) © Elliot Luque
`;

// ── Assets ───────────────────────────────────────────────────────────────────
const swatches = new Set(flavors.flatMap((f) => [...Object.values(f.colors).map((c) => c.hex), ...f.ansi.normal, ...f.ansi.bright]));
const files = [
  ...generate(flavors),
  { path: "README.md", content: readme },
  ...[...swatches].map((h) => ({
    path: `assets/swatches/${h.slice(1)}.svg`,
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><rect width="18" height="18" rx="3" fill="${h}"/><rect x=".5" y=".5" width="17" height="17" rx="2.5" fill="none" stroke="#888" stroke-opacity=".35"/></svg>\n`,
  })),
];

// ── Write / check ────────────────────────────────────────────────────────────
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
  console.error(`\n${stale} generated files out of date — run node scripts/build.mjs`);
  process.exitCode = 1;
}
