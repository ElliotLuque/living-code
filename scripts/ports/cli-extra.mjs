import { rgbSpace, allFlavors, fence, rawUrl } from "./util.mjs";
import { license } from "./meta.mjs";
import { tmtheme } from "./editors.mjs";

const bare = (hex) => hex.slice(1);

export function fishTheme(f) {
  const vars = [
    ["fish_color_normal", f.r("fg")], ["fish_color_command", f.r("function")], ["fish_color_keyword", f.r("keyword")],
    ["fish_color_quote", f.r("string")], ["fish_color_redirection", f.r("operator")], ["fish_color_end", f.r("punctuation")],
    ["fish_color_error", f.r("error")], ["fish_color_param", f.r("parameter")], ["fish_color_option", f.r("type")],
    ["fish_color_comment", f.r("comment")], ["fish_color_selection", `${f.r("fg")} --background=${bare(f.r("selection"))}`],
    ["fish_color_operator", f.r("accent")], ["fish_color_escape", f.r("escape")], ["fish_color_autosuggestion", f.r("fgSubtle")],
    ["fish_color_cwd", f.r("type")], ["fish_color_cwd_root", f.r("error")], ["fish_color_user", f.r("success")],
    ["fish_color_host", f.r("info")], ["fish_color_host_remote", f.r("warning")], ["fish_color_status", f.r("error")],
    ["fish_color_valid_path", `${f.r("fg")} --underline`], ["fish_color_history_current", `${f.r("fg")} --bold`],
    ["fish_color_search_match", `${f.r("fg")} --background=${bare(f.c("surface1"))}`], ["fish_color_cancel", f.r("fgSubtle")],
    ["fish_pager_color_progress", f.r("fgSubtle")], ["fish_pager_color_background", ""],
    ["fish_pager_color_prefix", `${f.r("accent")} --bold --underline`], ["fish_pager_color_completion", f.r("fg")],
    ["fish_pager_color_description", f.r("fgMuted")], ["fish_pager_color_selected_background", `--background=${bare(f.r("selection"))}`],
    ["fish_pager_color_selected_prefix", `${f.r("accent")} --bold --underline`], ["fish_pager_color_selected_completion", f.r("fg")],
    ["fish_pager_color_selected_description", f.r("fgAlt")], ["fish_pager_color_secondary_background", ""],
    ["fish_pager_color_secondary_prefix", f.r("accent")], ["fish_pager_color_secondary_completion", f.r("fgAlt")],
    ["fish_pager_color_secondary_description", f.r("fgMuted")],
  ];
  const line = ([k, v]) => `${k} ${v.replace(/#/g, "")}`.trimEnd();
  return `# name: '${f.name}'
# preferred_background: ${bare(f.r("bg"))}
# url: https://github.com/ElliotLuque/living-code

${vars.map(line).join("\n")}
`;
}

export const fish = {
  id: "fish",
  name: "fish",
  homepage: "https://fishshell.com",
  files: (f) => [{ path: `extras/fish/${f.slug}.theme`, content: fishTheme(f) }],
  install: `Needs fish 3.4 or newer. Download the themes, then choose one:

${fence("fish", `curl -fsSL --create-dirs --output-dir ~/.config/fish/themes -O "${rawUrl(allFlavors("extras/fish/living-code-*.theme"))}"
fish_config theme save living-code-night`)}

\`fish_config theme choose living-code-night\` previews it for the current session only; \`save\` makes it permanent. \`fish_config theme\` lists the other flavors.`,
};

