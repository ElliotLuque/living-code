import { sh, getFile, fence, XDG_CONFIG } from "./util.mjs";
import { SCOPES } from "./editors.mjs";

// Diff backgrounds: a quiet row tint, and a stronger one for changed words.
const ROW = 0.12;
const EMPH = 0.26;

function deltaFeature(f) {
  const r = f.r;
  const tint = (role, t) => f.mix("bg", role, t);
  const styles = {
    [f.light ? "light" : "dark"]: true,
    "syntax-theme": f.slug,
    "minus-style": `syntax ${tint("removed", ROW)}`,
    "minus-non-emph-style": `syntax ${tint("removed", ROW)}`,
    "minus-emph-style": `bold syntax ${tint("removed", EMPH)}`,
    "minus-empty-line-marker-style": `normal ${tint("removed", ROW)}`,
    "plus-style": `syntax ${tint("added", ROW)}`,
    "plus-non-emph-style": `syntax ${tint("added", ROW)}`,
    "plus-emph-style": `bold syntax ${tint("added", EMPH)}`,
    "plus-empty-line-marker-style": `normal ${tint("added", ROW)}`,
    "zero-style": "syntax",
    "whitespace-error-style": `reverse ${r("error")}`,
    "line-numbers-minus-style": r("removed"),
    "line-numbers-plus-style": r("added"),
    "line-numbers-zero-style": r("lineNumber"),
    "line-numbers-left-style": r("border"),
    "line-numbers-right-style": r("border"),
    "file-style": `bold ${r("fg")}`,
    "file-decoration-style": `${r("accent")} ul`,
    "hunk-header-style": "file line-number syntax",
    "hunk-header-decoration-style": `${r("border")} box`,
    "hunk-header-file-style": r("info"),
    "hunk-header-line-number-style": r("lineNumberActive"),
    "commit-style": `bold ${r("accent")}`,
    "commit-decoration-style": `${r("accent")} box`,
    "blame-palette": ["bg", "bgAlt", "lineHighlight", "border"].map(r).join(" "),
    "blame-code-style": "syntax",
    "inline-hint-style": r("fgSubtle"),
    "grep-file-style": r("accent"),
    "grep-line-number-style": r("lineNumberActive"),
    "grep-match-line-style": `syntax ${r("lineHighlight")}`,
    "grep-match-word-style": `bold ${r("bg")} ${r("match")}`,
    "merge-conflict-ours-diff-header-style": `bold ${r("warning")}`,
    "merge-conflict-ours-diff-header-decoration-style": `${r("border")} box`,
    "merge-conflict-theirs-diff-header-style": `bold ${r("info")}`,
    "merge-conflict-theirs-diff-header-decoration-style": `${r("border")} box`,
  };
  // Quote the entire value: unquoted hex colors are comments in gitconfig.
  return `[delta "${f.slug}"]\n${Object.entries(styles).map(([k, v]) => `\t${k} = ${JSON.stringify(v)}`).join("\n")}\n`;
}

export const delta = {
  id: "delta",
  name: "delta",
  homepage: "https://github.com/dandavison/delta",
  files: () => [],
  all: (fs) => [{
    path: "extras/delta/living-code.gitconfig",
    content: `# Living Code for delta. Generated: do not edit.
# Syntax colors come from the matching tmTheme; install it into bat first.

${fs.map(deltaFeature).join("\n")}`,
  }],
  install: `First install the [tmTheme port](https://github.com/ElliotLuque/living-code#tmtheme) into bat's cache for syntax colors. This port adds delta's diff backgrounds, word highlights, headers and gutters.

${sh(getFile(`${XDG_CONFIG}/delta`, "extras/delta/living-code.gitconfig"), `git config --global --add include.path "${XDG_CONFIG}/delta/living-code.gitconfig"`, "git config --global core.pager delta", `git config --global interactive.diffFilter "delta --color-only"`, "git config --global delta.features living-code-night")}

That includes the file in \`~/.gitconfig\` and selects a flavor. Skip the \`core.pager\` and \`diffFilter\` lines if delta is already set up.

Each flavor is a delta feature: \`living-code-night\`, \`living-code-signal\`, \`living-code-frost\`, \`living-code-paper\`.`,
};

