import { ANSI_ORDER } from "../resolve.mjs";
import { REPO, changelog, license, version } from "./meta.mjs";

export const SCOPES = [
  { role: "comment", scope: ["comment", "punctuation.definition.comment", "string.quoted.docstring"] },
  { role: "keyword", scope: ["keyword", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new", "keyword.operator.expression", "keyword.operator.logical.python", "keyword.operator.wordlike", "keyword.other", "punctuation.definition.template-expression", "punctuation.section.embedded"] },
  { role: "operator", scope: ["keyword.operator", "storage.type.function.arrow"] },
  { role: "punctuation", scope: ["punctuation", "meta.brace", "punctuation.definition.tag", "punctuation.separator", "punctuation.terminator", "punctuation.accessor"] },
  { role: "string", scope: ["string", "punctuation.definition.string", "string.template"] },
  { role: "escape", scope: ["constant.character.escape", "constant.other.placeholder", "constant.character.format"] },
  { role: "regex", scope: ["string.regexp"] },
  { role: "number", scope: ["constant.numeric", "keyword.other.unit"] },
  { role: "constant", scope: ["constant.language", "constant.other", "variable.other.constant.property", "support.constant", "variable.other.enummember", "constant.other.color"] },
  { role: "function", scope: ["entity.name.function", "support.function", "meta.function-call.generic", "variable.function", "entity.name.function.member"] },
  { role: "type", scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class", "storage.type.primitive", "support.class.component", "entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"] },
  { role: "namespace", scope: ["entity.name.namespace", "entity.name.type.module", "entity.name.scope-resolution"] },
  { role: "decorator", scope: ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator", "storage.type.annotation", "meta.attribute", "entity.name.function.macro"] },
  { role: "tag", scope: ["entity.name.tag"] },
  { role: "attribute", scope: ["entity.other.attribute-name"] },
  { role: "property", scope: ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key", "support.type.property-name", "entity.name.tag.yaml", "entity.name.tag.toml", "support.type.property-name.json"] },
  { role: "parameter", scope: ["variable.parameter", "meta.parameter variable"] },
  { role: "builtin", scope: ["variable.language", "support.variable", "variable.language.this", "variable.language.self", "variable.language.super"] },
  { role: "variable", scope: ["variable", "meta.definition.variable", "variable.other.readwrite"] },
  { role: "heading", scope: ["markup.heading", "entity.name.section", "markup.heading punctuation.definition.heading"] },
  { role: null, scope: ["markup.bold"], fontStyle: "bold" },
  { role: null, scope: ["markup.italic"], fontStyle: "italic" },
  { role: null, scope: ["markup.strikethrough"], fontStyle: "strikethrough" },
  { role: "link", scope: ["markup.underline.link", "string.other.link", "markup.link"] },
  { role: "code", scope: ["markup.inline.raw", "markup.fenced_code", "markup.raw"] },
  { role: "quote", scope: ["markup.quote"] },
  { role: "accent", scope: ["punctuation.definition.list", "markup.list punctuation.definition"] },
  { role: "added", scope: ["markup.inserted", "meta.diff.header.to-file", "punctuation.definition.inserted"] },
  { role: "removed", scope: ["markup.deleted", "meta.diff.header.from-file", "punctuation.definition.deleted"] },
  { role: "modified", scope: ["markup.changed", "punctuation.definition.changed"] },
  { role: "fgSubtle", scope: ["meta.diff.range", "meta.diff.index", "meta.separator"] },
  { role: "error", scope: ["invalid", "invalid.illegal"] },
  { role: "warning", scope: ["invalid.deprecated"] },
];

export const scopeRules = (f) =>
  SCOPES.map(({ role, scope, fontStyle }) => {
    const settings = {};
    if (role) settings.foreground = f.r(role);
    const style = fontStyle ?? (role && f.styles[role]);
    if (style) settings.fontStyle = style;
    return { scope, settings };
  });

const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, "0");

function vscodeTheme(f) {
  const r = f.r, c = f.c;
  const ansiNames = ANSI_ORDER.map((n) => n[0].toUpperCase() + n.slice(1));
  const terminal = Object.fromEntries([
    ...ansiNames.map((n, i) => [`terminal.ansi${n}`, f.ansi.normal[i]]),
    ...ansiNames.map((n, i) => [`terminal.ansiBright${n}`, f.ansi.bright[i]]),
  ]);
  return {
    $schema: "vscode://schemas/color-theme",
    name: f.name,
    type: f.light ? "light" : "dark",
    semanticHighlighting: true,
    colors: {
      focusBorder: r("accent"),
      foreground: r("fg"),
      descriptionForeground: r("fgMuted"),
      disabledForeground: r("lineNumber"),
      errorForeground: r("error"),
      "icon.foreground": r("fgMuted"),
      "selection.background": alpha(c("teal"), 0.35),
      "widget.shadow": "#00000066",
      "textLink.foreground": r("link"),
      "textLink.activeForeground": c("mint"),
      "textCodeBlock.background": r("bgAlt"),
      "textBlockQuote.background": r("bgAlt"),
      "textBlockQuote.border": r("accent"),
      "textPreformat.foreground": r("code"),

      "button.background": r("accent"),
      "button.foreground": r("bg"),
      "button.hoverBackground": c("mint"),
      "button.secondaryBackground": c("surface1"),
      "button.secondaryForeground": r("fg"),
      "badge.background": r("accent"),
      "badge.foreground": r("bg"),
      "progressBar.background": r("accent"),
      "checkbox.background": c("surface0"),
      "checkbox.border": r("border"),
      "dropdown.background": r("bgAlt"),
      "dropdown.border": r("border"),
      "input.background": r("bgDeep"),
      "input.border": r("border"),
      "input.foreground": r("fg"),
      "input.placeholderForeground": r("lineNumber"),
      "inputOption.activeBorder": r("accent"),
      "inputOption.activeBackground": alpha(c("teal"), 0.2),
      "inputValidation.errorBorder": r("error"),
      "inputValidation.warningBorder": r("warning"),
      "inputValidation.infoBorder": r("info"),
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": alpha(c("surface2"), 0.5),
      "scrollbarSlider.hoverBackground": alpha(c("surface2"), 0.8),
      "scrollbarSlider.activeBackground": c("surface2"),

      "activityBar.background": r("bgDeep"),
      "activityBar.foreground": r("fg"),
      "activityBar.inactiveForeground": r("lineNumber"),
      "activityBar.activeBorder": r("accent"),
      "activityBar.border": r("border"),
      "activityBarBadge.background": r("accent"),
      "activityBarBadge.foreground": r("bg"),
      "sideBar.background": r("bgDeep"),
      "sideBar.foreground": r("fgAlt"),
      "sideBar.border": r("border"),
      "sideBarTitle.foreground": r("fgMuted"),
      "sideBarSectionHeader.background": r("bgDeep"),
      "sideBarSectionHeader.foreground": r("fgMuted"),
      "sideBarSectionHeader.border": r("border"),
      "list.activeSelectionBackground": c("surface0"),
      "list.activeSelectionForeground": r("fg"),
      "list.inactiveSelectionBackground": r("bgAlt"),
      "list.hoverBackground": r("bgAlt"),
      "list.focusOutline": r("accent"),
      "list.highlightForeground": r("accent"),
      "list.errorForeground": r("error"),
      "list.warningForeground": r("warning"),
      "tree.indentGuidesStroke": c("surface1"),

      "titleBar.activeBackground": r("bgDeep"),
      "titleBar.activeForeground": r("fgAlt"),
      "titleBar.inactiveBackground": r("bgDeep"),
      "titleBar.inactiveForeground": r("lineNumber"),
      "titleBar.border": r("border"),
      "menu.background": r("bgAlt"),
      "menu.border": r("border"),
      "menu.selectionBackground": c("surface0"),
      "commandCenter.background": r("bg"),
      "commandCenter.border": r("border"),

      "editorGroupHeader.tabsBackground": r("bgDeep"),
      "editorGroupHeader.tabsBorder": r("border"),
      "editorGroup.border": r("border"),
      "tab.activeBackground": r("bg"),
      "tab.activeForeground": r("fg"),
      "tab.activeBorderTop": r("accent"),
      "tab.inactiveBackground": r("bgDeep"),
      "tab.inactiveForeground": r("lineNumber"),
      "tab.border": r("border"),
      "tab.hoverBackground": r("bgAlt"),
      "tab.unfocusedActiveBorderTop": r("border"),
      "tab.activeModifiedBorder": r("modified"),
      "breadcrumb.foreground": r("fgSubtle"),
      "breadcrumb.focusForeground": r("fg"),
      "breadcrumb.activeSelectionForeground": r("accent"),

      "editor.background": r("bg"),
      "editor.foreground": r("fg"),
      "editorLineNumber.foreground": r("lineNumber"),
      "editorLineNumber.activeForeground": r("lineNumberActive"),
      "editorCursor.foreground": r("cursor"),
      "editorCursor.background": r("bg"),
      "editor.lineHighlightBackground": r("lineHighlight"),
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": r("selection"),
      "editor.inactiveSelectionBackground": alpha(c("surface2"), 0.6),
      "editor.selectionHighlightBackground": alpha(c("teal"), 0.15),
      "editor.wordHighlightBackground": alpha(c("steel"), 0.15),
      "editor.wordHighlightStrongBackground": alpha(c("steel"), 0.25),
      "editor.findMatchBackground": alpha(c("amber"), 0.35),
      "editor.findMatchBorder": c("amber"),
      "editor.findMatchHighlightBackground": alpha(c("amber"), 0.15),
      "editor.rangeHighlightBackground": alpha(c("teal"), 0.08),
      "editor.foldBackground": alpha(c("surface1"), 0.4),
      "editorBracketMatch.background": alpha(c("teal"), 0.15),
      "editorBracketMatch.border": r("accent"),
      "editorBracketHighlight.foreground1": c("subtext"),
      "editorBracketHighlight.foreground2": c("mint"),
      "editorBracketHighlight.foreground3": c("amber"),
      "editorBracketHighlight.foreground4": c("steel"),
      "editorBracketHighlight.foreground5": c("orchid"),
      "editorBracketHighlight.foreground6": c("copper"),
      "editorBracketHighlight.unexpectedBracket.foreground": r("error"),
      "editorIndentGuide.background1": c("surface0"),
      "editorIndentGuide.activeBackground1": c("surface2"),
      "editorWhitespace.foreground": c("surface1"),
      "editorRuler.foreground": c("surface0"),
      "editorCodeLens.foreground": r("fgSubtle"),
      "editorInlayHint.foreground": r("fgSubtle"),
      "editorInlayHint.background": alpha(c("surface0"), 0.6),
      "editorLink.activeForeground": r("link"),
      "editorError.foreground": r("error"),
      "editorWarning.foreground": r("warning"),
      "editorInfo.foreground": r("info"),
      "editorHint.foreground": r("hint"),
      "editorGutter.addedBackground": r("added"),
      "editorGutter.modifiedBackground": r("modified"),
      "editorGutter.deletedBackground": r("removed"),
      "editorOverviewRuler.border": "#00000000",
      "editorOverviewRuler.errorForeground": r("error"),
      "editorOverviewRuler.warningForeground": r("warning"),
      "editorOverviewRuler.findMatchForeground": r("match"),
      "editorWidget.background": r("bgAlt"),
      "editorWidget.border": r("border"),
      "editorSuggestWidget.background": r("bgAlt"),
      "editorSuggestWidget.border": r("border"),
      "editorSuggestWidget.selectedBackground": c("surface0"),
      "editorSuggestWidget.highlightForeground": r("accent"),
      "editorHoverWidget.background": r("bgAlt"),
      "editorHoverWidget.border": r("border"),
      "peekView.border": r("accent"),
      "peekViewEditor.background": r("bgAlt"),
      "peekViewResult.background": r("bgDeep"),
      "peekViewTitle.background": r("bgDeep"),
      "peekViewEditor.matchHighlightBackground": alpha(c("amber"), 0.25),
      "peekViewResult.matchHighlightBackground": alpha(c("amber"), 0.25),
      "diffEditor.insertedTextBackground": alpha(c("moss"), 0.15),
      "diffEditor.removedTextBackground": alpha(c("flare"), 0.15),
      "diffEditor.insertedLineBackground": alpha(c("moss"), 0.08),
      "diffEditor.removedLineBackground": alpha(c("flare"), 0.08),
      "merge.currentHeaderBackground": alpha(c("moss"), 0.35),
      "merge.incomingHeaderBackground": alpha(c("steel"), 0.35),

      "panel.background": r("bgDeep"),
      "panel.border": r("border"),
      "panelTitle.activeBorder": r("accent"),
      "panelTitle.activeForeground": r("fg"),
      "panelTitle.inactiveForeground": r("lineNumber"),
      "statusBar.background": r("bgDeep"),
      "statusBar.foreground": r("fgMuted"),
      "statusBar.border": r("border"),
      "statusBar.debuggingBackground": c("copper"),
      "statusBar.debuggingForeground": r("bg"),
      "statusBar.noFolderBackground": r("bgDeep"),
      "statusBarItem.remoteBackground": r("accent"),
      "statusBarItem.remoteForeground": r("bg"),
      "statusBarItem.hoverBackground": c("surface0"),
      "notifications.background": r("bgAlt"),
      "notifications.border": r("border"),
      "notificationCenterHeader.background": r("bgDeep"),
      "quickInput.background": r("bgAlt"),
      "quickInputList.focusBackground": c("surface0"),
      "pickerGroup.foreground": r("accent"),
      "pickerGroup.border": r("border"),
      "keybindingLabel.background": c("surface0"),
      "keybindingLabel.border": r("border"),
      "keybindingLabel.foreground": r("fg"),

      "gitDecoration.addedResourceForeground": r("added"),
      "gitDecoration.modifiedResourceForeground": r("modified"),
      "gitDecoration.deletedResourceForeground": r("removed"),
      "gitDecoration.untrackedResourceForeground": c("mint"),
      "gitDecoration.ignoredResourceForeground": r("lineNumber"),
      "gitDecoration.conflictingResourceForeground": c("orchid"),
      "minimap.findMatchHighlight": r("match"),
      "minimap.errorHighlight": r("error"),
      "minimapGutter.addedBackground": r("added"),
      "minimapGutter.modifiedBackground": r("modified"),
      "minimapGutter.deletedBackground": r("removed"),

      "terminal.background": r("bg"),
      "terminal.foreground": r("fg"),
      "terminalCursor.foreground": r("cursor"),
      "terminal.selectionBackground": r("selection"),
      ...terminal,
    },
    tokenColors: scopeRules(f),
    semanticTokenColors: {
      parameter: { foreground: r("parameter"), italic: f.styles.parameter === "italic" },
      property: r("property"),
      function: r("function"),
      method: r("function"),
      type: r("type"),
      class: r("type"),
      interface: r("type"),
      enum: r("type"),
      typeParameter: r("type"),
      enumMember: r("constant"),
      namespace: r("namespace"),
      decorator: r("decorator"),
      macro: r("decorator"),
      "variable.defaultLibrary": r("builtin"),
      "*.deprecated": { strikethrough: true },
    },
  };
}

const RAW = `${REPO.replace("github.com", "raw.githubusercontent.com")}/main`;

const vscodeReadme = (fs) => `# Living Code

**Calm slate. Living color.** A color theme where the background stays quiet and the code comes alive: cool teal structure, warm amber data, on dark slate.

${fs.map((f) => `![${f.name}](${RAW}/assets/preview-${f.id}.png)`).join("\n\n")}

## Themes

| Theme | Appearance |
|---|---|
| Living Code Night | Dark slate with the full palette. The default. |
| Living Code Frost | Lifted, bluer slate with lower-chroma accents. |
| Living Code Paper | Light theme on near-white slate. |
| Living Code Signal | Dark slate with a single teal accent. |

Pick one with *Preferences: Color Theme* (\`Ctrl+K Ctrl+T\` or \`Cmd+K Cmd+T\`).

Every theme maps the same semantic roles (keyword, string, error, border...), so Living Code looks the same in your editor, terminal and browser. All text colors meet WCAG AA contrast against their background. The same theme is also available for [many other tools](${REPO}#ports).

## License

[MIT](LICENSE) © Elliot Luque. Source: [${REPO.replace("https://", "")}](${REPO}).
`;

export const vscode = {
  id: "vscode",
  name: "VS Code",
  homepage: "https://code.visualstudio.com",
  files: (f) => [{ path: `extras/vscode/themes/${f.slug}-color-theme.json`, content: JSON.stringify(vscodeTheme(f), null, 2) + "\n" }],
  all: (fs) => [
    {
      path: "extras/vscode/package.json",
      content: JSON.stringify({
        name: "living-code",
        displayName: "Living Code",
        description: "Teal structure, amber data, on dark slate. Night, Frost, Paper and Signal color themes.",
        version,
        publisher: "elliotluque",
        license: "MIT",
        icon: "images/icon.png",
        galleryBanner: { color: fs.find((f) => f.id === "night").c("base"), theme: "dark" },
        homepage: REPO,
        bugs: { url: `${REPO}/issues` },
        repository: { type: "git", url: `${REPO}.git`, directory: "extras/vscode" },
        engines: { vscode: "^1.70.0" },
        categories: ["Themes"],
        keywords: ["theme", "color-theme", "dark", "light", "oklch", "slate", "teal", "amber", "minimal", ...fs.map((f) => f.name.toLowerCase())],
        contributes: {
          themes: fs.map((f) => ({ label: f.name, uiTheme: f.light ? "vs" : "vs-dark", path: `./themes/${f.slug}-color-theme.json` })),
        },
      }, null, 2) + "\n",
    },
    { path: "extras/vscode/README.md", content: vscodeReadme(fs) },
    { path: "extras/vscode/CHANGELOG.md", content: changelog },
    { path: "extras/vscode/LICENSE", content: license },
    { path: "extras/vscode/.vscodeignore", content: ".vscodeignore\n*.vsix\n.DS_Store\n" },
  ],
  install: `Open the Extensions view (\`Ctrl+Shift+X\`), search for **Living Code** and click **Install**, or run:

\`\`\`sh
code --install-extension elliotluque.living-code
\`\`\`

Then pick **Living Code Night**, **Frost**, **Paper** or **Signal** in *Preferences: Color Theme*.

**Cursor, VSCodium, Windsurf and other forks** install from [Open VSX](https://open-vsx.org/extension/elliotluque/living-code): search for **Living Code** in their Extensions view.

**Without a marketplace:** once a release has been published, download \`living-code-<version>.vsix\` from the [latest GitHub release](https://github.com/ElliotLuque/living-code/releases/latest) and run \`code --install-extension living-code-<version>.vsix\` (or *Extensions: Install from VSIX...*). To build it yourself: \`cd extras/vscode && pnpm dlx @vscode/vsce package --no-dependencies\`. This README assumes the extension is published to both marketplaces.

The same JSON works with **Shiki**. For Astro and other Expressive Code integrations, use the dedicated [Expressive Code port](#expressive-code).`,
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function plistDict(obj, indent) {
  const pad = "\t".repeat(indent);
  return `${pad}<dict>\n${Object.entries(obj).map(([k, v]) => `${pad}\t<key>${esc(k)}</key>\n${pad}\t<string>${esc(v)}</string>`).join("\n")}\n${pad}</dict>`;
}

export const tmtheme = {
  id: "tmtheme",
  name: "bat · delta (tmTheme)",
  homepage: "https://github.com/sharkdp/bat",
  files: (f) => {
    const global = {
      background: f.r("bg"), foreground: f.r("fg"), caret: f.r("cursor"),
      lineHighlight: f.r("lineHighlight"), selection: f.r("selection"),
      invisibles: f.c("surface1"), gutter: f.r("bg"), gutterForeground: f.r("lineNumber"),
      findHighlight: f.r("match"), findHighlightForeground: f.r("bg"),
      bracketsForeground: f.r("accent"), guide: f.c("surface0"), activeGuide: f.c("surface2"),
    };
    const rules = scopeRules(f).map(({ scope, settings }) => `\t\t<dict>
\t\t\t<key>scope</key>
\t\t\t<string>${esc(scope.join(", "))}</string>
\t\t\t<key>settings</key>
${plistDict(settings, 3)}
\t\t</dict>`).join("\n");
    return [{
      path: `extras/tmtheme/${f.slug}.tmTheme`,
      content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>name</key>
\t<string>${f.name}</string>
\t<key>settings</key>
\t<array>
\t\t<dict>
\t\t\t<key>settings</key>
${plistDict(global, 3)}
\t\t</dict>
${rules}
\t</array>
\t<key>uuid</key>
\t<string>${uuid(f.slug)}</string>
</dict>
</plist>
`,
    }];
  },
  install: `**bat / delta**

\`\`\`sh
mkdir -p "$(bat --config-dir)/themes"
cp extras/tmtheme/*.tmTheme "$(bat --config-dir)/themes/"
bat cache --build
bat --list-themes | grep living-code
\`\`\`

Then \`--theme="living-code-night"\` in \`$(bat --config-dir)/config\`, and \`syntax-theme = living-code-night\` under \`[delta]\` in \`~/.gitconfig\`. For delta's diff backgrounds, headers and gutters, also use the dedicated [delta port](https://github.com/ElliotLuque/living-code#delta).

**Sublime Text** has its own native color scheme: use the dedicated [Sublime Text port](#sublime). The \`.tmTheme\` files are kept for bat and delta.`,
};

function uuid(seed) {
  let h = 2166136261;
  const out = [];
  for (let i = 0; i < 32; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    out.push((h & 15).toString(16));
  }
  const s = out.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-a${s.slice(17, 20)}-${s.slice(20, 32)}`;
}

export const helix = {
  id: "helix",
  name: "Helix",
  homepage: "https://helix-editor.com",
  files: (f) => {
    const R = f.roles;
    const st = (role, extra = {}) => {
      const o = { fg: R[role], ...extra };
      const s = f.styles[role];
      if (s && !o.modifiers) o.modifiers = [s === "underline" ? "underlined" : s];
      return o;
    };
    const t = {
      attribute: st("decorator"),
      type: st("type"), "type.builtin": st("type"), "type.enum.variant": st("constant"),
      constructor: st("type"),
      constant: st("constant"), "constant.builtin": st("constant"), "constant.numeric": st("number"),
      "constant.character.escape": st("escape"),
      string: st("string"), "string.regexp": st("regex"), "string.special": st("escape"),
      "string.special.url": st("link"), "string.special.symbol": st("constant"),
      comment: st("comment"),
      variable: st("variable"), "variable.parameter": st("parameter"), "variable.builtin": st("builtin"),
      "variable.other.member": st("property"),
      label: st("decorator"),
      punctuation: st("punctuation"), "punctuation.special": st("keyword"),
      keyword: st("keyword"), "keyword.directive": st("decorator"),
      operator: st("operator"),
      function: st("function"), "function.builtin": st("function"), "function.macro": st("decorator"),
      tag: st("tag"), namespace: st("namespace"), special: st("accent"),
      "markup.heading": st("heading"), "markup.list": st("accent"),
      "markup.bold": { modifiers: ["bold"] }, "markup.italic": { modifiers: ["italic"] },
      "markup.strikethrough": { modifiers: ["crossed_out"] },
      "markup.link.url": { fg: R.link, modifiers: ["underlined"] }, "markup.link.text": st("link"),
      "markup.quote": st("quote"), "markup.raw": st("code"),
      "diff.plus": st("added"), "diff.minus": st("removed"), "diff.delta": st("modified"),

      "ui.background": { bg: R.bg },
      "ui.text": { fg: R.fg }, "ui.text.focus": { fg: R.fg, bg: "surface0" }, "ui.text.inactive": { fg: R.fgSubtle },
      "ui.linenr": { fg: R.lineNumber }, "ui.linenr.selected": { fg: R.lineNumberActive, modifiers: ["bold"] },
      "ui.cursorline.primary": { bg: R.lineHighlight },
      "ui.cursor": { fg: R.bg, bg: "subtext" }, "ui.cursor.primary": { fg: R.bg, bg: R.cursor },
      "ui.cursor.match": { fg: R.accent, modifiers: ["bold", "underlined"] },
      "ui.cursor.primary.insert": { fg: R.bg, bg: "amber" }, "ui.cursor.primary.select": { fg: R.bg, bg: "orchid" },
      "ui.selection": { bg: "surface1" }, "ui.selection.primary": { bg: R.selection },
      "ui.statusline": { fg: R.fgMuted, bg: R.bgDeep }, "ui.statusline.inactive": { fg: R.lineNumber, bg: R.bgDeep },
      "ui.statusline.normal": { fg: R.bg, bg: R.accent, modifiers: ["bold"] },
      "ui.statusline.insert": { fg: R.bg, bg: "amber", modifiers: ["bold"] },
      "ui.statusline.select": { fg: R.bg, bg: "orchid", modifiers: ["bold"] },
      "ui.bufferline": { fg: R.fgMuted, bg: R.bgDeep }, "ui.bufferline.active": { fg: R.fg, bg: R.bg, underline: { color: R.accent, style: "line" } },
      "ui.popup": { fg: R.fg, bg: R.bgAlt }, "ui.popup.info": { fg: R.fg, bg: R.bgAlt },
      "ui.window": { fg: R.border }, "ui.help": { fg: R.fg, bg: R.bgAlt },
      "ui.menu": { fg: R.fg, bg: R.bgAlt }, "ui.menu.selected": { fg: R.fg, bg: "surface1" }, "ui.menu.scroll": { fg: "surface2", bg: R.bgAlt },
      "ui.picker.header": { fg: R.accent, modifiers: ["bold"] },
      "ui.virtual.whitespace": { fg: "surface1" }, "ui.virtual.ruler": { bg: "surface0" },
      "ui.virtual.indent-guide": { fg: "surface0" }, "ui.virtual.inlay-hint": { fg: R.fgSubtle, bg: "surface0" },
      "ui.virtual.jump-label": { fg: R.accent, modifiers: ["bold"] },
      "ui.highlight": { bg: "surface0" },
      "ui.gutter": { bg: R.bg },
      error: { fg: R.error }, warning: { fg: R.warning }, info: { fg: R.info }, hint: { fg: R.hint },
      "diagnostic.error": { underline: { color: R.error, style: "curl" } },
      "diagnostic.warning": { underline: { color: R.warning, style: "curl" } },
      "diagnostic.info": { underline: { color: R.info, style: "curl" } },
      "diagnostic.hint": { underline: { color: R.hint, style: "curl" } },
      "diagnostic.unnecessary": { modifiers: ["dim"] }, "diagnostic.deprecated": { modifiers: ["crossed_out"] },
    };
    const toml = (v) =>
      typeof v === "string" ? `"${v}"`
        : Array.isArray(v) ? `[${v.map(toml).join(", ")}]`
          : `{ ${Object.entries(v).map(([k, x]) => `${k} = ${toml(x)}`).join(", ")} }`;
    return [{
      path: `extras/helix/${f.slug}.toml`,
      content: `${Object.entries(t).map(([k, v]) => `"${k}" = ${toml(v)}`).join("\n")}\n\n[palette]\n${Object.keys(f.colors).map((n) => `${n} = "${f.c(n)}"`).join("\n")}\n`,
    }];
  },
  install: `Copy to \`~/.config/helix/themes/\`, then \`theme = "living-code-night"\` in \`config.toml\`.`,
};

export const neovim = {
  id: "neovim",
  name: "Neovim",
  homepage: "https://neovim.io",
  files: (f) => {
    const lua = (o) => Object.entries(o).map(([k, v]) => `    ["${k}"] = "${v}",`).join("\n");
    return [
      {
        path: `lua/living-code/palettes/${f.id}.lua`,
        content: `return {\n  name = "${f.name}",\n  light = ${f.light},\n  colors = {\n${lua(Object.fromEntries(Object.keys(f.colors).map((n) => [n, f.c(n)])))}\n  },\n  roles = {\n${lua(Object.fromEntries(Object.keys(f.roles).map((k) => [k, f.r(k)])))}\n  },\n  ansi = {\n${[...f.ansi.normal, ...f.ansi.bright].map((c) => `    "${c}",`).join("\n")}\n  },\n  blend = {\n    added = "${f.mix("bg", "added", 0.14)}",\n    removed = "${f.mix("bg", "removed", 0.14)}",\n    modified = "${f.mix("bg", "modified", 0.12)}",\n    error = "${f.mix("bg", "error", 0.12)}",\n    warning = "${f.mix("bg", "warning", 0.12)}",\n    info = "${f.mix("bg", "info", 0.12)}",\n    hint = "${f.mix("bg", "hint", 0.12)}",\n    accent = "${f.mix("bg", "accent", 0.18)}",\n  },\n}\n`,
      },
      { path: `colors/${f.slug}.lua`, content: `require("living-code").load("${f.id}")\n` },
    ];
  },
  all: () => [{ path: "colors/living-code.lua", content: `require("living-code").load()\n` }],
  install: `This repo is a Neovim plugin.

\`\`\`lua
{
  "ElliotLuque/living-code",
  priority = 1000,
  config = function()
    require("living-code").setup({
      flavor = "night",
      transparent = false,
      italic_comments = true,
    })
    vim.cmd.colorscheme("living-code")
  end,
}
\`\`\`

Or pick a flavor directly: \`:colorscheme living-code-signal\`. Covers Tree-sitter, LSP semantic tokens, diagnostics, gitsigns, telescope, nvim-cmp / blink.cmp, which-key, mini.*, lualine (\`theme = "living-code"\`).`,
};

export const zed = {
  id: "zed",
  name: "Zed",
  homepage: "https://zed.dev",
  files: () => [],
  all: (fs) => {
    const a = (h, x) => h + Math.round(x * 255).toString(16).padStart(2, "0");
    const theme = (f) => {
      const r = f.r, c = f.c;
      const syn = (role) => ({ color: r(role), font_style: f.styles[role] === "italic" ? "italic" : null, font_weight: f.styles[role] === "bold" ? 700 : null });
      return {
        name: f.name,
        appearance: f.light ? "light" : "dark",
        style: {
          background: r("bgDeep"), "surface.background": r("bgDeep"), "elevated_surface.background": r("bgAlt"),
          "editor.background": r("bg"), "editor.foreground": r("fg"), "editor.gutter.background": r("bg"),
          "editor.active_line.background": r("lineHighlight"), "editor.line_number": r("lineNumber"),
          "editor.active_line_number": r("lineNumberActive"), "editor.indent_guide": c("surface0"),
          "editor.indent_guide_active": c("surface2"), "editor.wrap_guide": c("surface0"),
          "editor.document_highlight.read_background": a(c("steel"), 0.15),
          border: r("border"), "border.variant": r("border"), "border.focused": r("accent"), "border.selected": r("accent"),
          text: r("fg"), "text.muted": r("fgMuted"), "text.placeholder": r("lineNumber"), "text.accent": r("accent"),
          icon: r("fgMuted"), "icon.accent": r("accent"),
          "element.background": c("surface0"), "element.hover": c("surface0"), "element.selected": c("surface1"),
          "ghost_element.hover": a(c("surface1"), 0.5), "ghost_element.selected": c("surface1"),
          "tab_bar.background": r("bgDeep"), "tab.active_background": r("bg"), "tab.inactive_background": r("bgDeep"),
          "toolbar.background": r("bg"), "title_bar.background": r("bgDeep"), "status_bar.background": r("bgDeep"),
          "panel.background": r("bgDeep"), "panel.focused_border": r("accent"),
          "scrollbar.thumb.background": a(c("surface2"), 0.6), "scrollbar.track.background": "#00000000",
          "search.match_background": a(c("amber"), 0.3),
          "terminal.background": r("bg"), "terminal.foreground": r("fg"),
          ...Object.fromEntries(ANSI_ORDER.flatMap((n, i) => [[`terminal.ansi.${n}`, f.ansi.normal[i]], [`terminal.ansi.bright_${n}`, f.ansi.bright[i]]])),
          error: r("error"), warning: r("warning"), info: r("info"), hint: r("hint"), success: r("success"),
          created: r("added"), modified: r("modified"), deleted: r("removed"), conflict: c("orchid"),
          ignored: r("lineNumber"), hidden: r("lineNumber"),
          players: [{ cursor: r("cursor"), selection: a(c("teal"), 0.3), background: r("accent") }],
          syntax: {
            comment: syn("comment"), "comment.doc": syn("comment"), keyword: syn("keyword"),
            function: syn("function"), string: syn("string"), "string.escape": syn("escape"), "string.regex": syn("regex"),
            number: syn("number"), boolean: syn("constant"), constant: syn("constant"), type: syn("type"),
            constructor: syn("type"), operator: syn("operator"), punctuation: syn("punctuation"),
            "punctuation.bracket": syn("punctuation"), "punctuation.delimiter": syn("punctuation"),
            "punctuation.special": syn("keyword"), attribute: syn("decorator"), tag: syn("tag"),
            property: syn("property"), variable: syn("variable"), "variable.special": syn("builtin"),
            namespace: syn("namespace"), label: syn("decorator"), title: syn("heading"),
            link_uri: syn("link"), link_text: syn("link"), "text.literal": syn("code"), emphasis: { font_style: "italic" },
            "emphasis.strong": { font_weight: 700 }, embedded: syn("variable"),
          },
        },
      };
    };
    return [
      {
        path: "extras/zed/themes/living-code.json",
        content: JSON.stringify({ $schema: "https://zed.dev/schema/themes/v0.2.0.json", name: "Living Code", author: "Elliot Luque", themes: fs.map(theme) }, null, 2) + "\n",
      },
      {
        path: "extras/zed/extension.toml",
        content: `id = "living-code-theme"
name = "Living Code"
version = "${version}"
schema_version = 1
authors = ["Elliot Luque"]
description = "Calm slate, living color. Night, Frost, Paper and Signal themes."
repository = "${REPO}"
`,
      },
      { path: "extras/zed/LICENSE", content: license },
    ];
  },
  install: `In Zed, open the Extensions panel (\`zed: extensions\`, or \`cmd-shift-x\` on macOS and \`ctrl-shift-x\` on Linux), search for **Living Code**, and click **Install**. Then pick a flavor with \`theme selector: toggle\` (\`cmd-k cmd-t\`).

Without the registry: run \`zed: install dev extension\` and select the \`extras/zed\` folder of a checkout, or download the theme file into \`~/.config/zed/themes/\`:

\`\`\`sh
mkdir -p ~/.config/zed/themes
curl -fsSL https://raw.githubusercontent.com/ElliotLuque/living-code/main/extras/zed/themes/living-code.json -o ~/.config/zed/themes/living-code.json
\`\`\`

The theme file holds all four flavors. This README assumes the extension is published to the Zed registry.`,
};
