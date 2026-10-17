import { sh, getFile, fence, rawUrl, allFlavors, XDG_CONFIG, FLAVOR_LINE } from "./util.mjs";
import { ANSI_ORDER } from "../resolve.mjs";

const nohash = (h) => h.slice(1);

export const kitty = {
  id: "kitty",
  name: "kitty",
  homepage: "https://sw.kovidgoyal.net/kitty/",
  files: (f) => [{
    path: `extras/kitty/${f.slug}.conf`,
    content: `## name: ${f.name}
## license: MIT
## upstream: https://github.com/ElliotLuque/living-code
foreground              ${f.r("fg")}
background              ${f.r("bg")}
selection_foreground    none
selection_background    ${f.r("selection")}
cursor                  ${f.r("cursor")}
cursor_text_color       ${f.r("bg")}
url_color               ${f.r("link")}

active_border_color     ${f.r("borderActive")}
inactive_border_color   ${f.r("border")}
bell_border_color       ${f.r("warning")}
visual_bell_color       none

wayland_titlebar_color  ${f.r("bgDeep")}
macos_titlebar_color    ${f.r("bgDeep")}

tab_bar_background      ${f.r("bgDeep")}
active_tab_foreground   ${f.r("bg")}
active_tab_background   ${f.r("accent")}
inactive_tab_foreground ${f.r("fgMuted")}
inactive_tab_background ${f.c("surface0")}

mark1_foreground ${f.r("bg")}
mark1_background ${f.c("teal")}
mark2_foreground ${f.r("bg")}
mark2_background ${f.c("orchid")}
mark3_foreground ${f.r("bg")}
mark3_background ${f.c("copper")}

${ANSI_ORDER.map((n, i) => `color${String(i).padEnd(3)} ${f.ansi.normal[i]}`).join("\n")}

${ANSI_ORDER.map((n, i) => `color${String(i + 8).padEnd(3)} ${f.ansi.bright[i]}`).join("\n")}
`,
  }],
  install: `${sh(FLAVOR_LINE, getFile(`${XDG_CONFIG}/kitty/themes`, "extras/kitty/living-code-$flavor.conf"))}

Then include it from \`kitty.conf\`:

${fence("conf", "include themes/living-code-night.conf")}

\`kitten themes\` also lists it under your own themes, where you can apply it and reload every window.`,
};

export const ghostty = {
  id: "ghostty",
  name: "Ghostty",
  homepage: "https://ghostty.org",
  files: (f) => [{
    path: `extras/ghostty/${f.slug}`,
    content: `${f.ansi.normal.map((c, i) => `palette = ${i}=${c}`).join("\n")}
${f.ansi.bright.map((c, i) => `palette = ${i + 8}=${c}`).join("\n")}
background = ${f.r("bg")}
foreground = ${f.r("fg")}
cursor-color = ${f.r("cursor")}
cursor-text = ${f.r("bg")}
selection-background = ${f.r("selection")}
selection-foreground = ${f.r("fg")}
split-divider-color = ${f.r("border")}
`,
  }],
  install: `${sh(`curl -fsSL --create-dirs --output-dir "${XDG_CONFIG}/ghostty/themes" -O "${rawUrl(allFlavors("extras/ghostty/living-code-*"))}"`)}

Then name one in the Ghostty config, or a light and a dark one:

${fence("conf", "theme = dark:living-code-night,light:living-code-paper")}`,
};

export const alacritty = {
  id: "alacritty",
  name: "Alacritty",
  homepage: "https://alacritty.org",
  files: (f) => {
    const block = (arr) => ANSI_ORDER.map((n, i) => `${n} = "${arr[i]}"`).join("\n");
    return [{
      path: `extras/alacritty/${f.slug}.toml`,
      content: `[colors.primary]
background = "${f.r("bg")}"
foreground = "${f.r("fg")}"
dim_foreground = "${f.r("fgMuted")}"
bright_foreground = "${f.r("fg")}"

[colors.cursor]
text = "${f.r("bg")}"
cursor = "${f.r("cursor")}"

[colors.vi_mode_cursor]
text = "${f.r("bg")}"
cursor = "${f.c("amber")}"

[colors.selection]
text = "CellForeground"
background = "${f.r("selection")}"

[colors.search.matches]
foreground = "${f.r("bg")}"
background = "${f.r("fgSubtle")}"

[colors.search.focused_match]
foreground = "${f.r("bg")}"
background = "${f.r("match")}"

[colors.footer_bar]
foreground = "${f.r("fg")}"
background = "${f.c("surface0")}"

[colors.hints.start]
foreground = "${f.r("bg")}"
background = "${f.r("accent")}"

[colors.hints.end]
foreground = "${f.r("bg")}"
background = "${f.r("fgMuted")}"

[colors.normal]
${block(f.ansi.normal)}

[colors.bright]
${block(f.ansi.bright)}
`,
    }];
  },
  install: `${sh(FLAVOR_LINE, getFile(`${XDG_CONFIG}/alacritty/themes`, "extras/alacritty/living-code-$flavor.toml"))}

Then import it in \`alacritty.toml\`:

${fence("toml", `[general]\nimport = ["~/.config/alacritty/themes/living-code-night.toml"]`)}

On Windows the folder is \`%APPDATA%\\alacritty\\themes\`.`,
};

