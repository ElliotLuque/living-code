import { alacritty, foot, ghostty, kitty, wezterm } from "./terminals.mjs";
import { iterm2, konsole, warp, windowsTerminal } from "./terminals-extra.mjs";
import { eza, fish, k9s, yazi, zellij } from "./cli-extra.mjs";
import { btop, fzf, lazygit, starship, tmux } from "./cli.mjs";
import { helix, neovim, tmtheme, vscode, zed } from "./editors.mjs";
import { sublime } from "./sublime.mjs";
import { chrome, firefox } from "./browsers.mjs";
import { css, json, tailwind } from "./web.mjs";
import { expressiveCode } from "./expressive-code.mjs";
import { base16Port } from "./base16.mjs";
import { delta, hunk } from "./git.mjs";
import { slack } from "./slack.mjs";
import { obsidian } from "./obsidian.mjs";
import { jetbrains } from "./jetbrains.mjs";
import { icons } from "./icons.mjs";

export const groups = [
  { title: "Editors", ports: [neovim, vscode, jetbrains, zed, helix, sublime, tmtheme] },
  { title: "Terminals", ports: [kitty, ghostty, alacritty, wezterm, foot, windowsTerminal, iterm2, warp, konsole] },
  { title: "CLI & TUI", ports: [tmux, fzf, starship, btop, lazygit, delta, hunk, fish, zellij, yazi, k9s, eza] },
  { title: "Browsers", ports: [firefox, chrome] },
  { title: "Apps", ports: [obsidian, slack] },
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
