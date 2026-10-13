import { hex } from "../color.mjs";

export const BASE16 = {
  base00: "base", base01: "surface0", base02: "surface2", base03: "comment",
  base04: "subtext", base05: "text",
  base08: "flare", base09: "copper", base0A: "amber", base0B: "moss",
  base0C: "teal", base0D: "steel", base0E: "orchid", base0F: "rose",
};

export function base16(f) {
  const [L, C, h] = f.raw.text;
  const step = f.light ? -1 : 1;
  const out = Object.fromEntries(Object.entries(BASE16).map(([k, n]) => [k, f.c(n)]));
  Object.assign(out, {
    base08: f.ansi16("red"), base0A: f.ansi16("yellow"), base0B: f.ansi16("green"),
    base0C: f.ansi16("cyan"), base0D: f.ansi16("blue"), base0E: f.ansi16("magenta"),
  });
  out.base06 = hex([L + step * 0.03, C * 0.7, h]);
  out.base07 = hex([L + step * 0.055, C * 0.4, h]);
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
}

export const base16Port = {
  id: "base16",
  name: "base16 · Stylix · tinted-theming",
  homepage: "https://github.com/tinted-theming/home",
  files: (f) => {
    const s = base16(f);
    return [{
      path: `extras/base16/${f.slug}.yaml`,
      content: `system: "base16"
name: "${f.name}"
slug: "${f.slug}"
author: "Elliot Luque (https://github.com/ElliotLuque/living-code)"
variant: "${f.light ? "light" : "dark"}"
palette:
${Object.entries(s).map(([k, v]) => `  ${k}: "${v}"`).join("\n")}
`,
    }];
  },
  install: `**Stylix (NixOS / home-manager)**

\`\`\`nix
inputs.living-code = { url = "github:ElliotLuque/living-code"; flake = false; };

stylix.base16Scheme = "\${inputs.living-code}/extras/base16/living-code-night.yaml";
stylix.polarity = "dark";
\`\`\`

base16 has 16 slots shared between ANSI and syntax, so Stylix-generated themes get Living Code *colors* with base16 *roles*
(teal accents, but strings green and keywords purple). For apps where the native port exists, disable the Stylix target and
use the port for exact Living Code syntax. For example, \`stylix.targets.kitty.enable = false\` + \`programs.kitty.extraConfig = "include \${inputs.living-code}/extras/kitty/living-code-night.conf"\`, and the same for \`neovim\`, \`vscode\`, \`bat\`, \`helix\`, \`zed\`.

Also works with **tinted-theming** tools (\`tinty\`, \`flavours\`, base16-shell): copy the YAML into their schemes directory.`,
};
