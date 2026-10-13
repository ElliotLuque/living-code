import { alacritty, foot, ghostty, kitty, wezterm } from "./terminals.mjs";
import { btop, fzf, lazygit, starship, tmux } from "./cli.mjs";
import { helix, neovim, tmtheme, vscode, zed } from "./editors.mjs";
import { css, json, tailwind } from "./web.mjs";
import { base16Port } from "./base16.mjs";

export const groups = [
  { title: "Editors", ports: [neovim, vscode, zed, helix, tmtheme] },
  { title: "Terminals", ports: [kitty, ghostty, alacritty, wezterm, foot] },
  { title: "CLI & TUI", ports: [tmux, fzf, starship, btop, lazygit] },
  { title: "Web & code", ports: [css, tailwind, json] },
  { title: "Theme systems", ports: [base16Port] },
];

export const ports = groups.flatMap((g) => g.ports);

/** All generated files for a set of resolved flavors. */
export function generate(flavors) {
  const files = [];
  for (const p of ports) {
    for (const f of flavors) files.push(...p.files(f));
    if (p.all) files.push(...p.all(flavors));
  }
  return files;
}