export function zellijTheme(f) {
  const c = (hex) => rgbSpace(hex);
  const comp = (name, base, bg, e) => `        ${name} {
            base ${c(base)}
            background ${c(bg)}
            emphasis_0 ${c(e[0])}
            emphasis_1 ${c(e[1])}
            emphasis_2 ${c(e[2])}
            emphasis_3 ${c(e[3])}
        }`;
  const hi = [f.r("warning"), f.r("accent"), f.r("success"), f.c("orchid")];
  const players = [f.r("accent"), f.c("orchid"), f.r("warning"), f.r("info"), f.r("error"), f.r("success"), f.c("copper"), f.c("rose"), f.c("aqua"), f.r("fgMuted")];
  return `// ${f.name}: https://github.com/ElliotLuque/living-code
themes {
    ${f.slug} {
${[
  comp("text_unselected", f.r("fg"), f.r("bg"), hi),
  comp("text_selected", f.r("fg"), f.r("selection"), hi),
  comp("ribbon_selected", f.r("bg"), f.r("accent"), [f.r("error"), f.r("warning"), f.c("orchid"), f.r("info")]),
  comp("ribbon_unselected", f.r("fg"), f.c("surface1"), [f.r("error"), f.r("fg"), f.r("info"), f.c("orchid")]),
  comp("table_title", f.r("accent"), f.r("bg"), hi),
  comp("table_cell_selected", f.r("fg"), f.r("selection"), hi),
  comp("table_cell_unselected", f.r("fg"), f.r("bg"), hi),
  comp("list_selected", f.r("fg"), f.r("selection"), hi),
  comp("list_unselected", f.r("fg"), f.r("bg"), hi),
  comp("frame_selected", f.r("borderActive"), f.r("bg"), [f.c("orchid"), f.r("info"), f.r("warning"), f.r("success")]),
  comp("frame_unselected", f.r("border"), f.r("bg"), [f.c("orchid"), f.r("info"), f.r("warning"), f.r("success")]),
  comp("frame_highlight", f.r("warning"), f.r("bg"), [f.c("orchid"), f.r("warning"), f.r("warning"), f.r("warning")]),
  comp("exit_code_success", f.r("success"), f.r("bg"), [f.r("accent"), f.c("orchid"), f.r("info"), f.r("fgMuted")]),
  comp("exit_code_error", f.r("error"), f.r("bg"), [f.r("warning"), f.r("warning"), f.r("warning"), f.r("warning")]),
].join("\n")}
        multiplayer_user_colors {
${players.map((p, i) => `            player_${i + 1} ${c(p)}`).join("\n")}
        }
    }
}
`;
}

export const zellij = {
  id: "zellij",
  name: "zellij",
  homepage: "https://zellij.dev",
  files: (f) => [{ path: `extras/zellij/${f.slug}.kdl`, content: zellijTheme(f) }],
  install: `These use zellij's component-based [theme format](https://zellij.dev/documentation/themes.html), so they need a zellij release that supports it. Download the themes into the \`themes\` folder of your config directory, then name one in \`config.kdl\`:

${fence("sh", `curl -fsSL --create-dirs --output-dir ~/.config/zellij/themes -O "${rawUrl(allFlavors("extras/zellij/living-code-*.kdl"))}"`)}

${fence("kdl", `theme "living-code-night"`)}

\`zellij setup --check\` prints the exact config directory if yours is elsewhere.`,
};

const style = (fg, extra = {}) => {
  const parts = [`fg = "${fg}"`, ...Object.entries(extra).map(([k, v]) => (typeof v === "boolean" ? `${k} = ${v}` : `${k} = "${v}"`))];
  return `{ ${parts.join(", ")} }`;
};