export const wezterm = {
  id: "wezterm",
  name: "WezTerm",
  homepage: "https://wezterm.org",
  files: (f) => [{
    path: `extras/wezterm/${f.slug}.toml`,
    content: `[colors]
foreground = "${f.r("fg")}"
background = "${f.r("bg")}"
cursor_bg = "${f.r("cursor")}"
cursor_border = "${f.r("cursor")}"
cursor_fg = "${f.r("bg")}"
selection_bg = "${f.r("selection")}"
selection_fg = "${f.r("fg")}"
split = "${f.r("border")}"
scrollbar_thumb = "${f.c("surface1")}"
compose_cursor = "${f.c("amber")}"
ansi = [${f.ansi.normal.map((c) => `"${c}"`).join(", ")}]
brights = [${f.ansi.bright.map((c) => `"${c}"`).join(", ")}]

[colors.tab_bar]
background = "${f.r("bgDeep")}"
inactive_tab_edge = "${f.r("border")}"

[colors.tab_bar.active_tab]
bg_color = "${f.r("accent")}"
fg_color = "${f.r("bg")}"

[colors.tab_bar.inactive_tab]
bg_color = "${f.c("surface0")}"
fg_color = "${f.r("fgMuted")}"

[colors.tab_bar.inactive_tab_hover]
bg_color = "${f.c("surface1")}"
fg_color = "${f.r("fg")}"

[colors.tab_bar.new_tab]
bg_color = "${f.r("bgDeep")}"
fg_color = "${f.r("fgMuted")}"

[colors.tab_bar.new_tab_hover]
bg_color = "${f.c("surface0")}"
fg_color = "${f.r("fg")}"

[metadata]
name = "${f.name}"
origin_url = "https://github.com/ElliotLuque/living-code"
`,
  }],
  install: `${sh(`curl -fsSL --create-dirs --output-dir "${XDG_CONFIG}/wezterm/colors" -O "${rawUrl(allFlavors("extras/wezterm/living-code-*.toml"))}"`)}

Then select the scheme in \`wezterm.lua\`:

${fence("lua", `config.color_scheme = "Living Code Night"`)}`,
};

export const foot = {
  id: "foot",
  name: "foot",
  homepage: "https://codeberg.org/dnkl/foot",
  files: (f) => [{
    path: `extras/foot/${f.slug}.ini`,
    content: `[cursor]
color=${nohash(f.r("bg"))} ${nohash(f.r("cursor"))}

[colors]
foreground=${nohash(f.r("fg"))}
background=${nohash(f.r("bg"))}
${f.ansi.normal.map((c, i) => `regular${i}=${nohash(c)}`).join("\n")}
${f.ansi.bright.map((c, i) => `bright${i}=${nohash(c)}`).join("\n")}
selection-foreground=${nohash(f.r("fg"))}
selection-background=${nohash(f.r("selection"))}
search-box-no-match=${nohash(f.r("bg"))} ${nohash(f.r("error"))}
search-box-match=${nohash(f.r("fg"))} ${nohash(f.c("surface0"))}
jump-labels=${nohash(f.r("bg"))} ${nohash(f.r("accent"))}
urls=${nohash(f.r("link"))}
`,
  }],
  install: `${sh(FLAVOR_LINE, getFile(`${XDG_CONFIG}/foot`, "extras/foot/living-code-$flavor.ini"))}

Then include it at the top of \`foot.ini\`:

${fence("ini", `[main]\ninclude=~/.config/foot/living-code-night.ini`)}`,
};
