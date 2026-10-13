// base16 scheme for Stylix, tinted-theming / flavours, base16-shell, etc.
//
// base16 is lossy: 16 slots, and every consumer uses base08–base0E BOTH as the
// ANSI colors AND as syntax colors. We map by hue (base0B = green, base0C =
// cyan…) so terminals stay correct; syntax in base16-generated themes will
// follow base16 conventions (strings green, keywords purple), not Living Code
// roles. For exact Living Code syntax use the native ports for those apps.
import { hex } from "../color.mjs";

export const BASE16 = {
  base00: "base", base01: "surface0", base02: "surface2", base03: "comment",
  base04: "subtext", base05: "text", /* base06, base07 derived */
  base08: "flare", base09: "copper", base0A: "amber", base0B: "moss",
  base0C: "teal", base0D: "steel", base0E: "orchid", base0F: "rose",
};

export function base16(f) {
  const [L, C, h] = f.raw.text;
  const step = f.light ? -1 : 1;
  const out = Object.fromEntries(Object.entries(BASE16).map(([k, n]) => [k, f.c(n)]));
  // hue slots = the flavor's ANSI colors, so Stylix terminals match the native ports
  Object.assign(out, {
    base08: f.ansi16("red"), base0A: f.ansi16("yellow"), base0B: f.ansi16("green"),
    base0C: f.ansi16("cyan"), base0D: f.ansi16("blue"), base0E: f.ansi16("magenta"),
  });
  // light foregrounds beyond `text`, on the same slate hue
  out.base06 = hex([L + step * 0.03, C * 0.7, h]);
  out.base07 = hex([L + step * 0.055, C * 0.4, h]);
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
}

const gen = "Generated from palette/flavors.mjs — do not edit by hand.";

export const base16Port = {
  id: "base16",
  name: "base16 · Stylix · tinted-theming",
  homepage: "https://github.com/tinted-theming/home",
  files: (f) => {
    const s = base16(f);
    return [{
      path: `extras/base16/${f.slug}.yaml`,
      content: `# ${gen}
# Hue-faithful mapping: base08 red · 09 orange · 0A yellow · 0B green · 0C cyan (teal) · 0D blue · 0E magenta
system: "base16"
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
# flake.nix
inputs.living-code = { url = "github:ElliotLuque/living-code"; flake = false; };

# configuration
stylix.base16Scheme = "\${inputs.living-code}/extras/base16/living-code-night.yaml";
stylix.polarity = "dark";   # "light" with living-code-paper
\`\`\`

base16 has 16 slots shared between ANSI and syntax, so Stylix-generated themes get Living Code *colors* with base16 *roles*
(teal accents, but strings green and keywords purple). For apps where the native port exists, disable the Stylix target and
use the port for exact Living Code syntax — e.g. \`stylix.targets.kitty.enable = false\` + \`programs.kitty.extraConfig = "include \${inputs.living-code}/extras/kitty/living-code-night.conf"\`, and the same for \`neovim\`, \`vscode\`, \`bat\`, \`helix\`, \`zed\`.

Also works with **tinted-theming** tools (\`tinty\`, \`flavours\`, base16-shell) — copy the YAML into their schemes directory.`,
};
