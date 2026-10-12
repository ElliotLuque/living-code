// CLI / TUI tools.
const header = (f, c = "#") => `${c} ${f.name}\n${c} Generated from palette/flavors.mjs — do not edit by hand.\n`;

export const tmux = {
  id: "tmux",
  name: "tmux",
  homepage: "https://github.com/tmux/tmux",
  files: (f) => [{
    path: `extras/tmux/${f.slug}.conf`,
    content: `${header(f)}
set -g status-style "bg=${f.r("bgDeep")},fg=${f.r("fgMuted")}"
set -g status-left-length 40
set -g status-left "#[bg=${f.r("accent")},fg=${f.r("bg")},bold] #S #[default] "
set -g status-right "#[fg=${f.r("fgSubtle")}]%H:%M #[bg=${f.c("surface0")},fg=${f.r("fg")}] #h "
set -g window-status-format "#[fg=${f.r("fgMuted")}] #I #W "
set -g window-status-current-format "#[bg=${f.c("surface0")},fg=${f.r("accent")},bold] #I #W "
set -g window-status-separator ""
set -g pane-border-style "fg=${f.r("border")}"
set -g pane-active-border-style "fg=${f.r("borderActive")}"
set -g message-style "bg=${f.c("surface0")},fg=${f.r("fg")}"
set -g message-command-style "bg=${f.c("surface0")},fg=${f.r("accent")}"
set -g mode-style "bg=${f.r("selection")},fg=${f.r("fg")}"
set -g display-panes-active-colour "${f.r("accent")}"
set -g display-panes-colour "${f.r("fgMuted")}"
set -g clock-mode-colour "${f.r("accent")}"
setw -g window-status-bell-style "fg=${f.r("warning")},bold"
`,
  }],
  install: `\`\`\`tmux
# ~/.config/tmux/tmux.conf
source-file ~/.config/tmux/living-code-night.conf
\`\`\``,
};

export const fzf = {
  id: "fzf",
  name: "fzf",
  homepage: "https://github.com/junegunn/fzf",
  files: (f) => {
    const opts = [
      `fg:${f.r("fgAlt")}`, `bg:${f.r("bg")}`, `hl:${f.r("accent")}`,
      `fg+:${f.r("fg")}`, `bg+:${f.c("surface0")}`, `hl+:${f.c("mint")}`,
      `info:${f.r("fgSubtle")}`, `prompt:${f.r("accent")}`, `pointer:${f.r("accent")}`,
      `marker:${f.c("amber")}`, `spinner:${f.r("accent")}`, `header:${f.c("steel")}`,
      `border:${f.r("border")}`, `label:${f.r("fgMuted")}`, `query:${f.r("fg")}`,
      `gutter:${f.r("bg")}`, `selected-bg:${f.r("selection")}`, `separator:${f.r("border")}`,
      `scrollbar:${f.c("surface2")}`,
    ].join(",");
    return [
      { path: `extras/fzf/${f.slug}.sh`, content: `${header(f)}\nexport FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS --color=${opts}"\n` },
      { path: `extras/fzf/${f.slug}.fish`, content: `${header(f)}\nset -gx FZF_DEFAULT_OPTS "$FZF_DEFAULT_OPTS --color=${opts}"\n` },
    ];
  },
  install: `Source the file for your shell from \`~/.bashrc\` / \`~/.zshrc\` (\`.sh\`) or \`config.fish\` (\`.fish\`).`,
};

export const starship = {
  id: "starship",
  name: "Starship",
  homepage: "https://starship.rs",
  files: (f) => {
    const key = f.slug.replace(/-/g, "_");
    const names = Object.keys(f.colors);
    return [{
      path: `extras/starship/${f.slug}.toml`,
      content: `${header(f)}
# Append to ~/.config/starship.toml, then reference colors by name
# (e.g. style = "bold teal").
palette = "${key}"

[palettes.${key}]
${names.map((n) => `${n.padEnd(9)}= "${f.c(n)}"`).join("\n")}
`,
    }];
  },
  install: `Append the palette to \`~/.config/starship.toml\`. Module styles can then use names like \`"bold teal"\` or \`"amber"\`.`,
};

export const btop = {
  id: "btop",
  name: "btop",
  homepage: "https://github.com/aristocratos/btop",
  files: (f) => {
    const t = {
      main_bg: f.r("bg"), main_fg: f.r("fg"), title: f.r("fg"), hi_fg: f.r("accent"),
      selected_bg: f.c("surface1"), selected_fg: f.r("fg"), inactive_fg: f.r("lineNumber"),
      graph_text: f.r("fgMuted"), meter_bg: f.c("surface1"), proc_misc: f.c("mint"),
      cpu_box: f.r("accent"), mem_box: f.c("orchid"), net_box: f.c("steel"), proc_box: f.c("amber"),
      div_line: f.r("border"),
      temp_start: f.c("moss"), temp_mid: f.c("amber"), temp_end: f.c("flare"),
      cpu_start: f.c("teal"), cpu_mid: f.c("amber"), cpu_end: f.c("flare"),
      free_start: f.c("moss"), free_mid: f.c("moss"), free_end: f.c("mint"),
      cached_start: f.c("steel"), cached_mid: f.c("steel"), cached_end: f.c("aqua"),
      available_start: f.c("amber"), available_mid: f.c("amber"), available_end: f.c("copper"),
      used_start: f.c("orchid"), used_mid: f.c("orchid"), used_end: f.c("flare"),
      download_start: f.c("teal"), download_mid: f.c("mint"), download_end: f.c("aqua"),
      upload_start: f.c("copper"), upload_mid: f.c("amber"), upload_end: f.c("flare"),
      process_start: f.c("teal"), process_mid: f.c("amber"), process_end: f.c("flare"),
    };
    return [{
      path: `extras/btop/${f.slug}.theme`,
      content: `${header(f)}\n${Object.entries(t).map(([k, v]) => `theme[${k}]="${v}"`).join("\n")}\n`,
    }];
  },
  install: `Copy to \`~/.config/btop/themes/\` and pick it under *Options → Color theme*.`,
};

export const lazygit = {
  id: "lazygit",
  name: "lazygit",
  homepage: "https://github.com/jesseduffield/lazygit",
  files: (f) => [{
    path: `extras/lazygit/${f.slug}.yml`,
    content: `${header(f)}
gui:
  theme:
    activeBorderColor:
      - "${f.r("borderActive")}"
      - bold
    inactiveBorderColor:
      - "${f.r("border")}"
    searchingActiveBorderColor:
      - "${f.r("match")}"
      - bold
    optionsTextColor:
      - "${f.c("steel")}"
    selectedLineBgColor:
      - "${f.c("surface0")}"
    inactiveViewSelectedLineBgColor:
      - "${f.r("bgAlt")}"
    cherryPickedCommitFgColor:
      - "${f.r("bg")}"
    cherryPickedCommitBgColor:
      - "${f.c("orchid")}"
    markedBaseCommitFgColor:
      - "${f.r("bg")}"
    markedBaseCommitBgColor:
      - "${f.c("amber")}"
    unstagedChangesColor:
      - "${f.r("removed")}"
    defaultFgColor:
      - "${f.r("fg")}"
    authorColors:
      "*": "${f.c("aqua")}"
`,
  }],
  install: `Merge the file into \`~/.config/lazygit/config.yml\`, or point \`LG_CONFIG_FILE\` at it alongside your config.`,
};