export function yaziFlavor(f) {
  const s = (fg, bg, bold) => style(fg, { ...(bg ? { bg } : {}), ...(bold ? { bold: true } : {}) });
  const accent = f.r("accent"), bg = f.r("bg"), fg = f.r("fg"), sel = f.r("selection"), surf = f.c("surface0");
  return `# ${f.name}: https://github.com/ElliotLuque/living-code
# Syntax highlighting in the preview pane comes from tmtheme.xml next to this file.

[mgr]
cwd = ${s(accent)}
hovered = { reversed = false, bg = "${sel}" }
preview_hovered = { bg = "${surf}" }
find_keyword = ${s(f.r("match"), null, true)}
find_position = ${s(f.c("orchid"), null, true)}
symlink_target = ${s(f.r("link"))}
marker_copied = { fg = "${f.r("success")}", bg = "${f.r("success")}" }
marker_cut = { fg = "${f.r("error")}", bg = "${f.r("error")}" }
marker_marked = { fg = "${f.c("orchid")}", bg = "${f.c("orchid")}" }
marker_selected = { fg = "${f.r("warning")}", bg = "${f.r("warning")}" }
count_copied = ${s(bg, f.r("success"))}
count_cut = ${s(bg, f.r("error"))}
count_selected = ${s(bg, f.r("warning"))}
border_symbol = "│"
border_style = ${s(f.r("border"))}

[tabs]
active = ${s(bg, accent, true)}
inactive = ${s(f.r("fgMuted"), surf)}

[mode]
normal_main = ${s(bg, accent, true)}
normal_alt = ${s(accent, surf)}
select_main = ${s(bg, f.r("warning"), true)}
select_alt = ${s(f.r("warning"), surf)}
unset_main = ${s(bg, f.c("orchid"), true)}
unset_alt = ${s(f.c("orchid"), surf)}

[status]
overall = ${s(fg, surf)}
sep_left = { open = "", close = "" }
sep_right = { open = "", close = "" }
perm_type = ${s(f.r("info"))}
perm_read = ${s(f.r("warning"))}
perm_write = ${s(f.r("error"))}
perm_exec = ${s(f.r("success"))}
perm_sep = ${s(f.r("fgSubtle"))}
progress_label = ${s(fg, null, true)}
progress_normal = ${s(accent, f.c("surface1"))}
progress_error = ${s(f.r("error"), f.c("surface1"))}

[which]
cols = 3
mask = ${s(fg, surf)}
cand = ${s(f.r("function"))}
rest = ${s(f.r("fgSubtle"))}
desc = ${s(f.c("orchid"))}
separator = "  "
separator_style = ${s(f.r("fgSubtle"))}

[confirm]
border = ${s(f.r("borderActive"))}
title = ${s(f.r("borderActive"))}
body = ${s(fg)}
list = ${s(fg)}
btn_yes = { reversed = true }
btn_no = {}
btn_labels = ["  [Y]es  ", "  (N)o  "]

[spot]
border = ${s(f.r("borderActive"))}
title = ${s(f.r("borderActive"))}
tbl_col = ${s(accent)}
tbl_cell = ${s(f.r("warning"), sel)}

[notify]
title_info = ${s(f.r("success"))}
title_warn = ${s(f.r("warning"))}
title_error = ${s(f.r("error"))}

[pick]
border = ${s(f.r("borderActive"))}
active = ${s(f.c("orchid"), null, true)}
inactive = ${s(fg)}

[input]
border = ${s(f.r("borderActive"))}
title = {}
value = {}
selected = { reversed = true }

[cmp]
border = ${s(f.r("borderActive"))}
active = { reversed = true }
inactive = {}

[tasks]
border = ${s(f.r("borderActive"))}
title = {}
hovered = ${s(f.c("orchid"), null, true)}

[help]
border = ${s(f.r("borderActive"))}
chord = ${s(f.c("copper"))}
action = ${s(f.r("function"))}
hovered = { reversed = true, bold = true }

[filetype]
rules = [
  { mime = "image/*", fg = "${f.c("copper")}" },
  { mime = "{audio,video}/*", fg = "${f.c("orchid")}" },
  { mime = "application/{zip,rar,7z*,tar,gzip,xz,zstd,bzip*,lzma,compress,archive,cpio,arj,xar,ms-cab*}", fg = "${f.r("error")}" },
  { mime = "application/{pdf,doc,rtf}", fg = "${f.r("warning")}" },
  { mime = "inode/empty", fg = "${f.r("fgSubtle")}" },
  { url = "*", is = "orphan", fg = "${f.r("error")}" },
  { url = "*", is = "exec", fg = "${f.r("success")}" },
  { url = "*/", fg = "${accent}" },
]
`;
}

export const yaziFlavorPath = (f, file) => `extras/yazi/${f.slug}.yazi/${file}`;

export const yazi = {
  id: "yazi",
  name: "yazi",
  homepage: "https://yazi-rs.github.io",
  files: (f) => [
    { path: yaziFlavorPath(f, "flavor.toml"), content: yaziFlavor(f) },
    { path: yaziFlavorPath(f, "tmtheme.xml"), content: tmtheme.files(f)[0].content },
    { path: yaziFlavorPath(f, "LICENSE"), content: license },
  ],
  install: `\`ya pkg add\` cannot install these straight from this repository. It looks for a \`<name>.yazi\` folder at the root of the repository (\`ya pkg add owner/repo:name\`), and Living Code keeps its flavors under \`extras/yazi/\` rather than adding folders at the root. So download the flavors by hand:

${fence("sh", `curl -fsSL --create-dirs -o "$HOME/.config/yazi/flavors/living-code-#1.yazi/#2" "${rawUrl("extras/yazi/living-code-{night,frost,paper,signal}.yazi/{flavor.toml,tmtheme.xml,LICENSE}")}"`)}

Then name them in \`~/.config/yazi/theme.toml\`:

${fence("toml", `[flavor]
dark = "living-code-night"
light = "living-code-paper"`)}

On Windows the flavors folder is \`%AppData%\\yazi\\config\\flavors\`.`,
};

