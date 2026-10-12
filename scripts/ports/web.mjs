// Web: CSS custom properties, Tailwind v4, JSON / JS for programmatic use.
const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const gen = "Generated from palette/flavors.mjs — do not edit by hand.";

const block = (f, sel) => `${sel} {
  color-scheme: ${f.light ? "light" : "dark"};
${Object.entries(f.colors).map(([n, c]) => `  --lc-${kebab(n)}: ${c.css}; /* ${c.hex} */`).join("\n")}

${Object.entries(f.roles).map(([role, n]) => `  --lc-${kebab(role)}: var(--lc-${kebab(n)});`).join("\n")}
}`;

export const css = {
  id: "css",
  name: "CSS variables",
  homepage: "https://developer.mozilla.org/docs/Web/CSS/color_value/oklch",
  files: () => [],
  all: (fs) => [{
    path: "extras/css/living-code.css",
    content: `/* Living Code — ${gen}
 * OKLCH values are canonical; hex in comments for reference.
 * Default is Night; switch with data-theme="living-code-<flavor>"
 * or data-theme="living-code-auto" to follow the OS (Night / Paper). */

${block(fs[0], `:root,\n[data-theme="${fs[0].slug}"]`)}

${fs.slice(1).map((f) => block(f, `[data-theme="${f.slug}"]`)).join("\n\n")}

/* data-theme="living-code-auto": Night or Paper following the OS. */
${block(fs[0], `[data-theme="living-code-auto"]`)}

@media (prefers-color-scheme: light) {
${block(fs.find((f) => f.light), `  [data-theme="living-code-auto"]`).replace(/\n/g, "\n  ")}
}
`,
  }],
  install: `\`\`\`html
<link rel="stylesheet" href="living-code.css" />
<html data-theme="living-code-night">
\`\`\`

Use palette names (\`var(--lc-teal)\`) or semantic roles (\`var(--lc-keyword)\`, \`var(--lc-bg)\`, \`var(--lc-border-active)\`).`,
};

export const tailwind = {
  id: "tailwind",
  name: "Tailwind CSS v4",
  homepage: "https://tailwindcss.com",
  files: () => [],
  all: (fs) => [{
    path: "extras/tailwind/living-code.css",
    content: `/* Living Code for Tailwind v4 — ${gen}
 * @import "tailwindcss"; @import "./living-code.css";
 * Utilities: bg-lc-base, text-lc-teal, border-lc-surface1, text-lc-keyword …
 * Flavor switches through data-theme (requires extras/css/living-code.css). */

@theme inline {
${Object.keys(fs[0].colors).map((n) => `  --color-lc-${kebab(n)}: var(--lc-${kebab(n)});`).join("\n")}
${Object.keys(fs[0].roles).map((r) => `  --color-lc-${kebab(r)}: var(--lc-${kebab(r)});`).join("\n")}
}
`,
  }],
  install: `\`\`\`css
@import "tailwindcss";
@import "living-code/extras/css/living-code.css";
@import "living-code/extras/tailwind/living-code.css";
\`\`\`

Then \`bg-lc-base text-lc-text border-lc-surface1\`, \`text-lc-keyword\`, etc.`,
};

export const json = {
  id: "json",
  name: "JSON / JavaScript",
  homepage: "https://github.com/ElliotLuque/living-code",
  files: () => [],
  all: (fs) => {
    const data = Object.fromEntries(fs.map((f) => [f.id, {
      name: f.name,
      light: f.light,
      colors: Object.fromEntries(Object.entries(f.colors).map(([n, c]) => [n, { hex: c.hex, oklch: c.css, rgb: c.rgb }])),
      roles: f.roles,
      ansi: f.ansi,
    }]));
    const body = JSON.stringify(data, null, 2);
    return [
      { path: "palette.json", content: body + "\n" },
      { path: "palette.mjs", content: `// ${gen}\nexport const palette = ${body};\nexport default palette;\n` },
    ];
  },
  install: `\`\`\`js
import { palette } from "living-code";          // palette.mjs
palette.night.colors.teal.hex;                   // "#00a692"
palette.night.roles.keyword;                     // "mint"
\`\`\`

Or read \`palette.json\` from any language.`,
};
