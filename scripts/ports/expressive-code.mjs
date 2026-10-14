import { ANSI_ORDER } from "../resolve.mjs";
import { scopeRules } from "./editors.mjs";

export function expressiveCodeTheme(f) {
  const r = f.r;
  const colors = {
    "editor.background": r("bg"),
    "editor.foreground": r("fg"),
    "editor.selectionBackground": r("selection"),
    "editorLineNumber.foreground": r("lineNumber"),
    "editorLineNumber.activeForeground": r("lineNumberActive"),
    "terminal.background": r("bg"),
    focusBorder: r("accent"),
  };
  for (const [i, name] of ANSI_ORDER.entries()) {
    const key = name[0].toUpperCase() + name.slice(1);
    colors[`terminal.ansi${key}`] = f.ansi.normal[i];
    colors[`terminal.ansiBright${key}`] = f.ansi.bright[i];
  }
  return {
    name: f.name,
    type: f.light ? "light" : "dark",
    colors,
    tokenColors: scopeRules(f),
    styleOverrides: {
      codeBackground: r("bg"),
      codeForeground: r("fg"),
      codeSelectionBackground: r("selection"),
      borderColor: r("border"),
      focusBorder: r("accent"),
      gutterBorderColor: r("border"),
      gutterForeground: r("fgSubtle"),
      gutterHighlightForeground: r("lineNumberActive"),
      uiSelectionBackground: r("selection"),
      uiSelectionForeground: r("fg"),
      scrollbarThumbColor: f.c("surface2"),
      scrollbarThumbHoverColor: r("fgSubtle"),
      frames: {
        frameBoxShadowCssValue: "none",
        editorBackground: r("bg"),
        editorTabBarBackground: r("bgDeep"),
        editorTabBarBorderColor: r("border"),
        editorTabBarBorderBottomColor: r("border"),
        editorActiveTabBackground: r("bg"),
        editorActiveTabForeground: r("fg"),
        editorActiveTabBorderColor: r("border"),
        editorActiveTabIndicatorTopColor: r("accent"),
        editorActiveTabIndicatorBottomColor: "transparent",
        terminalBackground: r("bg"),
        terminalTitlebarBackground: r("bgDeep"),
        terminalTitlebarForeground: r("fgMuted"),
        terminalTitlebarBorderBottomColor: r("border"),
        terminalTitlebarDotsForeground: r("fgMuted"),
        inlineButtonForeground: r("fgMuted"),
        inlineButtonBackground: r("fgMuted"),
        inlineButtonBorder: r("border"),
        tooltipSuccessBackground: r("bgAlt"),
        tooltipSuccessForeground: r("success"),
      },
      textMarkers: {
        markBackground: r("modified") + "26",
        markBorderColor: r("modified"),
        insBackground: r("added") + "26",
        insBorderColor: r("added"),
        insDiffIndicatorColor: r("added"),
        delBackground: r("removed") + "26",
        delBorderColor: r("removed"),
        delDiffIndicatorColor: r("removed"),
        lineMarkerLabelColor: r("bg"),
      },
    },
  };
}

export const expressiveCode = {
  id: "expressive-code",
  name: "Expressive Code",
  homepage: "https://expressive-code.com",
  files: (f) => [{
    path: `extras/expressive-code/${f.slug}.json`,
    content: JSON.stringify(expressiveCodeTheme(f), null, 2) + "\n",
  }],
  install: `Use the dedicated themes for syntax highlighting, editor and terminal frames, copy buttons, line numbers, and highlighted or diff lines.

For Astro:

\`\`\`sh
pnpm add @living-code/expressive-code astro-expressive-code
\`\`\`

Add the integration to \`astro.config.mjs\`:

\`\`\`js
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import night from "@living-code/expressive-code/living-code-night.json" with { type: "json" };
import paper from "@living-code/expressive-code/living-code-paper.json" with { type: "json" };

export default defineConfig({
  integrations: [expressiveCode({ themes: [night, paper] })],
});
\`\`\`

Night and Paper follow the visitor’s dark/light preference by default. Replace Night with \`living-code-frost.json\` or \`living-code-signal.json\` for another dark flavor, or pass a single theme for a fixed appearance.

**Starlight:** pass the same \`themes\` array to \`starlight({ expressiveCode: { themes: [night, paper] } })\` instead of adding a separate integration. For other integrations, pass these JSON objects to their Expressive Code \`themes\` option. When using the \`ExpressiveCode\` JavaScript API directly, wrap each JSON object in \`new ExpressiveCodeTheme(theme)\` (imported from \`expressive-code\`).`,
};
