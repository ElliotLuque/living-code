import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { expressiveCode, expressiveCodeTheme } from "./ports/expressive-code.mjs";
import { resolveAll } from "./resolve.mjs";

for (const f of resolveAll()) {
  test(`${f.id}: Expressive Code preserves syntax colors and styles`, async () => {
    const theme = expressiveCodeTheme(f);
    const vscode = JSON.parse(await readFile(new URL(`../extras/vscode/themes/${f.slug}-color-theme.json`, import.meta.url), "utf8"));
    assert.equal(theme.name, f.name);
    assert.equal(theme.type, f.light ? "light" : "dark");
    assert.deepEqual(theme.tokenColors, vscode.tokenColors);
    for (const [key, color] of Object.entries(theme.colors)) {
      assert.equal(color, vscode.colors[key]);
    }
  });

  test(`${f.id}: Expressive Code UI and markers use semantic palette roles`, () => {
    const { styleOverrides: s } = expressiveCodeTheme(f);
    assert.equal(s.codeBackground, f.r("bg"));
    assert.equal(s.codeForeground, f.r("fg"));
    assert.equal(s.codeSelectionBackground, f.r("selection"));
    assert.equal(s.gutterForeground, f.r("fgSubtle"));
    assert.equal(s.gutterHighlightForeground, f.r("lineNumberActive"));
    assert.equal(s.frames.editorTabBarBackground, f.r("bgDeep"));
    assert.equal(s.frames.editorActiveTabIndicatorTopColor, f.r("accent"));
    assert.equal(s.frames.terminalBackground, s.codeBackground);
    for (const [marker, role] of [["mark", "modified"], ["ins", "added"], ["del", "removed"]]) {
      assert.equal(s.textMarkers[`${marker}Background`], f.r(role) + "26");
      assert.equal(s.textMarkers[`${marker}BorderColor`], f.r(role));
    }
    assert.equal(s.textMarkers.insDiffIndicatorColor, f.r("added"));
    assert.equal(s.textMarkers.delDiffIndicatorColor, f.r("removed"));
  });

  test(`${f.id}: generated Expressive Code theme is current`, async () => {
    const [file] = expressiveCode.files(f);
    const actual = await readFile(new URL(`../${file.path}`, import.meta.url), "utf8");
    assert.equal(actual, file.content);
    assert.deepEqual(JSON.parse(actual), expressiveCodeTheme(f));
  });
}
