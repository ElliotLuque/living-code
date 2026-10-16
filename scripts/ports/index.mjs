import { alacritty, foot, ghostty, kitty, wezterm } from "./terminals.mjs";
import { btop, fzf, lazygit, starship, tmux } from "./cli.mjs";
import { helix, neovim, tmtheme, vscode, zed } from "./editors.mjs";
import { firefox } from "./browsers.mjs";
import { css, json, tailwind } from "./web.mjs";
import { expressiveCode } from "./expressive-code.mjs";
import { base16Port } from "./base16.mjs";
import { delta, hunk } from "./git.mjs";
import { jetbrains } from "./jetbrains.mjs";
import { icons } from "./icons.mjs";

export const groups = [
  { title: "Editors", ports: [neovim, vscode, zed, helix, tmtheme, jetbrains] },
  { title: "Terminals", ports: [kitty, ghostty, alacritty, wezterm, foot] },
  { title: "CLI & TUI", ports: [tmux, fzf, starship, btop, lazygit, delta, hunk] },
  { title: "Browsers", ports: [firefox] },
  { title: "Web & code", ports: [expressiveCode, css, tailwind, json] },
  { title: "Theme systems", ports: [base16Port] },
];

export const ports = groups.flatMap((g) => g.ports);

export function generate(flavors) {
  const files = [];
  for (const p of ports) {
    for (const f of flavors) files.push(...p.files(f));
    if (p.all) files.push(...p.all(flavors));
  }
  for (const f of flavors) files.push(...icons.files(f));
  return files;
}