export function k9sSkin(f) {
  const q = (h) => `"${h}"`;
  const fg = q(f.r("fg")), bg = q(f.r("bg")), acc = q(f.r("accent")), border = q(f.r("border"));
  const info = q(f.r("info")), warn = q(f.r("warning")), err = q(f.r("error")), ok = q(f.r("success"));
  const orchid = q(f.c("orchid")), muted = q(f.r("fgMuted"));
  return `# ${f.name}: https://github.com/ElliotLuque/living-code
k9s:
  body:
    fgColor: ${fg}
    bgColor: ${bg}
    logoColor: ${acc}
  prompt:
    fgColor: ${fg}
    bgColor: ${q(f.r("bgAlt"))}
    suggestColor: ${q(f.r("fgSubtle"))}
  info:
    fgColor: ${orchid}
    sectionColor: ${fg}
  dialog:
    fgColor: ${fg}
    bgColor: ${bg}
    buttonFgColor: ${bg}
    buttonBgColor: ${acc}
    buttonFocusFgColor: ${bg}
    buttonFocusBgColor: ${warn}
    labelFgColor: ${warn}
    fieldFgColor: ${fg}
  frame:
    border:
      fgColor: ${border}
      focusColor: ${q(f.r("borderActive"))}
    menu:
      fgColor: ${fg}
      keyColor: ${acc}
      numKeyColor: ${orchid}
    crumbs:
      fgColor: ${bg}
      bgColor: ${muted}
      activeColor: ${acc}
    status:
      newColor: ${info}
      modifyColor: ${acc}
      addColor: ${ok}
      errorColor: ${err}
      highlightColor: ${warn}
      killColor: ${q(f.r("fgSubtle"))}
      completedColor: ${q(f.r("fgSubtle"))}
    title:
      fgColor: ${fg}
      bgColor: ${bg}
      highlightColor: ${warn}
      counterColor: ${acc}
      filterColor: ${orchid}
  views:
    charts:
      bgColor: default
      defaultDialColors:
        - ${acc}
        - ${err}
      defaultChartColors:
        - ${acc}
        - ${err}
      resourceColors:
        cpu:
          - ${acc}
          - ${info}
        mem:
          - ${warn}
          - ${q(f.c("copper"))}
    table:
      fgColor: ${fg}
      bgColor: ${bg}
      cursorFgColor: ${fg}
      cursorBgColor: ${q(f.r("selection"))}
      markColor: ${q(f.c("copper"))}
      header:
        fgColor: ${q(f.r("fgAlt"))}
        bgColor: ${bg}
        sorterColor: ${q(f.c("aqua"))}
    xray:
      fgColor: ${fg}
      bgColor: ${bg}
      cursorColor: ${q(f.r("selection"))}
      cursorTextColor: ${fg}
      graphicColor: ${acc}
    yaml:
      keyColor: ${acc}
      colonColor: ${q(f.r("punctuation"))}
      valueColor: ${fg}
    logs:
      fgColor: ${fg}
      bgColor: ${bg}
      indicator:
        fgColor: ${fg}
        bgColor: ${q(f.c("surface0"))}
        toggleOnColor: ${ok}
        toggleOffColor: ${q(f.r("fgSubtle"))}
`;
}

export const k9s = {
  id: "k9s",
  name: "k9s",
  homepage: "https://k9scli.io",
  files: (f) => [{ path: `extras/k9s/${f.slug}.yaml`, content: k9sSkin(f) }],
  install: `Download the skins, then select one in \`config.yaml\`:

${fence("sh", `curl -fsSL --create-dirs --output-dir "\${XDG_CONFIG_HOME:-$HOME/.config}/k9s/skins" -O "${rawUrl(allFlavors("extras/k9s/living-code-*.yaml"))}"`)}

${fence("yaml", `k9s:
  ui:
    skin: living-code-night`)}

On macOS k9s may keep its config in \`~/Library/Application Support/k9s\` instead; run \`k9s info\` to see the directory it uses.`,
};

