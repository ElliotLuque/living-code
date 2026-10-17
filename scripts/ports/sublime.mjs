import { SCOPES } from "./editors.mjs";

// Modern Sublime Text colour scheme (.sublime-color-scheme, JSON, Sublime Text 3.1+).
// Format reference: https://www.sublimetext.com/docs/color_schemes.html
// Scope names:      https://www.sublimetext.com/docs/scope_naming.html
//
// The syntax rules reuse SCOPES from the tmTheme/VS Code ports, so every editor
// colours the same scopes with the same roles. Colours are emitted once, as
// variables, and referenced from globals and rules with var(name).

export const SUBLIME_DIR = "extras/sublime";
export const SUBLIME_AUTHOR = "Elliot Luque";

// Sublime font_style accepts bold, italic, glow, underline, stippled_underline and
// squiggly_underline. It has no strikethrough, so that style is dropped.
const FONT_STYLES = new Set(["bold", "italic", "underline"]);

// Sublime-specific scopes (scope naming guide) that the shared SCOPES list does not
// name. They are more specific than the broad entries, so they win where both match.
export const SUBLIME_SCOPES = [
  { role: "type", scope: ["entity.name.struct", "entity.name.enum", "entity.name.union", "entity.name.trait", "entity.name.interface", "entity.name.impl"] },
  { role: "constant", scope: ["entity.name.constant", "variable.other.constant"] },
  { role: "keyword", scope: ["keyword.operator.word", "punctuation.definition.keyword", "punctuation.section.interpolation"] },
  { role: "namespace", scope: ["support.module"] },
  { role: "decorator", scope: ["meta.annotation", "variable.annotation", "punctuation.definition.annotation", "meta.preprocessor", "entity.name.label"] },
  { role: "accent", scope: ["entity.name.filename.find-in-files"] },
  { role: "lineNumber", scope: ["constant.numeric.line-number.find-in-files"] },
  { role: null, scope: ["markup.underline"], fontStyle: "underline" },
];

const rule = (name, scope, props) => ({ name, scope: scope.join(", "), ...props });

export function sublimeScheme(f) {
  const palette = Object.fromEntries(Object.keys(f.colors).map((n) => [n, f.c(n)]));
  const roles = Object.fromEntries(Object.keys(f.roles).map((r) => [`role_${r}`, f.r(r)]));
  // Tints for diff backgrounds and the unfocused selection, from the same roles
  // the delta and Neovim ports blend.
  const tints = {
    tint_added: f.mix("bg", "added", 0.14),
    tint_removed: f.mix("bg", "removed", 0.14),
    tint_modified: f.mix("bg", "modified", 0.12),
    selection_inactive: f.mix("bg", "selection", 0.6),
  };
  const variables = { ...palette, ...roles, ...tints };
  const v = (name) => `var(${name})`;
  const role = (r) => v(`role_${r}`);

  const globals = {
    background: role("bg"),
    foreground: role("fg"),
    caret: role("cursor"),
    block_caret: role("cursor"),
    invisibles: v("surface1"),
    line_highlight: role("lineHighlight"),
    misspelling: role("error"),
    fold_marker: role("fgSubtle"),
    minimap_border: role("border"),
    accent: role("accent"),
    shadow: "#00000033",
    shadow_width: 8,

    gutter: role("bg"),
    gutter_foreground: role("lineNumber"),
    gutter_foreground_highlight: role("lineNumberActive"),
    line_diff_width: 3,
    line_diff_added: role("added"),
    line_diff_modified: role("modified"),
    line_diff_deleted: role("removed"),

    selection: role("selection"),
    inactive_selection: v("selection_inactive"),

    highlight: role("match"),
    find_highlight: role("match"),
    find_highlight_foreground: role("bg"),
    scroll_highlight: role("match"),
    scroll_selected_highlight: role("accent"),

    rulers: v("surface0"),
    guide: v("surface0"),
    stack_guide: v("surface1"),
    active_guide: v("surface2"),

    brackets_options: "underline",
    brackets_foreground: role("accent"),
    bracket_contents_options: "underline",
    bracket_contents_foreground: role("fgMuted"),
    tags_options: "stippled_underline",
    tags_foreground: role("accent"),
  };

  const style = (r, fontStyle) => {
    const s = (fontStyle ?? (r && f.styles[r]))?.split(" ").filter((x) => FONT_STYLES.has(x)).join(" ");
    return s ? { font_style: s } : {};
  };
  const fromScopes = (list) =>
    list
      .map(({ role: r, scope, fontStyle }) => rule(r ?? scope[0], scope, { ...(r ? { foreground: role(r) } : {}), ...style(r, fontStyle) }))
      .filter((x) => x.foreground || x.font_style);

  const diff = (kind, r, tint) => rule(`diff ${kind}`, [`markup.${kind}.diff`], { foreground: role(r), background: v(tint) });

  const rules = [
    ...fromScopes(SCOPES),
    ...fromScopes(SUBLIME_SCOPES),
    diff("inserted", "added", "tint_added"),
    diff("deleted", "removed", "tint_removed"),
    diff("changed", "modified", "tint_modified"),
  ];

  return { name: f.name, author: SUBLIME_AUTHOR, variables, globals, rules };
}

export const sublime = {
  id: "sublime",
  name: "Sublime Text",
  homepage: "https://www.sublimetext.com",
  files: (f) => [{ path: `${SUBLIME_DIR}/${f.slug}.sublime-color-scheme`, content: JSON.stringify(sublimeScheme(f), null, 2) + "\n" }],
  install: `Targets Sublime Text 4. It uses the modern \`.sublime-color-scheme\` format, one file per flavor.

**Package Control.** This README assumes the package is published to Package Control. Open the Command Palette and run *Package Control: Install Package*, choose **Living Code**, then pick *Preferences → Select Color Scheme → Living Code Night* (or *UI: Select Color Scheme*). Flavors: Night, Frost, Paper and Signal.

**Manual.** Copy the \`.sublime-color-scheme\` files from [\`extras/sublime/\`](extras/sublime) into \`Packages/User/\` (*Preferences → Browse Packages…*), then select the scheme as above. To customize a manual install, edit the copied file. With the Package Control install, add a \`Packages/User/<Scheme>.sublime-color-scheme\` with the same file name as the package scheme and override entries under \`variables\` or \`globals\`.

\`pnpm run package:sublime\` builds \`dist/sublime/Living Code.sublime-package\` from the same generator. The [bat · delta (tmTheme) port](#tmtheme) stays for bat and delta; Sublime Text should use this native scheme.`,
};