export function hunkTheme(f) {
  const r = f.r, c = f.c;
  const tint = (role, t) => f.mix("bg", role, t);
  const colors = {
    label: f.name,
    base: f.light ? "github-light-default" : "github-dark-default",
    background: r("bg"),
    panel: r("bgAlt"),
    panelAlt: r("lineHighlight"),
    border: r("border"),
    accent: r("accent"),
    accentMuted: tint("accent", f.light ? 0.2 : 0.3),
    text: r("fg"),
    muted: r("fgMuted"),
    contextBg: r("bg"),
    contextContentBg: r("bg"),
    addedBg: tint("added", ROW),
    removedBg: tint("removed", ROW),
    addedContentBg: tint("added", EMPH),
    removedContentBg: tint("removed", EMPH),
    movedAddedBg: tint("info", ROW),
    movedRemovedBg: tint("warning", ROW),
    addedSignColor: r("added"),
    removedSignColor: r("removed"),
    lineNumberBg: r("bg"),
    lineNumberFg: r("lineNumber"),
    selectedHunk: r("lineHighlight"),
    badgeAdded: r("added"),
    badgeRemoved: r("removed"),
    badgeNeutral: r("fgMuted"),
    fileNew: r("added"),
    fileDeleted: r("removed"),
    fileRenamed: r("info"),
    fileModified: r("modified"),
    fileUntracked: r("fgSubtle"),
    noteBorder: c("orchid"),
    noteBackground: r("bgAlt"),
    noteTitleBackground: r("border"),
    noteTitleText: r("fg"),
  };
  const syntaxScopes = Object.fromEntries(
    SCOPES.filter((s) => s.role).flatMap(({ role, scope }) => scope.map((sc) => [sc, r(role)])),
  );
  return { id: f.slug, ...colors, syntaxScopes };
}

const toml = (v) => JSON.stringify(v);

export const hunk = {
  id: "hunk",
  name: "Hunk",
  homepage: "https://github.com/modem-dev/hunk",
  files: (f) => {
    const { id, syntaxScopes, ...colors } = hunkTheme(f);
    return [{
      path: `extras/hunk/${f.slug}.toml`,
      content: `[themes.${id}]
${Object.entries(colors).map(([k, v]) => `${k} = ${toml(v)}`).join("\n")}

[themes.${id}.syntax_scopes]
${Object.entries(syntaxScopes).map(([k, v]) => `${toml(k)} = ${toml(v)}`).join("\n")}
`,
    }];
  },
  all: (fs) => [{
    path: "extras/hunk/living-code.mjs",
    content: `// Living Code for Hunk. Generated: do not edit.
// Registers every flavor as a selectable theme.
const themes = ${JSON.stringify(fs.map(hunkTheme), null, 2)};

export default function livingCode(hunk) {
  for (const theme of themes) hunk.registerTheme(theme);
}
`,
  }],
  install: `**Extension (all flavors):** download the generated extension:

${sh(getFile("$HOME/.config/hunk/extensions", "extras/hunk/living-code.mjs"))}

Set the top-level \`theme\` in \`~/.config/hunk/config.toml\` (before any TOML tables):

${fence("toml", `theme = "living-code-night"`)}

To try it first, run \`hunk diff --extension ~/.config/hunk/extensions/living-code.mjs --theme living-code-night\`.

**Config only:** instead of the extension, merge a flavor's \`.toml\` file into \`~/.config/hunk/config.toml\` (or a repo's \`.hunk/config.toml\`) and set the top-level \`theme\` as above. Do not add duplicate theme tables. Config themes take precedence over extension themes with the same name.

Available themes: \`living-code-night\`, \`living-code-signal\`, \`living-code-frost\`, \`living-code-paper\`. Syntax colors share the editor ports' scope map.`,
};