export function ezaTheme(f) {
  const t = (fg, extra = {}) => ({ foreground: fg, ...extra });
  const dir = f.r("accent"), exec = f.r("success"), link = f.r("link"), dim = f.r("fgSubtle");
  const doc = {
    colourful: true,
    filekinds: {
      normal: t(f.r("fg")), directory: t(dir, { is_bold: true }), symlink: t(link), pipe: t(f.r("warning")),
      block_device: t(f.r("warning"), { is_bold: true }), char_device: t(f.r("warning"), { is_bold: true }),
      socket: t(f.c("orchid")), special: t(f.c("orchid")), executable: t(exec, { is_bold: true }), mount_point: t(f.r("info"), { is_bold: true }),
    },
    perms: {
      user_read: t(f.r("warning")), user_write: t(f.r("error")), user_execute_file: t(exec, { is_underline: true }),
      user_execute_other: t(exec), group_read: t(f.r("warning")), group_write: t(f.r("error")), group_execute: t(exec),
      other_read: t(f.r("warning")), other_write: t(f.r("error")), other_execute: t(exec),
      special_user_file: t(f.c("orchid")), special_other: t(f.c("orchid")), attribute: t(f.r("fgMuted")),
    },
    size: {
      major: t(f.r("fgMuted")), minor: t(f.r("fgMuted")), number_byte: t(f.r("success")), number_kilo: t(f.r("success")),
      number_mega: t(f.r("warning")), number_giga: t(f.c("copper")), number_huge: t(f.r("error")),
      unit_byte: t(f.r("fgMuted")), unit_kilo: t(f.r("fgMuted")), unit_mega: t(f.r("fgMuted")), unit_giga: t(f.r("fgMuted")), unit_huge: t(f.r("fgMuted")),
    },
    users: {
      user_you: t(f.r("warning")), user_root: t(f.r("error")), user_other: t(f.c("orchid")),
      group_yours: t(f.r("warning")), group_other: t(f.r("fgMuted")), group_root: t(f.r("error")),
    },
    links: { normal: t(link), multi_link_file: t(f.c("copper")) },
    git: {
      new: t(f.r("added")), modified: t(f.r("modified")), deleted: t(f.r("removed")), renamed: t(f.r("info")),
      ignored: t(dim), conflicted: t(f.r("error")),
    },
    git_repo: {
      branch_main: t(f.r("success")), branch_other: t(f.c("orchid")), git_clean: t(f.r("success")), git_dirty: t(f.r("warning")),
    },
    security_context: {
      colon: t(dim), user: t(f.r("info")), role: t(f.c("orchid")), typ: t(f.r("warning")), range: t(f.r("fgMuted")),
    },
    file_type: {
      image: t(f.c("copper")), video: t(f.c("orchid")), music: t(f.c("aqua")), crypto: t(f.r("error")),
      document: t(f.r("fgAlt")), compressed: t(f.r("error")), temp: t(dim), compiled: t(f.r("info")),
      build: t(f.r("warning"), { is_bold: true }), source: t(f.r("function")),
    },
    punctuation: t(dim),
    date: t(f.r("info")),
    inode: t(f.r("fgMuted")),
    blocks: t(f.r("fgMuted")),
    header: t(f.r("fgAlt"), { is_underline: true }),
    octal: t(f.c("copper")),
    flags: t(f.c("orchid")),
    symlink_path: t(link),
    control_char: t(f.r("error")),
    broken_symlink: t(f.r("error")),
    broken_path_overlay: t(f.r("error"), { is_underline: true }),
  };
  return doc;
}

// eza's theme.yml: `security_context` nests selinux fields, so fold the flat keys above into that shape.
function yamlValue(v, indent) {
  const pad = "  ".repeat(indent);
  return Object.entries(v).map(([k, x]) => (x && typeof x === "object"
    ? `${pad}${k}:\n${yamlValue(x, indent + 1)}`
    : `${pad}${k}: ${typeof x === "string" ? `"${x}"` : x}`)).join("\n");
}

export function ezaYaml(f) {
  const doc = ezaTheme(f);
  const { colon, user, role, typ, range } = doc.security_context;
  doc.security_context = { selinux: { colon, user, role, typ, range }, none: doc.punctuation };
  delete doc.colourful;
  return `# ${f.name}: https://github.com/ElliotLuque/living-code\n${yamlValue(doc, 0)}\n`;
}

export const eza = {
  id: "eza",
  name: "eza",
  homepage: "https://eza.rocks",
  files: (f) => [{ path: `extras/eza/${f.slug}.yml`, content: ezaYaml(f) }],
  install: `Needs eza 0.19 or newer. eza reads a single \`theme.yml\` from \`$EZA_CONFIG_DIR\`, or \`~/.config/eza/\` if that is unset, so download the flavor you want under that name:

${fence("sh", `curl -fsSLo ~/.config/eza/theme.yml --create-dirs ${rawUrl("extras/eza/living-code-night.yml")}`)}

Swap \`night\` for \`frost\`, \`paper\` or \`signal\` to use another flavor. eza only colors what \`LS_COLORS\` / \`EZA_COLORS\` do not already set, so unset those variables if the theme seems to have no effect.`,
};
