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

// The "Install in 30 seconds" table in the README: one entry per port id. A test requires an entry for every port.
export const QUICK = {
  neovim: "Plugin manager, see below",
  vscode: "Marketplace: `code --install-extension elliotluque.living-code`",
  jetbrains: "Marketplace: *Settings | Plugins*, search **Living Code**",
  zed: "Extensions panel: search **Living Code**",
  helix: "One line, see below",
  sublime: "One line, see below (Package Control pending a dedicated repo)",
  tmtheme: "One line, see below",
  kitty: "One line, see below",
  ghostty: "One line, see below",
  alacritty: "One line, see below",
  wezterm: "One line, see below",
  foot: "One line, see below",
  "windows-terminal": "One PowerShell line, see below",
  iterm2: "One line, see below",
  warp: "One line, see below",
  konsole: "One line, see below",
  tmux: "One line, see below",
  fzf: "One line, see below",
  starship: "One command block, see below",
  btop: "One line, see below",
  lazygit: "One command block, see below",
  delta: "One command block, see below",
  hunk: "One line, see below",
  fish: "One line, see below",
  zellij: "One line, see below",
  yazi: "One line, see below",
  k9s: "One line, see below",
  eza: "One line, see below",
  firefox: "Firefox Add-ons: click **Install Theme**",
  chrome: "Release zip today (Chrome Web Store pending), see below",
  obsidian: "Community themes: search **Living Code**",
  slack: "Paste one theme string, see below",
  "expressive-code": "`npm i @living-code/expressive-code`",
  css: "`npm i @living-code/css`",
  tailwind: "`npm i @living-code/tailwind`",
  json: "`npm i @living-code/palette`",
  base16: "Nix flake input, see below",
};

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
